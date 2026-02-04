/**
 * Infrastructure Specification Generator
 * Generates comprehensive INFRASTRUCTURE.md documentation
 */

import { ProvisioningResult } from './types'

// Local type definition (ServiceConnector removed in v2.0)
interface StackSelection {
  infrastructure?: string
  source_control?: string
  hosting?: string
  database?: string
  [key: string]: any
}

interface ServiceSpec {
  name: string
  category: string
  purpose: string
  provisioned: {
    resource: string
    details: string[]
  }[]
  freeTier: {
    includes: string[]
    limits: string[]
  }
  currentPlan: string
  monthlyCost: string
  whenToUpgrade: string[]
  upgradePath: {
    plan: string
    cost: string
    benefits: string[]
  }
  dashboardUrl: string
  docsUrl: string
  statusPageUrl?: string
}

interface InfrastructureSpec {
  projectName: string
  description: string
  generatedAt: string
  stack: StackSelection
  services: ServiceSpec[]
  totalMonthlyCost: string
  environmentVariables: {
    name: string
    service: string
    description: string
    whereToFind: string
  }[]
  nextSteps: string[]
  maintenanceChecklist: string[]
}

const SERVICE_SPECS: Record<string, ServiceSpec> = {
  github: {
    name: 'GitHub',
    category: 'Source Control & CI/CD',
    purpose: 'Version control, code hosting, and GitHub Actions for CI/CD pipelines',
    provisioned: [
      {
        resource: 'Repository',
        details: [
          'Private repository with branch protection',
          'Main branch as default',
          'Issue and PR templates configured',
        ],
      },
      {
        resource: 'GitHub Actions',
        details: [
          'CI workflow for tests and linting',
          'CD workflow for automatic deployments',
          'Dependabot for security updates',
        ],
      },
    ],
    freeTier: {
      includes: [
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Unlimited collaborators',
        '500 MB package storage',
        '2,000 CI/CD minutes/month',
        'Community support',
      ],
      limits: [
        'Actions minutes limited on private repos (2,000/month)',
        'No required reviewers on private repos',
        'Basic security features only',
        'No code owners file enforcement',
      ],
    },
    currentPlan: 'Free',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Need more than 2,000 CI/CD minutes per month',
      'Require code owners and required reviewers',
      'Need advanced security features (SAST, secret scanning)',
      'Want protected branches with status checks',
      'Team size exceeds collaboration needs',
    ],
    upgradePath: {
      plan: 'GitHub Pro / Team',
      cost: '$4/user/month (Pro) or $4/user/month (Team)',
      benefits: [
        '3,000 CI/CD minutes/month',
        'Required reviewers',
        'Code owners',
        'Protected branches',
        'Draft pull requests',
      ],
    },
    dashboardUrl: 'https://github.com',
    docsUrl: 'https://docs.github.com',
    statusPageUrl: 'https://www.githubstatus.com',
  },

  vercel: {
    name: 'Vercel',
    category: 'Hosting & Deployment',
    purpose: 'Frontend hosting with edge network, serverless functions, and automatic deployments',
    provisioned: [
      {
        resource: 'Project',
        details: [
          'Connected to GitHub repository',
          'Automatic deployments on push',
          'Preview deployments for PRs',
        ],
      },
      {
        resource: 'Domains',
        details: [
          'Free .vercel.app subdomain',
          'Custom domain support ready',
          'Automatic SSL certificates',
        ],
      },
      {
        resource: 'Environment Variables',
        details: [
          'Production, Preview, and Development environments',
          'Encrypted at rest',
          'Automatic injection during build',
        ],
      },
    ],
    freeTier: {
      includes: [
        'Unlimited deployments',
        'Automatic HTTPS',
        '100 GB bandwidth/month',
        'Serverless functions (100 GB-hrs)',
        'Edge functions (500K invocations)',
        'Preview deployments',
        'Automatic CI/CD from Git',
      ],
      limits: [
        '1 team member only',
        'No password protection',
        'Community support only',
        '10 second function timeout',
        'No advanced analytics',
      ],
    },
    currentPlan: 'Hobby',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Need more than 1 team member',
      'Require password-protected previews',
      'Function timeout > 10 seconds needed',
      'Need advanced analytics and logs',
      'Require priority support',
      'Bandwidth exceeds 100 GB/month',
    ],
    upgradePath: {
      plan: 'Vercel Pro',
      cost: '$20/user/month',
      benefits: [
        '1 TB bandwidth/month',
        '60 second function timeout',
        'Password protection',
        'Advanced analytics',
        'Email support',
        'Unlimited team members',
      ],
    },
    dashboardUrl: 'https://vercel.com/dashboard',
    docsUrl: 'https://vercel.com/docs',
    statusPageUrl: 'https://www.vercel-status.com',
  },

  supabase: {
    name: 'Supabase',
    category: 'Database & Backend',
    purpose: 'PostgreSQL database, authentication, real-time subscriptions, and storage',
    provisioned: [
      {
        resource: 'Database',
        details: [
          'PostgreSQL 15 database',
          'Automatic backups (paid plans)',
          'Connection pooling enabled',
        ],
      },
      {
        resource: 'Authentication',
        details: [
          'Email/password auth configured',
          'Social auth providers ready',
          'Row Level Security enabled',
        ],
      },
      {
        resource: 'Storage',
        details: [
          'File storage bucket created',
          'Public and private buckets',
          'CDN delivery',
        ],
      },
      {
        resource: 'Edge Functions',
        details: [
          'Deno-based serverless functions',
          'Global edge deployment',
          'TypeScript support',
        ],
      },
    ],
    freeTier: {
      includes: [
        '500 MB database space',
        '1 GB file storage',
        '2 GB bandwidth/month',
        '50,000 monthly active users',
        'Unlimited API requests',
        'Social auth providers',
        'Real-time subscriptions',
        'Edge functions (500K invocations)',
      ],
      limits: [
        '2 free projects only',
        'Project pauses after 1 week of inactivity',
        'No daily backups',
        'Community support only',
        'Shared compute resources',
      ],
    },
    currentPlan: 'Free',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Database exceeds 500 MB',
      'Need project to stay always-on',
      'Require daily backups',
      'Need dedicated compute resources',
      'Require priority support',
      'Need more than 2 projects',
    ],
    upgradePath: {
      plan: 'Supabase Pro',
      cost: '$25/month',
      benefits: [
        '8 GB database space',
        '100 GB bandwidth/month',
        'Daily backups (7 day retention)',
        'No project pausing',
        'Email support',
        'Unlimited projects',
      ],
    },
    dashboardUrl: 'https://supabase.com/dashboard',
    docsUrl: 'https://supabase.com/docs',
    statusPageUrl: 'https://status.supabase.com',
  },

  netlify: {
    name: 'Netlify',
    category: 'Hosting & Deployment',
    purpose: 'JAMstack hosting with edge functions and form handling',
    provisioned: [
      {
        resource: 'Site',
        details: [
          'Connected to Git repository',
          'Automatic deployments',
          'Deploy previews for PRs',
        ],
      },
    ],
    freeTier: {
      includes: [
        '100 GB bandwidth/month',
        '300 build minutes/month',
        'Automatic HTTPS',
        'Form handling (100 submissions)',
        'Serverless functions',
      ],
      limits: [
        '1 team member',
        'Limited analytics',
        'Community support',
      ],
    },
    currentPlan: 'Starter',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Need more build minutes',
      'Require team collaboration',
      'Need advanced analytics',
    ],
    upgradePath: {
      plan: 'Netlify Pro',
      cost: '$19/member/month',
      benefits: [
        '1 TB bandwidth',
        '25,000 build minutes',
        'Background functions',
        'Analytics',
      ],
    },
    dashboardUrl: 'https://app.netlify.com',
    docsUrl: 'https://docs.netlify.com',
  },

  railway: {
    name: 'Railway',
    category: 'Hosting & Database',
    purpose: 'Full-stack deployment platform with managed databases',
    provisioned: [
      {
        resource: 'Service',
        details: [
          'Container deployment',
          'Automatic scaling',
          'Connected to Git repository',
        ],
      },
    ],
    freeTier: {
      includes: [
        '$5 free credits/month',
        '512 MB RAM',
        '1 GB disk',
        'Automatic deployments',
      ],
      limits: [
        'Limited to $5/month usage',
        'Resources scale with usage',
        'Community support',
      ],
    },
    currentPlan: 'Hobby',
    monthlyCost: '$0 (up to $5 usage)',
    whenToUpgrade: [
      'Exceed $5/month usage',
      'Need more resources',
      'Require team features',
    ],
    upgradePath: {
      plan: 'Railway Pro',
      cost: '$20/seat/month + usage',
      benefits: [
        'Unlimited usage',
        'Team collaboration',
        'Priority support',
        'Advanced networking',
      ],
    },
    dashboardUrl: 'https://railway.app/dashboard',
    docsUrl: 'https://docs.railway.app',
  },

  planetscale: {
    name: 'PlanetScale',
    category: 'Database',
    purpose: 'Serverless MySQL-compatible database with branching',
    provisioned: [
      {
        resource: 'Database',
        details: [
          'MySQL-compatible database',
          'Branch-based workflow',
          'Connection pooling',
        ],
      },
    ],
    freeTier: {
      includes: [
        '5 GB storage',
        '1 billion row reads/month',
        '10 million row writes/month',
        '1 production branch',
        '1 development branch',
      ],
      limits: [
        '1 database only',
        'Community support',
        'Limited branches',
      ],
    },
    currentPlan: 'Hobby',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Exceed storage limits',
      'Need more branches',
      'Require insights and analytics',
    ],
    upgradePath: {
      plan: 'PlanetScale Scaler',
      cost: '$29/month',
      benefits: [
        '10 GB storage',
        '100 billion row reads',
        'Unlimited branches',
        'Query insights',
      ],
    },
    dashboardUrl: 'https://app.planetscale.com',
    docsUrl: 'https://docs.planetscale.com',
  },

  neon: {
    name: 'Neon',
    category: 'Database',
    purpose: 'Serverless PostgreSQL with branching and autoscaling',
    provisioned: [
      {
        resource: 'Database',
        details: [
          'PostgreSQL 15 database',
          'Branching workflow',
          'Autoscaling compute',
        ],
      },
    ],
    freeTier: {
      includes: [
        '512 MB storage',
        '24/7 availability',
        'Branching',
        'Connection pooling',
        'Autoscaling (0.25-2 CU)',
      ],
      limits: [
        '1 project',
        '10 branches',
        'Community support',
        '100 hours compute/month',
      ],
    },
    currentPlan: 'Free Tier',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Exceed storage limits',
      'Need more compute hours',
      'Require more projects',
    ],
    upgradePath: {
      plan: 'Neon Launch',
      cost: '$19/month',
      benefits: [
        '10 GB storage',
        '300 compute hours',
        'Unlimited branches',
        'Email support',
      ],
    },
    dashboardUrl: 'https://console.neon.tech',
    docsUrl: 'https://neon.tech/docs',
  },

  codespaces: {
    name: 'GitHub Codespaces',
    category: 'Development Environment',
    purpose: 'Cloud-based development environment with VS Code',
    provisioned: [
      {
        resource: 'Dev Container',
        details: [
          'Pre-configured development environment',
          'Claude Code pre-installed',
          'All dependencies ready',
        ],
      },
    ],
    freeTier: {
      includes: [
        '60 core hours/month (30 hrs on 2-core)',
        '15 GB storage/month',
        'Full VS Code in browser',
        'Pre-configured dev containers',
        'Port forwarding',
        'Dotfiles support',
      ],
      limits: [
        'Limited to personal accounts',
        'Additional usage billed per hour',
        '2-core: $0.18/hr after free tier',
        '4-core: $0.36/hr',
      ],
    },
    currentPlan: 'Free Tier',
    monthlyCost: '$0',
    whenToUpgrade: [
      'Exceed 60 core hours/month',
      'Need more powerful machines',
      'Require GPU access',
    ],
    upgradePath: {
      plan: 'Pay-as-you-go',
      cost: '$0.18-$2.88/hr depending on machine',
      benefits: [
        'Unlimited hours',
        'Up to 32-core machines',
        'GPU-enabled machines',
        'More storage',
      ],
    },
    dashboardUrl: 'https://github.com/codespaces',
    docsUrl: 'https://docs.github.com/codespaces',
  },
}

