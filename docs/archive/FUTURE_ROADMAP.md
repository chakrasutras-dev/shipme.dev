# ShipMe - Future Roadmap

> **Last Updated:** February 2026
> **Planning Horizon:** 18 months
> **Status Legend:** 🟢 Planned | 🟡 In Design | 🔵 In Development | ✅ Released

---

## Vision Statement

**ShipMe will become the default way developers start new projects** - an intelligent platform that not only provisions infrastructure but learns from the community to continuously improve recommendations, integrates with emerging tools automatically, and scales from solo projects to enterprise deployments.

---

## Roadmap Overview

```
2026 Q1          Q2              Q3              Q4          2027 Q1
  │               │               │               │               │
  ▼               ▼               ▼               ▼               ▼
┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐
│ 1.0 │──────▶│ 1.1 │──────▶│ 1.2 │──────▶│ 2.0 │──────▶│ 2.1 │
│     │       │     │       │     │       │     │       │     │
│Core │       │More │       │Team │       │MCP  │       │Enter│
│MVP  │       │Svcs │       │Work │       │Int. │       │prise│
└─────┘       └─────┘       └─────┘       └─────┘       └─────┘
```

---

## Version 1.0 (Current) ✅

### Released Features

| Feature | Description | Status |
|---------|-------------|--------|
| AI Recommendations | Claude-powered service suggestions | ✅ Released |
| GitHub Integration | Repo creation, file commits | ✅ Released |
| Vercel Integration | Project setup, auto-deploy | ✅ Released |
| Supabase Integration | Database + Auth provisioning | ✅ Released |
| Service Customization | Dropdown selection with alternatives | ✅ Released |
| Free Tier Breakdown | Cost transparency display | ✅ Released |
| GitHub Codespaces | devcontainer.json with Claude Code | ✅ Released |
| INFRASTRUCTURE.md | Auto-generated documentation | ✅ Released |
| Connect Buttons | One-click service navigation | ✅ Released |
| Post-Provision Guide | Claude Code setup instructions | ✅ Released |

---

## Version 1.1 (Q2 2026) 🟢

**Theme:** Payments & Expanded Services

### New Integrations

| Service | Category | Priority | Complexity |
|---------|----------|----------|------------|
| **Stripe** | Payments | High | Medium |
| **Netlify** | Hosting | High | Medium |
| **GitLab** | Source Control | High | Medium |
| **Railway** | Hosting | Medium | Medium |
| **Render** | Hosting | Medium | Medium |

### Feature Details

#### Stripe Integration
```
Scope:
- Stripe account connection via Stripe Connect
- Product/Price creation for SaaS apps
- Webhook endpoint configuration
- Customer portal setup
- API keys synced to Vercel env vars

API Endpoints:
- POST /v1/accounts (Stripe Connect)
- POST /v1/products (create products)
- POST /v1/prices (create prices)
- POST /v1/webhook_endpoints (setup webhooks)

Free Tier:
- No monthly fees
- 2.9% + 30¢ per transaction
- Test mode unlimited
```

#### Netlify Integration
```
Scope:
- Site creation via Netlify API
- GitHub repo connection
- Build settings auto-configuration
- Environment variables sync
- Deploy previews enabled

API Endpoints:
- POST /sites (create site)
- POST /sites/{site_id}/builds (trigger build)
- PATCH /sites/{site_id} (update settings)
```

#### GitLab Integration
```
Scope:
- Project creation
- Initial file push
- CI/CD pipeline (.gitlab-ci.yml)
- GitLab Pages support

Considerations:
- Self-hosted GitLab support (future)
- Group/subgroup hierarchy
```

### UX Improvements

| Improvement | Description |
|-------------|-------------|
| **Progress Persistence** | Resume interrupted provisions |
| **Provision History** | View past provisions with details |
| **Retry Failed Steps** | Selective retry without full restart |
| **Email Notifications** | Provision complete alerts |

---

