import { createClient } from '@/lib/supabase/client'

export async function signInWithGitHub() {
  const supabase = createClient()

  // Use window.location.origin as fallback for redirect URL
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`

  console.log('[Auth] Starting GitHub OAuth, redirect URL:', redirectUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
      scopes: 'repo read:user'
    }
  })

  console.log('[Auth] OAuth response:', { data, error })

  if (error) {
    console.error('[Auth] OAuth error:', error)
  }

  return { data, error }
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
