import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials for reliable deployment
const supabaseUrl = 'https://kklqnpbckomxdglkjdlv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbHFucGJja29teGRnbGtqZGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDk4MjEsImV4cCI6MjA4MTAyNTgyMX0.nGnMNXjiFmxzDGzgJvvpgwG1V9TASz8Dn0cws0gyE4U'

// Supabase is always configured now
export const isSupabaseConfigured = () => true

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
