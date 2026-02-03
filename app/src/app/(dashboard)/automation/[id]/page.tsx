'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle, Clock, Terminal as TerminalIcon } from 'lucide-react'

interface AutomationStep {
  step: number
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp?: Date
}

export default function AutomationProgressPage() {
  const params = useParams()
  const automationId = params.id as string
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [overallStatus, setOverallStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending')

  const steps: AutomationStep[] = [
    { step: 1, title: 'Initializing automation', status: 'pending' },
    { step: 2, title: 'Creating GitHub repository', status: 'pending' },
    { step: 3, title: 'Deploying to Vercel', status: 'pending' },
    { step: 4, title: 'Provisioning Supabase database', status: 'pending' },
    { step: 5, title: 'Configuring Stripe payments', status: 'pending' },
    { step: 6, title: 'Automation complete', status: 'pending' },
  ]

  useEffect(() => {
    // Demo mode: Simulate automation progress
    const isDemoMode = automationId.startsWith('demo-')

    if (isDemoMode) {
      simulateProgress()
    } else {
      // Poll for real progress from API
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/automation/${automationId}`)
          const data = await res.json()

          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(interval)
          }

          // Update UI with real data
          setOverallStatus(data.status)
          if (data.logs) {
            setLogs(data.logs)
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [automationId])

  const simulateProgress = () => {
    setOverallStatus('in_progress')
    addLog('🚀 Starting automation...')

    let step = 0
    const interval = setInterval(() => {
      step++

      if (step === 1) {
        addLog('✓ Automation initialized')
        setCurrentStep(1)
      } else if (step === 2) {
        addLog('📁 Creating GitHub repository...')
        setCurrentStep(2)
      } else if (step === 3) {
        addLog('✓ GitHub repository created: https://github.com/demo/my-awesome-app')
        addLog('🚀 Deploying to Vercel...')
        setCurrentStep(3)
      } else if (step === 4) {
        addLog('✓ Deployed to Vercel: https://my-awesome-app.vercel.app')
        addLog('💾 Provisioning Supabase database...')
        setCurrentStep(4)
      } else if (step === 5) {
        addLog('✓ Supabase database provisioned: https://my-awesome-app.supabase.co')
        addLog('💳 Configuring Stripe payments...')
        setCurrentStep(5)
      } else if (step === 6) {
        addLog('✓ Stripe configured successfully')
        addLog('🎉 Automation completed in 8m 32s')
        setCurrentStep(6)
        setOverallStatus('completed')
        clearInterval(interval)
      }
    }, 2000) // Each step takes 2 seconds
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const getStepStatus = (stepNum: number): 'pending' | 'in_progress' | 'completed' | 'failed' => {
    if (currentStep > stepNum) return 'completed'
    if (currentStep === stepNum) return 'in_progress'
    return 'pending'
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-['Syne'] font-bold gradient-text-cyan-lime mb-2">
            Automation Progress
          </h1>
          <p className="text-slate-400">
            Automation ID: <span className="font-mono text-[#00f5ff]">{automationId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steps Progress */}
          <div className="glass-dark rounded-2xl p-6 border border-[#1f1f28]">
            <h2 className="text-2xl font-['Syne'] font-bold text-white mb-6">Steps</h2>

            <div className="space-y-4">
              {steps.map((step) => {
                const status = getStepStatus(step.step)
                return (
                  <div
                    key={step.step}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      status === 'in_progress'
                        ? 'bg-[#d4ff00]/10 border border-[#d4ff00]/30'
                        : status === 'completed'
                        ? 'bg-[#00f5ff]/5 border border-[#00f5ff]/20'
                        : 'bg-[#141419] border border-[#1f1f28]'
                    }`}
                  >
                    <div className="flex-shrink-0">{getStatusIcon(status)}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{step.title}</div>
                      {status === 'in_progress' && (
                        <div className="text-xs text-[#d4ff00] mt-1">In progress...</div>
                      )}
                      {status === 'completed' && (
                        <div className="text-xs text-[#00f5ff] mt-1">Completed</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall Status */}
            <div className="mt-6 p-4 rounded-lg bg-[#141419] border border-[#1f1f28]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(overallStatus)}
                  <span className="text-white font-semibold capitalize">{overallStatus}</span>
                </div>
              </div>
              {overallStatus === 'in_progress' && (
                <div className="mt-3">
                  <div className="h-2 bg-[#1f1f28] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] transition-all duration-500"
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 text-right">
                    {Math.round((currentStep / steps.length) * 100)}% complete
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="glass-dark rounded-2xl p-6 border border-[#1f1f28]">
            <div className="flex items-center gap-2 mb-4">
              <TerminalIcon className="h-5 w-5 text-[#00f5ff]" />
              <h2 className="text-2xl font-['Syne'] font-bold text-white">Logs</h2>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#1f1f28] h-[600px] overflow-y-auto font-['Fira_Code'] text-sm">
              {logs.length === 0 ? (
                <div className="text-slate-500">Waiting for logs...</div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-slate-300 hover:bg-[#141419] px-2 py-1 rounded">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {overallStatus === 'completed' && (
              <div className="mt-4 p-4 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/30">
                <div className="text-[#00f5ff] font-semibold mb-2">✨ Resources Created</div>
                <div className="space-y-1 text-sm">
                  <div className="text-slate-300">
                    <span className="text-slate-500">GitHub:</span>{' '}
                    <a
                      href="https://github.com/demo/my-awesome-app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00f5ff] hover:underline"
                    >
                      github.com/demo/my-awesome-app
                    </a>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Vercel:</span>{' '}
                    <a
                      href="https://my-awesome-app.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00f5ff] hover:underline"
                    >
                      my-awesome-app.vercel.app
                    </a>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Supabase:</span>{' '}
                    <span className="text-white">my-awesome-app.supabase.co</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Stripe:</span>{' '}
                    <span className="text-white">Configured ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {automationId.startsWith('demo-') && (
          <div className="mt-6 p-4 rounded-lg bg-[#ff6b35]/10 border border-[#ff6b35]/30">
            <div className="text-[#ff6b35] font-semibold mb-1">🎭 Demo Mode Active</div>
            <div className="text-sm text-slate-300">
              This is a simulated automation for demonstration purposes. To run real automations:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Set up Supabase with actual credentials</li>
                <li>Add Anthropic API key for Claude Computer Use</li>
                <li>Configure GitHub, Vercel CLI authentication</li>
                <li>Run the automation engine: <code className="bg-[#0a0a0f] px-2 py-1 rounded">node automation-engine/index.js {automationId}</code></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
