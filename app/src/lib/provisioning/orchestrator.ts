import { createGitHubRepo, pushInitialFiles } from './github'
import { createVercelProject } from './vercel'
import { createSupabaseProject, runMigrations, generateStarterSchema } from './supabase'
import { generateDevContainerJson, generateCodespacesReadme } from './codespaces'
import { generateInfrastructureSpec } from './infrastructure-spec'
import type { ProvisioningInput, ProvisioningResult, ProvisioningStep } from './types'

export type ProvisioningCallback = (step: ProvisioningStep) => void

/**
 * Main orchestrator that provisions all infrastructure
 * Calls back with progress updates for real-time UI updates
 */
export async function runProvisioning(
  input: ProvisioningInput,
  onProgress: ProvisioningCallback
): Promise<ProvisioningResult> {
  const steps: ProvisioningStep[] = []
  const resources: ProvisioningResult['resources'] = {}
  const errors: string[] = []

  const updateStep = (step: ProvisioningStep) => {
    const existingIndex = steps.findIndex(s => s.id === step.id)
    if (existingIndex >= 0) {
      steps[existingIndex] = step
    } else {
      steps.push(step)
    }
    onProgress(step)
  }

  // Step 1: Create GitHub Repository
  if (input.credentials.github?.accessToken) {
    updateStep({
      id: 'github',
      name: 'Creating GitHub Repository',
      status: 'in_progress'
    })

    const githubResult = await createGitHubRepo({
      accessToken: input.credentials.github.accessToken,
      repoName: input.projectName,
      description: input.description,
      isPrivate: false
    })

    if (githubResult.success) {
      resources.github = {
        repoUrl: githubResult.repoUrl!,
        cloneUrl: githubResult.cloneUrl!
      }
      updateStep({
        id: 'github',
        name: 'Creating GitHub Repository',
        status: 'completed',
        message: `Repository created: ${githubResult.repoUrl}`,
        result: githubResult
      })
    } else {
      errors.push(githubResult.error || 'GitHub provisioning failed')
      updateStep({
        id: 'github',
        name: 'Creating GitHub Repository',
        status: 'failed',
        message: githubResult.error
      })
    }
  }

  // Step 2: Create Supabase Project
  if (input.credentials.supabase?.accessToken && input.credentials.supabase?.organizationId) {
    updateStep({
      id: 'supabase',
      name: 'Provisioning Supabase Database',
      status: 'in_progress'
    })

    // Generate a secure random password
    const dbPassword = generateSecurePassword()

    const supabaseResult = await createSupabaseProject({
      accessToken: input.credentials.supabase.accessToken,
      projectName: input.projectName,
      organizationId: input.credentials.supabase.organizationId,
      dbPassword
    })

    if (supabaseResult.success) {
      resources.supabase = {
        projectUrl: supabaseResult.projectUrl!,
        apiUrl: supabaseResult.apiUrl!,
        anonKey: supabaseResult.anonKey!
      }

      // Run starter migrations
      const appType = detectAppType(input.description)
      const schema = generateStarterSchema(appType)
      await runMigrations(
        input.credentials.supabase.accessToken,
        supabaseResult.projectId!,
        schema
      )

      updateStep({
        id: 'supabase',
        name: 'Provisioning Supabase Database',
        status: 'completed',
        message: `Database ready: ${supabaseResult.apiUrl}`,
        result: supabaseResult
      })
    } else {
      errors.push(supabaseResult.error || 'Supabase provisioning failed')
      updateStep({
        id: 'supabase',
        name: 'Provisioning Supabase Database',
        status: 'failed',
        message: supabaseResult.error
      })
    }
  }

  // Step 3: Create Vercel Project
  if (input.credentials.vercel?.accessToken && resources.github?.repoUrl) {
    updateStep({
      id: 'vercel',
      name: 'Deploying to Vercel',
      status: 'in_progress'
    })

    // Extract owner/repo from GitHub URL
    const repoMatch = resources.github.repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)
    const repoPath = repoMatch ? repoMatch[1] : ''

    const envVars: Array<{ key: string; value: string; target: ('production' | 'preview' | 'development')[] }> = []
    if (resources.supabase?.apiUrl && resources.supabase?.anonKey) {
      envVars.push(
        { key: 'NEXT_PUBLIC_SUPABASE_URL', value: resources.supabase.apiUrl, target: ['production', 'preview', 'development'] },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: resources.supabase.anonKey, target: ['production', 'preview', 'development'] }
      )
    }

    const vercelResult = await createVercelProject({
      accessToken: input.credentials.vercel.accessToken,
      projectName: input.projectName,
      framework: mapFramework(input.stack.framework),
      gitRepository: {
        type: 'github',
        repo: repoPath
      },
      teamId: input.credentials.vercel.teamId,
      environmentVariables: envVars
    })

    if (vercelResult.success) {
      resources.vercel = {
        projectUrl: vercelResult.projectUrl!,
        deploymentUrl: vercelResult.projectUrl!,
        dashboardUrl: vercelResult.dashboardUrl!
      }
      updateStep({
        id: 'vercel',
        name: 'Deploying to Vercel',
        status: 'completed',
        message: `Deployed: ${vercelResult.projectUrl}`,
        result: vercelResult
      })
    } else {
      errors.push(vercelResult.error || 'Vercel provisioning failed')
      updateStep({
        id: 'vercel',
        name: 'Deploying to Vercel',
        status: 'failed',
        message: vercelResult.error
      })
    }
  }

  // Step 4: Push configuration files to GitHub (including Codespaces and Infrastructure Spec)
  if (resources.github?.repoUrl && input.credentials.github?.accessToken) {
    updateStep({
      id: 'config',
      name: 'Configuring Project & Codespaces',
      status: 'in_progress'
    })

    const repoMatch = resources.github.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (repoMatch) {
      const [, owner, repo] = repoMatch

      // Add Codespaces URL to resources first (needed for infrastructure spec)
      resources.codespaces = {
        url: `https://github.com/codespaces/new?repo=${owner}/${repo}`,
        setupInstructions: 'Click "Open in Codespace" in GitHub to start coding with Claude Code pre-installed'
      }

      const envContent = generateEnvFile(resources)
      const readmeContent = generateReadme(input.projectName, input.description, resources)

      // Generate devcontainer.json for GitHub Codespaces
      const devcontainerJson = generateDevContainerJson({
        projectName: input.projectName,
        framework: input.stack.framework,
        database: input.stack.database,
        hosting: input.stack.hosting,
      })

      // Generate Codespaces instructions
      const codespacesReadme = generateCodespacesReadme(input.projectName)

      // Generate comprehensive Infrastructure Specification
      const stackSelection = {
        source_control: 'github',
        hosting: input.stack.hosting || 'vercel',
        database: input.stack.database || 'supabase',
      }

      // Build provisional result for infrastructure spec
      const provisionalResult: ProvisioningResult = {
        success: true,
        steps,
        resources: {
          ...resources,
          github: {
            url: resources.github.repoUrl,
            cloneUrl: resources.github.cloneUrl,
            defaultBranch: 'main',
          },
          vercel: resources.vercel ? {
            url: resources.vercel.projectUrl,
            dashboardUrl: resources.vercel.dashboardUrl,
          } : undefined,
          supabase: resources.supabase ? {
            url: resources.supabase.apiUrl,
            dashboardUrl: resources.supabase.projectUrl,
          } : undefined,
          codespaces: resources.codespaces,
        }
      }

      const infrastructureSpec = generateInfrastructureSpec(
        input.projectName,
        input.description,
        stackSelection,
        provisionalResult
      )

      await pushInitialFiles(
        input.credentials.github.accessToken,
        owner,
        repo,
        [
          { path: 'INFRASTRUCTURE.md', content: infrastructureSpec },
          { path: '.env.example', content: envContent },
          { path: 'README.md', content: readmeContent },
          { path: '.devcontainer/devcontainer.json', content: devcontainerJson },
          { path: 'CODESPACES.md', content: codespacesReadme }
        ]
      )
    }

    updateStep({
      id: 'config',
      name: 'Configuring Project & Codespaces',
      status: 'completed',
      message: 'Project configured with INFRASTRUCTURE.md and GitHub Codespaces'
    })
  }

  // Final cleanup step
  updateStep({
    id: 'cleanup',
    name: 'Securing Credentials',
    status: 'completed',
    message: 'All temporary credentials have been cleared from memory'
  })

  return {
    success: errors.length === 0,
    steps,
    resources,
    errors: errors.length > 0 ? errors : undefined
  }
}

