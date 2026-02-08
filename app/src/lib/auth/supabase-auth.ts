import { createClient } from '@/lib/supabase/client'

export async function signInWithGitHub() {
  const supabase = createClient()

  const redirectUrl = `${window.location.origin}/auth/callback`
  console.log('[Auth] Starting GitHub OAuth, redirect URL:', redirectUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
      scopes: 'repo read:user'
    }
  })

  if (error) {
    console.error('[Auth] OAuth error:', error)
    return { data, error }
  }

  if (data?.url) {
    window.location.href = data.url
  }

  return { data, error }
}

export async function getSession() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return session
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (user && !error) {
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
    return refreshedSession
  }

  return null
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
