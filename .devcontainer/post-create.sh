#!/bin/bash

echo "🚀 Setting up ShipMe self-deployment environment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build MCP servers
echo "🔧 Building MCP servers..."
cd template-components/mcp-servers
npm install
npm run build
cd ../..

# Install app dependencies
echo "📦 Installing app dependencies..."
cd app
npm install
cd ..

# Verify MCP servers are built
if [ -d "template-components/mcp-servers/dist" ]; then
  echo "✅ MCP servers built successfully"
  echo "   - GitHub MCP"
  echo "   - Supabase MCP"
  echo "   - Netlify MCP"
else
  echo "❌ Failed to build MCP servers"
  exit 1
fi

echo ""
echo "✅ Environment ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 To deploy ShipMe.dev:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Authenticate to GitHub:"
echo "   gh auth login"
echo ""
echo "2. Set required tokens as Codespace secrets:"
echo "   - GITHUB_TOKEN (from gh auth status)"
echo "   - SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)"
echo "   - NETLIFY_AUTH_TOKEN (from https://app.netlify.com/user/applications)"
echo ""
echo "3. Ask Claude to deploy ShipMe:"
echo "   @claude Deploy ShipMe.dev using the deployment guide"
echo ""
echo "📖 Deployment guide: .devcontainer/DEPLOY_SHIPME.md"
echo ""
