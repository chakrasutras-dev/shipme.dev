'use client'

import { useState } from 'react'
import {
  Github,
  Globe,
  Database,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  HelpCircle,
  GitBranch,
  Shield,
  Train,
  Cloud,
} from 'lucide-react'
import { getProviderById, ServiceProvider } from '@/lib/services/registry'

// Map icon names to actual icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Globe,
  Database,
  GitBranch,
  Shield,
  Train,
  Cloud,
}

// Generic credentials interface that can hold any provider's credentials
export interface ServiceCredentials {
  [key: string]: {
    token: string
    [extraField: string]: string | undefined
  } | undefined
}

export interface StackSelection {
  source_control: string
  hosting: string
  database: string
}

interface ServiceConnectorProps {
  credentials: ServiceCredentials
  onCredentialsChange: (credentials: ServiceCredentials) => void
  selectedServices?: StackSelection
}

export default function ServiceConnector({
  credentials,
  onCredentialsChange,
  selectedServices = {
    source_control: 'github',
    hosting: 'vercel',
    database: 'supabase',
  },
}: ServiceConnectorProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [validating, setValidating] = useState<Record<string, boolean>>({})
  const [validated, setValidated] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get the selected providers from the registry
  const selectedProviders: ServiceProvider[] = [
    getProviderById(selectedServices.source_control),
    getProviderById(selectedServices.hosting),
    getProviderById(selectedServices.database),
  ].filter((p): p is ServiceProvider => p !== undefined && !p.features.comingSoon)

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const toggleShowToken = (serviceId: string) => {
    setShowTokens((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }))
  }

  const updateToken = (serviceId: string, token: string) => {
    onCredentialsChange({
      ...credentials,
      [serviceId]: {
        ...credentials[serviceId],
        token,
      },
    })
    // Clear error and validated status when user types
    if (errors[serviceId]) {
      setErrors((prev) => ({ ...prev, [serviceId]: '' }))
    }
    if (validated[serviceId]) {
      setValidated((prev) => ({ ...prev, [serviceId]: false }))
    }
  }

  const updateExtraField = (serviceId: string, fieldId: string, value: string) => {
    onCredentialsChange({
      ...credentials,
      [serviceId]: {
        token: credentials[serviceId]?.token || '',
        ...credentials[serviceId],
        [fieldId]: value,
      },
    })
  }

  const validateToken = async (provider: ServiceProvider) => {
    const token = credentials[provider.id]?.token
    if (!token) {
      setErrors((prev) => ({ ...prev, [provider.id]: 'Token is required' }))
      return
    }

    setValidating((prev) => ({ ...prev, [provider.id]: true }))
    setErrors((prev) => ({ ...prev, [provider.id]: '' }))

    try {
      const response = await fetch(`/api/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: provider.id,
          token,
          // Pass any extra fields
          ...(provider.credentials.extraFields?.reduce(
            (acc, field) => ({
              ...acc,
              [field.id]: credentials[provider.id]?.[field.id],
            }),
            {}
          ) || {}),
        }),
      })

      const data = await response.json()

      if (!data.valid) {
        setErrors((prev) => ({ ...prev, [provider.id]: data.error || 'Invalid token' }))
      } else {
        setValidated((prev) => ({ ...prev, [provider.id]: true }))
      }
    } catch {
      setErrors((prev) => ({ ...prev, [provider.id]: 'Failed to validate token' }))
    } finally {
      setValidating((prev) => ({ ...prev, [provider.id]: false }))
    }
  }

  const isConnected = (serviceId: string) => {
    const cred = credentials[serviceId]
    return cred?.token && cred.token.length > 10 && !errors[serviceId] && validated[serviceId]
  }

  const hasToken = (serviceId: string) => {
    const cred = credentials[serviceId]
    return cred?.token && cred.token.length > 5
  }

  return (
    <div className="space-y-4">
      {selectedProviders.map((provider) => {
        const connected = isConnected(provider.id)
        const expanded = expandedService === provider.id
        const Icon = ICON_MAP[provider.icon] || Globe

        return (
          <div
            key={provider.id}
            className={`rounded-xl border transition-all ${
              connected
                ? 'border-green-500/30 bg-green-500/5'
                : errors[provider.id]
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-[#1f1f28] bg-[#141419]'
            }`}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(provider.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${provider.bgColor}/10 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${provider.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{provider.name}</span>
                    <span className="text-xs text-slate-500">Required</span>
                  </div>
                  <div className="text-slate-500 text-xs">{provider.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Connect Button - Always visible for quick access */}
                {provider.instructions.steps.find(s => s.link) && (
                  <a
                    href={provider.instructions.steps.find(s => s.link)?.link?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      connected
                        ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        : `border-[#1f1f28] ${provider.color} hover:bg-[#1f1f28]`
                    }`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {connected ? 'Manage' : 'Connect'}
                  </a>
                )}
                {connected ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="h-4 w-4" />
                    Connected
                  </div>
                ) : hasToken(provider.id) ? (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Verify
                  </div>
                ) : null}
                {expanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
              <div className="px-4 pb-4 border-t border-[#1f1f28] pt-4 space-y-4">
                {/* Instructions */}
                <div className="bg-[#0a0a0f] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-300 font-medium mb-3">
                    <HelpCircle className="h-4 w-4" />
                    {provider.instructions.title}
                  </div>
                  <ol className="space-y-2 text-sm text-slate-400">
                    {provider.instructions.steps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-slate-500 font-mono">{i + 1}.</span>
                        <span>
                          {step.text}
                          {step.link && (
                            <a
                              href={step.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`ml-2 inline-flex items-center gap-1 ${provider.color} hover:underline`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {step.link.label}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Token Input */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">{provider.credentials.tokenLabel}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showTokens[provider.id] ? 'text' : 'password'}
                        value={credentials[provider.id]?.token || ''}
                        onChange={(e) => updateToken(provider.id, e.target.value)}
                        placeholder={provider.credentials.tokenPlaceholder}
                        className={`w-full px-4 py-2.5 bg-[#0a0a0f] border rounded-lg text-white placeholder-slate-600 focus:outline-none transition-colors font-mono text-sm ${
                          errors[provider.id] ? 'border-red-500/50 focus:border-red-500' : 'border-[#1f1f28] focus:border-[#00f5ff]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowToken(provider.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showTokens[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => validateToken(provider)}
                      disabled={validating[provider.id] || !credentials[provider.id]?.token}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${provider.bgColor}/10 ${provider.color}`}
                    >
                      {validating[provider.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {errors[provider.id] && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[provider.id]}
                    </p>
                  )}
                </div>

                {/* Extra fields */}
                {provider.credentials.extraFields?.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm text-slate-300 mb-2">{field.label}</label>
                    <input
                      type="text"
                      value={credentials[provider.id]?.[field.id] || ''}
                      onChange={(e) => updateExtraField(provider.id, field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#1f1f28] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#00f5ff] transition-colors font-mono text-sm"
                    />
                    {field.helpText && <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>}
                  </div>
                ))}

                {/* Security Note */}
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-[#0a0a0f] rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Your token is only used for this provisioning session and is deleted immediately after. ShipMe never stores your credentials.</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
