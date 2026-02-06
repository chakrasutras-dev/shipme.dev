import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

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
    }

    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  // Add launch=pending parameter to trigger launch resumption
  return NextResponse.redirect(`${origin}/?launch=pending`)
}
