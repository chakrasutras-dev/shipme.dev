#!/bin/bash

echo "🚀 Setting up ShipMe development environment..."
echo ""

# Check if project configuration exists
if [ ! -f ".shipme/project.json" ]; then
  echo "⚠️  No project configuration found at .shipme/project.json"
  echo "This file should have been created by shipme.dev during repository creation."
  echo ""
fi

# Install project dependencies (if package.json exists)
if [ -f "package.json" ]; then
  echo "📦 Installing project dependencies..."
  npm install
  echo "✅ Project dependencies installed"
  echo ""
fi

# Build MCP servers
echo "🔧 Building MCP servers..."
cd mcp-servers && npm install && npm run build && cd ..
echo "✅ MCP servers built successfully"
echo ""

# Install global tools
echo "🛠️  Installing global tools..."
npm install -g netlify-cli supabase 2>/dev/null || echo "  (Some tools may already be installed)"
echo ""

echo "✅ Environment setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔐 Authenticate your services:"
echo "   • GitHub: gh auth login"
echo "   • Provide Supabase & Netlify tokens as Codespace secrets"
echo ""
echo "2. 🤖 Start provisioning:"
echo "   Type: @claude Read my project configuration and start provisioning"
echo ""
echo "3. 📖 Or get help:"
echo "   Type: @claude help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Display project info if available
if [ -f ".shipme/project.json" ]; then
  echo "📄 Project Configuration:"
  cat .shipme/project.json | head -20
  echo ""
fi
