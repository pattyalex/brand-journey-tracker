
import { supabase } from './supabaseClient'

export async function signUpWithRetry(
  email: string, 
  password: string, 
  fullName: string, 
  maxRetries: number = 3,
  onRetryStatus?: (status: { isWaiting: boolean; secondsRemaining?: number; message?: string }) => void
) {
  console.log(`=== STARTING SIGNUP WITH RETRY (max ${maxRetries} attempts) ===`);
  console.log(`Target email: ${email}`);
  console.log(`Target name: ${fullName}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n=== SIGNUP ATTEMPT ${attempt}/${maxRetries} ===`);
    console.log(`Attempt started at: ${new Date().toISOString()}`);
    
    const result = await signUp(email, password, fullName);
    
    console.log(`Attempt ${attempt} completed at: ${new Date().toISOString()}`);
    console.log(`Attempt ${attempt} result:`, {
      success: result.success,
      errorMessage: result.error?.message,
      errorType: result.error?.type
    });
    
    if (result.success) {
      console.log(`✅ Signup successful on attempt ${attempt}`);
      console.log(`Final success result:`, result);
      onRetryStatus?.({ isWaiting: false, message: 'Signup successful!' });
      return result;
    }
    
    // Enhanced rate limit detection
    const errorMessage = result.error?.message?.toLowerCase() || '';
    const errorCode = (result.error as any)?.code || '';
    const isRateLimited = errorMessage.includes('can only request this after') || 
                         errorMessage.includes('rate limit') ||
                         errorMessage.includes('for security purposes') ||
                         errorMessage.includes('over_email_send_rate_limit') ||
                         errorCode === 'over_email_send_rate_limit' ||
                         errorCode === '429' ||
                         (result.error as any)?.status === 429;
    
    console.log(`Rate limit check for attempt ${attempt}:`, {
      errorMessage: result.error?.message,
      errorCode: (result.error as any)?.code,
      isRateLimited: isRateLimited
    });
    
    if (!isRateLimited) {
      console.log(`❌ Non-rate-limit error on attempt ${attempt}, not retrying`);
      console.log(`Error details:`, result.error);
      onRetryStatus?.({ isWaiting: false, message: `Error: ${result.error?.message}` });
      return result;
    }
    
    if (attempt < maxRetries) {
      const waitTime = 61; // Slightly longer than 60 seconds to be safe
      console.log(`⏳ Rate limited on attempt ${attempt}/${maxRetries}`);
      console.log(`Rate limit error message: "${result.error?.message}"`);
      console.log(`Waiting ${waitTime} seconds before retry...`);
      console.log(`Wait started at: ${new Date().toISOString()}`);
      
      // Update UI with countdown
      onRetryStatus?.({ 
        isWaiting: true, 
        secondsRemaining: waitTime,
        message: `Rate limited. Retrying in ${waitTime} seconds...`
      });
      
      // Count down the wait time with more frequent updates for UI
      for (let i = waitTime; i > 0; i--) {
        onRetryStatus?.({ 
          isWaiting: true, 
          secondsRemaining: i,
          message: `Rate limited. Retrying in ${i} seconds...`
        });
        
        if (i % 10 === 0 || i <= 10) {
          console.log(`⏰ ${i} seconds remaining...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for more precise countdown
      }
      
      console.log(`⏰ Wait completed at: ${new Date().toISOString()}`);
      console.log(`🔄 Starting retry attempt ${attempt + 1}...`);
      onRetryStatus?.({ 
        isWaiting: false, 
        message: `Attempting signup again (attempt ${attempt + 1}/${maxRetries})...`
      });
    } else {
      console.log(`❌ Max retries (${maxRetries}) reached, giving up`);
      console.log(`Final error after all retries:`, result.error);
      onRetryStatus?.({ isWaiting: false, message: 'Maximum retry attempts exceeded. Please try again later.' });
      return result;
    }
  }
  
  // This should never be reached, but just in case
  const exhaustedResult = { 
    success: false, 
    error: { 
      message: 'Maximum retry attempts exceeded', 
      type: 'RETRY_EXHAUSTED' 
    } 
  };
  console.log(`❌ Returning exhausted result:`, exhaustedResult);
  onRetryStatus?.({ isWaiting: false, message: 'Maximum retry attempts exceeded. Please try again later.' });
  return exhaustedResult;
}

// Manual testing function for rate limit behavior
export async function testSignUpRetry() {
  console.log('=== MANUAL TESTING SIGNUP RETRY ===');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';
  
  console.log('Testing with:', { testEmail, testPassword, testName });
  
  const result = await signUpWithRetry(testEmail, testPassword, testName, 2, (status) => {
    console.log('Test retry status:', status);
  });
  console.log('Manual test result:', result);
  return result;
}

// Make test function available on window for console testing
if (typeof window !== 'undefined') {
  (window as any).testSignUpRetry = testSignUpRetry;
  (window as any).testAuth = {
    testSignUpRetry: testSignUpRetry,
    signUpWithRetry: signUpWithRetry
  };
  console.log('✅ testSignUpRetry() function available in console for testing');
  console.log('✅ Also available: window.testAuth.testSignUpRetry()');
}

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
