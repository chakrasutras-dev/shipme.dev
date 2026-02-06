import { NextResponse } from 'next/server'

/**
 * OAuth Start - Initiates OAuth flow for Supabase or Netlify
 *
 * GET /api/oauth/start?provider=supabase&codespace_url=...&state=...
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const provider = url.searchParams.get('provider')
  const codespaceUrl = url.searchParams.get('codespace_url')
  const state = url.searchParams.get('state')

  if (!provider || !codespaceUrl || !state) {
    return NextResponse.json(
      { error: 'Missing required parameters: provider, codespace_url, state' },
      { status: 400 }
    )
  }

  // Encode state data (includes Codespace URL for callback)
  const stateData = Buffer.from(JSON.stringify({
    codespace_url: codespaceUrl,
    state,
    provider
  })).toString('base64')

  // OAuth URLs for each provider
  const redirectUri = `${url.origin}/api/oauth/callback`

  const authUrls: Record<string, string> = {
    supabase: `https://api.supabase.com/v1/oauth/authorize?client_id=${process.env.SHIPME_SUPABASE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${stateData}&scope=all`,
    netlify: `https://app.netlify.com/authorize?client_id=${process.env.SHIPME_NETLIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${stateData}`
  }

  if (!authUrls[provider]) {
    return NextResponse.json(
      { error: 'Invalid provider. Use: supabase, netlify' },
      { status: 400 }
    )
  }

  // Redirect to OAuth provider
  return NextResponse.redirect(authUrls[provider])
}
