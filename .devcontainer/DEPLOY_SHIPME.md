# ShipMe Self-Deployment Guide
**For: Claude Code Agent in GitHub Codespaces**

## How to Use This Guide

You are Claude Code, orchestrating ShipMe's deployment using MCP servers.

**Your Responsibilities:**
1. Read each step carefully
2. Call the specified MCP tool with given parameters
3. Parse the JSON response from tool output (`content[0].text`)
4. Extract marked values (⚠️ EXTRACT AND STORE sections)
5. Store extracted values in conversation context for use in subsequent steps
6. Handle errors according to recovery patterns
7. Provide real-time progress updates to user
8. Use SecretVault for sensitive values (API keys, passwords)

**Important:**
- All MCP tool responses are wrapped in `content[0].text` (JSON string)
- Parse JSON before extracting values
- Reference stored variables using conversation context
- Retry transient errors automatically (see Error Recovery Patterns)
- Pause on manual steps (OAuth) and prompt user
- Report completion with all generated URLs

## Overview

This Codespace deploys **shipme.dev** using its own MCP servers, validating the entire platform approach by "eating our own dog food."

## Prerequisites

User must provide (via Codespace secrets or environment variables):
- **GITHUB_TOKEN** - From `gh auth login` or GitHub settings
- **SUPABASE_ACCESS_TOKEN** - From Supabase dashboard (Management API token)
- **NETLIFY_AUTH_TOKEN** - From Netlify dashboard (Personal Access Token)
- **SUPABASE_ORG_ID** (Optional) - Will use first available org if not provided

## Architecture

```
User opens Codespace
    ↓
User authenticates once (gh, Supabase, Netlify tokens)
    ↓
Claude Code orchestrates via MCP servers:
  - Supabase MCP: Create project + run migrations
  - Netlify MCP: Create site + configure env vars + deploy
    ↓
ShipMe.dev is LIVE
```

## Deployment Steps

### 1. Create Supabase Project

**Tool:** `supabase.create_project`

**Input:**
```json
{
  "name": "shipme-prod",
  "region": "us-east-1",
  "db_password": "<generate-secure-32-char-password>"
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "project_id": "xyzabc123",
  "project_ref": "xyzabc123",
  "url": "https://xyzabc123.supabase.co",
  "api_url": "https://xyzabc123.supabase.co",
  "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "service_role_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "db_connection_string": "postgresql://postgres:PASSWORD@db.xyzabc123.supabase.co:5432/postgres",
  "dashboard_url": "https://supabase.com/dashboard/project/xyzabc123"
}
```

