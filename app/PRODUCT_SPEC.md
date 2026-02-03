# ShipMe - Product Specification

> **Domain:** shipme.dev
> **Tagline:** From Idea to Deployed App. Zero Guesswork.
> **Version:** 1.0.0
> **Last Updated:** February 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Target Audience](#target-audience)
5. [Core Features](#core-features)
6. [Technical Architecture](#technical-architecture)
7. [User Journey](#user-journey)
8. [Service Integrations](#service-integrations)
9. [AI Integration](#ai-integration)
10. [Security & Privacy](#security--privacy)
11. [Pricing Model](#pricing-model)
12. [Success Metrics](#success-metrics)
13. [Competitive Analysis](#competitive-analysis)
14. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**ShipMe** is an AI-powered infrastructure provisioning platform that transforms app ideas into fully deployed, production-ready projects in under 5 minutes. By leveraging Claude AI for intelligent service recommendations and automated provisioning pipelines, ShipMe eliminates the hours of manual setup typically required to configure GitHub repositories, hosting platforms, and databases.

### Key Value Propositions

| Value | Description |
|-------|-------------|
| **Speed** | 5 minutes from idea to deployed app |
| **Intelligence** | AI recommends optimal services based on your needs |
| **Zero Config** | Pre-configured with best practices |
| **Cost Transparency** | Clear free tier breakdown, no surprises |
| **Developer Experience** | GitHub Codespaces with Claude Code pre-installed |

---

## Problem Statement

### The Current Pain

Setting up a new project infrastructure typically requires:

1. **Decision Fatigue** (30+ minutes)
   - Which framework? Which database? Which hosting?
   - Comparing pricing, features, limitations
   - Reading documentation for each service

2. **Manual Configuration** (2-4 hours)
   - Creating GitHub repository
   - Setting up hosting platform
   - Provisioning database
   - Configuring environment variables
   - Setting up CI/CD pipelines
   - Configuring development environments

3. **Context Switching** (Ongoing)
   - Jumping between multiple dashboards
   - Managing credentials across platforms
   - Keeping documentation in sync

### The Cost

- **Time:** 3-5 hours per project setup
- **Cognitive Load:** Decision paralysis, configuration errors
- **Opportunity Cost:** Time not spent building actual features

---

## Solution Overview

ShipMe automates the entire infrastructure setup process:

```
┌─────────────────────────────────────────────────────────────────┐
│                         ShipMe Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Describe Idea] → [AI Recommendation] → [Customize Services]   │
│                                                                  │
│        ↓                                                         │
│                                                                  │
│  [Connect APIs] → [Review & Confirm] → [Auto Provision]         │
│                                                                  │
│        ↓                                                         │
│                                                                  │
│  [GitHub Repo] + [Hosting] + [Database] + [Codespaces]          │
│                                                                  │
│        ↓                                                         │
│                                                                  │
│  [INFRASTRUCTURE.md] + [README] + [devcontainer.json]           │
│                                                                  │
│        ↓                                                         │
│                                                                  │
│  🚀 Start coding with Claude Code in Codespaces!                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target Audience

### Primary Users

| Segment | Description | Pain Points |
|---------|-------------|-------------|
| **Indie Hackers** | Solo developers shipping MVPs | Time-constrained, need speed |
| **Startup Founders** | Technical founders validating ideas | Focus on product, not infra |
| **Freelancers** | Developers starting client projects | Repetitive setup tasks |
| **Bootcamp Grads** | New developers building portfolios | Overwhelmed by choices |

### Secondary Users

| Segment | Description | Use Case |
|---------|-------------|----------|
| **Agencies** | Development shops | Standardized project setup |
| **Educators** | Coding bootcamps, teachers | Quick classroom environments |
| **Hackathon Teams** | Time-pressured builders | Maximum speed setup |

### User Personas

#### Persona 1: "The Indie Hacker"
- **Name:** Alex
- **Role:** Solo founder
- **Goal:** Ship MVP in a weekend
- **Frustration:** "I spend more time setting up than building"
- **ShipMe Value:** 5-minute setup → more time for features

#### Persona 2: "The Freelancer"
- **Name:** Jordan
- **Role:** Contract developer
- **Goal:** Start client projects quickly
- **Frustration:** "Every client wants a different stack"
- **ShipMe Value:** Consistent, documented setup every time

---

## Core Features

### 1. AI-Powered Service Recommendations

**How it works:**
- User describes their app idea in natural language
- Claude AI analyzes requirements (budget, scale, platform)
- Returns optimized service recommendations with reasoning

**Input:**
```
"A SaaS platform for tracking gym workouts with social
features, leaderboards, and personal training plans"
```

**Output:**
```json
{
  "stack": {
    "framework": "Next.js",
    "database": "Supabase",
    "hosting": "Vercel"
  },
  "reasoning": "Next.js provides SSR for SEO, Supabase handles
               auth + real-time for social features, Vercel
               offers seamless Next.js deployment",
  "estimated_monthly_cost": "$0-25",
  "setup_time": "~3 minutes"
}
```

### 2. Service Customization

Users can override AI recommendations:

| Category | Options | Status |
|----------|---------|--------|
| **Source Control** | GitHub | ✅ Supported |
| | GitLab | 🔜 Coming Soon |
| | Bitbucket | 🔜 Coming Soon |
| **Hosting** | Vercel | ✅ Supported |
| | Netlify | 🔜 Coming Soon |
| | Railway | 🔜 Coming Soon |
| | Render | 🔜 Coming Soon |
| **Database** | Supabase | ✅ Supported |
| | PlanetScale | 🔜 Coming Soon |
| | Neon | 🔜 Coming Soon |
| | MongoDB Atlas | 🔜 Coming Soon |

### 3. One-Click Service Connection

- **Connect buttons** for quick navigation to API token pages
- **Step-by-step instructions** for each service
- **Token verification** before provisioning
- **Credential security** - tokens deleted after use

### 4. Automated Provisioning

What gets created:

| Resource | Details |
|----------|---------|
| **GitHub Repository** | Private repo with branch protection |
| **Vercel Project** | Connected to repo, auto-deploy enabled |
| **Supabase Project** | PostgreSQL + Auth + Storage configured |
| **Environment Variables** | Auto-configured across all services |
| **GitHub Codespaces** | devcontainer.json with Claude Code |

### 5. Infrastructure Documentation

Auto-generated `INFRASTRUCTURE.md` includes:

- Service details and purposes
- Free tier limits and costs
- When to upgrade guidance
- Environment variable reference
- Claude Code setup instructions
- Maintenance checklist

### 6. Free Tier Transparency

Clear breakdown showing:
- What's included at $0/month
- Limitations of each service
- Upgrade triggers and costs
- Cost projections by user scale

### 7. GitHub Codespaces Integration

Pre-configured development environment:
- Claude Code pre-installed
- All dependencies ready
- Port forwarding configured
- Dotfiles support

---

## Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ShipMe Platform                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │    │   Backend    │    │   Services   │       │
│  │   (Next.js)  │───▶│  (Next.js    │───▶│   Registry   │       │
│  │              │    │   API Routes)│    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         │                   ▼                    │               │
│         │            ┌──────────────┐            │               │
│         │            │  Claude AI   │            │               │
│         │            │  (Anthropic) │            │               │
│         │            └──────────────┘            │               │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Provisioning Engine                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │ GitHub  │  │ Vercel  │  │Supabase │  │Codespaces│    │    │
│  │  │Provisioner│ │Provisioner│ │Provisioner│ │Generator│    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, React 19 | UI and routing |
| **Styling** | Tailwind CSS | Responsive design |
| **Backend** | Next.js API Routes | API endpoints |
| **AI** | Claude API (Anthropic) | Service recommendations |
| **Auth** | Supabase Auth | User authentication |
| **Database** | Supabase (PostgreSQL) | User data, projects |
| **Hosting** | Vercel | Platform hosting |

### Directory Structure

```
shipme/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── new/           # New provision wizard
│   │   │   └── settings/      # User settings
│   │   └── api/               # API routes
│   │       ├── analyze-idea/  # Claude AI endpoint
│   │       ├── provision/     # Provisioning endpoint
│   │       └── validate-token/# Token validation
│   ├── components/            # React components
│   │   ├── ServiceConnector/  # API connection UI
│   │   ├── StackCustomizer/   # Service selection
│   │   ├── FreeTierInfo/      # Cost breakdown
│   │   └── ProvisioningComplete/ # Success screen
│   └── lib/
│       ├── provisioning/      # Provisioning logic
│       │   ├── orchestrator.ts    # Main orchestration
│       │   ├── github.ts          # GitHub API
│       │   ├── vercel.ts          # Vercel API
│       │   ├── supabase.ts        # Supabase API
│       │   ├── codespaces.ts      # Codespaces config
│       │   └── infrastructure-spec.ts # Doc generator
│       └── services/
│           └── registry.ts    # Service definitions
├── PRODUCT_SPEC.md           # This document
├── FUTURE_ROADMAP.md         # Planned features
└── README.md                  # Quick start guide
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze-idea` | POST | Get AI service recommendations |
| `/api/provision` | POST | Execute provisioning |
| `/api/validate-token` | POST | Verify service tokens |

---

## User Journey

### Step 1: Describe Idea

**Screen:** Idea Input Form

**User Actions:**
- Describe app idea in textarea
- Select monthly budget range
- Choose target platform (web/mobile/both)
- Indicate expected user scale

**System Response:**
- Validates input
- Prepares for AI analysis

### Step 2: AI Recommendation

**Screen:** Stack Recommendation Display

**User Actions:**
- Review recommended services
- Read AI reasoning
- See estimated costs and setup time

**System Response:**
- Calls Claude API with user inputs
- Returns structured recommendation
- Shows API cost transparency

### Step 3: Customize Services

**Screen:** Service Picker with Dropdowns

**User Actions:**
- Accept or modify recommendations
- Select alternative providers
- See "Recommended" badges

**System Response:**
- Updates selection state
- Shows "Coming Soon" for unsupported options

### Step 4: Connect Services

**Screen:** Credential Input Form

**User Actions:**
- Click "Connect" to open service dashboards
- Follow step-by-step token instructions
- Paste tokens into input fields
- Click "Verify" to validate

**System Response:**
- Validates tokens against service APIs
- Shows connection status
- Enables progression when all connected

### Step 5: Review & Provision

**Screen:** Summary with Free Tier Breakdown

**User Actions:**
- Review all selections
- See detailed free tier information
- Click "Start Provisioning"

**System Response:**
- Shows provisioning progress
- Creates all resources
- Commits INFRASTRUCTURE.md
- Redirects to success screen

### Step 6: Post-Provisioning

**Screen:** Provisioning Complete

**User Actions:**
- Access quick links to all services
- Follow Claude Code setup steps
- Open GitHub Codespaces

**System Response:**
- Shows 4-step Claude Code setup guide
- Provides direct links to all resources
- Points to INFRASTRUCTURE.md

---

## Service Integrations

### GitHub Integration

**API Used:** GitHub REST API v3

**Resources Created:**
- Repository (private)
- Initial commit with files:
  - `INFRASTRUCTURE.md`
  - `README.md`
  - `.env.example`
  - `.devcontainer/devcontainer.json`
  - `CODESPACES.md`

**Permissions Required:**
- `repo` - Full repository access
- `workflow` - GitHub Actions
- `admin:repo_hook` - Webhooks

### Vercel Integration

**API Used:** Vercel REST API v13

**Resources Created:**
- Project linked to GitHub repo
- Production deployment
- Preview deployments (auto)
- Environment variables

**Permissions Required:**
- Full Account access token
- Optional: Team ID for team projects

### Supabase Integration

**API Used:** Supabase Management API

**Resources Created:**
- Project with PostgreSQL database
- Auth configuration
- Storage buckets
- API keys

**Permissions Required:**
- Access token
- Organization ID

---

## AI Integration

### Claude API Usage

**Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)

**System Prompt:**
```
You are a senior software architect helping developers choose
the right tech stack. Analyze their app idea and constraints
to recommend optimal services.

Consider:
- Budget constraints
- Expected scale
- Target platforms
- Free tier availability
- Developer experience
```

**Request Format:**
```json
{
  "idea": "User's app description",
  "budget": "$0-50",
  "platform": "web",
  "scale": "1000"
}
```

**Response Format:**
```json
{
  "stack": {
    "framework": "Next.js",
    "database": "Supabase",
    "hosting": "Vercel",
    "additional": ["Stripe", "Resend"]
  },
  "reasoning": "...",
  "estimated_monthly_cost": "$0-25",
  "setup_time": "~3 minutes",
  "features": ["Auth", "Database", "Storage"]
}
```

**Cost Management:**
- Average request: ~1,500 tokens
- Estimated cost: ~$0.003 per analysis
- Displayed to user for transparency

---

## Security & Privacy

### Credential Handling

| Principle | Implementation |
|-----------|----------------|
| **No Storage** | Tokens never saved to database |
| **Memory Only** | Credentials held in session state |
| **Immediate Deletion** | Cleared after provisioning completes |
| **HTTPS Only** | All API calls encrypted |
| **No Logging** | Tokens excluded from logs |

### User Data

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Email | Supabase Auth | Account lifetime |
| Project metadata | Supabase DB | Account lifetime |
| API credentials | Memory only | Session only |
| Usage analytics | Anonymous | 90 days |

### Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- CSRF protection
- Rate limiting on API endpoints

---

## Pricing Model

### Proposed Tiers

| Tier | Price | Provisions/Month | Features |
|------|-------|------------------|----------|
| **Free** | $0 | 3 | Basic provisioning |
| **Builder** | $9/mo | 15 | Priority support |
| **Pro** | $29/mo | Unlimited | Team features, templates |
| **Enterprise** | Custom | Unlimited | SSO, audit logs |

### Revenue Streams

1. **Subscription Revenue** - Monthly/annual plans
2. **Affiliate Revenue** - Service provider partnerships
3. **Enterprise Contracts** - Custom deployments

---

## Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to Deploy** | < 5 minutes | Avg provisioning time |
| **Success Rate** | > 95% | Provisions completed |
| **User Retention** | > 40% | Monthly active return |
| **NPS Score** | > 50 | Quarterly surveys |

### Growth Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| Registered Users | 10,000 |
| Monthly Provisions | 5,000 |
| Paid Conversions | 5% |
| MRR | $15,000 |

---

## Competitive Analysis

### Direct Competitors

| Product | Approach | ShipMe Advantage |
|---------|----------|------------------|
| **Create React App** | CLI, no hosting | Full deployment included |
| **Vercel Templates** | Pre-built starters | AI customization |
| **Railway Templates** | Container-based | Multi-service orchestration |
| **Render Blueprints** | YAML config | No config required |

### Indirect Competitors

| Product | Approach | ShipMe Advantage |
|---------|----------|------------------|
| **Terraform** | IaC, complex | No learning curve |
| **Pulumi** | Code-based IaC | Simpler mental model |
| **AWS Amplify** | AWS-locked | Multi-cloud freedom |

### Unique Differentiators

1. **AI-Powered Recommendations** - No other tool uses AI for service selection
2. **Claude Code Integration** - Pre-configured AI coding assistant
3. **Free Tier Transparency** - Clear cost breakdown before provisioning
4. **INFRASTRUCTURE.md** - Self-documenting infrastructure

---

## Future Roadmap

See [FUTURE_ROADMAP.md](./FUTURE_ROADMAP.md) for detailed feature plans.

### Version 1.1 (Q2 2026)
- Netlify integration
- GitLab integration
- Project templates

### Version 1.2 (Q3 2026)
- Team workspaces
- PlanetScale/Neon databases
- Custom domains

### Version 2.0 (Q4 2026)
- MCP integration for dynamic discovery
- Self-hosted option
- Enterprise features

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| **Provisioning** | Automated creation and configuration of services |
| **Service** | External platform (GitHub, Vercel, Supabase) |
| **Stack** | Combination of framework + database + language |
| **Free Tier** | Service usage at $0/month |
| **Codespaces** | GitHub's cloud development environment |

### References

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Supabase API Documentation](https://supabase.com/docs/reference)
- [Claude API Documentation](https://docs.anthropic.com)

---

*This document is maintained by the ShipMe team and updated with each major release.*
