import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      return { 
        success: false, 
        error: { message: 'Email, password, and full name are required' } 
      };
    }

    // Step 1: Sign the user up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Signup failed:', error.message);
      return { success: false, error };
    }

    const userId = data.user?.id;
    
    if (!userId) {
      return { 
        success: false, 
        error: { message: 'User creation failed - no user ID returned' } 
      };
    }

    // Step 2: Insert the profile into your profiles table
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        full_name: fullName,
        is_on_trial: true,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    ]);

    if (insertError) {
      console.error('Profile insert failed:', insertError.message);
      return { success: false, error: insertError };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred during signup' } 
    };
  }
}
