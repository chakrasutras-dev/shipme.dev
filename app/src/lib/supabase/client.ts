import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    })
  }

  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
    {
      auth: {
        flowType: 'pkce',
        // IMPORTANT: Disable auto-detection of auth codes in URLs.
        // The /auth/callback page handles code exchange explicitly.
        // Without this, the singleton client auto-exchanges the code
        // when any module imports it on the callback page, consuming
        // the code before the callback page can use it.
        detectSessionInUrl: false,
      },
    }
  )
}
