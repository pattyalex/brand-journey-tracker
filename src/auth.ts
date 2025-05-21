import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  // Generate a random email if not provided
  const randomEmail = `test-${Date.now()}@example.com`;
  const emailToUse = email === "test@example.com" ? randomEmail : email;
  
  console.log(`Signing up with email: ${emailToUse}`);
  
  // Step 1: Sign the user up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: emailToUse,
    password
  })

  if (error) {
    console.error('Signup failed:', error.message)
    return { error }
  }

  const userId = data.user?.id

  // Step 2: Insert the profile into your profiles table
  const { error: insertError } = await supabase.from('profiles').insert([
    {
      id: userId,
      full_name: fullName,
      is_on_trial: true,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  ])

  if (insertError) {
    console.error('Profile insert failed:', insertError.message)
    return { error: insertError }
  }

  return { success: true, email: emailToUse }
}
