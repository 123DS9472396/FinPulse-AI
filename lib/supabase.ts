import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single instance to avoid multiple clients
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

export const createClientComponentClient = () => {
  return supabaseClient
}

// For server components only - simplified version
export const getServerSupabaseClient = () => {
  return supabaseClient
}

// Alias for compatibility
export const getSupabaseClient = createClientComponentClient

export const supabase = supabaseClient
