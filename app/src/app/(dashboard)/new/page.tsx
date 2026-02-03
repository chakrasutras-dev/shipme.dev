'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Lightbulb,
  Cpu,
  Lock,
  Rocket,
  Trash2,
  MessageSquare,
  DollarSign,
  Users,
  Smartphone,
  Globe,
  Settings2,
} from 'lucide-react'
import ServiceConnector, { ServiceCredentials, StackSelection } from '@/components/ServiceConnector'
import StackCustomizer from '@/components/StackCustomizer'
import FreeTierInfo from '@/components/FreeTierInfo'
import { getProviderById } from '@/lib/services/registry'

type StackType = 'nextjs_fullstack' | 'mobile_app' | 'python_api' | 'custom'

interface FormData {
  ideaDescription: string
  budget: string
  targetPlatform: string
  expectedScale: string
  stackType: StackType
  githubRepo: boolean
  deploymentPlatform: string
  database: string
  auth: string
  payments: boolean
}

const STEPS = [
  { id: 1, name: 'Describe Idea', icon: Lightbulb },
  { id: 2, name: 'AI Recommendation', icon: Cpu },
  { id: 3, name: 'Customize', icon: Settings2 },
  { id: 4, name: 'Connect', icon: Lock },
  { id: 5, name: 'Review', icon: Rocket },
]

