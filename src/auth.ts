
import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string, fullName: string) {
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${fullName}`);
  
  try {
    // Step 1: Sign the user up with Supabase Auth
    console.log('Step 1: Creating Supabase Auth user...');
    
    // Test direct fetch to Supabase auth endpoint first
    const authUrl = `${supabase.supabaseUrl}/auth/v1/signup`;
    console.log('Testing direct auth endpoint:', authUrl);
    
    try {
      const testResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          email: email,
          password: password,
          data: { full_name: fullName }
        })
      });
      console.log('Direct fetch test response status:', testResponse.status);
      console.log('Direct fetch test response headers:', Object.fromEntries(testResponse.headers.entries()));
    } catch (fetchError) {
      console.error('Direct fetch test failed:', fetchError);
    }
    
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
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        statusCode: authError.status
      });
      throw new Error(`Auth signup failed: ${authError.message}`);
    }

    if (!authData.user?.id) {
      console.error('❌ No user ID returned from signup');
      throw new Error('No user ID returned from signup');
    }

    const userId = authData.user.id;
    console.log('✅ Supabase Auth user created successfully:', userId);

    // Wait for auth state to settle
    console.log('Waiting for auth state to settle...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify we're authenticated before proceeding
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      console.error('❌ Auth session not established:', sessionError);
      throw new Error('Authentication session not established');
    }
    console.log('✅ Auth session confirmed for user:', user.id);

    // Step 2: Insert into users table
    console.log('Step 2: Creating user record in users table...');
    const { data: userData, error: usersInsertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email
      }])
      .select();

    if (usersInsertError) {
      console.error('❌ Users table insert failed:', usersInsertError);
      console.error('Users insert error details:', {
        message: usersInsertError.message,
        details: usersInsertError.details,
        hint: usersInsertError.hint,
        code: usersInsertError.code
      });
      throw new Error(`Failed to create user record: ${usersInsertError.message}`);
    }

    console.log('✅ User record created successfully:', userData);

    // Step 3: Insert into profiles table
    console.log('Step 3: Creating user profile...');
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { data: profileData, error: profileInsertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        email: email,
        is_on_trial: true,
        trial_ends_at: trialEndDate.toISOString()
      }])
      .select();

    if (profileInsertError) {
      console.error('❌ Profile insert failed:', profileInsertError);
      console.error('Profile insert error details:', {
        message: profileInsertError.message,
        details: profileInsertError.details,
        hint: profileInsertError.hint,
        code: profileInsertError.code
      });
      throw new Error(`Failed to create user profile: ${profileInsertError.message}`);
    }

    console.log('✅ Profile created successfully:', profileData);
    console.log('=== SIGNUP PROCESS COMPLETE ===');

    return { 
      success: true, 
      email: email, 
      user: authData.user,
      userId: userId,
      userData: userData,
      profileData: profileData
    };
    
  } catch (error) {
    console.error('❌ Signup process failed:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return structured error response
    return { 
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error during signup',
        type: 'SIGNUP_ERROR'
      }
    };
  }
}
