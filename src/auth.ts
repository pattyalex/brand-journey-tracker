import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  // Generate a random email using crypto.randomUUID
  const randomEmail = `user-${crypto.randomUUID()}@example.com`;
  const emailToUse = email === "test@example.com" ? randomEmail : email;
  
  console.log(`Signing up with email: ${emailToUse}`);
  console.log(`Using password: ${password.substring(0, 2)}${'*'.repeat(password.length - 2)}`);
  console.log(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
  
  // Step 1: Sign the user up with Supabase Auth
  try {
    const { data, error } = await supabase.auth.signUp({
      email: emailToUse,
      password
    })

    if (error) {
      console.error('Signup failed:', error);
      console.error('Error message:', error.message);
      console.error('Status code:', error.status);
      return { error }
    }
    
    console.log('Signup success data:', JSON.stringify(data, null, 2));
    console.log('User ID:', data.user?.id);
  } catch (err) {
    console.error('Unexpected error during signup:', err);
    return { error: err instanceof Error ? { message: err.message } : { message: 'Unknown error' } };
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
