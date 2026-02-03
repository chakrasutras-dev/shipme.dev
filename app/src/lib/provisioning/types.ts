// Types for the provisioning system

export interface StackConfig {
  framework: 'nextjs' | 'react-vite' | 'remix' | 'astro'
  database: 'supabase' | 'planetscale' | 'neon' | 'firebase'
  hosting: 'vercel' | 'railway' | 'render' | 'netlify'
  additional: string[]
}

export interface ProvisioningInput {
  projectName: string
  description: string
  stack: StackConfig

  // User credentials (temporary, deleted after provisioning)
  credentials: {
    github?: {
      accessToken: string
    }
    vercel?: {
      accessToken: string
      teamId?: string
    }
    supabase?: {
      accessToken: string
      organizationId?: string
    }
  }
}

export interface ProvisioningStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  message?: string
  result?: Record<string, any>
}

export interface ProvisioningResult {
  success: boolean
  steps: ProvisioningStep[]
  resources: {
    github?: {
      repoUrl?: string
      cloneUrl?: string
      // Alternative property names for infrastructure spec
      url?: string
      defaultBranch?: string
    }
    vercel?: {
      projectUrl?: string
      deploymentUrl?: string
      dashboardUrl?: string
      // Alternative property names for infrastructure spec
      url?: string
    }
    supabase?: {
      projectUrl?: string
      apiUrl?: string
      anonKey?: string
      // Alternative property names for infrastructure spec
      url?: string
      dashboardUrl?: string
    }
    codespaces?: {
      url: string
      setupInstructions: string
    }
  }
  errors?: string[]
  // Post-provisioning guidance
  nextSteps?: {
    claudeCodeSetup: {
      title: string
      steps: string[]
      apiKeyUrl: string
    }
  }
}

// Template configurations for different frameworks
export const FRAMEWORK_TEMPLATES: Record<string, {
  repo: string
  branch: string
  description: string
}> = {
  nextjs: {
    repo: 'vercel/next.js',
    branch: 'canary',
    description: 'Next.js starter with App Router'
  },
  'react-vite': {
    repo: 'vitejs/vite',
    branch: 'main',
    description: 'React + Vite starter'
  },
  remix: {
    repo: 'remix-run/remix',
    branch: 'main',
    description: 'Remix starter'
  },
  astro: {
    repo: 'withastro/astro',
    branch: 'main',
    description: 'Astro starter'
  }
}
