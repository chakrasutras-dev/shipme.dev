#!/usr/bin/env node

/**
 * OAuth Server for ShipMe Credential Setup
 *
 * This server handles OAuth flows for Supabase and Netlify.
 * It runs locally on port 54321 and captures OAuth callbacks.
 */

const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PORT = 54321;
const CREDENTIALS_DIR = path.join(os.homedir(), '.shipme');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.env');

// OAuth configuration
const OAUTH_CONFIG = {
  supabase: {
    authUrl: 'https://api.supabase.com/v1/oauth/authorize',
    tokenUrl: 'https://api.supabase.com/v1/oauth/token',
    clientId: process.env.SHIPME_SUPABASE_CLIENT_ID || 'shipme-dev',
    redirectUri: `http://localhost:${PORT}/callback/supabase`,
    scope: 'all'
  },
  netlify: {
    authUrl: 'https://app.netlify.com/authorize',
    tokenUrl: 'https://api.netlify.com/oauth/token',
    clientId: process.env.SHIPME_NETLIFY_CLIENT_ID || 'shipme-dev',
    redirectUri: `http://localhost:${PORT}/callback/netlify`,
    scope: ''
  }
};

// Store for pending OAuth flows
const pendingFlows = new Map();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Ensure credentials directory exists
if (!fs.existsSync(CREDENTIALS_DIR)) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}

// Start OAuth flow
function startOAuthFlow(provider) {
  const config = OAUTH_CONFIG[provider];
  if (!config) {
    log(`Unknown provider: ${provider}`, 'red');
    return;
  }

  const state = Math.random().toString(36).substring(7);
  pendingFlows.set(state, { provider, timestamp: Date.now() });

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  if (config.scope) {
    authUrl.searchParams.set('scope', config.scope);
  }

  log(`\n🌐 Opening ${provider} login in your browser...`, 'cyan');
  log(`If browser doesn't open, visit: ${authUrl.toString()}`, 'yellow');

  // Open browser
  const openCmd = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${openCmd} "${authUrl.toString()}"`, (error) => {
    if (error) {
      log(`Failed to open browser: ${error.message}`, 'red');
      log(`Please open this URL manually: ${authUrl.toString()}`, 'yellow');
    }
  });

  return state;
}

// Exchange authorization code for access token
async function exchangeCodeForToken(provider, code) {
  const config = OAUTH_CONFIG[provider];

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId
  });

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    log(`Token exchange error: ${error.message}`, 'red');
    throw error;
  }
}

// Save credential to file
function saveCredential(key, value) {
  let credentials = {};

  // Read existing credentials
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const content = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    content.split('\n').forEach(line => {
      const [k, v] = line.split('=');
      if (k && v) {
        credentials[k.trim()] = v.trim();
      }
    });
  }

  // Update credential
  credentials[key] = value;

  // Write back
  const lines = Object.entries(credentials).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(CREDENTIALS_FILE, lines.join('\n'), { mode: 0o600 });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // OAuth callbacks
  if (pathname.startsWith('/callback/')) {
    const provider = pathname.split('/')[2];
    const { code, state, error } = parsedUrl.query;

    // Error from OAuth provider
    if (error) {
      log(`\n❌ OAuth error: ${error}`, 'red');
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ShipMe - Authentication Error</title>
            <style>
              body { font-family: system-ui; padding: 40px; text-align: center; }
              .error { color: #ef4444; font-size: 24px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>❌ Authentication Failed</h1>
            <div class="error">${error}</div>
            <p>Please close this window and try again.</p>
          </body>
        </html>
      `);
      return;
    }

    // Validate state
    if (!state || !pendingFlows.has(state)) {
      log('\n❌ Invalid OAuth state', 'red');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid state parameter');
      return;
    }

    const flow = pendingFlows.get(state);
    pendingFlows.delete(state);

    // Validate provider
    if (flow.provider !== provider) {
      log('\n❌ Provider mismatch', 'red');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Provider mismatch');
      return;
    }

    try {
      log(`\n✓ Received authorization code from ${provider}`, 'green');
      log('Exchanging for access token...', 'yellow');

      // Exchange code for token
      const accessToken = await exchangeCodeForToken(provider, code);

      // Save credential
      const credentialKey = provider === 'supabase' ? 'SUPABASE_ACCESS_TOKEN' : 'NETLIFY_AUTH_TOKEN';
      saveCredential(credentialKey, accessToken);

      log(`✓ ${provider} connected successfully!`, 'green');

      // Send success response
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ShipMe - Authentication Success</title>
            <style>
              body {
                font-family: system-ui;
                padding: 40px;
                text-align: center;
                background: linear-gradient(to bottom, #0f172a, #1e293b);
                color: white;
                min-height: 100vh;
              }
              .success {
                color: #00f5ff;
                font-size: 32px;
                margin: 20px 0;
              }
              .provider {
                text-transform: capitalize;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1 class="success">✓ Connected to <span class="provider">${provider}</span>!</h1>
            <p>You can close this window and return to your terminal.</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);

      // Signal completion
      process.send && process.send({ type: 'auth_complete', provider, success: true });
    } catch (error) {
      log(`\n❌ Failed to complete authentication: ${error.message}`, 'red');
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ShipMe - Authentication Error</title>
            <style>
              body { font-family: system-ui; padding: 40px; text-align: center; }
              .error { color: #ef4444; font-size: 24px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>❌ Authentication Failed</h1>
            <div class="error">${error.message}</div>
            <p>Please close this window and try again.</p>
          </body>
        </html>
      `);

      process.send && process.send({ type: 'auth_complete', provider, success: false, error: error.message });
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start server
server.listen(PORT, () => {
  log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  log(`🚀 ShipMe OAuth Server Running`, 'cyan');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  log(`\nListening on: http://localhost:${PORT}`, 'green');
  log(`Ready to handle OAuth flows\n`, 'green');
});

// Handle process messages (from parent script)
process.on('message', (msg) => {
  if (msg.type === 'start_oauth') {
    startOAuthFlow(msg.provider);
  } else if (msg.type === 'shutdown') {
    log('\nShutting down OAuth server...', 'yellow');
    server.close(() => {
      log('✓ Server stopped', 'green');
      process.exit(0);
    });
  }
});

// Handle shutdown
process.on('SIGINT', () => {
  log('\n\nReceived SIGINT, shutting down...', 'yellow');
  server.close(() => {
    log('✓ Server stopped', 'green');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('\n\nReceived SIGTERM, shutting down...', 'yellow');
  server.close(() => {
    log('✓ Server stopped', 'green');
    process.exit(0);
  });
});

// Export for programmatic use
if (require.main !== module) {
  module.exports = { startOAuthFlow, server };
} else {
  // If run directly, start GitHub OAuth as example
  if (process.argv[2]) {
    startOAuthFlow(process.argv[2]);
  }
}
