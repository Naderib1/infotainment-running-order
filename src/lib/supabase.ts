import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '' && supabaseUrl.startsWith('http')
}

// Only create client if configured, otherwise create a dummy that won't be used
let supabaseClient: SupabaseClient | null = null

if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  } catch (e) {
    console.warn('Failed to create Supabase client:', e)
    supabaseClient = null
  }
}

// Export a safe getter
export const supabase = supabaseClient as SupabaseClient