**⚠️ EXTRACT AND STORE:**
- `project_ref` → Use in Steps 2, 3, 6 (database operations)
- `url` → Use in Step 3 (OAuth callback URL) and Step 6 (NEXT_PUBLIC_SUPABASE_URL)
- `anon_key` → Use in Step 6 (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- `service_role_key` → Use in Step 6 (SUPABASE_SERVICE_ROLE_KEY)
- `db_password` (generated) → Store securely in conversation context

**Duration:** 1-2 minutes + 30-60s initialization

---

### 2. Run Database Migrations

**⚠️ REQUIRES VALUES FROM:**
- Step 1: `project_ref` (Supabase project reference ID)

**Tool:** `supabase.execute_sql`

**Input:**
```json
{
  "project_ref": "{{STEP_1_PROJECT_REF}}",
  "sql": "<contents of /app/supabase/schema.sql>"
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "rows_affected": 0
}
```

**Tables Created:**
- `profiles` - User profile data
- `automation_plans` - Generated provisioning plans
- `codespace_launches` - Codespace creation tracking
- `provisioning_events` - Provisioning step logs

**⚠️ EXTRACT AND STORE:**
- No new values to extract (operation confirmation only)

**Duration:** 5-10 seconds

---

### 3. Configure GitHub OAuth (Manual Step)

**⚠️ REQUIRES VALUES FROM:**
- Step 1: `url` (for OAuth callback URL construction)
- Step 1: `project_ref` (for Supabase auth configuration)

**⚠️ This step requires manual user action:**

User must create a GitHub OAuth app at: https://github.com/settings/developers

**Settings:**
- **Application name:** ShipMe Production
- **Homepage URL:** `https://shipme.dev` (or Netlify URL if not using custom domain)
- **Authorization callback URL:** `{{STEP_1_URL}}/auth/v1/callback`
  - Example: `https://xyzabc123.supabase.co/auth/v1/callback`

**Prompt user:**
```
⚠️ Manual Step Required: GitHub OAuth Setup

Please create a GitHub OAuth app:
1. Visit: https://github.com/settings/developers
2. Click "New OAuth App"
3. Use these settings:
   - Application name: ShipMe Production
   - Homepage URL: https://shipme.dev
   - Authorization callback URL: {{STEP_1_URL}}/auth/v1/callback

4. After creation, provide:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET

Reply with: "GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=yyy"
```

**After receiving credentials, use Tool:** `supabase.configure_auth_provider`

**Input:**
```json
{
  "project_ref": "{{STEP_1_PROJECT_REF}}",
  "provider": "github",
  "client_id": "{{USER_PROVIDED_GITHUB_CLIENT_ID}}",
  "client_secret": "{{USER_PROVIDED_GITHUB_CLIENT_SECRET}}"
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "provider": "github",
  "message": "github OAuth provider configured successfully"
}
```

**⚠️ EXTRACT AND STORE:**
- `github_client_id` (from user input) → Use in Step 6 (GITHUB_ID env var)
- `github_client_secret` (from user input) → Use in Step 6 (GITHUB_SECRET env var)

**Duration:** 10-15 seconds (after user provides credentials)

---

### 4. Build Application

**⚠️ REQUIRES VALUES FROM:**
- None (independent step)

**Shell Command:**
```bash
cd app && npm run build
```

**Output:** Generates `.next/` directory with production build

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB          80 kB
└ ○ /api/launch-codespace                0 B             0 B
```

**⚠️ EXTRACT AND STORE:**
- Build success status → Confirm before proceeding to deployment
- `.next/` directory path → Use in Step 7 (deploy_site directory parameter)

**Duration:** 30-60 seconds

---

### 5. Create Netlify Site

**⚠️ REQUIRES VALUES FROM:**
- None (independent step, but user context needed for repo URL)

**Tool:** `netlify.create_site`

**Input:**
```json
{
  "name": "shipme-prod",
  "repo": "<user-github-username>/shipme.dev"
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "site_id": "abc123-def456-ghi789",
  "site_name": "shipme-prod",
  "url": "https://shipme-prod.netlify.app",
  "admin_url": "https://app.netlify.com/sites/shipme-prod",
  "deploy_url": "https://abc123--shipme-prod.netlify.app"
}
```

**⚠️ EXTRACT AND STORE:**
- `site_id` → Use in Steps 6, 7 (environment variables and deployment)
- `url` → Final live URL for user
- `admin_url` → For manual verification/configuration

**Duration:** 5-10 seconds

---

### 6. Configure Environment Variables

**⚠️ REQUIRES VALUES FROM:**
- Step 1: `url`, `anon_key`, `service_role_key` (Supabase credentials)
- Step 3: `github_client_id`, `github_client_secret` (GitHub OAuth credentials)
- Step 5: `site_id` (Netlify site identifier)
- Generated: `NEXTAUTH_SECRET` (32 random characters)

**Tool:** `netlify.configure_env_vars`

**Input Template:**
```json
{
  "site_id": "{{STEP_5_SITE_ID}}",
  "env_vars": {
    "NEXT_PUBLIC_SUPABASE_URL": "{{STEP_1_URL}}",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "{{STEP_1_ANON_KEY}}",
    "SUPABASE_SERVICE_ROLE_KEY": "{{STEP_1_SERVICE_ROLE_KEY}}",
    "NEXTAUTH_SECRET": "{{GENERATE_RANDOM_32_CHARS}}",
    "GITHUB_ID": "{{STEP_3_CLIENT_ID}}",
    "GITHUB_SECRET": "{{STEP_3_CLIENT_SECRET}}",
    "TEMPLATE_OWNER": "{{USER_GITHUB_USERNAME}}",
    "TEMPLATE_REPO": "shipme-starter-template"
  }
}
```

**Example with actual values:**
```json
{
  "site_id": "abc123-def456-ghi789",
  "env_vars": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://xyzabc123.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "NEXTAUTH_SECRET": "a8b3c2d1e9f0g4h5i6j7k8l9m0n1o2p3",
    "GITHUB_ID": "Iv1.abc123def456",
    "GITHUB_SECRET": "1234567890abcdefghijklmnopqrstuvwxyz1234",
    "TEMPLATE_OWNER": "chakrasutras-dev",
    "TEMPLATE_REPO": "shipme-starter-template"
  }
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "vars_set": 8,
  "message": "Set 8 environment variable(s)"
}
```

**⚠️ EXTRACT AND STORE:**
- No new values to extract
- Note: If `vars_set` < 8, some variables may have failed → suggest manual verification

**Duration:** 10-20 seconds (multiple API calls)

---

### 7. Deploy to Netlify

**⚠️ REQUIRES VALUES FROM:**
- Step 4: Build success confirmation (`.next/` directory must exist)
- Step 5: `site_id` (Netlify site identifier)

**Tool:** `netlify.deploy_site`

**Input:**
```json
{
  "site_id": "{{STEP_5_SITE_ID}}",
  "directory": "app/.next",
  "branch": "main"
}
```

**Expected Output (JSON):**
```json
{
  "success": true,
  "deploy_id": "64a8b9c7d6e5f4a3b2c1d0e9",
  "build_id": "64a8b9c7d6e5f4a3",
  "deploy_url": "https://abc123--shipme-prod.netlify.app",
  "state": "ready",
  "message": "Deployment triggered successfully. State: ready"
}
```

**⚠️ EXTRACT AND STORE:**
- `deploy_url` → Final live URL to report to user
- `deploy_id` → For debugging/tracking purposes
- `state` → Monitor for "ready" (success) or "processing" (wait)

**Duration:** 2-5 minutes (Netlify build process)

---

### 8. Verification

**⚠️ REQUIRES VALUES FROM:**
- Step 7: `deploy_url` (live site URL to test)
- Step 1: Supabase dashboard URL (for database verification)
- Step 5: Netlify admin URL (for configuration verification)

**Manual checks:**
1. Visit live URL from step 7: `{{STEP_7_DEPLOY_URL}}`
2. Test GitHub OAuth login
3. Verify database connection (profile created after login in Supabase dashboard)
4. Test "Launch Codespace" flow with a test project

**Expected Results:**
- ✅ ShipMe.dev is live and accessible
- ✅ Authentication works (GitHub OAuth)
- ✅ Can describe project idea
- ✅ Can click "Launch Development Environment"
- ✅ Creates test repository (if Phase 2 complete)

**Report to User:**
```
🎉 ShipMe Deployment Complete!

