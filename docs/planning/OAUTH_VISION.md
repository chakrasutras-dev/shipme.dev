# ShipMe v2.0 - OAuth-Based Infrastructure Provisioning
**The Real Product Vision**

## Executive Summary

ShipMe v2.0 enables **infrastructure provisioning as simple as logging in**. Users describe their app, launch a Codespace, log in with username/password, and Claude Code provisions everything automatically via MCP servers.

**Core Innovation:** Browser-based OAuth flows replace manual API token management.

## User Experience (End-to-End)

```
User visits shipme.dev
    ↓
Describes app idea: "A SaaS for pet health tracking"
    ↓
Claude analyzes → Recommends Next.js + Supabase + Netlify
    ↓
User clicks "Launch Development Environment"
    ↓
GitHub OAuth → Codespace created automatically
    ↓
Codespace opens in VS Code
    ↓
Claude Code (in terminal):
"👋 Hi! Let's provision your infrastructure.
 I'll open your browser - just log in with username/password."
    ↓
Browser opens → Supabase login page
    ↓
User enters username + password
    ↓
Redirects back → Token captured
    ↓
Browser opens → Netlify login page
    ↓
User enters username + password
    ↓
Redirects back → Token captured
    ↓
Claude Code: "✓ All connected! Provisioning now..."
    ↓
[MCP servers provision everything]
    ↓
Claude Code: "🚀 Done! Your app is live at: https://your-app.netlify.app"
    ↓
Total time: 8-10 minutes
```

**User effort:** Type idea + enter username/password twice = Done!

## Technical Architecture

### OAuth Flow (Browser-Based)

```
Codespace (localhost:54321)
    ↓
User: "Connect to Supabase"
    ↓
OAuth server starts on :54321
    ↓
Opens: https://api.supabase.com/v1/oauth/authorize?client_id=...&redirect_uri=http://localhost:54321/callback
    ↓
User logs in on Supabase.com
    ↓
Supabase redirects: http://localhost:54321/callback?code=abc123
    ↓
OAuth server exchanges code for access token
    ↓
Stores token in ~/.shipme/credentials.env (encrypted, mode 600)
    ↓
Claude Code continues provisioning with token
```

### Components

1. **OAuth Server** (`.devcontainer/oauth-server.js`)
   - Node.js HTTP server
   - Handles OAuth callbacks for Supabase + Netlify
   - Runs on localhost:54321
   - Auto-opens browser
   - Captures tokens securely

2. **Setup Script** (`.devcontainer/setup-credentials-oauth.sh`)
   - Starts OAuth server
   - Guides user through each OAuth flow
   - Waits for completion
   - Validates tokens
   - Shuts down server

3. **Claude Orchestrator** (`.shipme/claude-orchestration.md`)
   - Instructions for Claude Code
   - Step-by-step provisioning guide
   - Error handling
   - User communication patterns

4. **MCP Servers**
   - **Supabase MCP**: Create projects, run migrations, configure auth
   - **Netlify MCP**: Create sites, set env vars, deploy
   - **GitHub MCP**: Already working (gh auth login)

### Secret Management

```
~/.shipme/credentials.env (mode 600)
├─ GITHUB_TOKEN=ghp_xxx (from gh auth login)
├─ SUPABASE_ACCESS_TOKEN=sbp_xxx (from OAuth)
└─ NETLIFY_AUTH_TOKEN=nfp_xxx (from OAuth)
```

- Stored locally in Codespace
- Never committed to git
- Encrypted at rest (filesystem permissions)
- Auto-loaded by MCP servers
- Destroyed when Codespace deleted

## Provisioning Steps (MCP-Driven)

### 1. Credentials (OAuth)
**User action:** Log in with username/password (x2)
**Time:** 2 minutes

### 2. Supabase Project Creation
**MCP call:** `supabase.create_project`
**Time:** 30-60 seconds
**Output:** Database URL, API keys

### 3. Database Schema
**MCP call:** `supabase.execute_sql`
**Time:** 5-10 seconds
**Output:** Tables created

### 4. GitHub OAuth App (Manual)
**User action:** Create OAuth app on GitHub
**Time:** 2 minutes
**Why manual:** GitHub doesn't support automated OAuth app creation

### 5. Supabase Auth Config
**MCP call:** `supabase.configure_auth`
**Time:** 5 seconds
**Output:** GitHub OAuth enabled

### 6. Netlify Site Creation
**MCP call:** `netlify.create_site`
**Time:** 10 seconds
**Output:** Site URL, admin URL

### 7. Environment Variables
**MCP call:** `netlify.set_env_vars`
**Time:** 5 seconds
**Output:** All secrets configured

