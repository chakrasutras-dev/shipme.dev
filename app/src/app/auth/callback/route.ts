import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[Callback] OAuth callback', { hasCode: !!code, origin })

  // Always redirect to /?launch=pending after OAuth
  // The launch data is stored in localStorage on the client (same origin)
  const redirectUrl = new URL('/?launch=pending', origin)
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
    // Create Supabase client that sets cookies on the redirect response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')
              ? request.headers.get('cookie')!.split('; ').map(c => {
                  const [name, ...rest] = c.split('=')
                  return { name, value: rest.join('=') }
                })
              : []
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Callback] Exchange error:', error)
      return NextResponse.redirect(new URL('/?error=auth_failed', origin))
    }

    console.log('[Callback] Session OK, user:', data?.session?.user?.email)

    if (data?.session?.provider_token) {
      response.cookies.set('github_provider_token', data.session.provider_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }
  }

  return response
}
