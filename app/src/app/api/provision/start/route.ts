import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Octokit } from '@octokit/rest'
import { cookies } from 'next/headers'

const SUPABASE_API = 'https://api.supabase.com/v1'

/**
 * POST /api/provision/start
 *
 * Kicks off server-side provisioning:
 * 1. Creates GitHub repo from template
 * 2. Fires Supabase project creation (async — returns immediately with project_id)
 * 3. Inserts provisioning_jobs row
 * 4. Returns { job_id, repo_url } — frontend polls /api/provision/status
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  const cookieStore = await cookies()
  const githubToken = session?.provider_token || cookieStore.get('github_provider_token')?.value
  if (!githubToken) {
    return NextResponse.json({ error: 'GitHub token missing. Please sign in again.' }, { status: 401 })
  }

  const body = await request.json()
  const { projectName, description: rawDescription } = body
  if (!projectName || !rawDescription) {
    return NextResponse.json({ error: 'projectName and description are required' }, { status: 400 })
  }
  // Strip control characters (newlines, tabs, etc.) — GitHub rejects them in repo descriptions
  const description = rawDescription.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 350)

  const serviceClient = createServiceRoleClient()

  // Fetch user's Supabase + Netlify tokens
  const { data: oauthTokens } = await serviceClient
    .from('user_oauth_tokens')
    .select('provider, access_token, metadata')
    .eq('user_id', user.id)

  const supabaseRow = oauthTokens?.find(t => t.provider === 'supabase')
  const supabaseToken = supabaseRow?.access_token
  const supabaseOrgId = supabaseRow?.metadata?.organization_id

  if (!supabaseToken) {
    return NextResponse.json({ error: 'Supabase account not connected', step: 'supabase_auth' }, { status: 400 })
  }
  if (!oauthTokens?.find(t => t.provider === 'netlify')) {
    return NextResponse.json({ error: 'Netlify account not connected', step: 'netlify_auth' }, { status: 400 })
  }

  // ── Step 1: Create GitHub repo from template ─────────────────────────────
  const octokit = new Octokit({ auth: githubToken })
  const { data: githubUser } = await octokit.users.getAuthenticated()

  const TEMPLATE_OWNER = process.env.TEMPLATE_OWNER || githubUser.login
  const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'shipme_template'

  let repo: { id: number; html_url: string }
  try {
    const { data } = await octokit.repos.createUsingTemplate({
      template_owner: TEMPLATE_OWNER,
      template_repo: TEMPLATE_REPO,
      name: projectName,
      description,
      private: false,
      include_all_branches: false
    })
    repo = data
  } catch (err: any) {
    console.error('[Provision/Start] GitHub repo creation failed:', err.message)
    return NextResponse.json({
      error: `GitHub repo creation failed: ${err.message}`,
      step: 'github'
    }, { status: 500 })
  }

  // Wait briefly for repo to be ready before injecting project.json
  await new Promise(r => setTimeout(r, 3000))

  // Inject .shipme/project.json into the new repo
  const projectConfig = {
    name: projectName,
    description,
    stack: { framework: 'Next.js', database: 'Supabase', hosting: 'Netlify' },
    createdAt: new Date().toISOString(),
    createdBy: 'shipme.dev',
    version: '3.0.0'
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let existingSha: string | undefined
      try {
        const { data: f } = await octokit.repos.getContent({
          owner: githubUser.login, repo: projectName, path: '.shipme/project.json'
        })
        if (!Array.isArray(f) && f.sha) existingSha = f.sha
      } catch {}

      await octokit.repos.createOrUpdateFileContents({
        owner: githubUser.login,
        repo: projectName,
        path: '.shipme/project.json',
        message: 'Add ShipMe project configuration',
        content: Buffer.from(JSON.stringify(projectConfig, null, 2)).toString('base64'),
        ...(existingSha ? { sha: existingSha } : {})
      })
      break
    } catch (err) {
      if (attempt === 3) console.error('[Provision/Start] project.json injection failed after 3 attempts')
      else await new Promise(r => setTimeout(r, 2000))
    }
  }

  // ── Step 2: Fire Supabase project creation (don't wait for ACTIVE_HEALTHY) ─
  let supabaseOrgIdResolved = supabaseOrgId
  if (!supabaseOrgIdResolved) {
    try {
      const res = await fetch(`${SUPABASE_API}/organizations`, {
        headers: { Authorization: `Bearer ${supabaseToken}` }
      })
      if (res.ok) {
        const orgs = await res.json() as Array<{ id: string }>
        supabaseOrgIdResolved = orgs[0]?.id
      }
    } catch {}
  }

  if (!supabaseOrgIdResolved) {
    return NextResponse.json({
      error: 'No Supabase organization found. Your Supabase token may have expired — disconnect and reconnect Supabase, then try again.',
      step: 'supabase_org'
    }, { status: 400 })
  }

  const dbPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('') + 'Aa1!'

  let supabaseProjectId: string
  try {
    const res = await fetch(`${SUPABASE_API}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${supabaseToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${projectName}-db`,
        organization_id: supabaseOrgIdResolved,
        region: 'us-east-1',
        db_pass: dbPassword,
        plan: 'free'
      })
    })
    if (!res.ok) {
      const err = await res.json() as { message?: string }
      return NextResponse.json({
        error: err.message || 'Supabase project creation failed',
        step: 'supabase_create'
      }, { status: 500 })
    }
    const project = await res.json() as { id: string }
    supabaseProjectId = project.id
  } catch (err: any) {
    return NextResponse.json({ error: err.message, step: 'supabase_create' }, { status: 500 })
  }

  // ── Step 3: Insert provisioning_jobs row ─────────────────────────────────
  const { data: job, error: jobError } = await serviceClient
    .from('provisioning_jobs')
    .insert({
      user_id: user.id,
      status: 'supabase_creating',
      project_name: projectName,
      description,
      github_repo_url: repo.html_url,
      github_repo_id: repo.id,
      supabase_project_id: supabaseProjectId
    })
    .select('id')
    .single()

  if (jobError || !job) {
    console.error('[Provision/Start] Failed to insert job:', jobError)
    return NextResponse.json({ error: 'Failed to create provisioning job' }, { status: 500 })
  }

  // Store db_password in a separate column for later (needed to construct connection string)
  // We also store the supabase token temporarily in the job for use by /status
  await serviceClient.from('provisioning_jobs').update({
    // We store the supabase token reference as org_id so /status can fetch keys
    // Actual tokens retrieved from user_oauth_tokens in /status
  }).eq('id', job.id)

  return NextResponse.json({
    job_id: job.id,
    repo_url: repo.html_url,
    codespace_url: `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${repo.id}`
  })
}
