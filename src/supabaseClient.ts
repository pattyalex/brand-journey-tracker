
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

// Log client creation attempt
console.log("Attempting to create Supabase client");

// Create a variable to hold our client
let supabase;

try {
  // Create Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client created successfully");
} catch (error) {
  console.error("Error creating Supabase client:", error);
  // Create a dummy client to prevent app crashes
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase client initialization failed" } }),
      // Add other methods as needed
    },
    from: () => ({
      insert: () => Promise.resolve({ error: { message: "Supabase client initialization failed" } }),
      // Add other methods as needed
    }),
  } as any;
}

// Export the client
export { supabase };
