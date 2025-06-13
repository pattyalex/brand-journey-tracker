import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhpngznnnulxvggddpgq.supabase.com';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG5nem5ubnVseHZnZ2RkcGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODMxMDgsImV4cCI6MjA2MzM1OTEwOH0.4F6EZcxQI4iwEhykTo-YesNy_Hmb_qCKiv_-ZUWKZdc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Auth helper functions with better error handling
export const signUpUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  } catch (err) {
    console.error('SignUp error:', err)
    return { data: null, error: { message: 'Network error during signup' } }
  }
}

export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (err) {
    console.error('SignIn error:', err)
    return { data: null, error: { message: 'Network error during signin' } }
  }
}

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    console.error('SignOut error:', err)
    return { error: { message: 'Network error during signout' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  } catch (err) {
    console.error('GetUser error:', err)
    return { user: null, error: { message: 'Network error getting user' } }
  }
}

export const updateUserProfile = async (userMetadata: { full_name?: string; email?: string }) => {
  let updateData: any = {}

  // Update user metadata (for name)
  if (userMetadata.full_name !== undefined) {
    updateData.data = { full_name: userMetadata.full_name }
  }

  // Update email if provided
  if (userMetadata.email !== undefined) {
    updateData.email = userMetadata.email
  }

  try {
    const { data, error } = await supabase.auth.updateUser(updateData)

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error('UpdateProfile error:', err)
    throw err
  }
}

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error('UpdatePassword error:', err)
    throw err
  }
}

/**
 * Logs out the current user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during logout:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Logout error:', err)
    throw err
  }
}