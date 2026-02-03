/**
 * Service Registry - Defines all supported infrastructure providers
 * This allows dynamic UI generation and future MCP integration
 */

export type ServiceCategory = 'hosting' | 'database' | 'source_control' | 'auth'

export interface ServiceProvider {
  id: string
  name: string
  category: ServiceCategory
  description: string
  icon: string // Icon name from lucide-react
  color: string // Tailwind color class
  bgColor: string
  // Credential configuration
  credentials: {
    tokenLabel: string
    tokenPlaceholder: string
    extraFields?: Array<{
      id: string
      label: string
      placeholder: string
      helpText?: string
    }>
  }
  // Instructions for getting API token
  instructions: {
    title: string
    steps: Array<{
      text: string
      link?: { url: string; label: string }
    }>
  }
  // Feature flags
  features: {
    supportsProvisioning: boolean // Can we auto-provision via API?
    supportsMCP: boolean // Is there an MCP server available?
    comingSoon?: boolean // Show as "coming soon"
  }
}

// ============================================
// HOSTING PROVIDERS
// ============================================

export const HOSTING_PROVIDERS: ServiceProvider[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'hosting',
    description: 'Deploy with zero config, automatic HTTPS',
    icon: 'Globe',
    color: 'text-[#d4ff00]',
    bgColor: 'bg-[#d4ff00]',
    credentials: {
      tokenLabel: 'Access Token',
      tokenPlaceholder: 'xxxxxxxxxxxxxxxx',
      extraFields: [
        {
          id: 'teamId',
          label: 'Team ID (optional)',
          placeholder: 'team_xxxx',
          helpText: 'Leave empty for personal account'
        }
      ]
    },
    instructions: {
      title: 'How to get your Vercel token',
      steps: [
        {
          text: 'Go to Vercel Dashboard → Settings → Tokens',
          link: { url: 'https://vercel.com/account/tokens', label: 'Open Vercel Tokens' }
        },
        { text: 'Click "Create" to generate a new token' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Set scope to "Full Account" for provisioning' },
        { text: 'Click "Create Token" and copy it' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'hosting',
    description: 'Instant rollbacks, split testing, forms',
    icon: 'Globe',
    color: 'text-[#00c7b7]',
    bgColor: 'bg-[#00c7b7]',
    credentials: {
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'xxxxxxxxxxxxxxxx'
    },
    instructions: {
      title: 'How to get your Netlify token',
      steps: [
        {
          text: 'Go to Netlify User Settings → Applications → Personal Access Tokens',
          link: { url: 'https://app.netlify.com/user/applications#personal-access-tokens', label: 'Open Netlify Tokens' }
        },
        { text: 'Click "New access token"' },
        { text: 'Give it a description like "ShipMe"' },
        { text: 'Click "Generate token" and copy it' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'hosting',
    description: 'Infrastructure platform with databases included',
    icon: 'Train',
    color: 'text-[#a855f7]',
    bgColor: 'bg-[#a855f7]',
    credentials: {
      tokenLabel: 'API Token',
      tokenPlaceholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    },
    instructions: {
      title: 'How to get your Railway token',
      steps: [
        {
          text: 'Go to Railway Dashboard → Account Settings → Tokens',
          link: { url: 'https://railway.app/account/tokens', label: 'Open Railway Tokens' }
        },
        { text: 'Click "Create Token"' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Copy the generated token' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'render',
    name: 'Render',
    category: 'hosting',
    description: 'Unified cloud for apps, databases, cron jobs',
    icon: 'Cloud',
    color: 'text-[#46e3b7]',
    bgColor: 'bg-[#46e3b7]',
    credentials: {
      tokenLabel: 'API Key',
      tokenPlaceholder: 'rnd_xxxxxxxxxxxx'
    },
    instructions: {
      title: 'How to get your Render API key',
      steps: [
        {
          text: 'Go to Render Dashboard → Account Settings → API Keys',
          link: { url: 'https://dashboard.render.com/u/settings#api-keys', label: 'Open Render API Keys' }
        },
        { text: 'Click "Create API Key"' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Copy the generated key (starts with rnd_)' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  }
]

// ============================================
// DATABASE PROVIDERS
// ============================================

export const DATABASE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    description: 'Postgres + Auth + Realtime + Storage',
    icon: 'Database',
    color: 'text-[#3ecf8e]',
    bgColor: 'bg-[#3ecf8e]',
    credentials: {
      tokenLabel: 'Access Token',
      tokenPlaceholder: 'sbp_xxxxxxxxxxxx',
      extraFields: [
        {
          id: 'organizationId',
          label: 'Organization ID',
          placeholder: 'org_xxxxxxxxxxxx',
          helpText: 'Find in your dashboard URL: supabase.com/dashboard/org/[org_id]'
        }
      ]
    },
    instructions: {
      title: 'How to get your Supabase token',
      steps: [
        {
          text: 'Go to Supabase Dashboard → Account → Access Tokens',
          link: { url: 'https://supabase.com/dashboard/account/tokens', label: 'Open Supabase Tokens' }
        },
        { text: 'Click "Generate new token"' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Copy the generated token (starts with sbp_)' },
        {
          text: 'Also note your Organization ID from settings',
          link: { url: 'https://supabase.com/dashboard/org', label: 'View Organizations' }
        }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    category: 'database',
    description: 'Serverless MySQL with branching',
    icon: 'Database',
    color: 'text-[#f472b6]',
    bgColor: 'bg-[#f472b6]',
    credentials: {
      tokenLabel: 'Service Token',
      tokenPlaceholder: 'pscale_tkn_xxxx',
      extraFields: [
        {
          id: 'organizationId',
          label: 'Organization Name',
          placeholder: 'my-org',
          helpText: 'Your PlanetScale organization slug'
        }
      ]
    },
    instructions: {
      title: 'How to get your PlanetScale token',
      steps: [
        {
          text: 'Go to PlanetScale Dashboard → Settings → Service Tokens',
          link: { url: 'https://app.planetscale.com/~/settings/service-tokens', label: 'Open PlanetScale Tokens' }
        },
        { text: 'Click "New service token"' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Select permissions: create_databases, delete_databases' },
        { text: 'Copy the token (starts with pscale_tkn_)' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    category: 'database',
    description: 'Serverless Postgres with branching',
    icon: 'Database',
    color: 'text-[#00e599]',
    bgColor: 'bg-[#00e599]',
    credentials: {
      tokenLabel: 'API Key',
      tokenPlaceholder: 'neon_api_key_xxxx'
    },
    instructions: {
      title: 'How to get your Neon API key',
      steps: [
        {
          text: 'Go to Neon Console → Account Settings → API Keys',
          link: { url: 'https://console.neon.tech/app/settings/api-keys', label: 'Open Neon API Keys' }
        },
        { text: 'Click "Create new API key"' },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Copy the generated key' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    category: 'database',
    description: 'Document database, fully managed',
    icon: 'Database',
    color: 'text-[#00ed64]',
    bgColor: 'bg-[#00ed64]',
    credentials: {
      tokenLabel: 'Public API Key',
      tokenPlaceholder: 'xxxxxxxx',
      extraFields: [
        {
          id: 'privateKey',
          label: 'Private API Key',
          placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        },
        {
          id: 'orgId',
          label: 'Organization ID',
          placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx'
        }
      ]
    },
    instructions: {
      title: 'How to get your MongoDB Atlas API keys',
      steps: [
        {
          text: 'Go to MongoDB Atlas → Organization Access Manager → API Keys',
          link: { url: 'https://cloud.mongodb.com/v2#/org/apiKeys', label: 'Open Atlas API Keys' }
        },
        { text: 'Click "Create API Key"' },
        { text: 'Give it a description like "ShipMe"' },
        { text: 'Set permissions: Organization Project Creator' },
        { text: 'Copy both Public and Private keys' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  }
]

// ============================================
// SOURCE CONTROL PROVIDERS
// ============================================

export const SOURCE_CONTROL_PROVIDERS: ServiceProvider[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'source_control',
    description: 'World\'s largest code hosting platform',
    icon: 'Github',
    color: 'text-[#00f5ff]',
    bgColor: 'bg-[#00f5ff]',
    credentials: {
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxx'
    },
    instructions: {
      title: 'How to get your GitHub token',
      steps: [
        {
          text: 'Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)',
          link: { url: 'https://github.com/settings/tokens/new', label: 'Open GitHub Tokens' }
        },
        { text: 'Click "Generate new token (classic)"' },
        { text: 'Give it a name like "ShipMe Provisioning"' },
        { text: 'Select scopes: repo, workflow, admin:repo_hook' },
        { text: 'Click "Generate token" and copy it (starts with ghp_)' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'source_control',
    description: 'Complete DevOps platform',
    icon: 'GitBranch',
    color: 'text-[#fc6d26]',
    bgColor: 'bg-[#fc6d26]',
    credentials: {
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'glpat-xxxxxxxxxxxx'
    },
    instructions: {
      title: 'How to get your GitLab token',
      steps: [
        {
          text: 'Go to GitLab → User Settings → Access Tokens',
          link: { url: 'https://gitlab.com/-/user_settings/personal_access_tokens', label: 'Open GitLab Tokens' }
        },
        { text: 'Give it a name like "ShipMe"' },
        { text: 'Select scopes: api, read_repository, write_repository' },
        { text: 'Click "Create personal access token"' },
        { text: 'Copy the token (starts with glpat-)' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    category: 'source_control',
    description: 'Git solution for teams using Jira',
    icon: 'GitBranch',
    color: 'text-[#0052cc]',
    bgColor: 'bg-[#0052cc]',
    credentials: {
      tokenLabel: 'App Password',
      tokenPlaceholder: 'xxxxxxxxxxxx',
      extraFields: [
        {
          id: 'username',
          label: 'Bitbucket Username',
          placeholder: 'your-username'
        }
      ]
    },
    instructions: {
      title: 'How to get your Bitbucket app password',
      steps: [
        {
          text: 'Go to Bitbucket → Personal Settings → App Passwords',
          link: { url: 'https://bitbucket.org/account/settings/app-passwords/', label: 'Open Bitbucket App Passwords' }
        },
        { text: 'Click "Create app password"' },
        { text: 'Give it a label like "ShipMe"' },
        { text: 'Select permissions: Repositories (Read, Write, Admin)' },
        { text: 'Click "Create" and copy the password' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  }
]

// ============================================
// AUTH PROVIDERS (Optional)
// ============================================

export const AUTH_PROVIDERS: ServiceProvider[] = [
  {
    id: 'supabase_auth',
    name: 'Supabase Auth',
    category: 'auth',
    description: 'Included with Supabase - no extra setup',
    icon: 'Shield',
    color: 'text-[#3ecf8e]',
    bgColor: 'bg-[#3ecf8e]',
    credentials: {
      tokenLabel: 'Uses Supabase credentials',
      tokenPlaceholder: ''
    },
    instructions: {
      title: 'Supabase Auth Setup',
      steps: [
        { text: 'Supabase Auth is automatically configured when you use Supabase' },
        { text: 'No additional credentials required' }
      ]
    },
    features: {
      supportsProvisioning: true,
      supportsMCP: false
    }
  },
  {
    id: 'clerk',
    name: 'Clerk',
    category: 'auth',
    description: 'Drop-in auth with pre-built components',
    icon: 'Shield',
    color: 'text-[#6c47ff]',
    bgColor: 'bg-[#6c47ff]',
    credentials: {
      tokenLabel: 'Secret Key',
      tokenPlaceholder: 'sk_live_xxxx'
    },
    instructions: {
      title: 'How to get your Clerk keys',
      steps: [
        {
          text: 'Go to Clerk Dashboard → API Keys',
          link: { url: 'https://dashboard.clerk.com/', label: 'Open Clerk Dashboard' }
        },
        { text: 'Copy your "Publishable key" (for frontend)' },
        { text: 'Copy your "Secret key" (for backend)' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'auth',
    description: 'Enterprise-grade identity platform',
    icon: 'Shield',
    color: 'text-[#eb5424]',
    bgColor: 'bg-[#eb5424]',
    credentials: {
      tokenLabel: 'Management API Token',
      tokenPlaceholder: 'xxxxxxxxxxxx',
      extraFields: [
        {
          id: 'domain',
          label: 'Auth0 Domain',
          placeholder: 'your-tenant.auth0.com'
        }
      ]
    },
    instructions: {
      title: 'How to get your Auth0 credentials',
      steps: [
        {
          text: 'Go to Auth0 Dashboard → Applications → APIs',
          link: { url: 'https://manage.auth0.com/', label: 'Open Auth0 Dashboard' }
        },
        { text: 'Select "Auth0 Management API"' },
        { text: 'Go to "API Explorer" tab' },
        { text: 'Copy the token or create an application for ShipMe' }
      ]
    },
    features: {
      supportsProvisioning: false,
      supportsMCP: false,
      comingSoon: true
    }
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export const ALL_PROVIDERS = [
  ...HOSTING_PROVIDERS,
  ...DATABASE_PROVIDERS,
  ...SOURCE_CONTROL_PROVIDERS,
  ...AUTH_PROVIDERS
]

export function getProviderById(id: string): ServiceProvider | undefined {
  return ALL_PROVIDERS.find(p => p.id === id)
}

export function getProvidersByCategory(category: ServiceCategory): ServiceProvider[] {
  return ALL_PROVIDERS.filter(p => p.category === category)
}

export function getSupportedProviders(): ServiceProvider[] {
  return ALL_PROVIDERS.filter(p => p.features.supportsProvisioning && !p.features.comingSoon)
}

export function getDefaultStack() {
  return {
    source_control: 'github',
    hosting: 'vercel',
    database: 'supabase',
    auth: 'supabase_auth'
  }
}

// Map Claude's recommendation to our provider IDs
export function mapRecommendationToProviders(recommendation: {
  framework?: string
  database?: string
  hosting?: string
}): {
  source_control: string
  hosting: string
  database: string
  auth: string
} {
  const defaults = getDefaultStack()

  // Map hosting recommendations
  const hostingMap: Record<string, string> = {
    'vercel': 'vercel',
    'netlify': 'netlify',
    'railway': 'railway',
    'render': 'render',
    'aws': 'vercel', // fallback
    'heroku': 'railway', // closest alternative
  }

  // Map database recommendations
  const dbMap: Record<string, string> = {
    'supabase': 'supabase',
    'postgresql': 'supabase',
    'postgres': 'supabase',
    'planetscale': 'planetscale',
    'mysql': 'planetscale',
    'neon': 'neon',
    'mongodb': 'mongodb',
    'firebase': 'supabase', // fallback
  }

  const hostingKey = recommendation.hosting?.toLowerCase() || ''
  const dbKey = recommendation.database?.toLowerCase() || ''

  return {
    source_control: defaults.source_control,
    hosting: hostingMap[hostingKey] || defaults.hosting,
    database: dbMap[dbKey] || defaults.database,
    auth: defaults.auth
  }
}
