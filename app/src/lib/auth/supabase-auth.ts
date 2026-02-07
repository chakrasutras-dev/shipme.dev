import { createClient } from '@/lib/supabase/client'

export async function signInWithGitHub(encodedLaunchData?: string) {
  const supabase = createClient()

  // Always use current origin for redirect so OAuth works on preview deploys too
  // Pass launch data directly in the URL (base64 encoded) so it survives OAuth
  let redirectUrl = `${window.location.origin}/auth/callback`
  if (encodedLaunchData) {
    redirectUrl += `?launch_data=${encodeURIComponent(encodedLaunchData)}`
  }

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
    return { data, error }
  }

  // Manually redirect to the OAuth URL if provided
  if (data?.url) {
    console.log('[Auth] Redirecting to:', data.url)
    window.location.href = data.url
  }

  return { data, error }
}

export async function getSession() {
  const supabase = createClient()

  // First try to get session from local storage/cookies
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return session
  }

  // If no session, try to get user (makes server call, more reliable after OAuth)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (user && !error) {
    // User exists, try to refresh the session
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
    return refreshedSession
  }

  return null
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
