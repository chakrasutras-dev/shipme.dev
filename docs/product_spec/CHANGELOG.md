# ShipMe Product Changelog

> Tracking major changes and pivots in product direction

---

## [v2.0] - February 2026 - MAJOR PIVOT

### 🚨 CRITICAL ARCHITECTURAL CHANGE

This release represents a **fundamental pivot** from the original product vision.

---

## Essential Changes Summary

| # | Change | Impact |
|---|--------|--------|
| 1 | **Execution Model** | Instructions → Automation |
| 2 | **Runtime Environment** | Web browser → GitHub Codespaces |
| 3 | **User Role** | Doer → Watcher/Supervisor |
| 4 | **Credential Handling** | Copy/paste → Automated + Encrypted |
| 5 | **Time to Deploy** | 30-45 min → 5-10 min |
| 6 | **Website Scope** | Full dashboard → Simple launcher |

---

## Detailed Changes

### 1. 🔄 Execution Model Change

**BEFORE (v1.0): Guide-Based**
```
ShipMe generates instructions
         ↓
User reads instructions
         ↓
User executes each step manually
         ↓
User troubleshoots errors alone
```

**AFTER (v2.0): Agent-Based**
```
ShipMe launches Codespace with Claude Code
         ↓
Claude Code executes provisioning automatically
         ↓
User watches in real-time
         ↓
Claude handles errors, user can intervene
```

**Why This Matters:**
- Users want **results**, not instructions
- Manual execution is **error-prone**
- AI can handle complexity **better than guides**

---

### 2. 🖥️ Runtime Environment Change

**BEFORE (v1.0): Web Browser Only**
```
┌─────────────────────────────┐
│      SHIPME.DEV             │
│  ┌───────────────────────┐  │
│  │   Dashboard           │  │
│  │   Instructions        │  │
│  │   Code snippets       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
         ↓
User opens 5 different dashboards
to execute the instructions
```

**AFTER (v2.0): GitHub Codespaces**
```
┌─────────────────────────────┐
│  SHIPME.DEV (simplified)    │
│  • Project description      │
│  • Launch button            │
└─────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│      GITHUB CODESPACE               │
│  ┌─────────────────────────────────┐│
│  │  VS Code in Browser             ││
│  │  • Terminal (watch Claude)      ││
│  │  • File Explorer (see code)     ││
│  │  • Source Control (see changes) ││
│  │  • Claude Code (AI agent)       ││
│  │  • MCP Servers (cloud APIs)     ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Why This Matters:**
- **Isolated** environment (security)
- **Visible** to user (transparency)
- **Interactive** (user can intervene)
- **Persistent** (becomes dev environment)

---

### 3. 👤 User Role Change

**BEFORE (v1.0): User as Executor**
```
User reads step 1 → User executes step 1
User reads step 2 → User executes step 2
User reads step 3 → User executes step 3
... (repeat 20+ times)
```

**AFTER (v2.0): User as Supervisor**
```
User watches Claude execute step 1
User watches Claude execute step 2
User: "Wait, can you use PostgreSQL instead?"
Claude: "Sure, let me adjust..."
User watches Claude continue
```

**Why This Matters:**
- User **learns by watching** (better than reading)
- User **maintains control** (can intervene anytime)
- User **saves time** (5 min vs 45 min)
- User **reduces errors** (AI is more consistent)

---

### 4. 🔐 Credential Handling Change

**BEFORE (v1.0): Manual Copy/Paste**
```
User creates Supabase project
         ↓
User copies API keys from Supabase dashboard
         ↓
User pastes into Netlify environment variables
         ↓
User copies Google OAuth credentials
         ↓
User pastes into Supabase auth settings
         ↓
Credentials exposed in clipboard, potentially in screenshots,
possibly stored insecurely by user
```

**AFTER (v2.0): Automated + Encrypted**
```
Claude Code calls Supabase MCP
         ↓
MCP creates project, receives credentials
         ↓
Credentials stored in Secret Vault (memory only)
         ↓
Claude references: "{{secrets.supabase_anon_key}}"
         ↓
MCP injects actual value when configuring Netlify
         ↓
Credentials destroyed when Codespace stops
         ↓
