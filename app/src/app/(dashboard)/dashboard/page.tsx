'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Github,
  Globe,
  Database,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react'
import ProvisioningComplete from '@/components/ProvisioningComplete'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-[#1f1f28] rounded w-48 mb-2" />
        <div className="h-4 bg-[#1f1f28] rounded w-64 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#1f1f28] rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-[#1f1f28] rounded-2xl" />
      </div>
    </div>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showProvisioned, setShowProvisioned] = useState(false)
  const [provisionedResources, setProvisionedResources] = useState<any>(null)

  useEffect(() => {
    const provisioned = searchParams.get('provisioned')
    const resources = searchParams.get('resources')

    if (provisioned === 'true' && resources) {
      try {
        setProvisionedResources(JSON.parse(decodeURIComponent(resources)))
        setShowProvisioned(true)
      } catch (e) {
        console.error('Failed to parse resources:', e)
      }
    }
  }, [searchParams])

  const dismissProvisioned = () => {
    setShowProvisioned(false)
    // Remove query params from URL
    router.replace('/dashboard')
  }
  // Mock data - replace with actual Supabase query
  const automations = [
    {
      id: '1',
      projectName: 'workout-tracker',
      stackType: 'Next.js + Supabase + Vercel',
      status: 'completed',
      createdAt: new Date('2026-01-28'),
      completedAt: new Date('2026-01-28'),
      services: ['GitHub', 'Vercel', 'Supabase'],
      deployUrl: 'https://workout-tracker.vercel.app',
    },
    {
      id: '2',
      projectName: 'invoice-generator',
      stackType: 'Next.js + Supabase + Vercel + Stripe',
      status: 'in_progress',
      createdAt: new Date('2026-02-01'),
      progressPercent: 72,
      currentStep: 'Configuring Supabase RLS policies...',
      services: ['GitHub', 'Vercel', 'Supabase', 'Stripe'],
    },
    {
      id: '3',
      projectName: 'api-backend',
      stackType: 'Python + Railway + PostgreSQL',
      status: 'completed',
      createdAt: new Date('2026-01-20'),
      completedAt: new Date('2026-01-20'),
      services: ['GitHub', 'Railway', 'PostgreSQL'],
      deployUrl: 'https://api-backend.up.railway.app',
    },
  ]

  const userStats = {
    provisionsUsed: 2,
    provisionsLimit: 10, // Builder tier
    timeSaved: '12 hours',
    successRate: 100,
    currentPlan: 'Builder',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-[#00f5ff]" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-[#d4ff00] animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-[#ff006e]" />
      default:
        return <Clock className="h-5 w-5 text-slate-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20">
            <Loader2 className="h-3 w-3 animate-spin" />
            Provisioning
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ff006e]/10 text-[#ff006e] border border-[#ff006e]/20">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'github':
        return <Github className="h-3.5 w-3.5" />
      case 'vercel':
      case 'railway':
        return <Globe className="h-3.5 w-3.5" />
      case 'supabase':
      case 'postgresql':
        return <Database className="h-3.5 w-3.5" />
      default:
        return <Zap className="h-3.5 w-3.5" />
    }
  }

  // Show ProvisioningComplete component if just finished provisioning
  if (showProvisioned && provisionedResources) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Dismiss Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={dismissProvisioned}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Go to Dashboard
            <X className="h-4 w-4" />
          </button>
        </div>

        <ProvisioningComplete resources={provisionedResources} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-['Syne'] font-bold text-white mb-1">
            Dashboard
          </h1>
          <p className="text-slate-400">
            Manage your infrastructure provisioning
          </p>
        </div>
        <Link
          href="/new"
          className="btn-cyber px-5 py-3 rounded-xl text-sm font-['Syne'] font-bold flex items-center gap-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          New Provision
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Provisions Used */}
        <div className="glass-dark rounded-2xl p-5 border border-[#1f1f28] hover:border-[#00f5ff]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-400 text-sm font-medium">Provisions</div>
            <div className="w-9 h-9 rounded-lg bg-[#00f5ff]/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#00f5ff]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-['Syne'] font-bold text-white">{userStats.provisionsUsed}</span>
            <span className="text-slate-500 text-sm">/ {userStats.provisionsLimit}</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#1f1f28] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] rounded-full"
              style={{ width: `${(userStats.provisionsUsed / userStats.provisionsLimit) * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-2">{userStats.currentPlan} plan</div>
        </div>

        {/* Time Saved */}
        <div className="glass-dark rounded-2xl p-5 border border-[#1f1f28] hover:border-[#d4ff00]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-400 text-sm font-medium">Time Saved</div>
            <div className="w-9 h-9 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#d4ff00]" />
            </div>
          </div>
          <div className="text-2xl font-['Syne'] font-bold text-white">{userStats.timeSaved}</div>
          <div className="text-xs text-slate-500 mt-2">vs. manual setup</div>
        </div>

        {/* Success Rate */}
        <div className="glass-dark rounded-2xl p-5 border border-[#1f1f28] hover:border-[#00f5ff]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-400 text-sm font-medium">Success Rate</div>
            <div className="w-9 h-9 rounded-lg bg-[#00f5ff]/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#00f5ff]" />
            </div>
          </div>
          <div className="text-2xl font-['Syne'] font-bold text-white">{userStats.successRate}%</div>
          <div className="text-xs text-slate-500 mt-2">Deterministic provisioning</div>
        </div>

        {/* This Month */}
        <div className="glass-dark rounded-2xl p-5 border border-[#1f1f28] hover:border-[#ff6b35]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-400 text-sm font-medium">This Month</div>
            <div className="w-9 h-9 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[#ff6b35]" />
            </div>
          </div>
          <div className="text-2xl font-['Syne'] font-bold text-white">3</div>
          <div className="text-xs text-slate-500 mt-2">Projects provisioned</div>
        </div>
      </div>

      {/* Recent Provisions */}
      <div className="glass-dark rounded-2xl border border-[#1f1f28]">
        <div className="flex items-center justify-between p-6 border-b border-[#1f1f28]">
          <h2 className="text-xl font-['Syne'] font-bold text-white">
            Recent Provisions
          </h2>
          <Link
            href="/provisions"
            className="text-sm text-[#00f5ff] hover:text-[#d4ff00] transition-colors font-medium flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {automations.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00f5ff]/10 to-[#d4ff00]/10 border border-[#00f5ff]/20 flex items-center justify-center">
              <Zap className="h-8 w-8 text-[#00f5ff]" />
            </div>
            <h3 className="text-lg font-['Syne'] font-semibold text-white mb-2">
              No provisions yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Describe your app idea and let ShipMe provision your entire infrastructure in under 3 minutes.
            </p>
            <Link
              href="/new"
              className="btn-cyber inline-flex items-center gap-2 px-6 py-3 rounded-xl font-['Syne'] font-semibold"
            >
              <Plus className="h-5 w-5" />
              Start First Provision
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f28]">
            {automations.map((automation) => (
              <Link
                key={automation.id}
                href={`/automation/${automation.id}`}
                className="block p-5 hover:bg-white/[0.02] transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f5ff]/10 to-[#d4ff00]/10 border border-[#00f5ff]/20 flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(automation.status)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-['Syne'] font-semibold text-white truncate">
                          {automation.projectName}
                        </h3>
                        {getStatusBadge(automation.status)}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        {automation.stackType}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {automation.services.map((service, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                          >
                            {getServiceIcon(service)}
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-xs text-slate-500">
                      {automation.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>

                    {automation.status === 'in_progress' && automation.progressPercent && (
                      <div className="w-28">
                        <div className="h-1.5 bg-[#1f1f28] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] rounded-full transition-all"
                            style={{ width: `${automation.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{automation.progressPercent}%</span>
                        </div>
                      </div>
                    )}

                    {automation.status === 'completed' && automation.deployUrl && (
                      <a
                        href={automation.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-[#00f5ff] hover:text-[#d4ff00] transition-colors"
                      >
                        View Deploy
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {automation.status === 'in_progress' && automation.currentStep && (
                  <div className="mt-3 ml-14 text-xs text-slate-500 font-['Fira_Code']">
                    ⚡ {automation.currentStep}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 glass-dark rounded-2xl p-5 border border-[#d4ff00]/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-[#d4ff00]" />
          </div>
          <div>
            <h3 className="font-['Syne'] font-semibold text-white mb-1">
              Pro Tip: Stack Profiles
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Save your preferred stack configurations as profiles. Next time you provision,
              ShipMe remembers your preferences—no need to repeat yourself.{' '}
              <Link href="/settings/profiles" className="text-[#d4ff00] hover:underline">
                Create a profile →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
