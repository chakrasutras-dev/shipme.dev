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
echo "1. Your project configuration is in: .shipme/project.json"
echo "2. Claude Code will automatically help provision your infrastructure"
echo "3. Watch the terminal for provisioning progress"
echo ""
echo "🤖 To get started, type: @claude help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
