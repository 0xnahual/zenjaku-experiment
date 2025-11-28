import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

// Public client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Gets a Supabase Admin client.
 * 
 * Even though Supabase marks the key as "legacy" in the dashboard, it is still THE standard way 
 * to perform server-side admin operations (bypassing RLS) in a Node.js environment.
 * 
 * The "new" way they push is often "Publishable Keys" combined with row-level security, 
 * but for a background sync job that needs to write to a table, the Service Role Key 
 * is still the correct and supported tool.
 * 
 * If the user is referring to "Disable legacy API keys", that usually refers to moving to 
 * JWT-less flows or using the Management API, but for data operations, `service_role` is standard.
 * 
 * HOWEVER, if we really want to avoid the service role key because of specific project settings,
 * we would need to sign a JWT or use a specific user session, which is much more complex for a cron job.
 * 
 * Let's stick with service_role but ensure we are using the latest supabase-js client options.
 */
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
