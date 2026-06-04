import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable live authentication and database persistence.'
  )
}

// Create a real Supabase client if configured, otherwise provide a fallback mock client that lets the UI render gracefully
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({
          data: { user: null },
          error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
        }),
        signUp: async () => ({
          data: { user: null },
          error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
        }),
        signOut: async () => ({ error: null }),
      },
      from: (table) => {
        const queryBuilder = {
          select: (columns = '*') => queryBuilder,
          insert: (values) => Promise.resolve({ data: null, error: new Error('Supabase not configured.') }),
          update: (values) => queryBuilder,
          delete: () => queryBuilder,
          eq: (column, value) => queryBuilder,
          order: (column, options) => queryBuilder,
          limit: (count) => queryBuilder,
          match: (queryObj) => queryBuilder,
          then: (onfulfilled) => {
            // Return empty arrays or nulls for database fallbacks
            return Promise.resolve(onfulfilled({ data: [], error: null }))
          }
        }
        return queryBuilder
      },
      storage: {
        from: (bucket) => ({
          upload: async (path, file) => ({
            data: null,
            error: new Error('Supabase is not configured.')
          }),
          getPublicUrl: (path) => ({
            data: { publicUrl: '' }
          })
        })
      }
    }
