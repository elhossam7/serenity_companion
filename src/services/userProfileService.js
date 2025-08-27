import { supabase } from '../lib/supabase'

// Helper to get current user's profile and auth metadata
export async function getCurrentUserProfile() {
  const { data: { session } } = await supabase?.auth?.getSession()
  const uid = session?.user?.id
  if (!uid) return { user: null, profile: null }
  const { data: profile } = await supabase?.from('user_profiles')?.select('*')?.eq('id', uid)?.single()
  return { user: session.user, profile }
}

// Persist allowed columns in user_profiles
export async function updateUserProfileColumns(payload = {}) {
  const { data: { session } } = await supabase?.auth?.getSession()
  const uid = session?.user?.id
  if (!uid) throw new Error('Not authenticated')
  const allowed = [
    'email','full_name','display_name','date_of_birth','timezone','language','phone_number','emergency_contact_name','emergency_contact_phone','preferred_therapist_id','is_active'
  ]
  const sanitized = Object.fromEntries(Object.entries(payload).filter(([k]) => allowed.includes(k)))
  const { data, error } = await supabase?.from('user_profiles')?.update({ ...sanitized, updated_at: new Date().toISOString() })?.eq('id', uid)?.select()?.single()
  if (error) throw error
  return data
}

// Store non-DB preferences in auth metadata safely
export async function updateAuthPreferences(prefs = {}) {
  const { data, error } = await supabase?.auth?.updateUser({ data: prefs })
  if (error) throw error
  return data?.user?.user_metadata || {}
}
