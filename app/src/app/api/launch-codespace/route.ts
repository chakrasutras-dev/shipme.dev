import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Octokit } from '@octokit/rest'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { projectName, description, stack } = await request.json()

    // Validate input
    if (!projectName || !description) {
      return NextResponse.json(
        { error: 'Project name and description are required' },
        { status: 400 }
      )
    }

    // Get GitHub token from session (OAuth provider token)
    const githubToken = session.provider_token
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub authentication required. Please sign in again.' },
        { status: 401 }
      )
    }

    const octokit = new Octokit({ auth: githubToken })

    // Get authenticated user info
    const { data: user } = await octokit.users.getAuthenticated()

    // Template repository configuration
    const TEMPLATE_OWNER = process.env.TEMPLATE_OWNER || user.login
    const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'shipme-starter-template'

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
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Inject project configuration into .shipme/project.json
    const projectConfig = {
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

    try {
      // Update .shipme/project.json in the new repository
      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: projectName,
        path: '.shipme/project.json',
        message: '🚀 Add ShipMe project configuration',
        content: Buffer.from(JSON.stringify(projectConfig, null, 2)).toString('base64')
      })
    } catch (error) {
      console.error('Failed to inject project config:', error)
      // Non-fatal - continue anyway
    }

    // Generate Codespace URL
    const codespaceUrl = `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${repo.id}`

    // Track launch in database
    const { data: launch, error: dbError } = await supabase
      .from('codespace_launches')
      .insert({
        user_id: session.user.id,
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
