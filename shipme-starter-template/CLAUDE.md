# ShipMe Project

This is a ShipMe-provisioned development environment with a Next.js starter app.
All credentials are pre-configured as environment variables.

## First Action

1. Read `.shipme/project.json` for project details
2. Read `.shipme/claude-instructions.md` for the full workflow
3. Begin IMMEDIATELY — do NOT ask for confirmation, do NOT present options, do NOT wait for user input

## What's Already Here

A minimal Next.js + Supabase + Tailwind app is ready in `src/`:
- `src/app/layout.tsx` — Root layout
- `src/app/page.tsx` — Landing page (reads project.json)
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client

Do NOT create a new project from scratch. CUSTOMIZE this existing app.

## Credentials

All required credentials are pre-configured as environment variables:
- `SUPABASE_ACCESS_TOKEN` — Supabase Management API
- `SUPABASE_ORG_ID` — Supabase organization (for project creation)
- `NETLIFY_AUTH_TOKEN` — Netlify API
- `GITHUB_TOKEN` — GitHub API
- `ANTHROPIC_API_KEY` — Already configured (this is how you're running)

Do NOT check or print credential status. Do NOT ask the user to set tokens. Just use them directly via MCP tools.

## Available MCP Servers

- **supabase**: `create_project`, `execute_sql`, `configure_auth_provider`, `get_project_info`
- **netlify**: `create_site`, `configure_env_vars`, `deploy_site`, `get_site_info`
- **github**: `create_repository`, `create_secret`, `push_files`

## Key Rules

- Never log or commit credentials
- Do NOT ask for confirmation — just execute
- Do NOT present options or choices — just execute
- Report progress at each step with clear status updates
- If a step fails, log the error and continue with remaining steps
- This runs in non-interactive print mode — there is no user to respond to prompts
