import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * OAuth Callback - Exchanges code for token and stores in DB
 * Redirects back to shipme.dev with success/error status
 *
 * GET /api/oauth/callback?code=...&state=...
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  // Use x-forwarded-host for correct redirect on Netlify
  const forwardedHost = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const origin = forwardedHost ? `${proto}://${forwardedHost}` : url.origin

  // Handle OAuth error from provider
  if (error) {
    console.error('[OAuth Callback] Provider error:', error)
    return NextResponse.redirect(`${origin}/?oauth_error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?oauth_error=missing_params`)
  }

  // Decode state
  let stateData: { user_id: string; provider: string; timestamp: number }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${origin}/?oauth_error=invalid_state`)
  }

  const { user_id, provider } = stateData

  // Validate state age (max 10 minutes)
  if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
    return NextResponse.redirect(`${origin}/?oauth_error=state_expired`)
  }

  // Get OAuth credentials for this provider
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
    console.error(`[OAuth Callback] Missing credentials for ${provider}`)
    return NextResponse.redirect(`${origin}/?oauth_error=config_missing`)
  }

  // Exchange authorization code for access token
  const redirectUri = `${origin}/api/oauth/callback`

  try {
    const tokenResponse = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`[OAuth Callback] Token exchange failed for ${provider}:`, errorText)
      return NextResponse.redirect(`${origin}/?oauth_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token || null
    const expiresIn = tokenData.expires_in // seconds

    if (!accessToken) {
      console.error('[OAuth Callback] No access_token in response:', tokenData)
      return NextResponse.redirect(`${origin}/?oauth_error=no_token`)
    }

    // Store token in DB (upsert — replace if already connected)
    const serviceClient = createServiceRoleClient()

    // Fetch provider-specific metadata (e.g. Supabase organization ID)
    let metadata: Record<string, any> = {}
    if (provider === 'supabase') {
      let orgId: string | null = null
      let orgName: string | null = null

      // 1. Try JWT decode — Supabase org-scoped tokens embed org info in payload
      try {
        const parts = accessToken.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
          console.log('[OAuth Callback] JWT payload keys:', Object.keys(payload))
          orgId = payload.org_id || payload.organization_id || null
          // Some tokens use sub=org_xxxxx format
          if (!orgId && typeof payload.sub === 'string' && payload.sub.startsWith('org_')) {
            orgId = payload.sub
          }
          if (orgId) console.log('[OAuth Callback] Got org ID from JWT:', orgId)
        }
      } catch (e) {
        console.warn('[OAuth Callback] JWT decode failed:', e)
      }

      // 2. Try API fetch as fallback
      if (!orgId) {
        try {
          const orgsRes = await fetch('https://api.supabase.com/v1/organizations', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
          if (orgsRes.ok) {
            const orgs = await orgsRes.json() as Array<{ id: string; name: string }>
            if (orgs.length > 0) {
              orgId = orgs[0].id
              orgName = orgs[0].name
              console.log(`[OAuth Callback] Got org from API: ${orgName} (${orgId})`)
            }
          } else {
            console.warn(`[OAuth Callback] Supabase orgs API returned ${orgsRes.status}`)
          }
        } catch (e) {
          console.warn('[OAuth Callback] Failed to fetch Supabase orgs:', e)
        }
      }

      // 3. Preserve existing org ID from DB if both methods failed
      if (!orgId) {
        const { data: existing } = await serviceClient
          .from('user_oauth_tokens')
          .select('metadata')
          .eq('user_id', user_id)
          .eq('provider', 'supabase')
          .single()
        if (existing?.metadata?.organization_id) {
          orgId = existing.metadata.organization_id
          orgName = existing.metadata.organization_name || null
          console.log('[OAuth Callback] Preserved existing org from DB:', orgId)
        }
      }

      if (orgId) {
        metadata.organization_id = orgId
        if (orgName) metadata.organization_name = orgName
      } else {
        console.warn('[OAuth Callback] Could not determine Supabase org ID — token may be user-scoped')
      }
    }
    const { error: dbError } = await serviceClient
      .from('user_oauth_tokens')
      .upsert({
        user_id,
        provider,
        access_token: accessToken,
        refresh_token: refreshToken,
        metadata,
        expires_at: expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      })

    if (dbError) {
      console.error(`[OAuth Callback] DB upsert failed for ${provider}:`, JSON.stringify(dbError))
      return NextResponse.redirect(`${origin}/?oauth_error=db_error`)
    }

    console.log(`[OAuth Callback] Stored ${provider} token for user ${user_id}`)

    // Redirect back to shipme.dev with success
    return NextResponse.redirect(`${origin}/?oauth_success=${provider}`)

  } catch (err) {
    console.error('[OAuth Callback] Error:', err)
    return NextResponse.redirect(`${origin}/?oauth_error=internal_error`)
  }
}
