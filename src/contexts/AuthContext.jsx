import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Proactively detect recovery callback in the URL and route to /reset-password
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
  const hashHasRecovery = /type=recovery/.test(url.hash || '') && /(access_token|code|token_hash)=/.test(url.hash || '')
  const searchHasRecovery = url.searchParams?.get('type') === 'recovery'
        if (hashHasRecovery || searchHasRecovery) {
          try { window.sessionStorage?.setItem('isPasswordRecovery', '1') } catch (_) {}
          // If we're already on /auth/callback, let that page handle navigation.
          if (url.pathname !== '/reset-password' && url.pathname !== '/auth/callback') {
            // Route through the callback page to centralize logic.
            url.pathname = '/auth/callback'
            window.history.replaceState(window.history.state, '', url.toString())
            try { window.dispatchEvent(new PopStateEvent('popstate')) } catch (_) {}
          }
        } else {
          // No recovery in URL; clear any stale flag on navigation to other pages
          try { window.sessionStorage?.removeItem('isPasswordRecovery') } catch (_) {}
        }
      }
    } catch (_) {}

    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        }
        setLoading(false)
      })

    // Listen for auth changes - NEVER ASYNC callback
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        // Explicitly handle recovery deep-link: ensure user lands on reset page
  if (event === 'PASSWORD_RECOVERY') {
          try {
            if (typeof window !== 'undefined') {
              try { window.sessionStorage?.setItem('isPasswordRecovery', '1') } catch (_) {}
            }
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              if (url.pathname !== '/reset-password') {
                url.pathname = '/reset-password'
                // preserve existing query/hash from Supabase link
    window.history.replaceState(window.history.state, '', url.toString())
    try { window.dispatchEvent(new PopStateEvent('popstate')) } catch (_) {}
              }
            }
          } catch (_) {}
        }
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)  // Fire-and-forget, NO AWAIT
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()

      if (error) {
        if (error?.code !== 'PGRST116') { // Not found error is expected for new users
          setAuthError(error?.message)
        }
        return
      }

      setUserProfile(data)
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        setAuthError('Cannot connect to database. Please check your Supabase configuration.')
        return
      }
      setAuthError('Failed to load user profile')
      console.error('Profile fetch error:', error)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setAuthError('')
      setLoading(true)

      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || '',
            display_name: userData?.displayName || '',
            language: userData?.language || 'fr'
          }
        }
      })

      if (error) {
        setAuthError(error?.message)
        return { success: false, error: error?.message }
      }

      return { success: true, data }
    } catch (error) {
      const errorMessage = error?.message?.includes('Failed to fetch') 
        ? 'Cannot connect to authentication service. Please check your internet connection.' :'Failed to create account'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setAuthError('')
      setLoading(true)

      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) {
        setAuthError(error?.message)
        return { success: false, error: error?.message }
      }

      return { success: true, data }
    } catch (error) {
      const errorMessage = error?.message?.includes('Failed to fetch') 
        ? 'Cannot connect to authentication service. Your Supabase project may be paused.' :'Failed to sign in'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setAuthError('')
      const { error } = await supabase?.auth?.signOut()
      
      if (error) {
        setAuthError(error?.message)
        return { success: false, error: error?.message }
      }

      setUser(null)
      setUserProfile(null)
      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to sign out'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setAuthError('')
      
      if (!user?.id) {
        throw new Error('No authenticated user')
      }

      // Only persist known columns to avoid PostgREST errors
      const allowed = [
        'email',
        'full_name',
        'display_name',
        'date_of_birth',
        'timezone',
        'language',
        'phone_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'preferred_therapist_id',
        'is_active',
        // profile_completion_percentage is set by DB trigger; don't write directly
      ]
      const sanitized = Object.fromEntries(
        Object.entries(profileData || {}).filter(([k]) => allowed.includes(k))
      )

      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...sanitized,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id)?.select()?.single()

      if (error) {
        setAuthError(error?.message)
        return { success: false, error: error?.message }
      }

      setUserProfile(data)
      return { success: true, data }
    } catch (error) {
      const errorMessage = error?.message?.includes('Failed to fetch')
        ? 'Cannot connect to database. Please check your connection.' :'Failed to update profile'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update auth.user metadata (e.g., avatar_url, preferences not stored in user_profiles)
  const setUserMetadata = async (metadata = {}) => {
    try {
      if (!user) return { success: false, error: 'Not authenticated' }
      const { data, error } = await supabase?.auth?.updateUser({ data: metadata })
      if (error) return { success: false, error: error?.message }
      // Merge latest user metadata locally
      if (data?.user) setUser(data.user)
      return { success: true, data }
    } catch (e) {
      return { success: false, error: 'Failed to update profile settings' }
    }
  }

  // Send a new confirmation email to a user who signed up but didn't confirm
  const resendEmailConfirmation = async (email) => {
    if (!email) return { success: false, error: 'Email is required' }
    try {
      const { error } = await supabase?.auth?.resend({ type: 'signup', email })
      if (error) return { success: false, error: error?.message }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to resend confirmation email' }
    }
  }

  // Request a password reset email; user will follow link to set new password
  const requestPasswordReset = async (email, redirectTo) => {
    if (!email) return { success: false, error: 'Email is required' }
    try {
  const envRedirect = import.meta?.env?.VITE_AUTH_REDIRECT_URL
  const defaultCallback = new URL('/auth/callback', window?.location?.origin).toString()
  const raw = (redirectTo || envRedirect || defaultCallback).toString().trim()
      let redirectAbs
      if (raw) {
        redirectAbs = /^https?:\/\//i.test(raw)
          ? raw
          : new URL(raw, window?.location?.origin).toString()
        // Ensure we mark this as a recovery flow for the callback page
        try {
          const u = new URL(redirectAbs)
          if (!u.searchParams.get('flow')) {
            u.searchParams.set('flow', 'recovery')
            redirectAbs = u.toString()
          }
        } catch (_) {}
        console.debug('[auth] Using redirectTo:', redirectAbs)
      } else {
        console.debug('[auth] No redirectTo provided; falling back to Supabase Site URL')
      }

      const { error } = await supabase?.auth?.resetPasswordForEmail(
        email,
        redirectAbs ? { redirectTo: redirectAbs } : undefined
      )
      if (error) return { success: false, error: error?.message }
      return { success: true }
    } catch (error) {
      console.error('[auth] requestPasswordReset error', error)
      return { success: false, error: 'Failed to request password reset' }
    }
  }

  // Complete password update after following the Supabase email link
  const updatePassword = async (newPassword) => {
    if (!newPassword) return { success: false, error: 'Password is required' }
    try {
      const { error } = await supabase?.auth?.updateUser({ password: newPassword })
      if (error) return { success: false, error: error?.message }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update password' }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
  setUserMetadata,
  resendEmailConfirmation,
  requestPasswordReset,
  updatePassword,
    clearError: () => setAuthError('')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}