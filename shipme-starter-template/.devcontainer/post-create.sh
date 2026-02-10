#!/bin/bash

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

# Step 2: Install project dependencies
if [ -f "package.json" ]; then
  echo "[1/5] Installing project dependencies..."
  npm install --silent 2>/dev/null
  echo "  Done."
fi

# Step 3: Build MCP servers
echo "[2/5] Building MCP servers..."
cd mcp-servers && npm install --silent 2>/dev/null && npm run build 2>/dev/null && cd ..
echo "  Done."

# Step 4: Install global tools
echo "[3/5] Installing global tools..."
npm install -g netlify-cli supabase 2>/dev/null || true
echo "  Done."

# Step 5: Install Claude Code CLI
echo "[4/5] Installing Claude Code CLI..."
npm install -g @anthropic-ai/claude-code 2>/dev/null || true
echo "  Done."

# Step 6: Configure Anthropic API key via provisioning token
echo "[5/5] Configuring Claude Code..."

# Check if ANTHROPIC_API_KEY is already set (e.g., via Codespace secret)
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
      -d "{\"token\": \"$PROVISIONING_TOKEN\"}" 2>/dev/null)

    API_KEY=$(node -e "
      try {
        const r = JSON.parse(process.argv[1]);
        if (r.anthropic_api_key) process.stdout.write(r.anthropic_api_key);
      } catch(e) {}
    " "$RESPONSE" 2>/dev/null)

    if [ -n "$API_KEY" ]; then
      # Persist the key for all terminal sessions
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
      echo "  Could not retrieve API key. Set ANTHROPIC_API_KEY manually."
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
echo "  To start provisioning your infrastructure, run:"
echo ""
echo "    claude"
echo ""
echo "  Claude Code will read your project config and begin"
echo "  setting up Supabase, Netlify, and GitHub automatically."
echo ""
echo "  To use your own Anthropic API key instead of ShipMe's:"
echo "    export ANTHROPIC_API_KEY=sk-ant-your-key-here"
echo ""
echo "======================================================"
echo ""

# Display project info if available
if [ -f ".shipme/project.json" ]; then
  echo "Project Configuration:"
  cat .shipme/project.json
  echo ""
fi