export function generateInfrastructureSpec(
  projectName: string,
  description: string,
  stack: StackSelection,
  result: ProvisioningResult
): string {
  const services: ServiceSpec[] = [
    stack.source_control ? SERVICE_SPECS[stack.source_control as keyof typeof SERVICE_SPECS] : undefined,
    stack.hosting ? SERVICE_SPECS[stack.hosting as keyof typeof SERVICE_SPECS] : undefined,
    stack.database ? SERVICE_SPECS[stack.database as keyof typeof SERVICE_SPECS] : undefined,
    SERVICE_SPECS.codespaces,
  ].filter((s): s is ServiceSpec => s !== undefined)

  const spec: InfrastructureSpec = {
    projectName,
    description,
    generatedAt: new Date().toISOString(),
    stack,
    services,
    totalMonthlyCost: '$0 (all services on free tier)',
    environmentVariables: [
      {
        name: 'DATABASE_URL',
        service: 'Supabase',
        description: 'PostgreSQL connection string',
        whereToFind: 'Supabase Dashboard → Settings → Database → Connection string',
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        service: 'Supabase',
        description: 'Public API URL for client-side access',
        whereToFind: 'Supabase Dashboard → Settings → API → Project URL',
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        service: 'Supabase',
        description: 'Public anonymous key for client-side access',
        whereToFind: 'Supabase Dashboard → Settings → API → anon public key',
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        service: 'Supabase',
        description: 'Service role key for server-side operations (keep secret!)',
        whereToFind: 'Supabase Dashboard → Settings → API → service_role key',
      },
      {
        name: 'ANTHROPIC_API_KEY',
        service: 'Anthropic',
        description: 'Claude API key for AI features',
        whereToFind: 'https://console.anthropic.com/settings/keys',
      },
    ],
    nextSteps: [
      'Set up your local development environment or open in GitHub Codespaces',
      'Create your Anthropic API key at https://console.anthropic.com/settings/keys',
      'Add the ANTHROPIC_API_KEY to your Codespace secrets or local .env file',
      'Review and customize the database schema in Supabase',
      'Configure authentication providers if needed',
      'Set up custom domain (optional)',
      'Review CI/CD workflows and adjust as needed',
    ],
    maintenanceChecklist: [
      'Monitor usage on all service dashboards weekly',
      'Review Dependabot security alerts',
      'Check deployment logs for errors',
      'Monitor database size approaching limits',
      'Review API usage and rate limits',
      'Update dependencies monthly',
      'Backup important data regularly',
    ],
  }

  return generateMarkdown(spec, result)
}

