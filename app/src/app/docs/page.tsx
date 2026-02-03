import Link from "next/link";
import {
  Book,
  Rocket,
  Code2,
  Shield,
  ArrowRight,
  Github,
  Zap,
  Database,
  Globe,
  CreditCard,
  Cloud,
  FileText,
  Key,
  CheckCircle,
} from "lucide-react";

export default function DocsPage() {
  const quickLinks = [
    {
      title: "Getting Started",
      description: "Create your first project in under 5 minutes with our web app.",
      icon: Rocket,
      href: "#getting-started",
      color: "cyan",
    },
    {
      title: "How It Works",
      description: "Understand the provisioning flow and what gets created.",
      icon: Zap,
      href: "#how-it-works",
      color: "lime",
    },
    {
      title: "Service Setup",
      description: "Get your API tokens from GitHub, Vercel, and Supabase.",
      icon: Key,
      href: "#service-setup",
      color: "orange",
    },
    {
      title: "Security",
      description: "How ShipMe handles credentials and keeps your data safe.",
      icon: Shield,
      href: "#security",
      color: "pink",
    },
  ];

  const stackTemplates = [
    {
      name: "Next.js + Supabase + Vercel",
      description: "Full-stack SaaS with auth, database, and deployment",
      services: ["GitHub", "Vercel", "Supabase"],
      status: "Available",
    },
    {
      name: "React + Netlify + Supabase",
      description: "JAMstack app with serverless functions",
      services: ["GitHub", "Netlify", "Supabase"],
      status: "Coming Soon",
    },
    {
      name: "Next.js + Railway + PostgreSQL",
      description: "Full-stack app with managed PostgreSQL",
      services: ["GitHub", "Railway", "PostgreSQL"],
      status: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      {/* Background Grid */}
      <div className="bg-grid fixed inset-0 opacity-30" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#d4ff00]">
                  <Zap className="h-4 w-4 text-[#0a0a0f]" />
                </div>
              </div>
              <span className="text-lg font-bold font-['Syne']">ShipMe</span>
              <span className="text-slate-500 text-sm font-medium">Docs</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/new"
                className="btn-cyber px-4 py-2 text-sm font-bold rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-5 w-5 text-[#00f5ff]" />
            <span className="text-sm font-medium text-[#00f5ff]">Documentation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-['Syne']">
            ShipMe Documentation
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Everything you need to provision production-ready infrastructure in under 5 minutes.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="card-cyber rounded-xl p-5 group"
              >
                <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${
                  link.color === 'cyan' ? 'bg-[#00f5ff]/10 border border-[#00f5ff]/20' :
                  link.color === 'lime' ? 'bg-[#d4ff00]/10 border border-[#d4ff00]/20' :
                  link.color === 'orange' ? 'bg-[#ff6b35]/10 border border-[#ff6b35]/20' :
                  'bg-[#ff006e]/10 border border-[#ff006e]/20'
                }`}>
                  <link.icon className={`h-5 w-5 ${
                    link.color === 'cyan' ? 'text-[#00f5ff]' :
                    link.color === 'lime' ? 'text-[#d4ff00]' :
                    link.color === 'orange' ? 'text-[#ff6b35]' :
                    'text-[#ff006e]'
                  }`} />
                </div>
                <h3 className="font-bold text-white mb-1 font-['Syne'] flex items-center gap-2">
                  {link.title}
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#00f5ff] group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-400">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="px-6 lg:px-8 py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">Getting Started</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Describe Your Idea</h3>
              <p className="text-slate-400 mb-3">
                Start by visiting <Link href="/new" className="text-[#00f5ff] hover:underline">shipme.dev/new</Link> and describing your app idea in plain English.
              </p>
              <div className="glass-dark rounded-xl p-4 border border-white/10">
                <p className="text-sm text-slate-300 italic">
                  &quot;A SaaS for tracking fitness goals with social features, leaderboards, and personal training plans&quot;
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Review AI Recommendation</h3>
              <p className="text-slate-400 mb-3">
                Claude AI analyzes your requirements and recommends the optimal services based on your budget, scale, and platform needs.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-dark rounded-lg p-3 border border-white/10 text-center">
                  <Code2 className="h-5 w-5 text-[#00f5ff] mx-auto mb-2" />
                  <div className="text-xs text-slate-500">Framework</div>
                  <div className="text-sm font-medium text-white">Next.js</div>
                </div>
                <div className="glass-dark rounded-lg p-3 border border-white/10 text-center">
                  <Database className="h-5 w-5 text-[#d4ff00] mx-auto mb-2" />
                  <div className="text-xs text-slate-500">Database</div>
                  <div className="text-sm font-medium text-white">Supabase</div>
                </div>
                <div className="glass-dark rounded-lg p-3 border border-white/10 text-center">
                  <Globe className="h-5 w-5 text-[#ff6b35] mx-auto mb-2" />
                  <div className="text-xs text-slate-500">Hosting</div>
                  <div className="text-sm font-medium text-white">Vercel</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Connect Your Services</h3>
              <p className="text-slate-400 mb-3">
                Click the &quot;Connect&quot; buttons to get your API tokens from each service. Follow the step-by-step instructions provided.
              </p>
              <div className="glass-dark rounded-xl p-4 border border-[#d4ff00]/20">
                <p className="text-sm text-slate-300">
                  <span className="text-[#d4ff00] font-semibold">Security Note:</span> Your tokens are used once for provisioning and immediately deleted. ShipMe never stores your credentials.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Start Provisioning</h3>
              <p className="text-slate-400">
                Click &quot;Start Provisioning&quot; and watch ShipMe create your entire infrastructure:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00f5ff]" />
                  GitHub repository with initial files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00f5ff]" />
                  Vercel project with auto-deploy
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00f5ff]" />
                  Supabase database with auth configured
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00f5ff]" />
                  GitHub Codespaces with Claude Code
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00f5ff]" />
                  INFRASTRUCTURE.md documentation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Start Coding</h3>
              <p className="text-slate-400">
                Open your project in GitHub Codespaces with Claude Code pre-installed. Add your Anthropic API key and start building with AI assistance!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">How It Works</h2>

          <div className="space-y-6">
            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#00f5ff]" />
                AI-Powered Recommendations
              </h3>
              <p className="text-sm text-slate-400">
                Claude AI analyzes your app description, budget, target platform, and expected scale to recommend the optimal combination of services. The AI considers free tier limits, scalability, and developer experience.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#d4ff00]" />
                Automated Provisioning
              </h3>
              <p className="text-sm text-slate-400">
                ShipMe uses official APIs from GitHub, Vercel, and Supabase to create and configure all your resources. Everything is set up with best practices: environment variables synced, CI/CD configured, and services connected.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#ff6b35]" />
                INFRASTRUCTURE.md
              </h3>
              <p className="text-sm text-slate-400">
                Every project gets a comprehensive documentation file that includes: all service details, free tier limits, environment variable reference, cost projections, upgrade guidance, and maintenance checklist.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#ff006e]" />
                GitHub Codespaces + Claude Code
              </h3>
              <p className="text-sm text-slate-400">
                Your project includes a devcontainer.json that pre-installs Claude Code. Open in Codespaces, add your Anthropic API key, and start coding with AI assistance immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Setup */}
      <section id="service-setup" className="px-6 lg:px-8 py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">Service Setup</h2>
          <p className="text-slate-400 mb-6">
            You&apos;ll need API tokens from each service. Here&apos;s how to get them:
          </p>

          <div className="space-y-6">
            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Personal Access Token
              </h3>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:underline">GitHub Settings → Developer Settings → Personal Access Tokens</a></li>
                <li>Click &quot;Generate new token (classic)&quot;</li>
                <li>Give it a name like &quot;ShipMe Provisioning&quot;</li>
                <li>Select scopes: <code className="bg-black/30 px-1 rounded">repo</code>, <code className="bg-black/30 px-1 rounded">workflow</code>, <code className="bg-black/30 px-1 rounded">admin:repo_hook</code></li>
                <li>Click &quot;Generate token&quot; and copy it</li>
              </ol>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Vercel Access Token
              </h3>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:underline">Vercel Dashboard → Settings → Tokens</a></li>
                <li>Click &quot;Create&quot; to generate a new token</li>
                <li>Give it a name like &quot;ShipMe&quot;</li>
                <li>Set scope to &quot;Full Account&quot; for provisioning</li>
                <li>Click &quot;Create Token&quot; and copy it</li>
              </ol>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Access Token
              </h3>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://supabase.com/dashboard/account/tokens" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:underline">Supabase Dashboard → Account → Access Tokens</a></li>
                <li>Click &quot;Generate new token&quot;</li>
                <li>Give it a name like &quot;ShipMe&quot;</li>
                <li>Copy the generated token (starts with <code className="bg-black/30 px-1 rounded">sbp_</code>)</li>
                <li>Also note your Organization ID from <a href="https://supabase.com/dashboard/org" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:underline">Settings</a></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">Supported Services</h2>
          <p className="text-slate-400 mb-6">
            ShipMe supports these service combinations. More coming soon!
          </p>

          <div className="space-y-4">
            {stackTemplates.map((template, idx) => (
              <div key={idx} className="glass-dark rounded-xl p-5 border border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                    <div className="flex items-center gap-2">
                      {template.services.map((service, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-2 py-1 rounded-full bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.status === 'Available'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {template.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tier Info */}
      <section className="px-6 lg:px-8 py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">Free Tier Overview</h2>
          <p className="text-slate-400 mb-6">
            All recommended services have generous free tiers. Here&apos;s what you get at $0/month:
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <Github className="h-6 w-6 text-slate-400 mb-3" />
              <h3 className="font-bold text-white mb-2">GitHub</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Unlimited repos</li>
                <li>• 2,000 CI/CD minutes/mo</li>
                <li>• 500MB packages</li>
                <li>• Codespaces: 60 hrs/mo</li>
              </ul>
            </div>
            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <Globe className="h-6 w-6 text-slate-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Vercel</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Unlimited deployments</li>
                <li>• 100GB bandwidth/mo</li>
                <li>• Serverless functions</li>
                <li>• Automatic HTTPS</li>
              </ul>
            </div>
            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <Database className="h-6 w-6 text-slate-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Supabase</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 500MB database</li>
                <li>• 50K monthly users</li>
                <li>• 1GB file storage</li>
                <li>• Unlimited API requests</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 glass-dark rounded-xl p-4 border border-[#d4ff00]/20">
            <p className="text-sm text-slate-300">
              <span className="text-[#d4ff00] font-semibold">Perfect for:</span> MVPs, side projects, learning, and apps with less than 1,000 monthly active users.
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Syne']">Security</h2>

          <div className="space-y-6">
            <div className="glass-dark rounded-xl p-5 border border-[#d4ff00]/20">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#d4ff00]" />
                Credential Handling
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                ShipMe stores credentials in memory only during the provisioning process. Once infrastructure setup completes,
                all API keys, OAuth tokens, and sensitive data are permanently deleted. We never store your tokens in any database.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2">What We Access</h3>
              <p className="text-sm text-slate-400 mb-3">
                ShipMe requests minimum necessary permissions:
              </p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <strong>GitHub:</strong> Create repos, push files, configure Actions</li>
                <li>• <strong>Vercel:</strong> Create projects, set environment variables</li>
                <li>• <strong>Supabase:</strong> Create projects, configure auth</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl p-5 border border-white/10">
              <h3 className="font-bold text-white mb-2">Best Practices</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Use tokens with minimal required permissions</li>
                <li>• Revoke tokens after provisioning if desired</li>
                <li>• Enable 2FA on all connected services</li>
                <li>• Review INFRASTRUCTURE.md for security guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-8 py-16 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 font-['Syne']">Ready to Ship?</h2>
          <p className="text-slate-400 mb-6">
            Go from idea to deployed app in under 5 minutes.
          </p>
          <Link
            href="/new"
            className="btn-cyber px-8 py-3 text-lg font-bold rounded-xl inline-flex items-center gap-2"
          >
            <Rocket className="h-5 w-5" />
            Start Provisioning
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-slate-500">© 2026 ShipMe</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-[#00f5ff] transition-colors">
              Home
            </Link>
            <Link href="/new" className="text-sm text-slate-400 hover:text-[#00f5ff] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
