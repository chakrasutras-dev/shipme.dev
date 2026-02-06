import { NextResponse } from 'next/server'

/**
 * OAuth Callback - Receives OAuth callback and forwards token to Codespace
 *
 * GET /api/oauth/callback?code=...&state=...
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  // Handle OAuth error
  if (error) {
    return new NextResponse(
      generateErrorHTML('Authentication Error', error),
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (!code || !state) {
    return new NextResponse(
      generateErrorHTML('Missing Parameters', 'Authorization code or state is missing'),
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Decode state to get Codespace URL and provider
  let stateData: { codespace_url: string; state: string; provider: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
  } catch (err) {
    return new NextResponse(
      generateErrorHTML('Invalid State', 'Could not decode state parameter'),
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  const { codespace_url, provider } = stateData

  // Get OAuth configuration for provider
  const tokenUrls: Record<string, string> = {
    supabase: 'https://api.supabase.com/v1/oauth/token',
    netlify: 'https://api.netlify.com/oauth/token'
  }

  const clientId = provider === 'supabase'
    ? process.env.SHIPME_SUPABASE_CLIENT_ID
    : process.env.SHIPME_NETLIFY_CLIENT_ID

  const clientSecret = provider === 'supabase'
    ? process.env.SHIPME_SUPABASE_CLIENT_SECRET
    : process.env.SHIPME_NETLIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error(`Missing credentials for ${provider}`)
    return new NextResponse(
      generateErrorHTML('Configuration Error', `OAuth credentials not configured for ${provider}`),
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Exchange authorization code for access token
  const redirectUri = `${url.origin}/api/oauth/callback`

  try {
    const tokenResponse = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return new NextResponse(
        generateErrorHTML('Token Exchange Failed', `Could not obtain access token from ${provider}`),
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error('No access token in response:', tokenData)
      return new NextResponse(
        generateErrorHTML('No Access Token', 'OAuth response did not include access token'),
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

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
        })
      })
    } catch (forwardError) {
      console.error('Failed to forward token to Codespace:', forwardError)
      // Continue anyway - user can see success and token was obtained
    }

    // Return success page
    return new NextResponse(
      generateSuccessHTML(provider),
      { headers: { 'Content-Type': 'text/html' } }
    )

  } catch (err) {
    console.error('OAuth callback error:', err)
    return new NextResponse(
      generateErrorHTML('Internal Error', 'An unexpected error occurred'),
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}

function generateSuccessHTML(provider: string): string {
  return `
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
            margin: 0;
          }
          .success {
            color: #00f5ff;
            font-size: 64px;
            margin: 20px 0;
          }
          h1 {
            font-size: 32px;
            margin: 10px 0;
          }
          .provider {
            text-transform: capitalize;
            color: #FFD700;
          }
          .message {
            font-size: 18px;
            margin: 20px 0;
            opacity: 0.9;
          }
          .submessage {
            font-size: 14px;
            opacity: 0.6;
          }
        </style>
      </head>
      <body>
        <div class="success">✓</div>
        <h1>Connected to <span class="provider">${provider}</span>!</h1>
        <p class="message">You can close this window and return to your Codespace.</p>
        <p class="submessage">This window will close automatically in 3 seconds...</p>
        <script>
          setTimeout(() => {
            window.close();
            document.body.innerHTML = '<div class="success">✓</div><h1>Success!</h1><p class="message">You can close this window now.</p>';
          }, 3000);
        </script>
      </body>
    </html>
  `
}

function generateErrorHTML(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ShipMe - ${title}</title>
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
            margin: 0;
          }
          .error {
            color: #ef4444;
            font-size: 64px;
            margin: 20px 0;
          }
          h1 {
            font-size: 32px;
            margin: 10px 0;
            color: #ef4444;
          }
          .message {
            font-size: 18px;
            margin: 20px 0;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="error">✕</div>
        <h1>${title}</h1>
        <p class="message">${message}</p>
        <p class="message">Please close this window and try again.</p>
      </body>
    </html>
  `
}
