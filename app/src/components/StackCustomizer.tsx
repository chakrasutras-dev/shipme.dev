'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import {
  HOSTING_PROVIDERS,
  DATABASE_PROVIDERS,
  SOURCE_CONTROL_PROVIDERS,
  ServiceProvider,
  getProviderById,
} from '@/lib/services/registry'
import type { StackSelection } from '@/components/ServiceConnector'

export type { StackSelection }

interface StackCustomizerProps {
  recommendation?: {
    stack?: {
      framework?: string
      database?: string
      hosting?: string
    }
  }
  selection: StackSelection
  onSelectionChange: (selection: StackSelection) => void
}

interface CategoryDropdownProps {
  label: string
  category: keyof StackSelection
  providers: ServiceProvider[]
  selectedId: string
  recommendedId?: string
  onChange: (id: string) => void
}

function CategoryDropdown({
  label,
  category,
  providers,
  selectedId,
  recommendedId,
  onChange,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedProvider = getProviderById(selectedId)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#141419] border border-[#1f1f28] rounded-xl text-left flex items-center justify-between hover:border-[#00f5ff]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg ${selectedProvider?.bgColor}/10 flex items-center justify-center`}
          >
            <span className={`text-lg ${selectedProvider?.color}`}>
              {selectedProvider?.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-white font-medium flex items-center gap-2">
              {selectedProvider?.name}
              {selectedId === recommendedId && (
                <span className="text-xs text-[#d4ff00] flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </span>
              )}
            </div>
            <div className="text-slate-500 text-xs">{selectedProvider?.description}</div>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-[#141419] border border-[#1f1f28] rounded-xl shadow-xl overflow-hidden">
            {providers.map((provider) => {
              const isSelected = provider.id === selectedId
              const isRecommended = provider.id === recommendedId
              const isDisabled = provider.features.comingSoon

              return (
                <button
                  key={provider.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(provider.id)
                      setIsOpen(false)
                    }
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#1f1f28] transition-colors ${
                    isSelected ? 'bg-[#1f1f28]' : ''
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${provider.bgColor}/10 flex items-center justify-center`}
                    >
                      <span className={`text-lg ${provider.color}`}>
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium flex items-center gap-2">
                        {provider.name}
                        {isRecommended && (
                          <span className="text-xs text-[#d4ff00] flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Pick
                          </span>
                        )}
                        {isDisabled && (
                          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-xs">{provider.description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-[#00f5ff]" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function StackCustomizer({
  recommendation,
  selection,
  onSelectionChange,
}: StackCustomizerProps) {
  // Map recommendation to provider IDs
  const getRecommendedId = (category: keyof StackSelection): string | undefined => {
    if (!recommendation?.stack) return undefined

    if (category === 'hosting') {
      const hosting = recommendation.stack.hosting?.toLowerCase()
      if (hosting?.includes('vercel')) return 'vercel'
      if (hosting?.includes('netlify')) return 'netlify'
      if (hosting?.includes('railway')) return 'railway'
    }

    if (category === 'database') {
      const db = recommendation.stack.database?.toLowerCase()
      if (db?.includes('supabase')) return 'supabase'
      if (db?.includes('planetscale')) return 'planetscale'
      if (db?.includes('neon')) return 'neon'
      if (db?.includes('postgres')) return 'supabase'
      if (db?.includes('mysql')) return 'planetscale'
    }

    if (category === 'source_control') {
      return 'github' // Default to GitHub
    }

    return undefined
  }

  const updateSelection = (category: keyof StackSelection, id: string) => {
    onSelectionChange({
      ...selection,
      [category]: id,
    })
  }

  // Check if any selected provider is "coming soon"
  const hasUnsupportedProvider = () => {
    const providers = [
      getProviderById(selection.source_control),
      getProviderById(selection.hosting),
      getProviderById(selection.database),
    ]
    return providers.some((p) => p?.features.comingSoon)
  }

  return (
    <div className="space-y-6">
      {/* Source Control */}
      <CategoryDropdown
        label="Source Control"
        category="source_control"
        providers={SOURCE_CONTROL_PROVIDERS}
        selectedId={selection.source_control}
        recommendedId={getRecommendedId('source_control')}
        onChange={(id) => updateSelection('source_control', id)}
      />

      {/* Hosting */}
      <CategoryDropdown
        label="Hosting Platform"
        category="hosting"
        providers={HOSTING_PROVIDERS}
        selectedId={selection.hosting}
        recommendedId={getRecommendedId('hosting')}
        onChange={(id) => updateSelection('hosting', id)}
      />

      {/* Database */}
      <CategoryDropdown
        label="Database"
        category="database"
        providers={DATABASE_PROVIDERS}
        selectedId={selection.database}
        recommendedId={getRecommendedId('database')}
        onChange={(id) => updateSelection('database', id)}
      />

      {/* Warning for unsupported providers */}
      {hasUnsupportedProvider() && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-yellow-400 font-medium text-sm">Some services not yet supported</div>
            <p className="text-yellow-400/70 text-xs mt-1">
              One or more selected services are coming soon. Please choose an available alternative to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-xl">
        <Sparkles className="h-5 w-5 text-[#00f5ff] flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-slate-300 font-medium text-sm">AI-Recommended Stack</div>
          <p className="text-slate-400 text-xs mt-1">
            Claude analyzed your requirements and suggested the best services. You can customize these choices based on your preferences or existing accounts.
          </p>
        </div>
      </div>
    </div>
  )
}