### 8. Deploy Application
**MCP call:** `netlify.deploy`
**Time:** 2-3 minutes
**Output:** Live application URL

**Total:** 8-10 minutes

## Why OAuth > Manual Tokens?

| Manual Token Approach | OAuth Approach |
|-----------------------|----------------|
| Visit 3 dashboards | Log in 2 times |
| Find "API Tokens" page | Click "Authorize" |
| Click "Create Token" | Enter password |
| Name the token | Done! |
| Copy token | |
| Paste into terminal | |
| Repeat 3x | |
| **Time:** 15-20 min | **Time:** 2 min |
| **Frustration:** High | **Frustration:** None |

## Security Benefits

1. **No long-lived tokens** - OAuth tokens can be short-lived
2. **Revokable** - User can revoke access instantly via OAuth dashboard
3. **Scoped permissions** - Only request what's needed
4. **No copy-paste errors** - Tokens captured automatically
5. **No token exposure** - Never displayed in terminal
6. **Audit trail** - OAuth apps show in user's security settings

## Implementation Status

### Completed ✅
- [x] OAuth server implementation (oauth-server.js)
- [x] OAuth setup script (setup-credentials-oauth.sh)
- [x] Claude orchestration guide (claude-orchestration.md)
- [x] Supabase MCP server (supports OAuth tokens)
- [x] Netlify MCP server (supports OAuth tokens)
- [x] GitHub MCP server (uses gh auth login)
- [x] Secret vault implementation
- [x] Template repository structure
- [x] Landing page with Codespace launcher

### In Progress 🚧
- [ ] OAuth app registration (need Supabase + Netlify OAuth apps for ShipMe)
- [ ] Test OAuth flow end-to-end
- [ ] Update devcontainer to use new setup script
- [ ] Deploy to production

### Next Steps (Priority Order)

1. **Register OAuth Apps** (30 min)
   - Supabase: Create OAuth app for ShipMe
   - Netlify: Create OAuth app for ShipMe
   - Get client_id and client_secret for each

2. **Test OAuth Flow** (1 hour)
   - Launch Codespace
   - Run setup-credentials-oauth.sh
   - Verify Supabase OAuth works
   - Verify Netlify OAuth works
   - Fix any bugs

3. **Update Devcontainer** (15 min)
   - Replace setup-credentials.sh with setup-credentials-oauth.sh
   - Update post-create.sh to mention OAuth
   - Update CREDENTIALS_SETUP.md docs

4. **Test End-to-End Provisioning** (2 hours)
   - Launch Codespace
   - OAuth setup
   - Claude Code provisions infrastructure
   - Verify everything works
   - Fix any issues

5. **Deploy to Production** (30 min)
   - Push changes to template repo
   - Deploy landing page
   - Test from shipme.dev

6. **Beta Testing** (1 week)
   - Invite 10-20 users
   - Gather feedback
   - Iterate on UX
   - Fix bugs

7. **Public Launch** (1 day)
   - Write announcement post
   - Post on Hacker News
   - Post on Twitter
   - Monitor for issues

## Success Metrics

### Technical
- ✅ OAuth flow completion rate: >90%
- ✅ Infrastructure provisioning success rate: >85%
- ✅ Average time to deploy: <12 minutes
- ✅ Zero credential leaks
- ✅ Error rate: <10%

### User Experience
- ✅ "Simple" rating: >80% of users
- ✅ Time to first working app: <20 minutes
- ✅ Support requests: <10% of users
- ✅ NPS score: >50

### Business
- ✅ 100+ beta users in first month
- ✅ Positive testimonials
- ✅ Hacker News front page
- ✅ Twitter/social media traction

## Comparison with v1.0

| Aspect | v1.0 | v2.0 (OAuth) |
|--------|------|--------------|
| **Credential Setup** | Manual dashboard visits | Browser login (OAuth) |
| **Time to Setup** | 15-20 minutes | 2 minutes |
| **User Actions** | 10-15 steps | 2-3 steps |
| **Technical Knowledge** | API tokens, env vars | Just username/password |
| **Provisioning** | Manual steps + scripts | Fully automated (MCP) |
| **Environment** | Local machine | GitHub Codespaces |
| **Learning Curve** | Steep | Gentle |
| **Error Rate** | High (copy-paste) | Low (automated) |
| **Wow Factor** | Low | High! |

## The Magic Moment

**v1.0:**
```
User: "Okay... I need to create a Supabase account, then find the API tokens page,
       then create a token, then copy it, then paste it in the terminal, then..."
```

**v2.0:**
```
User: "Wait, that's it? I just logged in and it's all done?! 🤯"
```

This is the product vision. Make infrastructure feel like magic.

---

**Next:** Register OAuth apps and start testing! 🚀
