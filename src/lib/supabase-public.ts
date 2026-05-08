import { createClient } from '@supabase/supabase-js'

// Plain anon client for reading public data in server components.
// Has NO cookie dependency → Next.js can cache/ISR these pages.
// Do NOT use for anything that needs a user session.
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
