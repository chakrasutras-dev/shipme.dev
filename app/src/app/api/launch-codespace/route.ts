import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Octokit } from '@octokit/rest'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  // Debug: log what cookies are present
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const cookieNames = allCookies.map(c => c.name)
  const hasAuthCookies = cookieNames.some(n => n.startsWith('sb-'))
  console.log('[Launch] Cookies present:', cookieNames.length, 'names:', cookieNames.join(', '))
  console.log('[Launch] Has Supabase auth cookies:', hasAuthCookies)

  const supabase = await createClient()

  // Use getUser() for reliable server-side auth (validates with Supabase server)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[Launch] Auth check failed:', userError?.message || 'No user')
    console.error('[Launch] Cookie names:', cookieNames.join(', '))
    return NextResponse.json({
      error: 'Unauthorized',
      debug: {
        cookieCount: allCookies.length,
        hasAuthCookies,
        cookieNames,
        authError: userError?.message || 'No user found'
      }
    }, { status: 401 })
  }

  // Also get session for provider_token and user id
  const { data: { session } } = await supabase.auth.getSession()

  try {
    const { projectName, description, stack } = await request.json()

    // Validate input
    if (!projectName || !description) {
      return NextResponse.json(
        { error: 'Project name and description are required' },
        { status: 400 }
      )
    }

    // Get GitHub token - first try session, then cookie
    const githubToken = session?.provider_token || cookieStore.get('github_provider_token')?.value
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub authentication required. Please sign in again.' },
        { status: 401 }
      )
    }

    const octokit = new Octokit({ auth: githubToken })

    // Get authenticated GitHub user info (named differently to avoid shadowing Supabase user)
    const { data: githubUser } = await octokit.users.getAuthenticated()

    // Template repository configuration
    const TEMPLATE_OWNER = process.env.TEMPLATE_OWNER || githubUser.login
    const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'shipme_template'

    // Check if template repository exists
    try {
      await octokit.repos.get({
        owner: TEMPLATE_OWNER,
        repo: TEMPLATE_REPO
      })
    } catch (error: any) {
      // Template doesn't exist - return instructions for Phase 2 completion
      if (error.status === 404) {
        return NextResponse.json({
          status: 'template_not_ready',
          message: 'Template repository not yet created',
          instructions: {
            step: 'Create template repository',
            repo_name: TEMPLATE_REPO,
            owner: TEMPLATE_OWNER,
            source: '/template-components/',
            note: 'Copy contents from template-components/ to create the template repository'
          },
          projectName,
          description,
          stack
        })
      }
      throw error
    }

    // Create repository from template
    const { data: repo } = await octokit.repos.createUsingTemplate({
      template_owner: TEMPLATE_OWNER,
      template_repo: TEMPLATE_REPO,
      name: projectName,
      description,
      private: false,
      include_all_branches: false
    })

    // Wait for repository to be ready (GitHub template creation is async)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Generate a one-time provisioning token for ALL credential delivery.
    // The Codespace's post-create.sh will redeem this token to receive:
    // - ShipMe's Anthropic API key (for Claude Code)
    // - User's Supabase Management API token (for creating projects)
    // - User's Netlify API token (for deploying sites)
    // - User's GitHub token (from the OAuth session)
    const serviceClient = createServiceRoleClient()
    let provisioningToken: string | undefined

    const hasShipmeKey = !!process.env.SHIPME_ANTHROPIC_API_KEY
    console.log('[Launch] SHIPME_ANTHROPIC_API_KEY present:', hasShipmeKey)
    console.log('[Launch] Supabase user ID:', user!.id)

    // Fetch user's OAuth tokens (Supabase + Netlify) from DB
    const { data: oauthTokens } = await serviceClient
      .from('user_oauth_tokens')
      .select('provider, access_token')
      .eq('user_id', user!.id)

    const supabaseToken = oauthTokens?.find(t => t.provider === 'supabase')?.access_token || null
    const netlifyToken = oauthTokens?.find(t => t.provider === 'netlify')?.access_token || null
    console.log('[Launch] Supabase token available:', !!supabaseToken)
    console.log('[Launch] Netlify token available:', !!netlifyToken)
    console.log('[Launch] GitHub token available:', !!githubToken)

    if (hasShipmeKey) {
      provisioningToken = crypto.randomUUID()
      console.log('[Launch] Generated provisioning token:', provisioningToken)
      const { error: tokenError } = await serviceClient.from('provisioning_tokens').insert({
        token: provisioningToken,
        user_id: user!.id,
        anthropic_api_key: process.env.SHIPME_ANTHROPIC_API_KEY,
        supabase_access_token: supabaseToken,
        netlify_auth_token: netlifyToken,
        github_token: githubToken,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      if (tokenError) {
        console.error('[Launch] Failed to store provisioning token:', JSON.stringify(tokenError))
        provisioningToken = undefined
      } else {
        console.log('[Launch] Provisioning token stored with all credentials')
      }
    } else {
      console.log('[Launch] SHIPME_ANTHROPIC_API_KEY is not set, skipping provisioning token')
    }

    // Inject project configuration into .shipme/project.json
    const projectConfig: Record<string, any> = {
      name: projectName,
      description,
      stack: stack || {
        framework: 'Next.js',
        database: 'Supabase',
        hosting: 'Netlify',
        auth: []
      },
      createdAt: new Date().toISOString(),
      createdBy: 'shipme.dev',
      version: '2.0.0'
    }
    if (provisioningToken) {
      projectConfig.provisioningToken = provisioningToken
    }

    // Inject project.json into the new repo (with retry for race condition)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Get the existing file's SHA (needed for updates since template includes project.json)
        let existingSha: string | undefined
        try {
          const { data: existingFile } = await octokit.repos.getContent({
            owner: githubUser.login,
            repo: projectName,
            path: '.shipme/project.json'
          })
          if (!Array.isArray(existingFile) && existingFile.sha) {
            existingSha = existingFile.sha
          }
        } catch {
          // File doesn't exist yet — that's fine, we'll create it
        }

        await octokit.repos.createOrUpdateFileContents({
          owner: githubUser.login,
          repo: projectName,
          path: '.shipme/project.json',
          message: 'Add ShipMe project configuration',
          content: Buffer.from(JSON.stringify(projectConfig, null, 2)).toString('base64'),
          ...(existingSha ? { sha: existingSha } : {})
        })
        console.log(`[Launch] Injected project.json on attempt ${attempt}`)
        break // Success
      } catch (error) {
        console.error(`[Launch] project.json injection attempt ${attempt}/3 failed:`, error)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait before retry
        }
      }
    }

    // Generate Codespace URL
    const codespaceUrl = `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${repo.id}`

    // Track launch in database
    const { data: launch, error: dbError } = await supabase
      .from('codespace_launches')
      .insert({
        user_id: user.id,
        project_name: projectName,
        project_description: description,
        stack_config: projectConfig.stack,
        template_repo_url: `https://github.com/${TEMPLATE_OWNER}/${TEMPLATE_REPO}`,
        codespace_url: codespaceUrl,
        status: 'created'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database tracking error:', dbError)
      // Non-fatal - continue anyway
    }

    // Record provisioning event
    if (launch) {
      await supabase.from('provisioning_events').insert({
        codespace_id: launch.id,
        step_id: 'repo_created',
        tool_name: 'github',
        status: 'completed',
        details: {
          repo_url: repo.html_url,
          template: `${TEMPLATE_OWNER}/${TEMPLATE_REPO}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      codespace_url: codespaceUrl,
      repo_url: repo.html_url,
      clone_url: repo.clone_url,
      launch_id: launch?.id,
      provisioning_token_injected: !!provisioningToken,
      message: 'Repository created successfully! Click the Codespace URL to start developing.',
      next_steps: [
        'Click the Codespace URL to open your development environment',
        'Wait for the devcontainer to build (2-3 minutes)',
        'Claude Code will automatically start provisioning your infrastructure',
        'Follow along with Claude\'s progress in the terminal'
      ]
    })

  } catch (error: any) {
    console.error('Codespace launch error:', error)

    // Track error in database
    try {
      await supabase.from('provisioning_events').insert({
        codespace_id: null,
        step_id: 'launch_failed',
        tool_name: 'api',
        status: 'failed',
        error_message: error.message
      })
    } catch (dbError) {
      console.error('Failed to track error:', dbError)
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to launch Codespace',
      details: error.response?.data || null
    }, { status: 500 })
  }
}
