import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const getSupabaseServer = () => {
  const cookieStore = cookies()
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'sb-auth-token',
    },
  })
}
