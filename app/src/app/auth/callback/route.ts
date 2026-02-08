import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // On Netlify, request.url may show the internal Netlify URL, not the custom domain.
  // Use x-forwarded-host header to get the real origin.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : requestUrl.origin

  console.log('[Callback] OAuth callback', { hasCode: !!code, origin, forwardedHost })

  if (code) {
    // Create the redirect response FIRST, then create Supabase client
    // that writes cookies directly onto this response.
    // This is the Supabase-recommended pattern for Route Handlers.
    const redirectResponse = NextResponse.redirect(new URL('/?launch=pending', origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options)
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

    console.log('[Callback] Session established for:', data.session?.user?.email)

    // Store GitHub provider token as a cookie on the redirect response
    if (data.session?.provider_token) {
      redirectResponse.cookies.set('github_provider_token', data.session.provider_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }

    return redirectResponse
  }

  return NextResponse.redirect(new URL('/?launch=pending', origin))
}
