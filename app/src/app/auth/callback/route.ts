import { NextResponse } from 'next/server'

// Redirect to client-side callback page which handles the code exchange
// This is more reliable than server-side exchange because the browser
// Supabase client manages its own session storage
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[Callback] Redirecting to client-side handler', { hasCode: !!code })

  // Pass the code to the client-side page for exchange
  if (code) {
    return NextResponse.redirect(new URL(`/auth/callback/exchange?code=${code}`, origin))
  }

  return NextResponse.redirect(new URL('/?error=no_code', origin))
}
