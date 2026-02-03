'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ExternalLink,
  Copy,
  Github,
  Globe,
  Database,
  Cloud,
  Terminal,
  Key,
  ArrowRight,
  Sparkles,
  FileText,
  BookOpen,
} from 'lucide-react'

interface ProvisioningResources {
  github?: {
    url?: string
    repoUrl?: string
    cloneUrl?: string
  }
  vercel?: {
    url?: string
    projectUrl?: string
    dashboardUrl?: string
  }
  supabase?: {
    url?: string
    projectUrl?: string
    apiUrl?: string
    dashboardUrl?: string
  }
  codespaces?: {
    url: string
    setupInstructions: string
  }
}

interface ProvisioningCompleteProps {
  resources: ProvisioningResources
  projectName?: string
}

export default function ProvisioningComplete({ resources, projectName }: ProvisioningCompleteProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(item)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const githubUrl = resources.github?.url || resources.github?.repoUrl || ''
  const vercelUrl = resources.vercel?.url || resources.vercel?.projectUrl || ''
  const supabaseUrl = resources.supabase?.dashboardUrl || resources.supabase?.projectUrl || ''
  const codespacesUrl = resources.codespaces?.url || ''

  const SETUP_STEPS = [
    {
      id: 'codespaces',
      title: 'Open GitHub Codespaces',
      description: 'Your cloud development environment with Claude Code pre-installed',
      icon: Cloud,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      action: {
        type: 'link',
        label: 'Open in Codespaces',
        url: codespacesUrl,
      },
      details: [
        'Click "Create codespace on main"',
        'Wait 2-3 minutes for environment setup',
        'VS Code opens in your browser with all tools ready',
      ],
    },
    {
      id: 'anthropic-key',
      title: 'Create Anthropic API Key',
      description: 'Required for Claude Code AI assistance',
      icon: Key,
      color: 'text-[#d4ff00]',
      bgColor: 'bg-[#d4ff00]/10',
      borderColor: 'border-[#d4ff00]/30',
      action: {
        type: 'link',
        label: 'Get API Key',
        url: 'https://console.anthropic.com/settings/keys',
      },
      details: [
        'Sign in to Anthropic Console',
        'Click "Create Key"',
        'Copy the key (starts with sk-ant-)',
      ],
    },
    {
      id: 'set-key',
      title: 'Add API Key to Codespaces',
      description: 'Configure Claude Code to use your API key',
      icon: Terminal,
      color: 'text-[#00f5ff]',
      bgColor: 'bg-[#00f5ff]/10',
      borderColor: 'border-[#00f5ff]/30',
      action: {
        type: 'code',
        label: 'Copy Command',
        code: 'export ANTHROPIC_API_KEY=sk-ant-your-key-here',
      },
      details: [
        'Open terminal in Codespaces (Ctrl+`)',
        'Paste the export command with your key',
        'Or add to GitHub Codespaces Secrets for persistence',
      ],
      secretsUrl: 'https://github.com/settings/codespaces',
    },
    {
      id: 'start-coding',
      title: 'Start AI-Assisted Coding',
      description: 'Run Claude Code and begin building',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      action: {
        type: 'code',
        label: 'Copy Command',
        code: 'claude',
      },
      details: [
        'Type "claude" in terminal to start',
        'Describe what you want to build',
        'Claude Code will help write and explain code',
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-[#00f5ff]/10 via-[#d4ff00]/10 to-[#00f5ff]/10 rounded-2xl p-6 border border-[#00f5ff]/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] flex items-center justify-center">
            <Check className="h-8 w-8 text-[#0a0a0f]" />
          </div>
          <div>
            <h2 className="text-2xl font-['Syne'] font-bold text-white">
              Infrastructure Provisioned!
            </h2>
            <p className="text-slate-300">
              {projectName || 'Your project'} is ready. Follow the steps below to start coding.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28] hover:border-slate-500/50 transition-all group"
          >
            <Github className="h-6 w-6 text-slate-400 group-hover:text-white mb-2" />
            <div className="text-white font-medium text-sm">Repository</div>
            <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              Open <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}
        {vercelUrl && (
          <a
            href={vercelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28] hover:border-slate-500/50 transition-all group"
          >
            <Globe className="h-6 w-6 text-slate-400 group-hover:text-white mb-2" />
            <div className="text-white font-medium text-sm">Live Site</div>
            <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              Visit <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}
        {supabaseUrl && (
          <a
            href={supabaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28] hover:border-slate-500/50 transition-all group"
          >
            <Database className="h-6 w-6 text-slate-400 group-hover:text-white mb-2" />
            <div className="text-white font-medium text-sm">Database</div>
            <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              Dashboard <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}
        {githubUrl && (
          <a
            href={`${githubUrl}/blob/main/INFRASTRUCTURE.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#141419] rounded-xl p-4 border border-[#1f1f28] hover:border-slate-500/50 transition-all group"
          >
            <FileText className="h-6 w-6 text-slate-400 group-hover:text-white mb-2" />
            <div className="text-white font-medium text-sm">Infra Spec</div>
            <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              View Docs <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}
      </div>

      {/* Claude Code Setup Steps */}
      <div className="bg-[#141419] rounded-2xl border border-[#1f1f28] overflow-hidden">
        <div className="p-5 border-b border-[#1f1f28]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4ff00]/20 to-[#00f5ff]/20 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-[#d4ff00]" />
            </div>
            <div>
              <h3 className="text-lg font-['Syne'] font-bold text-white">
                Next Steps: Set Up Claude Code
              </h3>
              <p className="text-slate-400 text-sm">
                Your Codespaces environment has Claude Code pre-installed. Just add your API key!
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#1f1f28]">
          {SETUP_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`p-5 transition-all ${
                currentStep === index ? 'bg-[#0a0a0f]' : ''
              }`}
            >
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => setCurrentStep(currentStep === index ? -1 : index)}
              >
                <div className={`w-10 h-10 rounded-lg ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${step.bgColor} ${step.color}`}>
                      Step {index + 1}
                    </span>
                    <h4 className="text-white font-medium">{step.title}</h4>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{step.description}</p>

                  {currentStep === index && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-slate-500 font-mono">{i + 1}.</span>
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {step.action.type === 'link' && (
                        <a
                          href={step.action.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${step.bgColor} ${step.color} text-sm font-medium hover:opacity-80 transition-opacity`}
                        >
                          {step.action.label}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      {step.action.type === 'code' && (
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-[#0a0a0f] rounded-lg text-sm text-slate-300 font-mono border border-[#1f1f28]">
                            {step.action.code}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(step.action.code!, step.id)
                            }}
                            className={`p-2 rounded-lg ${step.bgColor} ${step.color} hover:opacity-80 transition-opacity`}
                          >
                            {copiedItem === step.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}

                      {step.secretsUrl && (
                        <div className="mt-2">
                          <a
                            href={step.secretsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                          >
                            Or add to Codespaces Secrets for persistence
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <ArrowRight
                  className={`h-5 w-5 text-slate-500 transition-transform ${
                    currentStep === index ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-[#d4ff00]/10 border border-[#d4ff00]/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-[#d4ff00] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[#d4ff00] font-medium">Pro Tip: Check INFRASTRUCTURE.md</h4>
            <p className="text-slate-300 text-sm mt-1">
              Your repo includes a comprehensive <code className="text-[#00f5ff]">INFRASTRUCTURE.md</code> file
              with all service details, free tier limits, costs, and upgrade paths. Review it to understand
              your full stack and when you might need to upgrade.
            </p>
            {githubUrl && (
              <a
                href={`${githubUrl}/blob/main/INFRASTRUCTURE.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#d4ff00] text-sm mt-2 hover:underline"
              >
                View INFRASTRUCTURE.md
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Start Coding CTA */}
      <div className="flex justify-center">
        <a
          href={codespacesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg"
        >
          <Cloud className="h-6 w-6" />
          Open in Codespaces & Start Coding
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </div>
  )
}
