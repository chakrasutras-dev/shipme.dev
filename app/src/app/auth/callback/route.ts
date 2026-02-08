import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Exchange the code on the server using the standard Supabase SSR pattern
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Callback] Exchange error:', error)
      return NextResponse.redirect(new URL('/?error=auth_failed', origin))
    }

    // Store GitHub provider token
    if (data?.session?.provider_token) {
      const cookieStore = await cookies()
      cookieStore.set('github_provider_token', data.session.provider_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }
  }

  return NextResponse.redirect(new URL('/?launch=pending', origin))
}