export default function NewProvisionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendation, setRecommendation] = useState<any | null>(null)
  const [apiCost, setApiCost] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    ideaDescription: '',
    budget: '$0-50',
    targetPlatform: 'web',
    expectedScale: '1000',
    stackType: 'nextjs_fullstack',
    githubRepo: true,
    deploymentPlatform: 'vercel',
    database: 'supabase',
    auth: 'supabase',
    payments: false,
  })
  const [credentials, setCredentials] = useState<ServiceCredentials>({})
  const [stackSelection, setStackSelection] = useState<StackSelection>({
    source_control: 'github',
    hosting: 'vercel',
    database: 'supabase',
  })

  const updateFormData = (key: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const analyzeIdea = async () => {
    setIsAnalyzing(true)
    setCurrentStep(2) // Move to step 2 to show loading state

    try {
      const response = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: formData.ideaDescription,
          budget: formData.budget,
          platform: formData.targetPlatform,
          scale: formData.expectedScale,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRecommendation(data.recommendation)
        setApiCost(data.usage?.estimated_cost)
      } else {
        // On error, show error message but stay on step 2
        setRecommendation({
          error: true,
          message: data.error || 'Failed to analyze idea'
        })
      }
    } catch (error) {
      console.error('Analyze error:', error)
      setRecommendation({
        error: true,
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      analyzeIdea()
    } else if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Use the provisioning API with credentials
      const response = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: formData.ideaDescription.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, ''),
          description: formData.ideaDescription,
          stack: {
            framework: recommendation?.stack?.framework || 'nextjs',
            database: recommendation?.stack?.database || 'supabase',
            hosting: recommendation?.stack?.hosting || 'vercel',
          },
          credentials: {
            github: credentials.github ? {
              accessToken: credentials.github.token
            } : undefined,
            vercel: credentials.vercel ? {
              accessToken: credentials.vercel.token,
              teamId: credentials.vercel.teamId
            } : undefined,
            supabase: credentials.supabase ? {
              accessToken: credentials.supabase.token,
              organizationId: credentials.supabase.organizationId
            } : undefined,
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to success page with resources info
        router.push(`/dashboard?provisioned=true&resources=${encodeURIComponent(JSON.stringify(data.resources))}`)
      } else {
        alert('Error provisioning: ' + (data.error || data.errors?.join(', ')))
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to provision infrastructure')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user has provided required credentials based on selected stack
  const hasRequiredCredentials = () => {
    const sourceControlCred = credentials[stackSelection.source_control as keyof ServiceCredentials]
    const hostingCred = credentials[stackSelection.hosting as keyof ServiceCredentials]
    const databaseCred = credentials[stackSelection.database as keyof ServiceCredentials]

    return !!(sourceControlCred?.token && hostingCred?.token && databaseCred?.token)
  }

  // Check if selected providers are all supported (not "coming soon")
  const hasUnsupportedProviders = () => {
    const providers = [
      getProviderById(stackSelection.source_control),
      getProviderById(stackSelection.hosting),
      getProviderById(stackSelection.database),
    ]
    return providers.some(p => p?.features.comingSoon)
  }

  const budgetOptions = [
    { value: '$0-50', label: '$0-50/mo', description: 'Side project / MVP' },
    { value: '$50-100', label: '$50-100/mo', description: 'Growing product' },
    { value: '$100-200', label: '$100-200/mo', description: 'Production app' },
    { value: '$200+', label: '$200+/mo', description: 'Scale infrastructure' },
  ]

  const platformOptions = [
    { value: 'web', label: 'Web Only', icon: Globe },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone },
    { value: 'both', label: 'Web + Mobile', icon: Globe },
  ]

  const scaleOptions = [
    { value: '100', label: '~100 users' },
    { value: '1000', label: '~1,000 users' },
    { value: '10000', label: '~10,000 users' },
    { value: '100000', label: '100,000+ users' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-[#00f5ff] transition-colors mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-['Syne'] font-bold text-white">
            New Provision
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Describe your idea and let ShipMe provision your infrastructure
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-['Syne'] font-bold text-sm transition-all ${
                      currentStep > step.id
                        ? 'bg-[#00f5ff] text-[#0a0a0f]'
                        : currentStep === step.id
                        ? 'bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] text-[#0a0a0f]'
                        : 'bg-[#141419] text-slate-500 border border-[#1f1f28]'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 font-medium hidden sm:block">
                    {step.name}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-all ${
                      currentStep > step.id
                        ? 'bg-[#00f5ff]'
                        : 'bg-[#1f1f28]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-[#1f1f28]">
          {/* Step 1: Describe Idea */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
                  Tell us about your idea
                </h2>
                <p className="text-slate-400 text-sm">
                  Describe your app and constraints. Claude will recommend the optimal stack.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-2 text-[#00f5ff]" />
                  Describe your app idea
                </label>
                <textarea
                  value={formData.ideaDescription}
                  onChange={(e) => updateFormData('ideaDescription', e.target.value)}
                  placeholder="A SaaS platform for tracking gym workouts with social features, leaderboards, and personal training plans..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#141419] border border-[#1f1f28] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <DollarSign className="h-4 w-4 inline mr-2 text-[#d4ff00]" />
                  Monthly budget
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFormData('budget', option.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        formData.budget === option.value
                          ? 'border-[#d4ff00] bg-[#d4ff00]/10'
                          : 'border-[#1f1f28] bg-[#141419] hover:border-[#d4ff00]/50'
                      }`}
                    >
                      <div className="text-white font-semibold text-sm">{option.label}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <Globe className="h-4 w-4 inline mr-2 text-[#00f5ff]" />
                  Target platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {platformOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFormData('targetPlatform', option.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.targetPlatform === option.value
                          ? 'border-[#00f5ff] bg-[#00f5ff]/10'
                          : 'border-[#1f1f28] bg-[#141419] hover:border-[#00f5ff]/50'
                      }`}
                    >
                      <option.icon className={`h-5 w-5 mx-auto mb-1 ${
                        formData.targetPlatform === option.value ? 'text-[#00f5ff]' : 'text-slate-400'
                      }`} />
                      <div className="text-white font-medium text-sm text-center">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <Users className="h-4 w-4 inline mr-2 text-[#ff6b35]" />
                  Expected scale
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {scaleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFormData('expectedScale', option.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.expectedScale === option.value
                          ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                          : 'border-[#1f1f28] bg-[#141419] hover:border-[#ff6b35]/50'
                      }`}
                    >
                      <div className="text-white font-medium text-sm text-center">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: AI Recommendation */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
                  AI Stack Recommendation
                </h2>
                <p className="text-slate-400 text-sm">
                  Claude analyzed your inputs and recommends this configuration
                </p>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f5ff]/10 to-[#d4ff00]/10 border border-[#00f5ff]/20 flex items-center justify-center mb-4">
                    <Cpu className="h-8 w-8 text-[#00f5ff] animate-pulse" />
                  </div>
                  <p className="text-slate-300 font-medium">Analyzing with Claude...</p>
                  <p className="text-slate-500 text-sm mt-1">This takes just a moment</p>
                </div>
              ) : recommendation?.error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <p className="text-red-400">{recommendation.message}</p>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  {/* Stack Recommendation */}
                  <div className="bg-[#141419] rounded-xl p-5 border border-[#00f5ff]/30">
                    <h3 className="text-[#00f5ff] font-bold mb-3 flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Recommended Stack
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Framework</div>
                        <div className="text-white font-semibold">{recommendation.stack?.framework}</div>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Database</div>
                        <div className="text-white font-semibold">{recommendation.stack?.database}</div>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Hosting</div>
                        <div className="text-white font-semibold">{recommendation.stack?.hosting}</div>
                      </div>
                    </div>
                    {recommendation.stack?.additional?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.stack.additional.map((item: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-[#0a0a0f] rounded text-xs text-slate-300">
                            + {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reasoning */}
                  <div className="bg-[#141419] rounded-xl p-5 border border-[#d4ff00]/30">
                    <h3 className="text-[#d4ff00] font-bold mb-2">Why this stack?</h3>
                    <p className="text-slate-300 text-sm">{recommendation.reasoning}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28]">
                      <div className="text-xs text-slate-500 mb-1">Estimated Cost</div>
                      <div className="text-white font-bold text-lg">{recommendation.estimated_monthly_cost}</div>
                    </div>
                    <div className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28]">
                      <div className="text-xs text-slate-500 mb-1">Setup Time</div>
                      <div className="text-white font-bold text-lg">{recommendation.setup_time}</div>
                    </div>
                  </div>

                  {/* Features */}
                  {recommendation.features?.length > 0 && (
                    <div className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28]">
                      <div className="text-xs text-slate-500 mb-2">Features Enabled</div>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.features.map((feature: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-[#00f5ff]/10 text-[#00f5ff] rounded-full text-xs">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* API Cost */}
                  {apiCost && (
                    <div className="text-right text-xs text-slate-500">
                      Analysis cost: {apiCost}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="glass-dark rounded-xl p-4 border border-[#d4ff00]/20">
                <p className="text-sm text-slate-300">
                  <span className="text-[#d4ff00] font-semibold">Ready to proceed?</span> Click Next to customize your stack or accept the AI recommendation.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Customize Stack */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
                  Customize Your Stack
                </h2>
                <p className="text-slate-400 text-sm">
                  Accept the AI recommendation or swap services based on your preferences.
                </p>
              </div>

              <StackCustomizer
                recommendation={recommendation}
                selection={stackSelection}
                onSelectionChange={setStackSelection}
              />
            </div>
          )}

          {/* Step 4: Connect Services */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
                  Connect Services
                </h2>
                <p className="text-slate-400 text-sm">
                  Provide API tokens for your selected services. Click each to see step-by-step instructions.
                </p>
              </div>

              <ServiceConnector
                credentials={credentials}
                onCredentialsChange={setCredentials}
                selectedServices={stackSelection}
              />

              <div className="glass-dark rounded-xl p-4 border border-[#d4ff00]/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-[#d4ff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium text-sm">Credentials deleted after setup</div>
                    <p className="text-slate-400 text-xs mt-1">
                      All API keys and OAuth tokens are permanently purged from ShipMe&apos;s systems after provisioning completes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
                  Review & Start
                </h2>
                <p className="text-slate-400 text-sm">Confirm your configuration before provisioning</p>
              </div>

              <div className="bg-[#141419] rounded-xl p-5 border border-[#1f1f28] space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Idea</div>
                  <div className="text-white text-sm">{formData.ideaDescription || 'Not provided'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Budget</div>
                    <div className="text-white text-sm">{formData.budget}/mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Platform</div>
                    <div className="text-white text-sm capitalize">{formData.targetPlatform}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Scale</div>
                    <div className="text-white text-sm">~{formData.expectedScale} users</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stack</div>
                  <div className="text-white text-sm">
                    {getProviderById(stackSelection.source_control)?.name} + {getProviderById(stackSelection.hosting)?.name} + {getProviderById(stackSelection.database)?.name}
                  </div>
                </div>
              </div>

              {/* Connected Services */}
              <div className="bg-[#141419] rounded-xl p-5 border border-[#1f1f28]">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Connected Services</div>
                <div className="space-y-2">
                  {/* Source Control */}
                  <div className="flex items-center gap-2">
                    {credentials[stackSelection.source_control as keyof ServiceCredentials]?.token ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-600" />
                    )}
                    <span className={credentials[stackSelection.source_control as keyof ServiceCredentials]?.token ? 'text-white' : 'text-slate-500'}>
                      {getProviderById(stackSelection.source_control)?.name}
                    </span>
                  </div>
                  {/* Hosting */}
                  <div className="flex items-center gap-2">
                    {credentials[stackSelection.hosting as keyof ServiceCredentials]?.token ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-600" />
                    )}
                    <span className={credentials[stackSelection.hosting as keyof ServiceCredentials]?.token ? 'text-white' : 'text-slate-500'}>
                      {getProviderById(stackSelection.hosting)?.name}
                    </span>
                  </div>
                  {/* Database */}
                  <div className="flex items-center gap-2">
                    {credentials[stackSelection.database as keyof ServiceCredentials]?.token ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-600" />
                    )}
                    <span className={credentials[stackSelection.database as keyof ServiceCredentials]?.token ? 'text-white' : 'text-slate-500'}>
                      {getProviderById(stackSelection.database)?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-[#00f5ff]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Estimated time</div>
                    <div className="text-slate-400 text-sm">{recommendation?.setup_time || '2-3 minutes'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">Estimated cost</div>
                    <div className="text-slate-400 text-sm">{recommendation?.estimated_monthly_cost || '$0/mo (free tier)'}</div>
                  </div>
                </div>
              </div>

              {/* Free Tier Breakdown */}
              <FreeTierInfo
                selectedStack={stackSelection}
                showCodespaces={true}
              />

              {!hasRequiredCredentials() && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
                  ⚠️ Please connect all required services ({getProviderById(stackSelection.source_control)?.name}, {getProviderById(stackSelection.hosting)?.name}, {getProviderById(stackSelection.database)?.name}) before provisioning.
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1f1f28]">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed text-slate-500'
                  : 'text-white hover:bg-[#141419]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !formData.ideaDescription) ||
                  (currentStep === 2 && isAnalyzing) ||
                  (currentStep === 3 && hasUnsupportedProviders()) ||
                  (currentStep === 4 && !hasRequiredCredentials())
                }
                className="btn-cyber flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1 ? 'Analyze' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !hasRequiredCredentials()}
                className="btn-cyber flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  <>
                    Start Provisioning
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
