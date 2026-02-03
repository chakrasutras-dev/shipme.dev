'use client'

import {
  Github,
  Globe,
  Database,
  Cloud,
  Check,
  Info,
  ExternalLink,
} from 'lucide-react'

interface FreeTierInfoProps {
  selectedStack?: {
    source_control: string
    hosting: string
    database: string
  }
  showCodespaces?: boolean
}

interface ServiceFreeTier {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  freeTier: {
    summary: string
    includes: string[]
    limits: string[]
    upgradePrice?: string
  }
  pricingUrl: string
}

const FREE_TIERS: Record<string, ServiceFreeTier> = {
  github: {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'text-[#00f5ff]',
    bgColor: 'bg-[#00f5ff]',
    freeTier: {
      summary: 'Unlimited public & private repos',
      includes: [
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Unlimited collaborators',
        '500 MB package storage',
        '2,000 CI/CD minutes/month',
        'Community support',
      ],
      limits: [
        'Actions minutes limited on private repos',
        'No required reviewers on private repos',
        'Basic security features only',
      ],
      upgradePrice: '$4/user/month for Pro',
    },
    pricingUrl: 'https://github.com/pricing',
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    icon: Globe,
    color: 'text-[#d4ff00]',
    bgColor: 'bg-[#d4ff00]',
    freeTier: {
      summary: 'Perfect for hobby projects',
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
        '1 team member',
        'No password protection',
        'Community support only',
        '10 second function timeout',
      ],
      upgradePrice: '$20/user/month for Pro',
    },
    pricingUrl: 'https://vercel.com/pricing',
  },
  netlify: {
    id: 'netlify',
    name: 'Netlify',
    icon: Globe,
    color: 'text-[#00c7b7]',
    bgColor: 'bg-[#00c7b7]',
    freeTier: {
      summary: 'Great for static sites & JAMstack',
      includes: [
        '100 GB bandwidth/month',
        '300 build minutes/month',
        'Continuous deployment',
        'Instant rollbacks',
        'Deploy previews',
        'Split testing',
        'Form handling (100 submissions/month)',
      ],
      limits: [
        '1 team member',
        'No analytics',
        'Community support only',
      ],
      upgradePrice: '$19/member/month for Pro',
    },
    pricingUrl: 'https://www.netlify.com/pricing/',
  },
  railway: {
    id: 'railway',
    name: 'Railway',
    icon: Cloud,
    color: 'text-[#a855f7]',
    bgColor: 'bg-[#a855f7]',
    freeTier: {
      summary: '$5 free credits/month (no credit card)',
      includes: [
        '$5 free usage/month',
        'Multiple services per project',
        'Built-in databases (Postgres, Redis, MySQL)',
        'Automatic deployments',
        'Private networking',
        'Instant rollbacks',
      ],
      limits: [
        'Usage-based after $5',
        '512 MB RAM per service',
        '1 GB disk per service',
        'Sleep after 30 min inactivity (Hobby)',
      ],
      upgradePrice: '$5/month + usage for Hobby',
    },
    pricingUrl: 'https://railway.app/pricing',
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    icon: Database,
    color: 'text-[#3ecf8e]',
    bgColor: 'bg-[#3ecf8e]',
    freeTier: {
      summary: 'Generous free tier for side projects',
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
        '2 free projects',
        'Paused after 1 week inactivity',
        'No daily backups',
        'Community support only',
      ],
      upgradePrice: '$25/month for Pro',
    },
    pricingUrl: 'https://supabase.com/pricing',
  },
  planetscale: {
    id: 'planetscale',
    name: 'PlanetScale',
    icon: Database,
    color: 'text-[#f472b6]',
    bgColor: 'bg-[#f472b6]',
    freeTier: {
      summary: 'Serverless MySQL with branching',
      includes: [
        '5 GB storage',
        '1 billion row reads/month',
        '10 million row writes/month',
        '1 production branch',
        '1 development branch',
        'Automatic backups',
      ],
      limits: [
        '1 free database',
        'No horizontal sharding',
        'Community support only',
      ],
      upgradePrice: '$29/month for Scaler',
    },
    pricingUrl: 'https://planetscale.com/pricing',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    icon: Database,
    color: 'text-[#00e599]',
    bgColor: 'bg-[#00e599]',
    freeTier: {
      summary: 'Serverless Postgres with branching',
      includes: [
        '0.5 GB storage',
        '190 compute hours/month',
        'Unlimited projects',
        'Database branching',
        'Automatic suspend',
        'Point-in-time recovery (7 days)',
      ],
      limits: [
        '10 branches per project',
        'Autosuspend after 5 minutes',
        'Community support only',
      ],
      upgradePrice: '$19/month for Launch',
    },
    pricingUrl: 'https://neon.tech/pricing',
  },
  codespaces: {
    id: 'codespaces',
    name: 'GitHub Codespaces',
    icon: Cloud,
    color: 'text-[#6e40c9]',
    bgColor: 'bg-[#6e40c9]',
    freeTier: {
      summary: '60 hours free/month on 2-core',
      includes: [
        '60 core hours/month (30 hrs on 2-core)',
        '15 GB storage/month',
        'Full VS Code in browser',
        'Pre-configured dev containers',
        'Port forwarding',
        'Dotfiles support',
        'GPU-enabled machines (paid)',
      ],
      limits: [
        'Limited to personal accounts',
        'Additional usage billed per hour',
        '2-core: $0.18/hr after free tier',
        '4-core: $0.36/hr',
      ],
      upgradePrice: 'Pay as you go after free tier',
    },
    pricingUrl: 'https://github.com/features/codespaces',
  },
}

