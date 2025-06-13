import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  console.log(`Signing up with email: ${email}`);
  console.log(`Using password: ${password.substring(0, 2)}${'*'.repeat(password.length - 2)}`);
  console.log(`Full name: ${fullName}`);
  console.log(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
  
  // Step 1: Sign the user up with Supabase Auth
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      console.error('Signup failed:', error);
      console.error('Error message:', error.message);
      console.error('Status code:', error.status);
      return { error }
    }
    
    console.log('Signup success data:', JSON.stringify(data, null, 2));
    console.log('User ID:', data.user?.id);

    if (!data.user?.id) {
      console.error('No user ID returned from signup');
      return { error: { message: 'No user ID returned from signup' } };
    }

  const userId = data.user.id;

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

    console.log('Profile created successfully for user:', userId);
    return { success: true, email: email, user: data.user }
    
  } catch (err) {
    console.error('Unexpected error during signup:', err);
    return { error: err instanceof Error ? { message: err.message } : { message: 'Unknown error' } };
  }
}
