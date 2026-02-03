/**
 * GitHub Codespaces / Dev Container Configuration
 * Generates devcontainer.json for cloud development environments
 */

export interface DevContainerConfig {
  projectName: string
  framework: string
  database: string
  hosting: string
  features?: string[]
}

export interface DevContainer {
  name: string
  image: string
  features: Record<string, object>
  postCreateCommand: string
  postStartCommand?: string
  customizations: {
    vscode: {
      extensions: string[]
      settings?: Record<string, unknown>
    }
  }
  forwardPorts: number[]
  portsAttributes?: Record<number, { label: string; onAutoForward?: string }>
  remoteEnv?: Record<string, string>
}

/**
 * Get the appropriate Docker image based on framework
 */
function getDockerImage(framework: string): string {
  const images: Record<string, string> = {
    nextjs: 'mcr.microsoft.com/devcontainers/javascript-node:20',
    'next.js': 'mcr.microsoft.com/devcontainers/javascript-node:20',
    react: 'mcr.microsoft.com/devcontainers/javascript-node:20',
    vue: 'mcr.microsoft.com/devcontainers/javascript-node:20',
    svelte: 'mcr.microsoft.com/devcontainers/javascript-node:20',
    python: 'mcr.microsoft.com/devcontainers/python:3.11',
    django: 'mcr.microsoft.com/devcontainers/python:3.11',
    flask: 'mcr.microsoft.com/devcontainers/python:3.11',
    fastapi: 'mcr.microsoft.com/devcontainers/python:3.11',
    go: 'mcr.microsoft.com/devcontainers/go:1.21',
    rust: 'mcr.microsoft.com/devcontainers/rust:1',
  }

  const normalizedFramework = framework.toLowerCase()
  return images[normalizedFramework] || images['nextjs']
}

/**
 * Get VS Code extensions based on framework and tools
 */
function getExtensions(framework: string, database: string): string[] {
  const baseExtensions = [
    'dbaeumer.vscode-eslint',
    'esbenp.prettier-vscode',
    'eamodio.gitlens',
    'GitHub.copilot',
  ]

  const frameworkExtensions: Record<string, string[]> = {
    nextjs: [
      'bradlc.vscode-tailwindcss',
      'formulahendry.auto-rename-tag',
    ],
    react: [
      'dsznajder.es7-react-js-snippets',
      'bradlc.vscode-tailwindcss',
    ],
    python: [
      'ms-python.python',
      'ms-python.vscode-pylance',
    ],
    django: [
      'ms-python.python',
      'batisteo.vscode-django',
    ],
  }

  const dbExtensions: Record<string, string[]> = {
    supabase: ['supabase.supabase-vscode'],
    postgresql: ['ckolkman.vscode-postgres'],
    postgres: ['ckolkman.vscode-postgres'],
    mongodb: ['mongodb.mongodb-vscode'],
  }

  const normalizedFramework = framework.toLowerCase()
  const normalizedDb = database.toLowerCase()

  return [
    ...baseExtensions,
    ...(frameworkExtensions[normalizedFramework] || []),
    ...(dbExtensions[normalizedDb] || []),
  ]
}

/**
 * Get post-create commands based on framework
 */
function getPostCreateCommand(framework: string): string {
  const commands = [
    'npm install',
    'npm install -g @anthropic-ai/claude-code',
  ]

  // Add framework-specific setup
  const normalizedFramework = framework.toLowerCase()

  if (normalizedFramework.includes('python') ||
      normalizedFramework.includes('django') ||
      normalizedFramework.includes('flask') ||
      normalizedFramework.includes('fastapi')) {
    commands[0] = 'pip install -r requirements.txt'
    commands.push('pip install anthropic')
  }

  return commands.join(' && ')
}

/**
 * Get forwarded ports based on framework
 */
function getForwardedPorts(framework: string): number[] {
  const portMap: Record<string, number[]> = {
    nextjs: [3000],
    react: [3000, 5173],
    vue: [5173],
    svelte: [5173],
    python: [8000],
    django: [8000],
    flask: [5000],
    fastapi: [8000],
  }

  const normalizedFramework = framework.toLowerCase()
  return portMap[normalizedFramework] || [3000]
}

/**
 * Generate devcontainer.json configuration
 */
export function generateDevContainer(config: DevContainerConfig): DevContainer {
  const ports = getForwardedPorts(config.framework)

  const devcontainer: DevContainer = {
    name: `${config.projectName} - ShipMe`,
    image: getDockerImage(config.framework),
    features: {
      'ghcr.io/devcontainers/features/github-cli:1': {},
      'ghcr.io/devcontainers/features/node:1': {
        version: '20',
      },
    },
    postCreateCommand: getPostCreateCommand(config.framework),
    customizations: {
      vscode: {
        extensions: getExtensions(config.framework, config.database),
        settings: {
          'editor.formatOnSave': true,
          'editor.defaultFormatter': 'esbenp.prettier-vscode',
          'terminal.integrated.defaultProfile.linux': 'bash',
        },
      },
    },
    forwardPorts: ports,
    portsAttributes: ports.reduce((acc, port) => ({
      ...acc,
      [port]: {
        label: port === 3000 ? 'Application' : `Port ${port}`,
        onAutoForward: 'notify',
      },
    }), {}),
    remoteEnv: {
      // Placeholder - user will need to add their own API key
      ANTHROPIC_API_KEY: '${localEnv:ANTHROPIC_API_KEY}',
    },
  }

  return devcontainer
}

/**
 * Generate devcontainer.json as a string
 */
export function generateDevContainerJson(config: DevContainerConfig): string {
  const devcontainer = generateDevContainer(config)
  return JSON.stringify(devcontainer, null, 2)
}

/**
 * Generate README instructions for Codespaces
 */
export function generateCodespacesReadme(projectName: string): string {
  return `## 🚀 Development with GitHub Codespaces

This project is pre-configured for GitHub Codespaces with Claude Code installed.

### Quick Start

1. Click the "Code" button above and select "Open with Codespaces"
2. Create a new Codespace or select an existing one
3. Wait for the environment to build (first time takes ~2 minutes)
4. Start coding with Claude Code: \`claude\`

### Claude Code Setup

To use Claude Code in your Codespace:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it as a Codespace secret:
   - Go to GitHub Settings → Codespaces → Secrets
   - Add a new secret: \`ANTHROPIC_API_KEY\`
   - Set the value to your API key

Or set it temporarily in terminal:
\`\`\`bash
export ANTHROPIC_API_KEY=your_key_here
claude
\`\`\`

### Available Commands

- \`claude\` - Start Claude Code AI assistant
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests

### Environment Variables

Create a \`.env.local\` file with your secrets (these are already configured in Codespaces secrets):

\`\`\`env
ANTHROPIC_API_KEY=your_anthropic_key
\`\`\`

---
*Generated by [ShipMe](https://shipme.dev) - Infrastructure Orchestrator*
`
}

/**
 * Generate the complete devcontainer folder structure
 */
export function generateDevContainerFiles(config: DevContainerConfig): Record<string, string> {
  return {
    '.devcontainer/devcontainer.json': generateDevContainerJson(config),
  }
}
