
import { createClient } from '@supabase/supabase-js';

// Get environment variables - no fallbacks for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('Raw VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Raw VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Resolved supabaseUrl:', supabaseUrl);
console.log('Resolved supabaseAnonKey (first 20 chars):', supabaseAnonKey?.substring(0, 20));
console.log('supabaseUrl type:', typeof supabaseUrl);
console.log('supabaseAnonKey type:', typeof supabaseAnonKey);

// Validate URL format
if (supabaseUrl && !supabaseUrl.endsWith('.co')) {
  console.error('❌ INVALID SUPABASE URL - Missing .co domain suffix!');
  console.error('Current URL:', supabaseUrl);
  console.error('Expected format: https://[project-id].supabase.co');
}

// Test URL reachability
console.log('Testing Supabase URL reachability...');
fetch(supabaseUrl + '/rest/v1/')
  .then(response => {
    console.log('✅ Supabase URL is reachable, status:', response.status);
  })
  .catch(error => {
    console.error('❌ Supabase URL is not reachable:', error.message);
  });

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
      detectSessionInUrl: true
    }
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ SUPABASE CLIENT CREATION ERROR:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  throw error;
}

// Enhanced global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  // Remove any existing handlers first
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  
  function handleUnhandledRejection(event) {
    console.error('=== UNHANDLED PROMISE REJECTION CAUGHT ===');
    console.error('Event:', event);
    console.error('Reason:', event.reason);
    console.error('Promise:', event.promise);
    
    // Check if it's a Supabase-related error
    if (event.reason && typeof event.reason === 'object') {
      if (event.reason.message) {
        console.error('Error message:', event.reason.message);
        
        if (event.reason.message.toLowerCase().includes('supabase') || 
            event.reason.message.toLowerCase().includes('postgrest') ||
            event.reason.message.toLowerCase().includes('auth')) {
          console.error('🔍 This appears to be a Supabase-related error');
          console.error('Supabase error details:', {
            message: event.reason.message,
            details: event.reason.details,
            hint: event.reason.hint,
            code: event.reason.code,
            status: event.reason.status
          });
        }
      }
      
      // Log the full error object
      try {
        console.error('Full error object:', JSON.stringify(event.reason, null, 2));
      } catch (stringifyError) {
        console.error('Could not stringify error object:', event.reason);
      }
    }
    
    // Prevent the default behavior but don't stop propagation completely
    // This allows us to see the error while preventing browser console spam
    event.preventDefault();
  }
  
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  console.log('✅ Enhanced unhandled rejection handler installed');
}

export { supabase };
