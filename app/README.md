<p align="center">
  <img src="public/logo.svg" alt="ShipMe Logo" width="80" height="80" />
</p>

<h1 align="center">ShipMe</h1>

<p align="center">
  <strong>From Idea to Deployed App. Zero Guesswork.</strong>
</p>

<p align="center">
  <a href="https://shipme.dev">Website</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="FUTURE_ROADMAP.md">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Claude-AI-orange?style=flat-square" alt="Claude AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## What is ShipMe?

ShipMe is an AI-powered infrastructure provisioning platform that transforms your app idea into a fully deployed, production-ready project in under 5 minutes.

**The Problem:** Setting up a new project requires 3-5 hours of:
- Deciding which services to use
- Creating accounts and generating API keys
- Configuring GitHub repos, hosting, and databases
- Connecting everything together
- Writing documentation

**The Solution:** ShipMe automates all of this:

```
Your Idea → AI Recommendation → One-Click Provision → Start Coding
```

---

## Features

### 🤖 AI-Powered Recommendations
Describe your app idea in plain English. Claude AI analyzes your requirements and recommends the optimal tech stack based on your budget, scale, and platform needs.

### ⚡ One-Click Provisioning
Connect your API tokens once, and ShipMe provisions everything:
- **GitHub** - Repository with best practices
- **Vercel** - Deployment with auto-deploy
- **Supabase** - Database + Auth + Storage

### 💰 Free Tier Transparency
See exactly what you get at $0/month. Clear breakdown of limits, costs, and when to upgrade.

### 🛠️ GitHub Codespaces Ready
Every project includes `devcontainer.json` with Claude Code pre-installed. Open in Codespaces and start coding with AI assistance immediately.

### 📄 Auto-Generated Documentation
Every project gets a comprehensive `INFRASTRUCTURE.md` with:
- Service details and purposes
- Environment variable reference
- Free tier limits and upgrade paths
- Maintenance checklist

### 🔒 Security First
Your API tokens are used once and immediately deleted. ShipMe never stores your credentials.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for: GitHub, Vercel, Supabase
- Anthropic API key (for AI recommendations)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shipme.git
cd shipme

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Anthropic (Required for AI recommendations)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (Required for auth and data)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

---

## How It Works

### Step 1: Describe Your Idea
Tell ShipMe about your app. Include details about features, target audience, and constraints.

```
"A SaaS platform for tracking gym workouts with social features,
leaderboards, and personal training plans. Budget is $0-50/month,
expecting around 1000 users."
```

### Step 2: Review AI Recommendation
Claude AI analyzes your inputs and recommends services:

| Component | Recommendation | Reasoning |
|-----------|---------------|-----------|
| Framework | Next.js | SSR for SEO, React ecosystem |
| Database | Supabase | Auth + real-time for social |
| Hosting | Vercel | Seamless Next.js deployment |

### Step 3: Customize (Optional)
Accept the AI recommendation or swap services based on your preferences.

### Step 4: Connect Services
Click "Connect" buttons to quickly navigate to each service's token page. Follow step-by-step instructions to generate tokens.

### Step 5: Provision
Click "Start Provisioning" and watch ShipMe create:

- ✅ GitHub repository with initial files
- ✅ Vercel project connected to GitHub
- ✅ Supabase project with auth configured
- ✅ Environment variables synced
- ✅ `INFRASTRUCTURE.md` documentation
- ✅ GitHub Codespaces configuration

### Step 6: Start Coding
Open your project in GitHub Codespaces with Claude Code pre-installed. Set your Anthropic API key and start building!

---

## Project Structure

```
shipme/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   └── new/           # Provision wizard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ServiceConnector/  # API connection UI
│   │   ├── StackCustomizer/   # Service selection
│   │   ├── FreeTierInfo/      # Cost breakdown
│   │   └── ProvisioningComplete/
│   └── lib/
│       ├── provisioning/      # Provisioning logic
│       │   ├── orchestrator.ts
│       │   ├── github.ts
│       │   ├── vercel.ts
│       │   ├── supabase.ts
│       │   └── codespaces.ts
│       └── services/
│           └── registry.ts    # Service definitions
├── PRODUCT_SPEC.md            # Full product specification
├── FUTURE_ROADMAP.md          # Planned features
└── README.md                  # This file
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) | Complete product specification |
| [FUTURE_ROADMAP.md](./FUTURE_ROADMAP.md) | Planned features and timeline |
| [QUICK_START.md](./QUICK_START.md) | Getting started guide |

---

## Supported Services

### Currently Supported

| Service | Category | Status |
|---------|----------|--------|
| GitHub | Source Control | ✅ Full support |
| Vercel | Hosting | ✅ Full support |
| Supabase | Database + Auth | ✅ Full support |

### Coming Soon

| Service | Category | ETA |
|---------|----------|-----|
| Netlify | Hosting | Q2 2026 |
| GitLab | Source Control | Q2 2026 |
| Railway | Hosting | Q2 2026 |
| PlanetScale | Database | Q3 2026 |
| Neon | Database | Q3 2026 |

---

## API Reference

### POST /api/analyze-idea

Get AI-powered service recommendations.

**Request:**
```json
{
  "idea": "Your app description",
  "budget": "$0-50",
  "platform": "web",
  "scale": "1000"
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "stack": {
      "framework": "Next.js",
      "database": "Supabase",
      "hosting": "Vercel"
    },
    "reasoning": "...",
    "estimated_monthly_cost": "$0-25",
    "setup_time": "~3 minutes"
  }
}
```

### POST /api/provision

Execute infrastructure provisioning.

**Request:**
```json
{
  "projectName": "my-app",
  "description": "App description",
  "stack": {
    "framework": "nextjs",
    "database": "supabase",
    "hosting": "vercel"
  },
  "credentials": {
    "github": { "accessToken": "..." },
    "vercel": { "accessToken": "..." },
    "supabase": { "accessToken": "...", "organizationId": "..." }
  }
}
```

### POST /api/validate-token

Validate a service token before provisioning.

**Request:**
```json
{
  "service": "github",
  "token": "ghp_..."
}
```

---

## Security

### Credential Handling

- **No Storage:** Tokens are never saved to any database
- **Memory Only:** Credentials exist only in session state
- **Immediate Deletion:** Cleared after provisioning completes
- **HTTPS Only:** All API calls are encrypted
- **No Logging:** Tokens are excluded from all logs

### Best Practices

1. Use tokens with minimal required permissions
2. Revoke tokens after provisioning if desired
3. Enable 2FA on all connected services
4. Review INFRASTRUCTURE.md for security guidelines

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude API
- **Icons**: Lucide React

---

## Contributing

We welcome contributions! Please see our contributing guidelines.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/shipme.git

# Install dependencies
npm install

# Create branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev
npm run lint

# Submit PR
git push origin feature/your-feature
```

### Areas to Contribute

- 🔌 New service integrations
- 📚 Documentation improvements
- 🐛 Bug fixes
- ✨ Feature enhancements

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- **Documentation:** [shipme.dev/docs](https://shipme.dev/docs)
- **Issues:** [GitHub Issues](https://github.com/yourusername/shipme/issues)
- **Email:** support@shipme.dev

---

<p align="center">
  Built with ❤️ by Ayan Putatunda
</p>

<p align="center">
  <a href="https://shipme.dev">shipme.dev</a>
</p>