export default function FreeTierInfo({
  selectedStack = {
    source_control: 'github',
    hosting: 'vercel',
    database: 'supabase',
  },
  showCodespaces = true,
}: FreeTierInfoProps) {
  // Get the free tier info for selected services
  const services = [
    FREE_TIERS[selectedStack.source_control],
    FREE_TIERS[selectedStack.hosting],
    FREE_TIERS[selectedStack.database],
    showCodespaces ? FREE_TIERS.codespaces : null,
  ].filter((s): s is ServiceFreeTier => s !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-[#00f5ff]" />
        <h3 className="text-lg font-['Syne'] font-bold text-white">
          Free Tier Breakdown
        </h3>
      </div>

      <p className="text-slate-400 text-sm">
        All services below offer generous free tiers. Here&apos;s exactly what you get at $0/month:
      </p>

      <div className="grid gap-4">
        {services.map((service) => {
          const Icon = service.icon

          return (
            <div
              key={service.id}
              className="bg-[#141419] rounded-xl border border-[#1f1f28] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#1f1f28]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${service.bgColor}/10 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${service.color}`} />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{service.name}</div>
                    <div className={`text-sm ${service.color}`}>{service.freeTier.summary}</div>
                  </div>
                </div>
                <a
                  href={service.pricingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  Pricing
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Content */}
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {/* Includes */}
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    ✅ Free tier includes
                  </div>
                  <ul className="space-y-1.5">
                    {service.freeTier.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    ⚠️ Limitations
                  </div>
                  <ul className="space-y-1.5">
                    {service.freeTier.limits.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-yellow-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {service.freeTier.upgradePrice && (
                    <div className="mt-3 text-xs text-slate-500">
                      Upgrade: {service.freeTier.upgradePrice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Cost Summary */}
      <div className="bg-gradient-to-r from-[#00f5ff]/10 to-[#d4ff00]/10 rounded-xl p-5 border border-[#00f5ff]/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">Total Monthly Cost</div>
            <div className="text-slate-400 text-sm">With all services on free tier</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#d4ff00]">$0</div>
            <div className="text-slate-500 text-xs">until you exceed limits</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1f1f28]">
          <div className="text-sm text-slate-300">
            <strong className="text-white">Perfect for:</strong> MVPs, side projects, learning, and apps with {'<'}1,000 monthly active users
          </div>
        </div>
      </div>

      {/* When to Upgrade */}
      <div className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28]">
        <div className="text-sm font-medium text-white mb-2">📈 When to consider upgrading:</div>
        <ul className="space-y-1 text-sm text-slate-400">
          <li>• Your app gets consistent traffic ({'>'}5,000 MAU)</li>
          <li>• You need team collaboration features</li>
          <li>• Database exceeds 500 MB or needs always-on</li>
          <li>• You require priority support or SLAs</li>
        </ul>
      </div>
    </div>
  )
}
