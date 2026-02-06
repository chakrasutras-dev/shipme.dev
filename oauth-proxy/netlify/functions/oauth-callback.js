/**
 * OAuth Callback - Receives OAuth callback and forwards token to Codespace
 *
 * Query params:
 * - code: Authorization code from OAuth provider
 * - state: Encoded state containing Codespace URL and provider info
 */

const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { code, state } = event.queryStringParameters;

    if (!code || !state) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head><title>ShipMe - Error</title></head>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
              <h1 style="color: #ef4444;">❌ Authentication Error</h1>
              <p>Missing authorization code or state</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `
      };
    }

    // Decode state to get Codespace URL and provider
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (err) {
      console.error('State decode error:', err);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head><title>ShipMe - Error</title></head>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
              <h1 style="color: #ef4444;">❌ Invalid State</h1>
              <p>Could not decode state parameter</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `
      };
    }

    const { codespace_url, provider } = stateData;

    // Get OAuth configuration for provider
    const tokenUrls = {
      supabase: 'https://api.supabase.com/v1/oauth/token',
      netlify: 'https://api.netlify.com/oauth/token'
    };

    const clientId = provider === 'supabase'
      ? process.env.SUPABASE_CLIENT_ID
      : process.env.NETLIFY_CLIENT_ID;

    const clientSecret = provider === 'supabase'
      ? process.env.SUPABASE_CLIENT_SECRET
      : process.env.NETLIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(`Missing credentials for ${provider}`);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head><title>ShipMe - Configuration Error</title></head>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
              <h1 style="color: #ef4444;">❌ Configuration Error</h1>
              <p>OAuth credentials not configured for ${provider}</p>
              <p>Please contact support.</p>
            </body>
          </html>
        `
      };
    }

    // Exchange authorization code for access token
    console.log(`Exchanging code for token (${provider})...`);

    const tokenResponse = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://oauth.shipme.dev/.netlify/functions/oauth-callback',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head><title>ShipMe - Token Error</title></head>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
              <h1 style="color: #ef4444;">❌ Token Exchange Failed</h1>
              <p>Could not obtain access token from ${provider}</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `
      };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head><title>ShipMe - Token Error</title></head>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
              <h1 style="color: #ef4444;">❌ No Access Token</h1>
              <p>OAuth response did not include access token</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `
      };
    }

    console.log(`Token obtained for ${provider}, forwarding to Codespace...`);

    // Forward token to user's Codespace
    try {
      await fetch(`${codespace_url}/oauth/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          token: accessToken
        }),
        timeout: 5000
      });
      console.log('Token forwarded successfully');
    } catch (forwardError) {
      console.error('Failed to forward token to Codespace:', forwardError);
      // Continue anyway - user can retry
    }

    // Return success page
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>ShipMe - Connected!</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 40px;
                text-align: center;
                background: linear-gradient(to bottom, #0f172a, #1e293b);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .success {
                color: #00f5ff;
                font-size: 48px;
                margin: 20px 0;
              }
              .provider {
                text-transform: capitalize;
                font-weight: bold;
              }
              .message {
                font-size: 18px;
                margin: 20px 0;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="success">✓</div>
            <h1>Connected to <span class="provider">${provider}</span>!</h1>
            <p class="message">You can close this window and return to your Codespace.</p>
            <p class="message" style="font-size: 14px; opacity: 0.7;">This window will close automatically in 3 seconds...</p>
            <script>
              setTimeout(() => {
                window.close();
                // If window.close() doesn't work (some browsers block it)
                document.body.innerHTML = '<h2>✓ Success!</h2><p>You can now close this window.</p>';
              }, 3000);
            </script>
          </body>
        </html>
      `
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <html>
          <head><title>ShipMe - Error</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0f172a; color: white;">
            <h1 style="color: #ef4444;">❌ Internal Error</h1>
            <p>An unexpected error occurred</p>
            <p>Please close this window and try again.</p>
          </body>
        </html>
      `
    };
  }
};
