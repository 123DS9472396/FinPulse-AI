import { supabase } from "./supabase"

export const getSupabaseBrowser = () => {
  return supabase
}

export const handleAuthError = (error: any) => {
  console.error('Supabase auth error:', error)
  return {
    error: error.message || 'Authentication error occurred',
    user: null
  }
}
