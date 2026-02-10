import { createClient } from '@supabase/supabase-js'

// Service-role client bypasses RLS — use only in server-side API routes
// that need to access tables without user authentication (e.g., token redemption
// called from a Codespace that has no ShipMe session)
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
