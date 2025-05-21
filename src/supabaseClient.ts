import { createClient } from '@supabase/supabase-js';

// Fallback values in case environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a mock client that won't throw errors
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null })
    },
    from: () => ({
      insert: async () => ({ error: { message: "Supabase not configured" } })
    })
  };
}

export { supabase };