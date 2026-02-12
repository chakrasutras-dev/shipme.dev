import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// POST: Redeem a one-time provisioning token to receive ALL credentials.
// Called from a Codespace's post-create.sh — no user auth (uses service role).
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Find the token (select all credential columns)
    const { data, error } = await supabase
      .from('provisioning_tokens')
      .select('id, anthropic_api_key, supabase_access_token, supabase_org_id, netlify_auth_token, github_token, redeemed, expires_at')
      .eq('token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    // Check if already redeemed
    if (data.redeemed) {
      return NextResponse.json({ error: 'Token already used' }, { status: 410 })
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 410 })
    }

    // Mark as redeemed
    await supabase
      .from('provisioning_tokens')
      .update({ redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', data.id)

    // Return ALL available credentials
    return NextResponse.json({
      success: true,
      anthropic_api_key: data.anthropic_api_key,
      supabase_access_token: data.supabase_access_token || null,
      supabase_org_id: data.supabase_org_id || null,
      netlify_auth_token: data.netlify_auth_token || null,
      github_token: data.github_token || null
    })
  } catch (err) {
    console.error('[ProvisioningToken] Redemption error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