✅ Supabase Project: {{STEP_1_PROJECT_REF}}
   Dashboard: https://supabase.com/dashboard/project/{{STEP_1_PROJECT_REF}}

✅ Netlify Site: {{STEP_5_SITE_NAME}}
   Live URL: {{STEP_7_DEPLOY_URL}}
   Admin: {{STEP_5_ADMIN_URL}}

✅ GitHub OAuth: Configured

Next Steps:
1. Visit {{STEP_7_DEPLOY_URL}}
2. Test login with your GitHub account
3. Try creating a test project

Total Time: X minutes Y seconds
All credentials stored securely ✓
```

---

## Success Criteria

✅ ShipMe.dev is deployed and live
✅ Authentication works end-to-end
✅ Database operations functional
✅ All MCP servers operational
✅ Deployment completed in <10 minutes
✅ No credentials exposed in logs

---

## Error Recovery Patterns

**For Claude Code: How to handle errors automatically**

### Transient Errors (Retry Automatically)

These errors should trigger automatic retry with exponential backoff:

| Error Type | HTTP Status | Retry Strategy | Max Attempts |
|------------|-------------|----------------|--------------|
| Too Many Requests | 429 | Wait 30s, then retry | 3 |
| Internal Server Error | 500 | Wait 10s, then retry | 3 |
| Service Unavailable | 503 | Wait 15s, then retry | 3 |
| Gateway Timeout | 504 | Wait 20s, then retry | 3 |
| Network Timeout | - | Wait 5s, then retry | 3 |

**Retry Pattern:**
```
Attempt 1: Execute immediately
Attempt 2: Wait initial_delay, execute
Attempt 3: Wait initial_delay * 2, execute
After max attempts: Report permanent failure
```

**Example:**
```
Step 1: Create Supabase project → 503 Service Unavailable
  ⏳ Retrying in 15 seconds (attempt 2/3)...
Step 1: Create Supabase project → 503 Service Unavailable
  ⏳ Retrying in 30 seconds (attempt 3/3)...