function generateMarkdown(spec: InfrastructureSpec, result: ProvisioningResult): string {
  const md = `# Infrastructure Specification

> **Project:** ${spec.projectName}
> **Generated:** ${new Date(spec.generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
> **Total Monthly Cost:** ${spec.totalMonthlyCost}

## Overview

${spec.description}

This document provides a comprehensive overview of all infrastructure services provisioned for this project, including their purposes, costs, limitations, and upgrade paths.

---

## Quick Links

| Service | Dashboard | Documentation | Status |
|---------|-----------|---------------|--------|
${spec.services.map(s =>
  `| ${s.name} | [Dashboard](${s.dashboardUrl}) | [Docs](${s.docsUrl}) | ${s.statusPageUrl ? `[Status](${s.statusPageUrl})` : 'N/A'} |`
).join('\n')}

---

## Provisioned Resources

${result.resources.github ? `### GitHub Repository
- **URL:** ${result.resources.github.url}
- **Clone:** \`git clone ${result.resources.github.cloneUrl}\`
- **Default Branch:** ${result.resources.github.defaultBranch}
` : ''}

${result.resources.vercel ? `### Vercel Deployment
- **Production URL:** ${result.resources.vercel.url}
- **Project Dashboard:** ${result.resources.vercel.dashboardUrl}
` : ''}

