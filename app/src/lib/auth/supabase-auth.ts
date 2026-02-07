import { createClient } from '@/lib/supabase/client'

export async function signInWithGitHub(launchData?: any) {
  const supabase = createClient()

  // Always use current origin for redirect so OAuth works on preview deploys too
  const redirectUrl = `${window.location.origin}/auth/callback`

  console.log('[Auth] Starting GitHub OAuth, redirect URL:', redirectUrl)

  // Encode launch data in the OAuth state to survive cross-origin redirects
  const stateData = launchData ? {
    launchData: JSON.stringify(launchData),
    origin: window.location.origin
  } : undefined

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
      scopes: 'repo read:user',
      queryParams: stateData ? {
        shipme_launch_data: btoa(JSON.stringify(stateData))
      } : undefined
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
    // Append our launch data to the URL if we have it (as backup)
    if (launchData) {
      const url = new URL(data.url)
      url.searchParams.set('shipme_data', btoa(JSON.stringify(launchData)))
      console.log('[Auth] Enhanced URL with launch data')
      window.location.href = url.toString()
    } else {
      window.location.href = data.url
    }
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