## Version 1.2 (Q3 2026) 🟢

**Theme:** Teams & Databases

### Database Integrations

| Service | Type | Priority |
|---------|------|----------|
| **PlanetScale** | MySQL (serverless) | High |
| **Neon** | PostgreSQL (serverless) | High |
| **MongoDB Atlas** | Document DB | Medium |
| **Turso** | SQLite (edge) | Medium |

#### PlanetScale Integration
```
Features:
- Database creation
- Branch workflow setup
- Connection string generation
- Schema migration support

Free Tier:
- 5GB storage
- 1 billion row reads/month
- 10 million row writes/month
```

#### Neon Integration
```
Features:
- Project creation
- Branching support
- Connection pooling
- Auto-suspend configuration

Free Tier:
- 512MB storage
- 24/7 availability
- Branching included
```

### Team Features

| Feature | Description |
|---------|-------------|
| **Team Workspaces** | Shared project view |
| **Role-Based Access** | Admin, Member, Viewer roles |
| **Shared Templates** | Team-wide stack templates |
| **Audit Logs** | Who provisioned what, when |

### Additional Features

| Feature | Description |
|---------|-------------|
| **Custom Domains** | DNS configuration guidance |
| **Project Templates** | Save/reuse configurations |
| **Bulk Provisioning** | Multiple projects at once |
| **Webhook Notifications** | Slack/Discord integration |

---

## Version 2.0 (Q4 2026) 🟡

**Theme:** Intelligence & Automation

### MCP Integration (Model Context Protocol)

**Goal:** Dynamic service discovery and provisioning without hardcoded integrations.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP-Powered Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   ShipMe     │    │     MCP      │    │   Service    │       │
│  │   Core       │───▶│   Registry   │───▶│   Adapters   │       │
│  │              │    │              │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                    │               │
│                             ▼                    ▼               │
│                      ┌─────────────────────────────────┐        │
│                      │      Dynamic Providers          │        │
│                      ├─────────────────────────────────┤        │
│                      │ • Auto-discovered services      │        │
│                      │ • Community-contributed         │        │
│                      │ • Self-updating capabilities    │        │
│                      └─────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Benefits
- **No Hardcoding:** New services added via MCP adapters
- **Community Contributions:** Anyone can add service support
- **Auto-Updates:** Service APIs change, adapters update
- **Infinite Scale:** Support hundreds of services

### AI Enhancements

| Feature | Description |
|---------|-------------|
| **Learning Recommendations** | Improve suggestions based on successful provisions |
| **Cost Optimization** | AI suggests cheaper alternatives |
| **Architecture Diagrams** | Auto-generate system diagrams |
| **Security Scanning** | AI-powered config review |

### Developer Experience

| Feature | Description |
|---------|-------------|
| **CLI Tool** | `shipme init` from terminal |
| **VS Code Extension** | Provision from editor |
| **GitHub App** | "Ship with ShipMe" button in READMEs |
| **API Access** | Programmatic provisioning |

---

## Version 2.1 (Q1 2027) 🟢

**Theme:** Enterprise & Scale

### Enterprise Features

| Feature | Description |
|---------|-------------|
| **SSO Integration** | SAML, OIDC, Okta, Azure AD |
| **Advanced Audit Logs** | Detailed compliance logging |
| **Custom Policies** | Restrict allowed services |
| **Private Registry** | Self-hosted MCP adapters |
| **SLA Guarantees** | 99.9% uptime commitment |

### Self-Hosted Option

```
Deployment Options:
- Docker Compose (simple)
- Kubernetes Helm chart (scale)
- Terraform module (IaC)

Requirements:
- PostgreSQL database
- Redis cache
- S3-compatible storage
- SMTP for notifications
```

### Advanced Provisioning

| Feature | Description |
|---------|-------------|
| **Multi-Region** | Deploy to multiple regions |
| **Blue-Green Deployments** | Zero-downtime setup |
| **Feature Flags** | Integrated feature flag service |
| **Monitoring Setup** | Auto-configure Datadog/Sentry |

