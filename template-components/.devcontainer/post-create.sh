#!/bin/bash

echo "🚀 Setting up ShipMe development environment..."
echo ""

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Build MCP servers
echo "🔧 Building MCP servers..."
cd mcp-servers && npm install && npm run build && cd ..

# Install global tools
echo "🛠️  Installing global tools..."
npm install -g netlify-cli supabase

# Verify installations
echo ""
echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo "✓ GitHub CLI: $(gh --version | head -n 1)"
echo "✓ Netlify CLI: $(netlify --version)"
echo "✓ Supabase CLI: $(supabase --version)"

echo ""
echo "✅ Environment ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🔐 Set up credentials (required for provisioning):"
echo "   Run: bash .devcontainer/setup-credentials.sh"
echo ""
echo "2. 📄 Your project configuration: .shipme/project.json"
echo ""
echo "3. 🤖 Start provisioning with Claude Code:"
echo "   Type: @claude help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: You can configure credentials later when you're ready"
echo "    to provision infrastructure. Just run the setup wizard!"
echo ""
