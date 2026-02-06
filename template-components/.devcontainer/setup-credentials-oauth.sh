#!/bin/bash

# ShipMe OAuth-Based Credential Setup
# This script provides a seamless OAuth flow for all services

set -e

CREDENTIALS_FILE="$HOME/.shipme/credentials.env"
OAUTH_SERVER_SCRIPT="$(dirname "$0")/oauth-server.js"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     ShipMe - One-Click Infrastructure Provisioning           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${YELLOW}Let's connect to your infrastructure services.${NC}"
echo -e "${YELLOW}I'll open your browser - just log in with your username and password!${NC}"
echo ""

# Create credentials directory
mkdir -p "$HOME/.shipme"

# Check if credentials file exists
if [ -f "$CREDENTIALS_FILE" ]; then
  echo -e "${GREEN}✓ Existing credentials found${NC}"
  echo ""
  read -p "Do you want to reconfigure? (y/N): " reconfigure
  if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
    echo "Keeping existing credentials."

    # Load and display what's configured
    source "$CREDENTIALS_FILE"
    echo ""
    echo "Currently configured:"
    [ ! -z "$GITHUB_TOKEN" ] && echo -e "  ${GREEN}✓${NC} GitHub"
    [ ! -z "$SUPABASE_ACCESS_TOKEN" ] && echo -e "  ${GREEN}✓${NC} Supabase"
    [ ! -z "$NETLIFY_AUTH_TOKEN" ] && echo -e "  ${GREEN}✓${NC} Netlify"
    echo ""
    exit 0
  fi
  echo ""
fi

# Start OAuth server in background
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Starting OAuth Server${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  echo "Node.js is required for OAuth flows."
  echo "Please install Node.js and try again."
  exit 1
fi

# Start OAuth server
node "$OAUTH_SERVER_SCRIPT" &
OAUTH_SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $OAUTH_SERVER_PID 2>/dev/null; then
  echo -e "${RED}❌ Failed to start OAuth server${NC}"
  exit 1
fi

echo -e "${GREEN}✓ OAuth server running on http://localhost:54321${NC}"
echo ""

# Function to cleanup OAuth server
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down OAuth server...${NC}"
  kill $OAUTH_SERVER_PID 2>/dev/null || true
  wait $OAUTH_SERVER_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Cleanup complete${NC}"
}

trap cleanup EXIT

# GitHub Authentication
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}1. GitHub Authentication${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "GitHub CLI provides automatic authentication."
echo ""
read -p "Authenticate with GitHub now? (Y/n): " github_auth
if [[ ! $github_auth =~ ^[Nn]$ ]]; then
  echo "Running: gh auth login"
  gh auth login
  GITHUB_TOKEN=$(gh auth token)
  echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> "$CREDENTIALS_FILE"
  echo -e "${GREEN}✓ GitHub authentication complete${NC}"
else
  echo "⊘ Skipped GitHub authentication"
fi

echo ""
echo ""

# Supabase OAuth
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}2. Supabase Connection${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Connect to Supabase to provision databases."
echo ""
read -p "Connect to Supabase now? (Y/n): " supabase_auth
if [[ ! $supabase_auth =~ ^[Nn]$ ]]; then
  echo ""
  echo -e "${YELLOW}Opening Supabase login in your browser...${NC}"
  echo "Please log in with your Supabase username and password."
  echo ""

  # Trigger OAuth flow via server
  node -e "
    const http = require('http');
    http.get('http://localhost:54321/callback/supabase?start=true', () => {});
  " 2>/dev/null || true

  # Open browser manually
  if command -v open &> /dev/null; then
    open "https://api.supabase.com/v1/oauth/authorize?client_id=shipme-dev&redirect_uri=http://localhost:54321/callback/supabase&response_type=code&scope=all" 2>/dev/null || true
  elif command -v xdg-open &> /dev/null; then
    xdg-open "https://api.supabase.com/v1/oauth/authorize?client_id=shipme-dev&redirect_uri=http://localhost:54321/callback/supabase&response_type=code&scope=all" 2>/dev/null || true
  fi

  echo "Waiting for authentication to complete..."
  echo -e "${YELLOW}(This may take a few moments)${NC}"

  # Wait for credential to be saved
  for i in {1..60}; do
    if grep -q "SUPABASE_ACCESS_TOKEN" "$CREDENTIALS_FILE" 2>/dev/null; then
      echo -e "${GREEN}✓ Supabase connected successfully!${NC}"
      break
    fi
    sleep 1
  done

  if ! grep -q "SUPABASE_ACCESS_TOKEN" "$CREDENTIALS_FILE" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Supabase authentication timed out${NC}"
    echo "You can configure Supabase later by re-running this script."
  fi
else
  echo "⊘ Skipped Supabase connection"
fi

echo ""
echo ""

# Netlify OAuth
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}3. Netlify Connection${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Connect to Netlify for site deployment."
echo ""
read -p "Connect to Netlify now? (Y/n): " netlify_auth
if [[ ! $netlify_auth =~ ^[Nn]$ ]]; then
  echo ""
  echo -e "${YELLOW}Opening Netlify login in your browser...${NC}"
  echo "Please log in with your Netlify username and password."
  echo ""

  # Open browser
  if command -v open &> /dev/null; then
    open "https://app.netlify.com/authorize?client_id=shipme-dev&redirect_uri=http://localhost:54321/callback/netlify&response_type=code" 2>/dev/null || true
  elif command -v xdg-open &> /dev/null; then
    xdg-open "https://app.netlify.com/authorize?client_id=shipme-dev&redirect_uri=http://localhost:54321/callback/netlify&response_type=code" 2>/dev/null || true
  fi

  echo "Waiting for authentication to complete..."
  echo -e "${YELLOW}(This may take a few moments)${NC}"

  # Wait for credential to be saved
  for i in {1..60}; do
    if grep -q "NETLIFY_AUTH_TOKEN" "$CREDENTIALS_FILE" 2>/dev/null; then
      echo -e "${GREEN}✓ Netlify connected successfully!${NC}"
      break
    fi
    sleep 1
  done

  if ! grep -q "NETLIFY_AUTH_TOKEN" "$CREDENTIALS_FILE" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Netlify authentication timed out${NC}"
    echo "You can configure Netlify later by re-running this script."
  fi
else
  echo "⊘ Skipped Netlify connection"
fi

echo ""
echo ""

# Secure the credentials file
chmod 600 "$CREDENTIALS_FILE"

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Setup Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show what was configured
source "$CREDENTIALS_FILE" 2>/dev/null || true
echo "Connected services:"
[ ! -z "$GITHUB_TOKEN" ] && echo -e "  ${GREEN}✓${NC} GitHub"
[ ! -z "$SUPABASE_ACCESS_TOKEN" ] && echo -e "  ${GREEN}✓${NC} Supabase"
[ ! -z "$NETLIFY_AUTH_TOKEN" ] && echo -e "  ${GREEN}✓${NC} Netlify"

echo ""
echo -e "${GREEN}You're ready to provision infrastructure!${NC}"
echo ""
echo "To start provisioning:"
echo -e "  ${YELLOW}@claude start provisioning${NC}"
echo ""