${result.resources.supabase ? `### Supabase Project
- **API URL:** ${result.resources.supabase.url}
- **Dashboard:** ${result.resources.supabase.dashboardUrl}
` : ''}

${result.resources.codespaces ? `### GitHub Codespaces
- **Open in Codespaces:** ${result.resources.codespaces.url}
- **Claude Code:** Pre-installed and ready to use
` : ''}

---

## Service Details

${spec.services.map(service => `
### ${service.name}

**Category:** ${service.category}
**Current Plan:** ${service.currentPlan}
**Monthly Cost:** ${service.monthlyCost}

#### Purpose
${service.purpose}

#### What's Provisioned
${service.provisioned.map(p => `
**${p.resource}**
${p.details.map(d => `- ${d}`).join('\n')}
`).join('\n')}

#### Free Tier Includes
${service.freeTier.includes.map(i => `- ✅ ${i}`).join('\n')}

#### Free Tier Limitations
${service.freeTier.limits.map(l => `- ⚠️ ${l}`).join('\n')}

#### When to Upgrade
Consider upgrading to ${service.upgradePath.plan} (${service.upgradePath.cost}) when:
${service.whenToUpgrade.map(w => `- ${w}`).join('\n')}

**Upgrade Benefits:**
${service.upgradePath.benefits.map(b => `- ${b}`).join('\n')}

---
`).join('\n')}

