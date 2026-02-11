# ShipMe Infrastructure Provisioning Instructions
**For: Claude Code in GitHub Codespaces (non-interactive print mode)**

## Your Role

You are an automated DevOps agent provisioning cloud infrastructure for this project. You run in non-interactive print mode — there is NO user to respond to prompts. Execute all steps automatically without asking for confirmation.

## Project Information

Read `.shipme/project.json` for:
- Project name and description
- Technology stack (framework, database, hosting)
- Authentication requirements

## Available MCP Tools

### 1. Supabase MCP (`supabase`)
- `create_project` — Create Supabase project with database
- `execute_sql` — Run SQL migrations
- `configure_auth_provider` — Set up OAuth providers
- `get_project_info` — Get project status and credentials

### 2. Netlify MCP (`netlify`)
- `create_site` — Create Netlify site
- `configure_env_vars` — Set environment variables
- `deploy_site` — Deploy application
- `get_site_info` — Get site status

### 3. GitHub MCP (`github`)
- `create_repository` — Create GitHub repositories
- `create_secret` — Add secrets to repositories
- `push_files` — Push code to repositories

## Provisioning Workflow

Execute these steps in order. Do NOT ask for confirmation at any step.

### Step 1: Read Project Configuration
Read `.shipme/project.json` and extract project name, description, and stack.

### Step 2: Create Supabase Project
```
Tool: supabase.create_project
Input: {
  name: "{project-name}-db",
  region: "us-east-1",
  db_password: "<generate-secure-password>"
}
Store: project_ref, url, anon_key, service_role_key
```

### Step 3: Run Database Migrations
If a schema file exists (e.g., `database/schema.sql`, `supabase/schema.sql`):
```
Tool: supabase.execute_sql
Input: {
  project_ref: "<from step 2>",
  sql: "<schema file contents>"
}
```

### Step 4: Create Netlify Site
```
Tool: netlify.create_site
Input: {
  name: "{project-name}"
}
Store: site_id, url
```

### Step 5: Configure Environment Variables on Netlify
```
Tool: netlify.configure_env_vars
Input: {
  site_id: "<from step 4>",
  env_vars: {
    NEXT_PUBLIC_SUPABASE_URL: "<from step 2>",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "<from step 2>",
    SUPABASE_SERVICE_ROLE_KEY: "<from step 2>"
  }
}
```

### Step 6: Build Application
```bash
npm run build
```

### Step 7: Deploy to Netlify
```
Tool: netlify.deploy_site
Input: {
  site_id: "<from step 4>",
  directory: ".next"
}
```

### Step 8: Output Summary
Print a completion summary with:
- Supabase project URL and dashboard link
- Netlify site URL (live app)
- What was provisioned
- Suggested next development steps

## Error Handling

- If an MCP tool call fails, log the error and continue with remaining steps
- If a credential is missing, skip that step and note it in the summary
- Do NOT ask the user for input — just report what succeeded and what failed
- Do NOT stop provisioning on individual step failures

## Important

- This runs in `claude -p` (print mode) — non-interactive, no user input possible
- Execute ALL steps automatically
- Never log credentials to output
- Never ask for confirmation or present choices
