# ShipMe Self-Deployment Guide

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

**Output:** Store in memory:
- `project_id`
- `url` (e.g., `https://xxx.supabase.co`)
- `anon_key`
- `service_role_key`
- `db_connection_string`

**Expected Time:** 1-2 minutes + 30-60s initialization

---

### 2. Run Database Migrations

**Tool:** `supabase.execute_sql`

**Input:**
```json
{
  "project_ref": "<project_id from step 1>",
  "sql": "<contents of /app/supabase/schema.sql>"
}
```

**Tables Created:**
- `profiles` - User profile data
- `automation_plans` - Generated provisioning plans
- `codespace_launches` - Codespace creation tracking
- `provisioning_events` - Provisioning step logs

**Expected Time:** 5-10 seconds

---

### 3. Configure GitHub OAuth (Manual Step)

**⚠️ This step requires manual user action:**

User must create a GitHub OAuth app at: https://github.com/settings/developers

**Settings:**
- **Application name:** ShipMe Production
- **Homepage URL:** `https://shipme.dev` (or Netlify URL if not using custom domain)
- **Authorization callback URL:** `<supabase_url>/auth/v1/callback`
  - Example: `https://xxx.supabase.co/auth/v1/callback`

**User will receive:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Then use **Tool:** `supabase.configure_auth_provider`

**Input:**
```json
{
  "project_ref": "<project_id from step 1>",
  "provider": "github",
  "client_id": "<GITHUB_CLIENT_ID from OAuth app>",
  "client_secret": "<GITHUB_CLIENT_SECRET from OAuth app>"
}
```

**Expected Time:** 10-15 seconds

---

### 4. Build Application

**Shell Command:**
```bash
cd app && npm run build
```

**Output:** Generates `.next/` directory with production build

**Expected Time:** 30-60 seconds

---

### 5. Create Netlify Site

**Tool:** `netlify.create_site`

**Input:**
```json
{
  "name": "shipme-prod",
  "repo": "<user-github-username>/shipme.dev"
}
```

**Output:** Store in memory:
- `site_id`
- `url` (e.g., `https://shipme-prod.netlify.app`)
- `admin_url`

**Expected Time:** 5-10 seconds

---

### 6. Configure Environment Variables

**Tool:** `netlify.configure_env_vars`

**Input:**
```json
{
  "site_id": "<site_id from step 5>",
  "env_vars": {
    "NEXT_PUBLIC_SUPABASE_URL": "<url from step 1>",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "<anon_key from step 1>",
    "SUPABASE_SERVICE_ROLE_KEY": "<service_role_key from step 1>",
    "NEXTAUTH_SECRET": "<generate-random-32-char-string>",
    "GITHUB_ID": "<GITHUB_CLIENT_ID from step 3>",
    "GITHUB_SECRET": "<GITHUB_CLIENT_SECRET from step 3>",
    "TEMPLATE_OWNER": "<user-github-username>",
    "TEMPLATE_REPO": "shipme-starter-template"
  }
}
```

**Expected Time:** 10-20 seconds (multiple API calls)

---

### 7. Deploy to Netlify

**Tool:** `netlify.deploy_site`

**Input:**
```json
{
  "site_id": "<site_id from step 5>",
  "directory": "app/.next",
  "branch": "main"
}
```

**Output:**
- `deploy_url` (live site URL)
- `deploy_id`
- `state` (should be "ready" or "processing")

**Expected Time:** 2-5 minutes (Netlify build process)

---

### 8. Verification

**Manual checks:**
1. Visit live URL from step 7
2. Test GitHub OAuth login
3. Verify database connection (profile created after login)
4. Test "Launch Codespace" flow with a test project

**Expected Results:**
- ✅ ShipMe.dev is live and accessible
- ✅ Authentication works (GitHub OAuth)
- ✅ Can describe project idea
- ✅ Can click "Launch Development Environment"
- ✅ Creates test repository (if Phase 2 complete)

---

## Success Criteria

✅ ShipMe.dev is deployed and live
✅ Authentication works end-to-end
✅ Database operations functional
✅ All MCP servers operational
✅ Deployment completed in <10 minutes
✅ No credentials exposed in logs

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
