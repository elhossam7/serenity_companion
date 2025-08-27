import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// During tests or misconfigured local env, avoid crashing at import-time.
function createSafeMock() {
  const noop = () => {};
  const resolved = (data = null, error = new Error('Supabase not configured')) => Promise.resolve({ data, error });
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: noop } } }),
      signInWithPassword: () => resolved(),
      signUp: () => resolved(),
      signOut: () => resolved(),
      updateUser: () => resolved(),
      resend: () => resolved(),
      resetPasswordForEmail: () => resolved(),
    },
    from: () => ({
      select: () => resolved(),
      insert: () => resolved(),
      update: () => resolved(),
      delete: () => resolved(),
      eq: function () { return this; },
      gte: function () { return this; },
      lte: function () { return this; },
      contains: function () { return this; },
      limit: function () { return this; },
      order: function () { return this; },
      single: () => resolved(),
    }),
    rpc: () => resolved(),
  };
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: true, persistSession: true } })
  : (() => {
      if (typeof console !== 'undefined') {
        console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using safe mock client.');
      }
      return createSafeMock();
    })();