Step 1: Create Supabase project → Success!
```

### Permanent Errors (Stop and Report)

These errors should NOT be retried - report to user immediately:

| Error Type | HTTP Status | Action Required |
|------------|-------------|----------------|
| Bad Request | 400 | Fix input parameters |
| Unauthorized | 401 | Check/refresh authentication token |
| Forbidden | 403 | Check permissions/scopes |
| Not Found | 404 | Verify resource exists |
| Validation Error | 422 | Fix invalid data (e.g., weak password) |

**Example:**
```
Step 1: Create Supabase project → 401 Unauthorized

❌ Authentication failed!

Error: SUPABASE_ACCESS_TOKEN is invalid or expired.

Please:
1. Visit https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Update SUPABASE_ACCESS_TOKEN in Codespace secrets
4. Run deployment again

Cannot proceed without valid credentials.
```

### Partial Success Handling

**Scenario:** Step 6 (Configure Environment Variables) may partially succeed.

**Expected behavior:**
```
Step 6: Configure environment variables → Partial success

✅ Set 6/8 environment variables
❌ Failed to set:
  - GITHUB_ID (401 Unauthorized - check Netlify token)
  - GITHUB_SECRET (401 Unauthorized - check Netlify token)

⚠️ Action Required:
1. Verify NETLIFY_AUTH_TOKEN is valid
2. Manually set failed variables in Netlify dashboard:
   https://app.netlify.com/sites/{{SITE_ID}}/configuration/env

Proceeding with deployment using available variables...
```

### Progress Reporting Template

Use this format for real-time updates:

```
🚀 Step X/8: [Step Name]
  ⏳ [Action being performed]...
  ✅ [Success message with key details]

  Extracted values:
  - variable_name: value (stored for Step Y)

  Duration: Xs
```

**Example:**
```
🚀 Step 1/8: Create Supabase Project
  ⏳ Waiting for project to initialize (30-60s)...
  ✅ Project created: https://xyzabc123.supabase.co

  Extracted values:
  - project_ref: xyzabc123 (stored for Steps 2, 3, 6)
  - url: https://xyzabc123.supabase.co (stored for Steps 3, 6)
  - anon_key: eyJhbG... (stored for Step 6)
  - service_role_key: eyJhbG... (stored for Step 6)

  Duration: 95s

🚀 Step 2/8: Run Database Migrations
  ⏳ Executing SQL schema...
  ✅ Created 4 tables (profiles, automation_plans, codespace_launches, provisioning_events)

  Duration: 8s
```

---

## Error Handling

### Common Issues

**1. Supabase project creation fails**
- Check `SUPABASE_ACCESS_TOKEN` is valid
- Verify `SUPABASE_ORG_ID` exists (or omit to use first available)
- Ensure organization has available project slots

**2. Database migration fails**
- Verify SQL syntax in `/app/supabase/schema.sql`
- Check project is fully initialized (wait 60s after creation)
- Ensure no duplicate migrations

**3. GitHub OAuth setup unclear**
- User must manually create OAuth app (cannot be automated)
- Provide clear callback URL from Supabase project
- Verify client ID and secret are correct

**4. Netlify deployment fails**
- Check `NETLIFY_AUTH_TOKEN` is valid
- Verify site name is unique (will be auto-slugified)
- Ensure build completed successfully in step 4

**5. Environment variables not set**
- Some env vars may fail silently
- Manually verify in Netlify dashboard: Site Settings → Environment Variables
- Re-run deployment if vars missing

---

## State Persistence & Value Extraction

**How Claude Code maintains state during deployment:**

### Conversation-Based State Management

All extracted values are stored in **conversation context** and persist throughout the deployment session.

**What this means:**
- Values from Step 1 are accessible in Steps 2, 3, 6
- Values from Step 3 are accessible in Step 6
- Values from Step 5 are accessible in Steps 6, 7
- No cross-session persistence (must complete deployment in one session)

**Session window:** 8-15 minutes (acceptable for single deployment session)

### Value Extraction Pattern

**Step-by-step example showing value flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Create Supabase Project                            │
├─────────────────────────────────────────────────────────────┤
│ MCP Response:                                               │
│   content[0].text = '{                                      │
│     "success": true,                                        │
│     "project_ref": "xyzabc123",                            │
│     "url": "https://xyzabc123.supabase.co",                │
│     "anon_key": "eyJ...",                                   │
│     "service_role_key": "eyJ..."                           │
│   }'                                                        │
│                                                             │
│ Parse JSON → Extract values → Store in context:            │
│   SUPABASE_PROJECT_REF = "xyzabc123"                       │
│   SUPABASE_URL = "https://xyzabc123.supabase.co"           │
│   SUPABASE_ANON_KEY = "eyJ..."                             │
│   SUPABASE_SERVICE_KEY = "eyJ..."                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Run Database Migrations                            │
├─────────────────────────────────────────────────────────────┤
│ Use stored value:                                           │
│   supabase.execute_sql({                                    │
│     project_ref: SUPABASE_PROJECT_REF  ← from Step 1       │
│     sql: "..."                                              │
│   })                                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Configure GitHub OAuth                             │
├─────────────────────────────────────────────────────────────┤
│ User provides:                                              │
│   GITHUB_CLIENT_ID = "Iv1.abc123"                          │
│   GITHUB_CLIENT_SECRET = "secret123"                       │
│                                                             │
│ Store in context for Step 6                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Create Netlify Site                                │
├─────────────────────────────────────────────────────────────┤
│ Extract and store:                                          │
│   NETLIFY_SITE_ID = "abc123-def456"                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Configure Environment Variables                    │
├─────────────────────────────────────────────────────────────┤
│ Compose from multiple sources:                             │
│   netlify.configure_env_vars({                             │
│     site_id: NETLIFY_SITE_ID,  ← from Step 5               │
│     env_vars: {                                             │
│       NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,              │
│           ↑ from Step 1                                     │
│       NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,   │
│           ↑ from Step 1                                     │
│       SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_KEY,    │
│           ↑ from Step 1                                     │
│       GITHUB_ID: GITHUB_CLIENT_ID,  ← from Step 3          │
│       GITHUB_SECRET: GITHUB_CLIENT_SECRET  ← from Step 3   │
│     }                                                       │
│   })                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Resume Capability (Manual)

If deployment fails midway, user can manually resume:

**Example:**
```
User: "Resume deployment from Step 5. Use supabase project xyzabc123,
       GitHub OAuth client Iv1.abc123"

