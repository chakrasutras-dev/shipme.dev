import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth Start - Initiates OAuth flow for Supabase or Netlify
 * User must be logged in (via GitHub/Supabase Auth).
 *
 * GET /api/oauth/start?provider=supabase
 * GET /api/oauth/start?provider=netlify
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const provider = url.searchParams.get('provider')

  if (!provider || !['supabase', 'netlify'].includes(provider)) {
    return NextResponse.json(
      { error: 'Invalid provider. Use: supabase, netlify' },
      { status: 400 }
    )
  }

  // Verify user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Use x-forwarded-host for correct redirect URI on Netlify
  const forwardedHost = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const origin = forwardedHost ? `${proto}://${forwardedHost}` : url.origin
  const redirectUri = `${origin}/api/oauth/callback`

  // Encode state with user ID and provider (for callback to verify)
  const stateData = Buffer.from(JSON.stringify({
    user_id: user.id,
    provider,
    timestamp: Date.now()
  })).toString('base64url')

  // Build provider-specific OAuth URL
  let authUrl: string
  if (provider === 'supabase') {
    authUrl = `https://api.supabase.com/v1/oauth/authorize?` +
      `client_id=${process.env.SHIPME_SUPABASE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${stateData}` +
      `&scope=all`
  } else {
    authUrl = `https://app.netlify.com/authorize?` +
      `client_id=${process.env.SHIPME_NETLIFY_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${stateData}`
  }

  return NextResponse.redirect(authUrl)
}