---

## Long-Term Vision (2027+)

### The "Ship Anything" Platform

```
┌─────────────────────────────────────────────────────────────────┐
│                    ShipMe Ecosystem (2027+)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ShipMe Core                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐         │
│  │ ShipMe  │   │ ShipMe  │   │ ShipMe  │   │ ShipMe  │         │
│  │   Web   │   │ Mobile  │   │   AI    │   │   IoT   │         │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘         │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              MCP Universal Adapter Layer                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│       ┌──────────────────────┼──────────────────────┐           │
│       ▼                      ▼                      ▼           │
│  ┌─────────┐          ┌─────────────┐         ┌─────────┐      │
│  │ 100s of │          │  Community  │         │ Private │      │
│  │Services │          │  Adapters   │         │Enterprise│      │
│  └─────────┘          └─────────────┘         └─────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Potential Expansions

| Domain | Description |
|--------|-------------|
| **Mobile Apps** | Provision Expo, Firebase, App Store Connect |
| **AI/ML Projects** | Setup Replicate, HuggingFace, vector DBs |
| **IoT Projects** | AWS IoT, Azure IoT Hub, Particle |
| **Data Pipelines** | Airbyte, Fivetran, dbt Cloud |
| **E-commerce** | Shopify, Medusa, Commerce.js (Stripe in v1.1) |

---

## Feature Requests & Voting

### How to Request Features

1. **GitHub Issues** - Open feature request issue
2. **Discord Community** - Discuss in #feature-requests
3. **Email** - features@shipme.dev

### Current Top Requests

| Rank | Feature | Votes | Status |
|------|---------|-------|--------|
| 1 | Stripe payments | 156 | 🟢 v1.1 |
| 2 | Netlify support | 147 | 🟢 v1.1 |
| 3 | CLI tool | 132 | 🟢 v2.0 |
| 4 | Team workspaces | 98 | 🟢 v1.2 |
| 5 | PlanetScale | 87 | 🟢 v1.2 |
| 6 | Self-hosted | 76 | 🟢 v2.1 |

---

## Technical Debt & Improvements

### Planned Refactoring

| Area | Current State | Target State | Version |
|------|---------------|--------------|---------|
| **Provisioner Architecture** | Hardcoded per-service | MCP adapters | 2.0 |
| **Error Handling** | Basic try/catch | Retry with backoff | 1.1 |
| **Testing** | Manual | E2E automated | 1.1 |
| **State Management** | Local state | Global store | 1.2 |

### Performance Targets

| Metric | Current | Target | Version |
|--------|---------|--------|---------|
| Provision Time | ~3 min | < 2 min | 1.2 |
| Page Load | ~1.5s | < 1s | 1.1 |
| API Response | ~500ms | < 200ms | 1.1 |

---

## Release Process

### Version Numbering

```
MAJOR.MINOR.PATCH

MAJOR - Breaking changes, major features
MINOR - New features, backward compatible
PATCH - Bug fixes, small improvements
```

### Release Cadence

| Type | Frequency | Examples |
|------|-----------|----------|
| Major | 2x per year | 1.0, 2.0 |
| Minor | Monthly | 1.1, 1.2 |
| Patch | As needed | 1.1.1, 1.1.2 |

### Beta Program

- Early access to new features
- Direct feedback channel
- Bug bounty participation
- Sign up: beta@shipme.dev

---

## Contributing

### How to Contribute

1. **Code** - PRs for bug fixes and features
2. **Docs** - Improve documentation
3. **MCP Adapters** - Add service support (v2.0+)
4. **Translations** - Localize the platform

### Contributor Recognition

- Contributors page on website
- Swag for significant contributions
- Early access to new features

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---

*This roadmap is a living document and will be updated quarterly based on user feedback and market conditions.*

*Last reviewed: February 2026*
*Next review: May 2026*
