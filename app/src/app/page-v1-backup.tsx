"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Terminal,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Github,
  Sparkles,
  Cpu,
  Database,
  Cloud,
  CreditCard,
  Globe,
  Lock,
  Trash2,
  Users,
  MessageSquare,
  Lightbulb,
  Settings,
  Rocket,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [selectedStack, setSelectedStack] = useState<string | null>(null);

  const infrastructureOptions = [
    {
      id: "nextjs-fullstack",
      name: "Next.js Full-Stack SaaS",
      description: "Complete web application",
      budget: "$0-50/mo",
      services: [
        { name: "GitHub", icon: Github, color: "cyan" },
        { name: "Vercel", icon: Globe, color: "lime" },
        { name: "Supabase", icon: Database, color: "orange" },
        { name: "Stripe", icon: CreditCard, color: "pink" },
      ],
    },
    {
      id: "mobile-app",
      name: "Cross-Platform Mobile",
      description: "React Native + Expo",
      budget: "$0-30/mo",
      services: [
        { name: "GitHub", icon: Github, color: "cyan" },
        { name: "Expo", icon: Cloud, color: "lime" },
        { name: "Supabase", icon: Database, color: "orange" },
        { name: "Storage", icon: Database, color: "pink" },
      ],
    },
    {
      id: "python-api",
      name: "Python API Backend",
      description: "Django/FastAPI + Railway",
      budget: "$5-25/mo",
      services: [
        { name: "GitHub", icon: Github, color: "cyan" },
        { name: "Railway", icon: Cloud, color: "lime" },
        { name: "PostgreSQL", icon: Database, color: "orange" },
        { name: "Redis", icon: Zap, color: "pink" },
      ],
    },
  ];

  // The 5-step pipeline from the product spec
  const pipelineSteps = [
    {
      step: 1,
      title: "Idea Intake",
      description: "Describe your app idea, budget constraints, target platforms, and scale expectations in natural language.",
      icon: Lightbulb,
      detail: "Budget: $0 free tier → $200+ scale",
    },
    {
      step: 2,
      title: "AI Stack Recommendation",
      description: "Claude analyzes your inputs and recommends the optimal tech stack with infrastructure configuration and cost estimates.",
      icon: Cpu,
      detail: "Powered by Claude API",
    },
    {
      step: 3,
      title: "Service Authentication",
      description: "Securely authenticate with GitHub (OAuth), Vercel (OAuth), and Supabase (temporary API key).",
      icon: Lock,
      detail: "OAuth + temporary keys only",
    },
    {
      step: 4,
      title: "MCP Provisioning",
      description: "ShipMe creates your GitHub repo, provisions Supabase with schema + RLS, and deploys to Vercel with CI/CD—all in one atomic operation.",
      icon: Rocket,
      detail: "Model Context Protocol",
    },
    {
      step: 5,
      title: "Delivery + Key Deletion",
      description: "Receive your ready-to-code environment. All API keys and OAuth tokens are permanently deleted from ShipMe's systems.",
      icon: Trash2,
      detail: "Credentials purged immediately",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "3 Minutes, Not 8 Hours",
      description:
        "From idea description to fully provisioned GitHub + Vercel + Supabase environment. Skip the 2-8 hours of manual configuration.",
      color: "cyan",
    },
    {
      icon: Cpu,
      title: "AI Recommends, Code Doesn't Generate",
      description:
        "The LLM analyzes and recommends your stack. Infrastructure is assembled deterministically from tested templates—no fragile AI-generated code.",
      color: "lime",
    },
    {
      icon: Shield,
      title: "Credentials Deleted After Setup",
      description:
        "Your API keys exist in memory only during provisioning. After delivery, they're permanently purged. Open-source CLI for verification.",
      color: "orange",
    },
    {
      icon: Code2,
      title: "You Own Everything",
      description:
        "Everything lives in YOUR GitHub, Vercel, and Supabase accounts. ShipMe is not in the loop after provisioning. No vendor lock-in.",
      color: "pink",
    },
  ];

  // Comparison with AI app builders from spec
  const comparison = [
    { feature: "Core Output", shipme: "Provisioned infrastructure", others: "Generated codebase" },
    { feature: "AI Role", shipme: "Recommends stack", others: "Writes & debugs code" },
    { feature: "Auth Pre-configured", shipme: "Yes, via MCP", others: "No (manual setup)" },
    { feature: "CI/CD Pipeline", shipme: "Auto-configured", others: "Not included" },
    { feature: "Credit Model", shipme: "Flat pricing", others: "Pay per prompt + debugging" },
    { feature: "Vendor Lock-in", shipme: "None—your accounts", others: "Platform-dependent" },
    { feature: "Credentials", shipme: "Deleted after use", others: "Stored on platform" },
  ];

  // Updated pricing from the spec
  const pricing = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try ShipMe on a side project",
      features: [
        "2 provisions per month",
        "2 LLM stack recommendations",
        "3 basic templates (SaaS, API, Internal Tool)",
        "Vercel deployment only",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Builder",
      price: "$19",
      period: "/month",
      description: "For indie developers",
      features: [
        "10 provisions per month",
        "10 LLM recommendations",
        "All templates included",
        "1 Stack Profile (memory)",
        "Vercel + Railway deployment",
      ],
      cta: "Start Building",
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For serious builders",
      features: [
        "Unlimited provisions",
        "Unlimited recommendations",
        "Custom templates",
        "5 Stack Profiles",
        "All deployment targets + Docker",
        "Priority provisioning",
      ],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "Factory",
      price: "$99",
      period: "/month",
      description: "For agencies & serial builders",
      features: [
        "Everything in Pro",
        "Unlimited Stack Profiles",
        "Team templates & sharing",
        "Team billing",
        "Custom deployment targets",
        "Priority support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  // Realistic stats (Month 1 baseline, not aspirational)
  const stats = [
    { value: "<3min", label: "Setup Time", icon: Clock },
    { value: "100%", label: "Deterministic", icon: TrendingUp },
    { value: "$0", label: "To Start", icon: CreditCard },
    { value: "Open", label: "Source CLI", icon: Github },
  ];

  // Problems ShipMe solves (from spec section 2)
  const problems = [
    {
      title: "The Technical Cliff",
      description: "AI generates a frontend, but connecting auth, RLS policies, and deployment crashes everything.",
      solved: "ShipMe provisions all infrastructure pre-connected.",
    },
    {
      title: "Credit Burn Trap",
      description: "AI breaks code, charges to fix it, breaks again. Users report $1,000+ on single projects.",
      solved: "Flat pricing. No AI code generation means no debugging loops.",
    },
    {
      title: "No Infrastructure Intelligence",
      description: "AI writes app code but doesn't understand CI/CD, env vars, or deployment pipelines.",
      solved: "ShipMe IS infrastructure. GitHub Actions, env vars, deployments—all configured.",
    },
    {
      title: "Vendor Lock-in",
      description: "Your code lives on their platforms. Limited export, no true ownership.",
      solved: "Everything in YOUR accounts. ShipMe exits after provisioning.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 relative overflow-hidden">
      {/* Background Grid */}
      <div className="bg-grid fixed inset-0 opacity-30" />

      {/* Animated Background Spotlights */}
      <div className="spotlight top-0 left-0 animate-float" />
      <div className="spotlight bottom-0 right-0 animate-float" style={{ animationDelay: '3s' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#d4ff00]">
                  <Terminal className="h-5 w-5 text-[#0a0a0f]" />
                </div>
              </div>
              <span className="text-xl font-bold font-['Syne']">ShipMe</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#problem"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                Problem
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#compare"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                Compare
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-[#00f5ff] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-cyber inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#00f5ff]/20 mb-8 animate-slide-in-bottom">
              <div className="w-2 h-2 rounded-full bg-[#d4ff00] animate-glow" />
              <span className="text-sm font-semibold text-slate-300">Infrastructure Orchestrator • Not an AI Code Generator</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight font-['Syne'] animate-slide-in-bottom delay-100">
              From Idea to{" "}
              <span className="gradient-text-cyan-lime">Deployed App</span>
              <br />
              <span className="text-slate-400">Zero Guesswork</span>
            </h1>

            {/* Subheading - key value prop from spec */}
            <p className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-3xl mx-auto animate-slide-in-bottom delay-200">
              ShipMe takes your app idea, recommends the right tech stack, provisions everything across{" "}
              <span className="text-[#00f5ff]">GitHub</span>,{" "}
              <span className="text-[#d4ff00]">Vercel</span>, and{" "}
              <span className="text-[#ff6b35]">Supabase</span> through secure MCP connections,
              delivers a ready-to-code environment, and then{" "}
              <span className="text-[#ff006e] font-semibold">deletes your API keys</span>.
            </p>

            {/* Trust statement */}
            <p className="text-base text-slate-500 mb-10 animate-slide-in-bottom delay-200">
              You own everything. We touch nothing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-bottom delay-300">
              <Link
                href="/signup"
                className="btn-cyber inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl"
              >
                Start Free—2 Provisions/Month
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://github.com/chakrasutras-dev/shipme.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-cyber inline-flex items-center gap-2 px-8 py-4 text-base rounded-xl"
              >
                <Github className="h-5 w-5" />
                View Open Source CLI
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16 animate-fade-in delay-400">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-dark rounded-2xl p-5 text-center border border-white/5 hover:border-[#00f5ff]/30 transition-all duration-300">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-[#00f5ff]" />
                </div>
                <div className="text-3xl font-bold mb-1 font-['Syne']">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Terminal Mockup */}
          <div className="max-w-4xl mx-auto animate-scale-in delay-500">
            <div className="terminal-cyber rounded-2xl overflow-hidden border border-[#00f5ff]/10">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#0f0f15]/50 to-[#1a1a22]/50 border-b border-[#00f5ff]/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                  <div className="w-3 h-3 rounded-full bg-[#d4ff00]" />
                  <div className="w-3 h-3 rounded-full bg-[#00f5ff]" />
                </div>
                <span className="text-xs text-slate-500 font-['Fira_Code']">shipme.dev/new</span>
                <div className="w-16" />
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-['Fira_Code'] text-sm leading-relaxed">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00f5ff]">→</span>
                    <span className="text-slate-200">Creating new project: my-saas</span>
                  </div>
                  <div className="text-slate-500 pl-4">📝 Describe your app idea...</div>
                  <div className="text-slate-400 pl-4 italic">&quot;A SaaS for tracking gym workouts with social features&quot;</div>
                  <div className="text-slate-500 pl-4">💰 Budget: $0-50/mo | 📱 Web only | 👥 ~1000 users</div>
                  <div className="text-slate-500 pl-4 mt-2">🤖 Analyzing with Claude...</div>
                  <div className="text-[#d4ff00] pl-4">✓ Recommended: Next.js + Supabase + Vercel</div>
                  <div className="text-slate-500 pl-4 mt-2">🔐 Authenticate with services...</div>
                  <div className="text-[#d4ff00] pl-4">✓ GitHub OAuth connected</div>
                  <div className="text-[#d4ff00] pl-4">✓ Vercel OAuth connected</div>
                  <div className="text-[#d4ff00] pl-4">✓ Supabase API key received</div>
                  <div className="text-slate-500 pl-4 mt-2">⚡ Provisioning via MCP...</div>
                  <div className="text-[#d4ff00] pl-4">✓ GitHub repo created with CI/CD</div>
                  <div className="text-[#d4ff00] pl-4">✓ Supabase project + schema + RLS</div>
                  <div className="text-[#d4ff00] pl-4">✓ Vercel deployed with preview URLs</div>
                  <div className="text-[#ff006e] pl-4 mt-2">🗑️ All credentials permanently deleted</div>
                  <div className="mt-4 flex items-center gap-2 text-[#00f5ff]">
                    <span className="text-xl">✓</span>
                    <span className="font-bold">Complete in 2m 47s</span>
                  </div>
                  <div className="text-[#00f5ff] pl-4 underline cursor-pointer hover:text-[#d4ff00] transition-colors">
                    → https://my-saas.vercel.app
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="relative py-24 px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              Why Every AI App Builder{" "}
              <span className="gradient-text-orange-pink">Fails at Production</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              After analyzing user reviews across Lovable, Bolt.new, v0, and others—these four problems appear consistently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {problems.map((problem, idx) => (
              <div key={idx} className="card-cyber rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#ff006e]/20 border border-[#ff006e]/30 flex items-center justify-center flex-shrink-0">
                    <X className="h-4 w-4 text-[#ff006e]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Syne'] mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {problem.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pl-12">
                  <div className="w-6 h-6 rounded-md bg-[#00f5ff]/20 border border-[#00f5ff]/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-[#00f5ff]" />
                  </div>
                  <p className="text-[#00f5ff] text-sm font-medium">
                    {problem.solved}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="glass-dark rounded-2xl p-6 border border-[#d4ff00]/20 text-center">
              <p className="text-slate-300 leading-relaxed">
                <span className="text-[#d4ff00] font-semibold">ShipMe sidesteps all these problems</span> by operating at a different layer.
                It does not generate application code. It provisions and configures the infrastructure that application code runs on.
                <span className="text-slate-400"> The AI cannot break what it does not generate.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 5-Step Pipeline */}
      <section id="how-it-works" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              The <span className="gradient-text-cyan-lime">5-Step</span> Pipeline
            </h2>
            <p className="text-lg text-slate-400">
              From idea to fully provisioned, deployed development environment in under 3 minutes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-6 items-start mb-8 last:mb-0"
              >
                {/* Step number and line */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00f5ff]/20 to-[#d4ff00]/20 border-2 border-[#00f5ff]/30 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-6 w-6 text-[#00f5ff]" />
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-[#00f5ff]/30 to-transparent mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 card-cyber rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#00f5ff] bg-[#00f5ff]/10 px-2 py-1 rounded-full">
                      Step {step.step}
                    </span>
                    <span className="text-xs text-slate-500 font-['Fira_Code']">
                      {step.detail}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-['Syne'] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-white font-['Syne'] mb-2">
              Total time: <span className="gradient-text-cyan-lime">under 3 minutes</span>
            </p>
            <p className="text-slate-400">
              vs. 2-8 hours of manual configuration
            </p>
          </div>
        </div>
      </section>

      {/* Stack Selection Section */}
      <section className="relative py-24 px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              Choose Your <span className="gradient-text-cyan-lime">Stack Template</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Battle-tested infrastructure templates. The LLM customizes the recommendation based on your specific constraints.
            </p>
          </div>

          {/* Stack Selection Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {infrastructureOptions.map((stack) => (
              <button
                key={stack.id}
                onClick={() => setSelectedStack(stack.id)}
                className={`card-cyber rounded-2xl p-6 text-left transition-all duration-300 ${
                  selectedStack === stack.id
                    ? "border-[#00f5ff]/50 bg-[#00f5ff]/5"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white font-['Syne']">
                    {stack.name}
                  </h3>
                  <span className="text-xs text-[#d4ff00] bg-[#d4ff00]/10 px-2 py-1 rounded-full">
                    {stack.budget}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-5">{stack.description}</p>

                <div className="space-y-2">
                  {stack.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                    >
                      <div className={`w-7 h-7 rounded-md ${
                        service.color === 'cyan' ? 'bg-[#00f5ff]/20' :
                        service.color === 'lime' ? 'bg-[#d4ff00]/20' :
                        service.color === 'orange' ? 'bg-[#ff6b35]/20' :
                        'bg-[#ff006e]/20'
                      } flex items-center justify-center`}>
                        <service.icon className={`h-3.5 w-3.5 ${
                          service.color === 'cyan' ? 'text-[#00f5ff]' :
                          service.color === 'lime' ? 'text-[#d4ff00]' :
                          service.color === 'orange' ? 'text-[#ff6b35]' :
                          'text-[#ff006e]'
                        }`} />
                      </div>
                      <span className="text-slate-300 text-sm">{service.name}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {selectedStack && (
            <div className="glass-dark rounded-2xl p-6 border border-[#00f5ff]/30 max-w-xl mx-auto animate-scale-in">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[#00f5ff]" />
                <h3 className="text-lg font-bold text-white font-['Syne']">Ready to Provision</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                The {infrastructureOptions.find(s => s.id === selectedStack)?.name} template will be customized based on your idea description.
              </p>
              <Link
                href="/signup"
                className="btn-cyber inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg"
              >
                Start Setup
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Section */}
      <section id="compare" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              ShipMe vs <span className="gradient-text-orange-pink">AI App Builders</span>
            </h2>
            <p className="text-lg text-slate-400">
              We&apos;re not competing with Lovable or Bolt.new. They generate code. We provision infrastructure.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
                <div className="p-4 text-sm font-semibold text-slate-400">Feature</div>
                <div className="p-4 text-sm font-bold text-[#00f5ff] text-center">ShipMe</div>
                <div className="p-4 text-sm font-semibold text-slate-400 text-center">Lovable / Bolt / v0</div>
              </div>
              {comparison.map((row, idx) => (
                <div key={idx} className={`grid grid-cols-3 ${idx !== comparison.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="p-4 text-sm text-slate-300">{row.feature}</div>
                  <div className="p-4 text-sm text-[#d4ff00] text-center font-medium">{row.shipme}</div>
                  <div className="p-4 text-sm text-slate-500 text-center">{row.others}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              Why <span className="gradient-text-cyan-lime">ShipMe</span>?
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Built for developers who want production infrastructure, not prototypes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="card-cyber rounded-2xl p-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  feature.color === 'cyan' ? 'from-[#00f5ff]/20 to-[#00f5ff]/10' :
                  feature.color === 'lime' ? 'from-[#d4ff00]/20 to-[#d4ff00]/10' :
                  feature.color === 'orange' ? 'from-[#ff6b35]/20 to-[#ff6b35]/10' :
                  'from-[#ff006e]/20 to-[#ff006e]/10'
                } flex items-center justify-center mb-5 border ${
                  feature.color === 'cyan' ? 'border-[#00f5ff]/20' :
                  feature.color === 'lime' ? 'border-[#d4ff00]/20' :
                  feature.color === 'orange' ? 'border-[#ff6b35]/20' :
                  'border-[#ff006e]/20'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.color === 'cyan' ? 'text-[#00f5ff]' :
                    feature.color === 'lime' ? 'text-[#d4ff00]' :
                    feature.color === 'orange' ? 'text-[#ff6b35]' :
                    'text-[#ff006e]'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-['Syne']">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight font-['Syne']">
              Simple, <span className="gradient-text-cyan-lime">Flat Pricing</span>
            </h2>
            <p className="text-lg text-slate-400">
              No credit burn. No pay-per-prompt debugging. Provisions are deterministic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {pricing.map((tier, idx) => (
              <div
                key={idx}
                className={`glass-dark rounded-2xl p-6 border ${
                  tier.popular
                    ? "border-[#00f5ff]/40 relative"
                    : "border-white/5"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] text-[#0a0a0f]">
                      <Star className="h-3 w-3 fill-current" />
                      Popular
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1 font-['Syne']">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-white font-['Syne']">{tier.price}</span>
                  <span className="text-slate-400 ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#d4ff00] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-3 text-center font-bold rounded-lg transition-all duration-300 text-sm ${
                    tier.popular
                      ? "btn-cyber"
                      : "btn-outline-cyber"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-white/[0.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/5 via-transparent to-[#d4ff00]/5" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight font-['Syne']">
            Ready to skip the{" "}
            <span className="gradient-text-orange-pink">Technical Cliff</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Join developers who ship faster with pre-provisioned infrastructure.
            Free tier includes 2 provisions per month—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-cyber inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://github.com/chakrasutras-dev/shipme.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-cyber inline-flex items-center gap-2 px-8 py-4 text-base rounded-xl"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0a0a0f] border-t border-white/5 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] blur-lg opacity-50" />
                  <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] flex items-center justify-center">
                    <Terminal className="h-4 w-4 text-[#0a0a0f]" />
                  </div>
                </div>
                <span className="text-lg font-bold font-['Syne']">ShipMe</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Infrastructure orchestrator for developers. Provision, don&apos;t generate.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 font-['Syne']">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#how-it-works" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 font-['Syne']">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/chakrasutras-dev/shipme.dev" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    GitHub CLI
                  </a>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 font-['Syne']">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-[#00f5ff] transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-sm text-center">
            <p className="text-slate-500">© 2026 ShipMe. Built by Ayan Putatunda.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
