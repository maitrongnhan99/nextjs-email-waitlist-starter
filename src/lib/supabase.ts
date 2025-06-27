import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client if environment variables are not set (for build purposes)
export const supabase = (supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase_url_here') && 
  !supabaseAnonKey.includes('your_supabase_anon_key_here'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types for the waitlist table
export type WaitlistEntry = {
  id: string
  email: string
  first_name?: string
  subscribed_at: string
  convertkit_subscriber_id?: string
  source: string
  created_at: string
  updated_at: string
}

// Types for the feature_requests table
export type FeatureRequest = {
  id: string
  email: string
  feature_request: string
  created_at: string
  updated_at: string
}