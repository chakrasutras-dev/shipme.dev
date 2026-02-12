#!/bin/bash

# ShipMe: One-time auto-launch of Claude Code for infrastructure provisioning
# This script runs via postAttachCommand in a VISIBLE terminal.
# It only auto-launches Claude on the first connection (uses flag file).

# Skip if already provisioned (reconnect scenario)
if [ -f "$HOME/.shipme-provisioned" ]; then
  echo ""
  echo "======================================================"
  echo "  ShipMe: Environment Ready"
  echo "======================================================"
  echo ""
  echo "  Infrastructure was already provisioned."
  echo "  Run 'claude' to start Claude Code again."
  echo ""
  echo "======================================================"
  echo ""
  exit 0
fi

# Source environment (all tokens set by post-create.sh)
if [ -f "$HOME/.shipme-env" ]; then
  source "$HOME/.shipme-env"
elif [ -z "$ANTHROPIC_API_KEY" ]; then
  source ~/.bashrc 2>/dev/null
fi

# Verify Claude Code CLI is installed
if ! command -v claude &>/dev/null; then
  echo "ShipMe: Claude Code CLI not found. Attempting install..."
  npm install -g @anthropic-ai/claude-code 2>&1 || {
    echo ""
    echo "  Failed to install Claude Code CLI."
    echo "  Run manually: npm install -g @anthropic-ai/claude-code"
    echo ""
    exit 0
  }
fi

# Verify API key is available
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo ""
  echo "======================================================"
  echo "  ShipMe: API Key Not Found"
  echo "======================================================"
  echo ""
  echo "  No Anthropic API key was provisioned."
  echo "  Set it manually:"
  echo "    export ANTHROPIC_API_KEY=sk-ant-your-key-here"
  echo "  Then run:"
  echo "    claude"
  echo ""
  echo "======================================================"
  echo ""
  exit 0
fi

# Mark as launched BEFORE starting Claude (prevents re-trigger on reconnect)
touch "$HOME/.shipme-provisioned"

echo ""
echo "======================================================"
echo "  ShipMe: Starting Claude Code"
echo "======================================================"
echo "  Claude will provision infrastructure, customize"
echo "  the starter app, build, and deploy automatically."
echo "======================================================"
echo ""

# Launch Claude Code in print mode for auto-provisioning + app customization
# -p: print mode — processes prompt, runs tools, outputs results, exits
# --dangerously-skip-permissions: allows MCP tools + Bash without prompting
# Note: interactive mode triggers first-time onboarding; -p skips it
claude -p --dangerously-skip-permissions \
  "You are running in non-interactive print mode. There is NO user to respond to prompts. Read CLAUDE.md, then .shipme/project.json, then .shipme/claude-instructions.md. Execute the full workflow: create Supabase project, run database migrations, create Netlify site, configure env vars, write .env.local, then CUSTOMIZE the existing Next.js starter app based on the project description (add pages, components, features, auth). Finally build and deploy. A starter app already exists in src/ — do NOT create a new project from scratch. Do NOT ask questions or wait for input. If a step fails, log it and continue. Go."

echo ""
echo "======================================================"
echo "  ShipMe: Provisioning Complete"
echo "======================================================"
echo "  Run 'claude' to start Claude Code interactively."
echo "======================================================"
echo ""
