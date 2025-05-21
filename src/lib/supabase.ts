import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
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

  const { data, error } = await supabase.auth.updateUser(updateData)

  if (error) {
    throw error
  }

  return data
}

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  // Note: Supabase doesn't have a direct "change password" with old password verification
  // In a real app, you might want to verify the old password first

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Logs out the current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error during logout:', error);
    throw error;
  }

  return { success: true };
}