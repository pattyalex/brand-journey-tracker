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
      const waitTime = 90; // Increased from 61 to 90 seconds to better accommodate Supabase rate limits
      const sessionId = Math.random().toString(36).substring(2, 15);
      console.log(`⏳ Rate limited on attempt ${attempt}/${maxRetries}`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Rate limit error message: "${result.error?.message}"`);
      console.log(`Waiting ${waitTime} seconds before retry...`);
      console.log(`Wait started at: ${new Date().toISOString()}`);
      console.log(`Expected retry at: ${new Date(Date.now() + waitTime * 1000).toISOString()}`);

      // Update UI with countdown
      onRetryStatus?.({ 
        isWaiting: true, 
        secondsRemaining: waitTime,
        message: `Rate limited. Retrying in ${waitTime} seconds...`,
        sessionId: sessionId
      });

      // Count down the wait time with more frequent updates for UI
      for (let i = waitTime; i > 0; i--) {
        onRetryStatus?.({ 
          isWaiting: true, 
          secondsRemaining: i,
          message: `Rate limited. Retrying in ${i} seconds...`,
          sessionId: sessionId
        });

        if (i % 15 === 0 || i <= 15) {
          console.log(`⏰ ${i} seconds remaining... (Session: ${sessionId})`);
          console.log(`Current time: ${new Date().toISOString()}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for more precise countdown
      }

      console.log(`⏰ Wait completed at: ${new Date().toISOString()}`);
      console.log(`🔄 Starting retry attempt ${attempt + 1}... (Session: ${sessionId})`);
      onRetryStatus?.({ 
        isWaiting: false, 
        message: `Attempting signup again (attempt ${attempt + 1}/${maxRetries})...`,
        sessionId: sessionId
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
  const testEmail = `testuser${Date.now()}@gmail.com`; // Changed to valid email format
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  console.log('Testing with:', { testEmail, testPassword, testName });

  const result = await signUpWithRetry(testEmail, testPassword, testName, 2, (status) => {
    console.log('Test retry status:', status);
  });
  console.log('Manual test result:', result);
  return result;
}

// UI Test function that simulates rate limiting without hitting Supabase
export async function testUIRateLimit(onRetryStatus?: (status: { isWaiting: boolean; secondsRemaining?: number; message?: string }) => void) {
  console.log('=== TESTING UI RATE LIMIT BEHAVIOR ===');

  // Simulate first attempt failure
  console.log('Simulating first signup attempt...');
  onRetryStatus?.({ 
    isWaiting: false, 
    message: 'Testing signup process...'
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate rate limit error
  console.log('Simulating rate limit error...');
  onRetryStatus?.({ 
    isWaiting: true, 
    secondsRemaining: 10,
    message: 'Rate limited. Retrying in 10 seconds...'
  });

  // Short countdown for testing (10 seconds for quick testing)
  for (let i = 10; i > 0; i--) {
    onRetryStatus?.({ 
      isWaiting: true, 
      secondsRemaining: i,
      message: `Rate limited. Retrying in ${i} seconds...`
    });
    console.log(`⏰ UI Test: ${i} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Simulate success
  console.log('Simulating successful retry...');
  onRetryStatus?.({ 
    isWaiting: false, 
    message: 'Test completed successfully!'
  });

  return { 
    success: true, 
    message: 'UI rate limit test completed successfully'
  };
}

// Global test function for OnboardingFlow UI testing
export async function testOnboardingUIRateLimit() {
  console.log('=== TESTING ONBOARDING UI RATE LIMIT ===');
  
  // Find the onboarding form in the DOM
  const continueButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
  
  if (!continueButton) {
    console.error('Could not find continue button for testing');
    return;
  }

  console.log('Found continue button:', continueButton.textContent);
  
  // Create a mock onRetryStatus function to simulate UI updates
  const mockOnRetryStatus = (status: { isWaiting: boolean; secondsRemaining?: number; message?: string }) => {
    console.log('Mock UI Status Update:', status);
    
    // Update button text and disabled state
    if (status.isWaiting) {
      continueButton.textContent = `Please wait ${status.secondsRemaining || '...'}s`;
      continueButton.disabled = true;
      continueButton.style.opacity = '0.5';
      continueButton.style.cursor = 'not-allowed';
    } else {
      continueButton.textContent = 'Continue';
      continueButton.disabled = false;
      continueButton.style.opacity = '1';
      continueButton.style.cursor = 'pointer';
    }
  };

  // Run the UI test
  await testUIRateLimit(mockOnRetryStatus);
  
  console.log('✅ Onboarding UI rate limit test completed');
}

// Make test functions available on window for console testing
if (typeof window !== 'undefined') {
  (window as any).testSignUpRetry = testSignUpRetry;
  (window as any).testUIRateLimit = testUIRateLimit;
  (window as any).testOnboardingUIRateLimit = testOnboardingUIRateLimit;
  console.log('✅ Test functions available in console:');
  console.log('  - testSignUpRetry() - Tests actual signup with retry logic');
  console.log('  - testUIRateLimit() - Tests UI rate limit behavior (needs callback)');
  console.log('  - testOnboardingUIRateLimit() - Tests onboarding UI rate limit behavior');
}

export async function signUp(email: string, password: string, fullName: string) {
  const signupSessionId = Math.random().toString(36).substring(2, 15);
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Session ID: ${signupSessionId}`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${fullName}`);
  console.log(`Start timestamp: ${new Date().toISOString()}`);
  console.log(`Start timestamp (epoch): ${Date.now()}`);

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
      console.error(`❌ Auth signup failed (Session: ${signupSessionId}):`, authError);
      console.error(`Auth error details (Session: ${signupSessionId}):`, {
        message: authError.message,
        status: authError.status,
        statusCode: authError.status,
        timestamp: new Date().toISOString(),
        sessionId: signupSessionId
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