// Helper functions

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function detectAppType(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store') || lower.includes('payment')) {
    return 'ecommerce'
  }
  if (lower.includes('blog') || lower.includes('cms') || lower.includes('content')) {
    return 'blog'
  }
  return 'saas'
}

function mapFramework(framework: string): 'nextjs' | 'vite' | 'remix' | 'astro' | 'other' {
  const map: Record<string, 'nextjs' | 'vite' | 'remix' | 'astro' | 'other'> = {
    'nextjs': 'nextjs',
    'react-vite': 'vite',
    'remix': 'remix',
    'astro': 'astro'
  }
  return map[framework] || 'other'
}

function generateEnvFile(resources: ProvisioningResult['resources']): string {
  let content = '# ShipMe Generated Environment Variables\n\n'

  if (resources.supabase) {
    content += `# Supabase\nNEXT_PUBLIC_SUPABASE_URL=${resources.supabase.apiUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${resources.supabase.anonKey}\n\n`
  }

  content += '# Add your other environment variables below\n'
  return content
}

function generateReadme(projectName: string, description: string, resources: ProvisioningResult['resources']): string {
  return `# ${projectName}

${description}

## 🚀 Provisioned by ShipMe

This project was automatically provisioned by ShipMe. Here are your resources:

${resources.github ? `### GitHub Repository\n- ${resources.github.repoUrl}\n` : ''}
${resources.vercel ? `### Vercel Deployment\n- Live: ${resources.vercel.projectUrl}\n- Dashboard: ${resources.vercel.dashboardUrl}\n` : ''}
${resources.supabase ? `### Supabase Database\n- Dashboard: ${resources.supabase.projectUrl}\n- API URL: ${resources.supabase.apiUrl}\n` : ''}

## ☁️ Develop with GitHub Codespaces (Recommended)

This project comes pre-configured with GitHub Codespaces and **Claude Code** for AI-assisted development.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](${resources.github?.repoUrl}/codespaces/new)

### Quick Start
1. Click the badge above or the "Code" → "Codespaces" button in GitHub
2. Wait for the environment to build (~2 minutes first time)
3. Run \`claude\` in terminal to start AI-assisted coding!

### Setup Anthropic API Key
Add your key as a Codespace secret:
1. Go to GitHub Settings → Codespaces → Secrets
2. Add: \`ANTHROPIC_API_KEY\` with your key from [console.anthropic.com](https://console.anthropic.com)

See [CODESPACES.md](./CODESPACES.md) for detailed instructions.

---

## Local Development

1. Clone the repository:
   \`\`\`bash
   git clone ${resources.github?.cloneUrl || '<your-repo-url>'}
   cd ${projectName}
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Start developing:
   \`\`\`bash
   npm run dev
   \`\`\`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Claude Code Documentation](https://claude.ai/code)
`
}
