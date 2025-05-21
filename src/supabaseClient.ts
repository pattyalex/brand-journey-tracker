
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log initialization details (for debugging)
console.log("=== SUPABASE CLIENT INITIALIZATION ===");
console.log("Supabase URL exists:", !!supabaseUrl);
console.log("Supabase Anon Key exists:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("URL empty:", !supabaseUrl);
  console.error("Key empty:", !supabaseAnonKey);
}

// Create Supabase client with error handling
try {
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log("Supabase client created successfully");
  export { supabase }
} catch (error) {
  console.error("Error creating Supabase client:", error);
  // Create a dummy client to prevent app crashes
  const dummyClient = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase client initialization failed" } }),
      // Add other methods as needed
    },
    from: () => ({
      insert: () => Promise.resolve({ error: { message: "Supabase client initialization failed" } }),
      // Add other methods as needed
    }),
  };
  export const supabase = dummyClient as any;
}
