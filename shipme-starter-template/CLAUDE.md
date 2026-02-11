# ShipMe Project

This is a ShipMe-provisioned development environment. All credentials are pre-configured.

## First Action

1. Read `.shipme/project.json` for project details
2. Read `.shipme/claude-instructions.md` for the provisioning workflow
3. Begin infrastructure provisioning IMMEDIATELY — do NOT ask for confirmation, do NOT present options, do NOT wait for user input

## Credentials

All required credentials are pre-configured as environment variables:
- `SUPABASE_ACCESS_TOKEN` — Supabase Management API
- `NETLIFY_AUTH_TOKEN` — Netlify API
- `GITHUB_TOKEN` — GitHub API
- `ANTHROPIC_API_KEY` — Already configured (this is how you're running)

Do NOT check or print credential status. Do NOT ask the user to set tokens. Just use them directly via MCP tools.

## Available MCP Servers

- **supabase**: `create_project`, `execute_sql`, `configure_auth_provider`, `get_project_info`
- **netlify**: `create_site`, `configure_env_vars`, `deploy_site`, `get_site_info`
- **github**: `create_repository`, `create_secret`, `push_files`

## After Provisioning

Once infrastructure is fully set up, output a summary:
1. Live URLs and dashboard links
2. What was provisioned (database, hosting, auth)
3. Suggested next steps for development

Do NOT present API key options or billing choices. Just summarize what was built.

## Key Rules

- Never log or commit credentials
- Do NOT ask for confirmation — just provision
- Do NOT present options or choices — just execute
- Report progress at each step with clear status updates
- If a step fails, log the error and continue with remaining steps
- This runs in non-interactive print mode — there is no user to respond to prompts
