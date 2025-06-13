
import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${fullName}`);
  
  try {
    // Step 1: Sign the user up with Supabase Auth
    console.log('Step 1: Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      throw new Error(`Auth signup failed: ${authError.message}`);
    }

    if (!authData.user?.id) {
      console.error('❌ No user ID returned from signup');
      throw new Error('No user ID returned from signup');
    }

    const userId = authData.user.id;
    console.log('✅ Supabase Auth user created successfully:', userId);

    // Wait a moment for the auth state to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Insert into users table
    console.log('Step 2: Creating user record...');
    const { error: usersInsertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email
      }]);

    if (usersInsertError) {
      console.error('❌ Users table insert failed:', usersInsertError);
      throw new Error(`Failed to create user record: ${usersInsertError.message}`);
    }

    console.log('✅ User record created successfully');

    // Step 3: Insert into profiles table
    console.log('Step 3: Creating user profile...');
    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        email: email,
        is_on_trial: true,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }]);

    if (profileInsertError) {
      console.error('❌ Profile insert failed:', profileInsertError);
      throw new Error(`Failed to create user profile: ${profileInsertError.message}`);
    }

    console.log('✅ Profile created successfully');
    console.log('=== SIGNUP PROCESS COMPLETE ===');

    return { 
      success: true, 
      email: email, 
      user: authData.user,
      userId: userId
    };
    
  } catch (error) {
    console.error('❌ Signup process failed:', error);
    
    // Return structured error response
    return { 
      error: {
        message: error instanceof Error ? error.message : 'Unknown error during signup'
      }
    };
  }
}
