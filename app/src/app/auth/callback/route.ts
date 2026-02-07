import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Check for launch data in URL params (passed through OAuth)
  const shipmeLaunchData = requestUrl.searchParams.get('shipme_data')

  console.log('[Callback] Processing OAuth callback', {
    hasCode: !!code,
    origin,
    hasLaunchData: !!shipmeLaunchData
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

    // Also store launch data in a cookie if present (to survive redirects)
    if (shipmeLaunchData) {
      const cookieStore = await cookies()
      cookieStore.set('pendingCodespaceLaunch', shipmeLaunchData, {
        httpOnly: false, // Needs to be readable by client JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/'
      })
      console.log('[Callback] Stored launch data in cookie')
    }

    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  // Add launch=pending parameter to trigger launch resumption
  // Also pass launch data in URL hash as backup
  let redirectUrl = `${origin}/?launch=pending`
  if (shipmeLaunchData) {
    redirectUrl += `#shipme_data=${encodeURIComponent(shipmeLaunchData)}`
  }

  console.log('[Callback] Redirecting to:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}
