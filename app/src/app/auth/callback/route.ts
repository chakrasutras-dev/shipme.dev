import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const launchData = requestUrl.searchParams.get('launch_data')
  const origin = requestUrl.origin

  console.log('[Callback] Processing OAuth callback', {
    hasCode: !!code,
    hasLaunchData: !!launchData,
    origin
  })

  // Build the redirect URL - pass launch data through
  let redirectPath = '/'
  const params = new URLSearchParams()
  if (launchData) {
    params.set('launch', 'pending')
    params.set('launch_data', launchData)
  }
  const queryString = params.toString()
  if (queryString) {
    redirectPath += `?${queryString}`
  }

  const redirectUrl = new URL(redirectPath, origin)

  // Create the redirect response FIRST so we can set cookies on it
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
    // Create a Supabase client that sets cookies directly on the redirect response
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
      console.error('[Callback] OAuth exchange error:', error)
      return NextResponse.redirect(new URL(`/?error=auth_failed`, origin))
    }

    console.log('[Callback] Session established, user:', data?.session?.user?.email)

    // Store the GitHub provider token if available
    if (data?.session?.provider_token) {
      response.cookies.set('github_provider_token', data.session.provider_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
      console.log('[Callback] Stored GitHub provider token in cookie')
    }
  }

  console.log('[Callback] Redirecting to:', redirectUrl.toString())
  return response
}
