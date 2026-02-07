import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const launchToken = requestUrl.searchParams.get('launch_token')
  const origin = requestUrl.origin

  console.log('[Callback] Processing OAuth callback', {
    hasCode: !!code,
    hasLaunchToken: !!launchToken,
    origin
  })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Capture the provider token from the OAuth response
    // This is only available immediately after code exchange
    if (data?.session?.provider_token) {
      const cookieStore = await cookies()
      // Store provider token in a secure HTTP-only cookie
      cookieStore.set('github_provider_token', data.session.provider_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
      console.log('[Callback] Stored GitHub provider token in cookie')
    }

    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  // Pass the launch token through so the frontend can retrieve the launch data
  let redirectUrl = `${origin}/?launch=pending`
  if (launchToken) {
    redirectUrl += `&launch_token=${launchToken}`
  }

  console.log('[Callback] Redirecting to:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}
