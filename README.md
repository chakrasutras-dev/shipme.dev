# ShipMe v2.0

**AI-powered infrastructure provisioning via GitHub Codespaces**

Transform your app idea into a fully-provisioned development environment in under 10 minutes.

[![Live Site](https://img.shields.io/badge/Live-shipme.dev-blue)](https://shipme.dev)
[![Version](https://img.shields.io/badge/version-2.0--dev-orange)](https://github.com/yourusername/shipme.dev)
[![Status](https://img.shields.io/badge/status-Phase%202-green)](./docs/planning/PROGRESS.md)

## 🚀 What is ShipMe?

ShipMe automates infrastructure provisioning for full-stack applications. Instead of spending hours setting up GitHub repos, Supabase databases, and Netlify deployments, ShipMe's AI agent does it for you in a GitHub Codespace.

### The Vision

**v1.0 (Archived):** Web dashboard with step-by-step instructions → 30-45 minutes
**v2.0 (Current):** GitHub Codespaces + Claude Code automation → 5-10 minutes

## ✨ Features

### Phase 1 (Complete) ✅
- Simplified landing page with AI stack recommendations
- GitHub OAuth authentication
- Codespace launcher API (stub)
- Database schema for tracking launches

### Phase 2 (In Progress) 🚀
- Template repository with devcontainer configuration
- GitHub MCP server for repository automation
- Secret vault for credential management
- Claude Code integration for automated provisioning

### Phase 3-5 (Planned) 📋
- Supabase database provisioning
- Netlify deployment automation
- Google OAuth setup
- Production hardening and launch

## 🏗️ Architecture

```
shipme.dev (Landing Page)
    ↓
GitHub OAuth
    ↓
/api/launch-codespace
    ↓
Creates repo from template
    ↓
GitHub Codespace opens
    ↓
Claude Code + MCP servers
    ↓
Fully provisioned infrastructure
```

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- **[Product Specifications](./docs/product_spec/)** - Vision and requirements
- **[Implementation Docs](./docs/implementation/)** - Phase completion summaries
- **[Progress Tracking](./docs/planning/PROGRESS.md)** - Live development status
- **[Testing Reports](./docs/reports/)** - Quality assurance and metrics

Quick links:
- [v2.0 Product Spec](./docs/product_spec/v2.0-PRODUCT_SPEC.md)
- [Phase 1 Completion](./docs/implementation/PHASE-1-COMPLETE.md)
- [Phase 1 Testing Report](./docs/reports/PHASE-1-TESTING-REPORT.md)

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS
- **UI:** React 19

### Backend
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **API:** Next.js API Routes
- **Authentication:** Supabase Auth (GitHub OAuth)

### Infrastructure
- **Hosting:** Netlify
- **Version Control:** GitHub
- **Development:** GitHub Codespaces
- **AI Agent:** Claude Code via Anthropic API

### MCP Servers
- **GitHub MCP:** Repository and secret management
- **Supabase MCP:** Database provisioning (Phase 3)
- **Netlify MCP:** Deployment automation (Phase 3)
- **GCP MCP:** OAuth configuration (Phase 4)

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Supabase CLI
- Netlify CLI (optional)
- GitHub account

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/shipme.dev.git
cd shipme.dev

# Install dependencies
cd app
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Database Setup

```bash
# Push database schema to Supabase
cd app
supabase db push
```

## 📂 Project Structure

```
shipme.dev/
├── app/                      # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities and helpers
│   └── supabase/            # Database schema and migrations
├── template-components/      # Phase 2: Template repo components
│   ├── .devcontainer/       # Codespace configuration
│   ├── .shipme/             # Project config and Claude instructions
│   └── mcp-servers/         # MCP server implementations
├── docs/                    # Documentation
│   ├── product_spec/        # Product specifications
│   ├── implementation/      # Phase completion docs
│   ├── reports/             # Testing reports
│   └── planning/            # Progress tracking
└── README.md               # This file
```

## 🌳 Git Branches

- **`main`** - Original state (stable)
- **`v1.0-archive`** - v1.0 backup (safe fallback)
- **`v2.0-development`** - Active development (current work)

## 📊 Current Status

### Phase 1: Complete ✅
- Code reduction: -4,051 lines
- Build status: ✅ Passing
- TypeScript errors: 0
- Branch: `v2.0-development`
- Commits: 6 commits pushed to GitHub

**Next Step:** Deploy Phase 1 to shipme.dev

### Phase 2: Preparation 🚀
- Template components created
- GitHub MCP server implemented
- Secret vault completed
- Awaiting template repository creation

## 🤝 Contributing

ShipMe v2.0 is currently in active development. Contributions will be welcomed after the Phase 5 public launch.

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/claude-code) by Anthropic
- Inspired by the need for faster infrastructure provisioning
- MCP (Model Context Protocol) by Anthropic

## 📞 Contact

- **Website:** [shipme.dev](https://shipme.dev)
- **Issues:** [GitHub Issues](https://github.com/yourusername/shipme.dev/issues)

---

**Version:** 2.0-dev
**Last Updated:** February 4, 2026
**Status:** Phase 2 in Progress

**Pivot Complete:** v1.0 → v2.0 (Manual Instructions → AI Automation)
