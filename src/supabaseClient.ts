
import { createClient } from '@supabase/supabase-js';

// Read from environment variables - check both VITE_ prefixed and non-prefixed
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  '';

let supabase;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully");
  } else {
    console.warn("Supabase credentials missing - creating fallback client");
    // Create a mock client that won't throw errors
    supabase = {
      auth: {
        signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        updateUser: async () => ({ data: null, error: { message: "Supabase not configured" } })
      },
      from: () => ({
        insert: async () => ({ error: { message: "Supabase not configured" } }),
        select: async () => ({ data: [], error: null }),
        update: async () => ({ error: { message: "Supabase not configured" } }),
        delete: async () => ({ error: { message: "Supabase not configured" } })
      })
    };
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a mock client that won't throw errors
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: { message: "Supabase initialization failed" } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase initialization failed" } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: null, error: { message: "Supabase initialization failed" } })
    },
    from: () => ({
      insert: async () => ({ error: { message: "Supabase initialization failed" } }),
      select: async () => ({ data: [], error: null }),
      update: async () => ({ error: { message: "Supabase initialization failed" } }),
      delete: async () => ({ error: { message: "Supabase initialization failed" } })
    })
  };
}

export { supabase };