User NEVER sees or handles raw credentials
```

**Why This Matters:**
- **Zero credential exposure** to user
- **No copy/paste errors**
- **Automatic cleanup**
- **Audit trail** without exposing values

---

### 5. ⏱️ Time to Deploy Change

**BEFORE (v1.0): 30-45 Minutes**
```
Step                              Time
────────────────────────────────────────
Create GitHub repo                 2 min
Create Supabase project            3 min
Run database migrations            5 min
Create GCP project                 3 min
Configure OAuth consent screen     5 min
Create OAuth credentials           3 min
Add credentials to Supabase        2 min
Create Netlify site                3 min
Configure environment variables    5 min
Wait for deployment                3 min
Configure custom domain            5 min
Test and troubleshoot             10 min
────────────────────────────────────────
TOTAL                            ~49 min
```

**AFTER (v2.0): 5-10 Minutes**
```
Step                              Time
────────────────────────────────────────
Describe project                   2 min
Launch Codespace                   1 min
Watch Claude provision             5 min
Ask questions / customize          2 min
────────────────────────────────────────
TOTAL                            ~10 min
```

**Why This Matters:**
- **5x faster** deployment
- **No context switching** between dashboards
- **Parallel execution** where possible
- **Automatic error recovery**

---

### 6. 🌐 Website Scope Change

**BEFORE (v1.0): Full-Featured Dashboard**
```
shipme.dev/
├── / (landing page)
├── /dashboard
│   ├── Overview
│   ├── Automations
│   ├── Plans
│   └── Settings
├── /chat (AI conversation)
├── /admin
│   ├── Users
│   ├── Services
│   └── Logs
└── API routes for all features
```

**AFTER (v2.0): Simple Launcher**
```
shipme.dev/
├── / (landing page)
├── /start (project description + launch)
└── /account (GitHub connection)
```

**Why This Matters:**
- **Simpler to maintain**
- **Less to go wrong**
- **Focus on core value** (the Codespace experience)
- **Faster iteration**

---

## Features Added in v2.0

| Feature | Description |
|---------|-------------|
| **MCP Servers** | Programmatic access to Supabase, Netlify, GCP |
| **Secret Vault** | In-memory encrypted credential storage |
| **Template Repo** | Pre-configured Codespace with all tools |
| **Watch Mode** | User sees everything Claude does |
| **Interactive Provisioning** | User can ask questions, make changes |
| **BYOK Support** | User's own API key for their app |

---

## Features Removed in v2.0

| Feature | Reason |
|---------|--------|
| **Step-by-step UI** | Replaced by Claude doing the work |
| **Infrastructure plan display** | Claude explains as it goes |
| **Code snippet copying** | Code generated directly in repo |
| **Complex dashboard** | Simplified to launcher only |
| **Manual service setup** | Automated via MCP servers |

---

## Migration Path

### For Existing v1.0 Users

If you've deployed using v1.0:
1. Your infrastructure continues to work
2. To use v2.0 for new projects, just use the new flow
3. v1.0 documentation remains available

### For New Users

Start directly with v2.0:
1. Visit shipme.dev
2. Describe your project
3. Launch Codespace
4. Watch Claude build your infrastructure

---

## Technical Debt Addressed

| Issue | v1.0 | v2.0 |
|-------|------|------|
| Credential security | ⚠️ User handles manually | ✅ Automated + encrypted |
| Error handling | ⚠️ User troubleshoots | ✅ Claude recovers |
| Consistency | ⚠️ Depends on user | ✅ Automated = consistent |
| Onboarding time | ⚠️ 45+ minutes | ✅ 10 minutes |
| Learning curve | ⚠️ Must know cloud dashboards | ✅ Just describe project |

---

## Risk Assessment

### Risks Mitigated
- ✅ Credential exposure (now in-memory only)
- ✅ User errors (now automated)
- ✅ Time to value (5x faster)

### New Risks Introduced
- ⚠️ Dependency on GitHub Codespaces
- ⚠️ MCP server reliability
- ⚠️ Anthropic API rate limits
- ⚠️ User unfamiliarity with VS Code

### Mitigation Strategies
- Fallback to v1.0 guide if Codespaces unavailable
- MCP server health checks and retries
- Rate limiting and queuing for API calls
- In-Codespace onboarding tutorial

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Feb 2026 | Pivot to Codespaces | Users don't want instructions, they want results |
| Feb 2026 | Add MCP servers | Programmatic access to cloud services |
| Feb 2026 | In-memory secrets | Security without external vault dependency |
| Feb 2026 | Keep v1.0 as fallback | Some users may prefer manual control |

---

## Next Steps

1. **Build template repository** with devcontainer
2. **Implement MCP servers** for each cloud service
3. **Create secret vault** in-memory implementation
4. **Simplify website** to launcher only
5. **Beta test** with early users
6. **Gather feedback** and iterate

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| v1.0 | Feb 2026 | Initial release - guide-based provisioning |
| v2.0 | Feb 2026 | Major pivot - Codespaces + agent-driven |

---

*Last Updated: February 2026*
