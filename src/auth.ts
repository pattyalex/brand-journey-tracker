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

// Manual testing function for rate limit behavior - DISABLED TO PREVENT INVALID EMAILS
export async function testSignUpRetry() {
  console.warn('=== TEST FUNCTION DISABLED ===');
  console.warn('testSignUpRetry() is disabled to prevent auto-generated test emails from being sent to Supabase.');
  console.warn('Use real user input instead of generated test emails.');
  console.warn('If you need to test, use the onboarding form with a real email address.');
  
  return {
    success: false,
    error: {
      message: 'Test function disabled - use real user input',
      type: 'TEST_DISABLED'
    }
  };
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
  
  // Add network monitoring helper
  (window as any).monitorSignupRequests = function() {
    console.log('🔍 NETWORK MONITORING: Watching for signup requests...');
    console.log('📋 To verify emails in network requests:');
    console.log('1. Open DevTools > Network tab');
    console.log('2. Filter by "signup" or "auth"');
    console.log('3. Attempt signup');
    console.log('4. Click on the signup request');
    console.log('5. Check Request payload in the "Payload" or "Request" tab');
    console.log('6. Verify the email field matches your form input exactly');
    
    // Override fetch to log all auth requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && url.includes('/auth/v1/signup')) {
        console.log('🚀 INTERCEPTED SIGNUP REQUEST:');
        console.log('URL:', url);
        if (options && options.body) {
          try {
            const body = JSON.parse(options.body);
            console.log('📧 EMAIL IN REQUEST:', body.email);
            console.log('👤 NAME IN REQUEST:', body.data?.full_name);
          } catch (e) {
            console.log('Body:', options.body);
          }
        }
      }
      return originalFetch.apply(this, arguments);
    };
    
    return 'Network monitoring enabled. Check console for signup request details.';
  };
  
  console.log('✅ Test functions available in console:');
  console.log('  - testSignUpRetry() - DISABLED to prevent test emails');
  console.log('  - testUIRateLimit() - Tests UI rate limit behavior (needs callback)');
  console.log('  - testOnboardingUIRateLimit() - Tests onboarding UI rate limit behavior');
  console.log('  - monitorSignupRequests() - Monitor network requests for email verification');
}

export async function signUp(email: string, password: string, fullName: string) {
  const signupSessionId = Math.random().toString(36).substring(2, 15);
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Session ID: ${signupSessionId}`);
  console.log(`=== EMAIL VERIFICATION ===`);
  console.log(`Original email parameter: "${email}"`);
  console.log(`Email type: ${typeof email}`);
  console.log(`Email length: ${email?.length || 'undefined'}`);
  console.log(`Email is valid format: ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}`);
  console.log(`Name: ${fullName}`);
  console.log(`Start timestamp: ${new Date().toISOString()}`);
  console.log(`Start timestamp (epoch): ${Date.now()}`);

  // Ensure email is exactly what the user entered - no modifications
  const userEnteredEmail = email; // Preserve original user input
  console.log(`=== FINAL EMAIL VERIFICATION BEFORE SUPABASE ===`);
  console.log(`Email being sent to Supabase: "${userEnteredEmail}"`);
  console.log(`Email === original parameter: ${userEnteredEmail === email}`);

  try {
    // Step 1: Sign the user up with Supabase Auth
    console.log('Step 1: Creating Supabase Auth user...');

    // Test direct fetch to Supabase auth endpoint first
    const authUrl = `${supabase.supabaseUrl}/auth/v1/signup`;
    console.log('Testing direct auth endpoint:', authUrl);

    // Create exact payload that will be sent
    const signupPayload = {
      email: userEnteredEmail,
      password: password,
      data: { full_name: fullName }
    };
    
    console.log(`=== EXACT PAYLOAD BEING SENT TO SUPABASE ===`);
    console.log(`Payload:`, JSON.stringify(signupPayload, null, 2));
    console.log(`Payload email field: "${signupPayload.email}"`);

    try {
      const testResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify(signupPayload)
      });
      console.log('Direct fetch test response status:', testResponse.status);
      console.log('Direct fetch test response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (testResponse.status === 400) {
        const errorResponse = await testResponse.text();
        console.log('Direct fetch 400 error response:', errorResponse);
      }
    } catch (fetchError) {
      console.error('Direct fetch test failed:', fetchError);
    }

    console.log(`=== CALLING SUPABASE AUTH SIGNUP ===`);
    console.log(`About to call supabase.auth.signUp with email: "${userEnteredEmail}"`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userEnteredEmail,  // Use the preserved user input
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    console.log(`=== SUPABASE RESPONSE RECEIVED ===`);
    console.log(`Auth data:`, authData ? { user: authData.user?.id, email: authData.user?.email } : null);
    console.log(`Auth error:`, authError ? { message: authError.message, status: authError.status } : null);

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
    console.log(`Inserting user record with email: "${userEnteredEmail}"`);
    const { data: userData, error: usersInsertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userEnteredEmail  // Use preserved user input
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
    console.log(`Creating profile with email: "${userEnteredEmail}"`);
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { data: profileData, error: profileInsertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        email: userEnteredEmail,  // Use preserved user input
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
      email: userEnteredEmail,  // Return the preserved user input
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