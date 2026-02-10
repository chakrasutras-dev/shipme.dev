# ShipMe Project

This is a ShipMe-provisioned development environment with Claude Code pre-configured.

## First Action
Read `.shipme/project.json` for project details, then read `.shipme/claude-instructions.md` for the full provisioning workflow. Begin infrastructure provisioning automatically.

## Available MCP Servers
- **github**: Create repos, push code, manage secrets (`create_repository`, `create_secret`, `push_files`)
- **supabase**: Provision databases, run SQL, configure auth (`create_project`, `execute_sql`, `configure_auth_provider`, `get_project_info`)
- **netlify**: Create sites, set env vars, deploy (`create_site`, `configure_env_vars`, `deploy_site`, `get_site_info`)

## Key Rules
- Never log or commit credentials — store sensitive values in memory only
- Follow the step-by-step provisioning workflow in `.shipme/claude-instructions.md`
- Report progress to the user at each step with clear status updates
- If a step fails, explain the error and suggest fixes before continuing
