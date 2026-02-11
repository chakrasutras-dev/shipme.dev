#!/bin/bash

# ShipMe Post-Create Setup
# This script must ALWAYS exit 0 to prevent recovery mode.
# Individual step failures are logged but never stop the setup.

echo ""
echo "======================================================"
echo "  ShipMe Development Environment Setup"
echo "======================================================"
echo ""

# Step 1: Check project configuration
if [ ! -f ".shipme/project.json" ]; then
  echo "Warning: No project configuration found at .shipme/project.json"
  echo "This file should have been created by shipme.dev during repository creation."
  echo ""
fi

# Step 2: Install project dependencies (if any)
if [ -f "package.json" ]; then
  echo "[1/5] Installing project dependencies..."
  npm install 2>&1 || echo "  Warning: npm install had issues (non-critical)"
  echo "  Done."
else
  echo "[1/5] No package.json found, skipping dependency install."
fi

# Step 3: Build MCP servers (run in subshell so cd doesn't affect parent)
echo "[2/5] Building MCP servers..."
if [ -d "mcp-servers" ]; then
  (
    cd mcp-servers
    npm install 2>&1 || echo "  Warning: mcp-servers npm install had issues"
    npm run build 2>&1 || echo "  Warning: mcp-servers build had issues"
  )
  echo "  Done."
else
  echo "  Warning: mcp-servers directory not found, skipping."
fi

# Step 4: Install global tools
echo "[3/5] Installing global tools..."
npm install -g netlify-cli 2>&1 || echo "  Warning: netlify-cli install failed (non-critical)"
npm install -g supabase 2>&1 || echo "  Warning: supabase install failed (non-critical)"
echo "  Done."

# Step 5: Install Claude Code CLI
echo "[4/5] Installing Claude Code CLI..."
npm install -g @anthropic-ai/claude-code 2>&1 || echo "  Warning: claude-code install failed"
echo "  Done."

# Pre-configure Claude Code to skip first-time onboarding (theme picker, login screen)
# This must happen AFTER Claude CLI install but BEFORE auto-launch-claude.sh runs
mkdir -p "$HOME/.claude"
cat > "$HOME/.claude.json" << 'CEOF'
{
  "hasCompletedOnboarding": true,
  "hasTrustDialogAccepted": true,
  "hasTrustDialogHooksAccepted": true
}
CEOF
echo "  Claude Code onboarding pre-configured."

# Step 6: Configure Anthropic API key via provisioning token
echo "[5/5] Configuring Claude Code..."

if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "  API key already configured via environment."
elif [ -f ".shipme/project.json" ]; then
  # Try to redeem the provisioning token from ShipMe
  PROVISIONING_TOKEN=$(node -e "
    try {
      const c = JSON.parse(require('fs').readFileSync('.shipme/project.json', 'utf8'));
      if (c.provisioningToken) process.stdout.write(c.provisioningToken);
    } catch(e) {}
  " 2>/dev/null)

  if [ -n "$PROVISIONING_TOKEN" ]; then
    echo "  Retrieving API key from ShipMe..."
    RESPONSE=$(curl -s -X POST https://shipme.dev/api/provisioning-token/redeem \
      -H "Content-Type: application/json" \
      -d "{\"token\": \"$PROVISIONING_TOKEN\"}")

    API_KEY=$(node -e "
      try {
        const r = JSON.parse(process.argv[1]);
        if (r.anthropic_api_key) process.stdout.write(r.anthropic_api_key);
      } catch(e) {}
    " "$RESPONSE" 2>/dev/null)

    if [ -n "$API_KEY" ]; then
      # Write to dedicated env file (sourced by auto-launch-claude.sh)
      echo "export ANTHROPIC_API_KEY=$API_KEY" > ~/.shipme-env

      # Also persist for all terminal sessions
      echo "export ANTHROPIC_API_KEY=$API_KEY" >> ~/.bashrc
      echo "export ANTHROPIC_API_KEY=$API_KEY" >> ~/.profile
      export ANTHROPIC_API_KEY=$API_KEY
      echo "  API key configured successfully."

      # Remove the provisioning token from project.json (security cleanup)
      node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('.shipme/project.json', 'utf8'));
        delete config.provisioningToken;
        fs.writeFileSync('.shipme/project.json', JSON.stringify(config, null, 2));
      " 2>/dev/null

      # Commit the token removal
      git add .shipme/project.json 2>/dev/null
      git commit -m "Remove provisioning token (redeemed)" --no-verify 2>/dev/null || true
    else
      echo "  Could not retrieve API key. Response: $RESPONSE"
      echo "  Set ANTHROPIC_API_KEY manually: export ANTHROPIC_API_KEY=sk-ant-your-key"
    fi
  else
    echo "  No provisioning token found. Set ANTHROPIC_API_KEY manually."
  fi
else
  echo "  No project config found. Set ANTHROPIC_API_KEY manually."
fi

echo ""
echo "======================================================"
echo "  Setup Complete!"
echo "======================================================"
echo ""
echo "  Claude Code will auto-launch when the terminal opens"
echo "  and begin infrastructure provisioning automatically."
echo ""
echo "======================================================"
echo ""

# Display project info if available
if [ -f ".shipme/project.json" ]; then
  echo "Project Configuration:"
  cat .shipme/project.json
  echo ""
fi

# CRITICAL: Always exit 0 to prevent Codespace recovery mode
exit 0
