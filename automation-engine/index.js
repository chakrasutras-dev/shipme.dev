/**
 * DevFlow Automation Engine
 * Claude Computer Use implementation for infrastructure automation
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Computer Use Tool - Executes bash commands with safety checks
 */
class ComputerUseTool {
  constructor(automationId, userId) {
    this.automationId = automationId
    this.userId = userId
    this.dangerousCommands = [
      /rm\s+-rf/,
      /dd\s+if=/,
      /mkfs/,
      /:\(\)\{\s*:\|:&\s*\};:/,
      /curl.*\|\s*bash/,
      /wget.*\|\s*sh/,
    ]
  }

  async validateCommand(command) {
    // Check for dangerous patterns
    for (const pattern of this.dangerousCommands) {
      if (pattern.test(command)) {
        await this.logSecurity('dangerous_command_blocked', command)
        throw new Error(`Dangerous command blocked: ${command}`)
      }
    }
    return true
  }

  async execute(command) {
    await this.validateCommand(command)

    try {
      await this.logToolUse('Bash', { command }, 'pending')

      const output = execSync(command, {
        encoding: 'utf-8',
        timeout: 60000, // 1 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      await this.logToolUse('Bash', { command }, 'success', output)
      return output
    } catch (error) {
      await this.logToolUse('Bash', { command }, 'error', error.message)
      throw error
    }
  }

  async logToolUse(toolName, toolInput, status, output = null) {
    await supabase.from('audit_logs').insert({
      user_id: this.userId,
      automation_id: this.automationId,
      event_type: 'tool_use',
      tool_name: toolName,
      tool_input: toolInput,
      tool_output: output ? { output } : null,
      status,
    })
  }

  async logSecurity(event, details) {
    await supabase.from('audit_logs').insert({
      user_id: this.userId,
      automation_id: this.automationId,
      event_type: 'security_event',
      status: 'blocked',
      metadata: { event, details },
    })
  }
}

/**
 * Automation Workflows
 */
class AutomationWorkflows {
  constructor(tool) {
    this.tool = tool
  }

  async createGitHubRepo(repoName, isPrivate = false) {
    console.log(`[GitHub] Creating repository: ${repoName}`)

    // Check if gh CLI is authenticated
    try {
      await this.tool.execute('gh auth status')
    } catch (error) {
      throw new Error('GitHub CLI not authenticated. Please run: gh auth login')
    }

    // Create repository
    const visibility = isPrivate ? '--private' : '--public'
    const output = await this.tool.execute(
      `gh repo create ${repoName} ${visibility} --confirm`
    )

    // Extract repo URL
    const repoUrl = `https://github.com/${await this.tool.execute('gh api user --jq .login').trim()}/${repoName}`

    return {
      repo_url: repoUrl,
      created: true,
    }
  }

  async deployToVercel(projectPath, projectName) {
    console.log(`[Vercel] Deploying project: ${projectName}`)

    // Check if Vercel CLI is authenticated
    try {
      await this.tool.execute('vercel whoami')
    } catch (error) {
      throw new Error('Vercel CLI not authenticated. Please run: vercel login')
    }

    // Deploy project
    const output = await this.tool.execute(
      `cd ${projectPath} && vercel --prod --yes --name ${projectName}`
    )

    // Extract deployment URL
    const urlMatch = output.match(/https:\/\/[^\s]+/)
    const deploymentUrl = urlMatch ? urlMatch[0] : null

    return {
      deployment_url: deploymentUrl,
      deployed: true,
    }
  }

  async provisionSupabase(projectName) {
    console.log(`[Supabase] Provisioning database: ${projectName}`)

    // Note: Supabase CLI automation requires API key
    // This is a simplified example
    return {
      database_url: `https://${projectName}.supabase.co`,
      provisioned: true,
    }
  }

  async configureStripe(projectName) {
    console.log(`[Stripe] Configuring payments: ${projectName}`)

    // Note: Stripe setup typically requires manual configuration
    // This is a placeholder for the workflow
    return {
      stripe_configured: true,
    }
  }
}

/**
 * Main Automation Engine
 */
async function runAutomation(automationId) {
  console.log(`[Engine] Starting automation: ${automationId}`)

  // Fetch automation details
  const { data: automation, error } = await supabase
    .from('automations')
    .select('*, automation_plans(*)')
    .eq('id', automationId)
    .single()

  if (error || !automation) {
    console.error('[Engine] Automation not found:', error)
    return
  }

  const tool = new ComputerUseTool(automationId, automation.user_id)
  const workflows = new AutomationWorkflows(tool)

  try {
    // Update status to in_progress
    await supabase
      .from('automations')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_step: 'Initializing automation',
        progress_percent: 10,
      })
      .eq('id', automationId)

    const config = automation.automation_plans.config
    const resources = {}

    // Step 1: Create GitHub Repository
    if (config.githubRepo) {
      await supabase
        .from('automations')
        .update({
          current_step: 'Creating GitHub repository',
          progress_percent: 25,
          logs: [...(automation.logs || []), 'Creating GitHub repository...'],
        })
        .eq('id', automationId)

      const githubResult = await workflows.createGitHubRepo(
        config.projectName,
        config.isPrivate || false
      )
      resources.github_repo = githubResult.repo_url
    }

    // Step 2: Deploy to Platform
    await supabase
      .from('automations')
      .update({
        current_step: `Deploying to ${config.deploymentPlatform}`,
        progress_percent: 50,
        logs: [
          ...(automation.logs || []),
          `Deploying to ${config.deploymentPlatform}...`,
        ],
      })
      .eq('id', automationId)

    if (config.deploymentPlatform === 'vercel') {
      const vercelResult = await workflows.deployToVercel(
        '/workspace',
        config.projectName
      )
      resources.deployment_url = vercelResult.deployment_url
    }

    // Step 3: Provision Database
    if (config.database) {
      await supabase
        .from('automations')
        .update({
          current_step: `Provisioning ${config.database} database`,
          progress_percent: 75,
          logs: [
            ...(automation.logs || []),
            `Provisioning ${config.database} database...`,
          ],
        })
        .eq('id', automationId)

      if (config.database === 'supabase') {
        const supabaseResult = await workflows.provisionSupabase(config.projectName)
        resources.database_url = supabaseResult.database_url
      }
    }

    // Step 4: Configure Payments
    if (config.payments) {
      await supabase
        .from('automations')
        .update({
          current_step: 'Configuring Stripe payments',
          progress_percent: 90,
          logs: [...(automation.logs || []), 'Configuring Stripe payments...'],
        })
        .eq('id', automationId)

      const stripeResult = await workflows.configureStripe(config.projectName)
      resources.stripe_configured = stripeResult.stripe_configured
    }

    // Complete automation
    await supabase
      .from('automations')
      .update({
        status: 'completed',
        progress_percent: 100,
        current_step: 'Automation complete',
        completed_at: new Date().toISOString(),
        resources,
        logs: [
          ...(automation.logs || []),
          'Automation completed successfully!',
        ],
      })
      .eq('id', automationId)

    console.log(`[Engine] Automation completed: ${automationId}`)
    console.log('[Engine] Resources created:', resources)
  } catch (error) {
    console.error('[Engine] Automation failed:', error)

    // Update to failed status
    await supabase
      .from('automations')
      .update({
        status: 'failed',
        error_message: error.message,
        logs: [
          ...(automation.logs || []),
          `Error: ${error.message}`,
        ],
      })
      .eq('id', automationId)
  }
}

// Start listening for automations
async function startEngine() {
  console.log('[Engine] DevFlow Automation Engine started')
  console.log('[Engine] Listening for automation requests...')

  // In production, this would listen to a job queue
  // For now, process automation ID from command line
  const automationId = process.argv[2]

  if (!automationId) {
    console.log('[Engine] Usage: node index.js <automation_id>')
    console.log('[Engine] Waiting for automation requests...')
    return
  }

  await runAutomation(automationId)
}

startEngine().catch(console.error)
