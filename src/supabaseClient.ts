import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhpngznnnulxvggddpgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG5nem5ubnVseHZnZ2RkcGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODMxMDgsImV4cCI6MjA2MzM1OTEwOH0.4F6EZcxQI4iwEhykTo-YesNy_Hmb_qCKiv_-ZUWKZdc';

console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('Raw VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Raw VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Resolved supabaseUrl:', supabaseUrl);
console.log('Resolved supabaseAnonKey (first 20 chars):', supabaseAnonKey?.substring(0, 20));
console.log('supabaseUrl type:', typeof supabaseUrl);
console.log('supabaseAnonKey type:', typeof supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

let supabase;
try {
  console.log('=== CREATING SUPABASE CLIENT ===');
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ SUPABASE CLIENT CREATION ERROR:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  throw error;
}

// Add global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('=== UNHANDLED PROMISE REJECTION ===');
    console.error('Reason:', event.reason);
    console.error('Promise:', event.promise);
    
    // Check if it's a Supabase-related error
    if (event.reason && typeof event.reason === 'object') {
      if (event.reason.message && event.reason.message.includes('supabase')) {
        console.error('This appears to be a Supabase-related error');
      }
    }
    
    // Prevent the default behavior (which logs to console)
    event.preventDefault();
  });
}

export { supabase };