Claude: Resuming from Step 5 (Create Netlify Site)...
        Restored context:
        - SUPABASE_PROJECT_REF = xyzabc123
        - GITHUB_CLIENT_ID = Iv1.abc123

        Proceeding with Netlify site creation...
```

**Trade-offs:**
- ✅ Simple implementation (no database needed)
- ✅ Works perfectly for 8-15 minute deployment window
- ❌ No automatic cross-session persistence
- ❌ User must complete in one session OR provide resume values

**Accepted limitation:** For Codespaces mode, single-session completion is the norm.

---

## Deployment Timeline

| Step | Task | Duration |
|------|------|----------|
| 1 | Create Supabase Project | 1-2 min |
| 2 | Run Migrations | 10s |
| 3 | Configure GitHub OAuth | 2-3 min (manual) |
| 4 | Build Application | 30-60s |
| 5 | Create Netlify Site | 10s |
| 6 | Configure Env Vars | 20s |
| 7 | Deploy to Netlify | 2-5 min |
| 8 | Verification | 2-3 min |
| **Total** | **End-to-end** | **8-15 minutes** |

---

## Post-Deployment

### Next Steps

1. **Custom Domain (Optional)**
   - Configure DNS: CNAME → Netlify site URL
   - Update GitHub OAuth app callback URL

2. **Phase 3 Preparation**
   - Copy devcontainer to template repository
   - Test end-to-end provisioning flow
   - Verify all MCPs work in user Codespaces

3. **Monitoring**
   - Set up Sentry for error tracking
   - Monitor Supabase usage
   - Track Netlify build times

---

## Security Notes

- All credentials stored in Codespace secrets (encrypted at rest)
- MCP servers run in isolated process context
- No credentials logged to stdout (only stderr for debug)
- Service role key only used server-side
- GitHub token has minimal required scopes

---

## Rollback Plan

If deployment fails critically:

1. **Database:** Delete Supabase project in dashboard
2. **Hosting:** Delete Netlify site in dashboard
3. **Code:** Revert to `v1.0-archive` branch
4. **DNS:** Point to previous hosting (if custom domain)

---

## Notes

- This is **dogfooding** - ShipMe deploys itself using its own automation
- Validates MCP server approach before exposing to users
- Serves as reference implementation for user projects
- All steps are reproducible and automatable

**If this works, it works for everyone.**

---

**Last Updated:** February 4, 2026
**Documentation Version:** 2.0
**Status:** Ready for Deployment
