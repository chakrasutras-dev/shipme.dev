import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/connected-accounts
 * Returns which OAuth providers the logged-in user has connected.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // GitHub is always connected (it's how they logged in via Supabase Auth)
  const accounts: Record<string, boolean> = {
    github: true,
    supabase: false,
    netlify: false
  }

  // Check user_oauth_tokens for Supabase and Netlify
  const { data: tokens } = await supabase
    .from('user_oauth_tokens')
    .select('provider')
    .eq('user_id', user.id)

  if (tokens) {
    for (const t of tokens) {
      if (t.provider === 'supabase') accounts.supabase = true
      if (t.provider === 'netlify') accounts.netlify = true
    }
  }

  return NextResponse.json({
    accounts,
    all_connected: accounts.github && accounts.supabase && accounts.netlify
  })
}