## Environment Variables

Your application needs these environment variables configured:

| Variable | Service | Description |
|----------|---------|-------------|
${spec.environmentVariables.map(env =>
  `| \`${env.name}\` | ${env.service} | ${env.description} |`
).join('\n')}

### Where to Find Each Variable

${spec.environmentVariables.map(env => `
**${env.name}**
${env.whereToFind}
`).join('\n')}

---

## Claude Code Setup

This project includes GitHub Codespaces configuration with Claude Code pre-installed.

### Getting Started with Claude Code

1. **Open Codespaces**
   - Go to your repository on GitHub
   - Click "Code" → "Codespaces" → "Create codespace on main"
   - Wait for the environment to build (~2-3 minutes)

2. **Create Your Anthropic API Key**
   - Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
   - Click "Create Key"
   - Copy the key (starts with \`sk-ant-\`)

3. **Set the API Key in Codespaces**
   \`\`\`bash
   # Option 1: Set as environment variable
   export ANTHROPIC_API_KEY=sk-ant-your-key-here

   # Option 2: Add to Codespace secrets (recommended for persistence)
   # Go to GitHub Settings → Codespaces → Secrets → New secret
   # Name: ANTHROPIC_API_KEY
   # Value: sk-ant-your-key-here
   \`\`\`

4. **Start Using Claude Code**
   \`\`\`bash
   # Open Claude Code interactive mode
   claude

   # Or run a single command
   claude "explain this codebase"
   \`\`\`

### Claude Code Commands

| Command | Description |
|---------|-------------|
| \`claude\` | Start interactive mode |
| \`claude "prompt"\` | Run single prompt |
| \`claude --help\` | Show all commands |

---

## Cost Summary

| Service | Current Plan | Monthly Cost | Paid Upgrade |
|---------|--------------|--------------|--------------|
${spec.services.map(s =>
  `| ${s.name} | ${s.currentPlan} | ${s.monthlyCost} | ${s.upgradePath.cost} |`
).join('\n')}
| **Total** | | **$0** | |

### Cost Projection

| Monthly Active Users | Estimated Cost | Notes |
|---------------------|----------------|-------|
| 0 - 1,000 | $0 | All free tiers |
| 1,000 - 5,000 | $25-50 | May need Supabase Pro |
| 5,000 - 10,000 | $50-100 | Add Vercel Pro |
| 10,000+ | $100+ | Full paid stack recommended |

---

## Next Steps

${spec.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## Maintenance Checklist

Regular maintenance tasks to keep your infrastructure healthy:

${spec.maintenanceChecklist.map(item => `- [ ] ${item}`).join('\n')}

---

## Support & Resources

- **GitHub Issues:** Report bugs and request features
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- **Claude Code Docs:** [docs.anthropic.com](https://docs.anthropic.com)

---

*This infrastructure specification was automatically generated by ShipMe.*
*Last updated: ${new Date().toISOString()}*
`

  return md
}
