import { supabase } from './supabaseClient'

// Remove the retry function entirely - we'll handle this at the UI level
export async function signUp(email: string, password: string, fullName: string) {
  const signupSessionId = Math.random().toString(36).substring(2, 15);
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Session ID: ${signupSessionId}`);

  // Store user-entered email in dedicated variable
  const userEnteredEmail = email;
  console.log(`🎯 userEnteredEmail assigned: "${userEnteredEmail}"`);
  console.log(`🎯 Email type: ${typeof userEnteredEmail}`);
  console.log(`🎯 Email length: ${userEnteredEmail?.length || 'undefined'}`);
  console.log(`🎯 Email is valid format: ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEnteredEmail)}`);
  console.log(`🎯 Start timestamp: ${new Date().toISOString()}`);

  // Clean the email to remove any potential issues
  const cleanedEmail = userEnteredEmail.trim().toLowerCase();
  console.log(`Cleaned email: "${cleanedEmail}"`);
  console.log(`Original vs cleaned: ${userEnteredEmail === cleanedEmail ? 'IDENTICAL' : 'DIFFERENT'}`);

  try {
    console.log(`🚀 Email being passed to supabase.auth.signUp: "${userEnteredEmail}"`);
    console.log(`🚀 Calling supabase.auth.signUp now...`);

    // Single signup attempt - no retries
    const { data, error } = await supabase.auth.signUp({
      email: userEnteredEmail,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    console.log(`📬 Signup response received:`, {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.status
    });

    if (error) {
      console.error(`❌ Auth signup failed (Session: ${signupSessionId}):`, error);

      // Handle rate limiting specifically
      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          error: {
            message: error.message,
            type: 'RATE_LIMITED',
            isRateLimit: true
          }
        };
      }

      // Handle other errors
      return {
        success: false,
        error: {
          message: error.message,
          type: 'SIGNUP_ERROR',
          isRateLimit: false
        }
      };
    }

    if (!data.user?.id) {
      console.error('❌ No user ID returned from signup');
      return {
        success: false,
        error: {
          message: 'No user ID returned from signup',
          type: 'SIGNUP_ERROR',
          isRateLimit: false
        }
      };
    }

    const userId = data.user.id;
    console.log('✅ Supabase Auth user created successfully:', userId);

    // Wait for auth state to settle
    console.log('Waiting for auth state to settle...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify we're authenticated before proceeding
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      console.error('❌ Auth session not established:', sessionError);
      return {
        success: false,
        error: {
          message: 'Authentication session not established',
          type: 'SESSION_ERROR',
          isRateLimit: false
        }
      };
    }
    console.log('✅ Auth session confirmed for user:', user.id);

    // Step 2: Insert into users table
    console.log('Step 2: Creating user record in users table...');
    const { data: userData, error: usersInsertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userEnteredEmail
      }])
      .select();

    if (usersInsertError) {
      console.error('❌ Users table insert failed:', usersInsertError);
      return {
        success: false,
        error: {
          message: `Failed to create user record: ${usersInsertError.message}`,
          type: 'DATABASE_ERROR',
          isRateLimit: false
        }
      };
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
        email: userEnteredEmail,
        is_on_trial: true,
        trial_ends_at: trialEndDate.toISOString()
      }])
      .select();

    if (profileInsertError) {
      console.error('❌ Profile insert failed:', profileInsertError);
      return {
        success: false,
        error: {
          message: `Failed to create user profile: ${profileInsertError.message}`,
          type: 'DATABASE_ERROR',
          isRateLimit: false
        }
      };
    }

    console.log('✅ Profile created successfully:', profileData);
    console.log('=== SIGNUP PROCESS COMPLETE ===');

    return { 
      success: true, 
      email: userEnteredEmail,
      user: data.user,
      userId: userId,
      userData: userData,
      profileData: profileData
    };

  } catch (error) {
    console.error('❌ Signup process failed:', error);

    return { 
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error during signup',
        type: 'SIGNUP_ERROR',
        isRateLimit: false
      }
    };
  }
}

// Keep utility functions for testing but remove retry logic
export async function testUIRateLimit(onRetryStatus?: (status: { isWaiting: boolean; secondsRemaining?: number; message?: string }) => void) {
  console.log('=== TESTING UI RATE LIMIT BEHAVIOR ===');

  onRetryStatus?.({ 
    isWaiting: false, 
    message: 'Testing signup process...'
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  onRetryStatus?.({ 
    isWaiting: true, 
    secondsRemaining: 5,
    message: 'Simulating rate limit...'
  });

  for (let i = 5; i > 0; i--) {
    onRetryStatus?.({ 
      isWaiting: true, 
      secondsRemaining: i,
      message: `Simulating rate limit... ${i}s`
    });
    console.log(`⏰ UI Test: ${i} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  onRetryStatus?.({ 
    isWaiting: false, 
    message: 'Test completed successfully!'
  });

  return { 
    success: true, 
    message: 'UI rate limit test completed successfully'
  };
}

// Make test functions available on window for console testing
if (typeof window !== 'undefined') {
  (window as any).testUIRateLimit = testUIRateLimit;

  // Enhanced network monitoring helper
  (window as any).monitorSignupRequests = function() {
    console.log('🔍 NETWORK MONITORING ENABLED');
    console.log('📋 Instructions for email verification:');
    console.log('1. Open DevTools > Network tab');
    console.log('2. Filter by "signup" or "auth"');
    console.log('3. Attempt signup with your real email');
    console.log('4. Check Request payload');

    const originalFetch = window.fetch;

    window.fetch = function(url, options) {
      const startTime = Date.now();

      if (typeof url === 'string' && url.includes('/auth/v1/signup')) {
        console.log('🚀 INTERCEPTED SIGNUP REQUEST:');
        console.log('📍 URL:', url);
        console.log('⏰ Request timestamp:', new Date().toISOString());

        if (options && options.body) {
          try {
            const body = JSON.parse(options.body);
            console.log('📧 EMAIL IN REQUEST PAYLOAD:', body.email);
            console.log('👤 NAME IN REQUEST PAYLOAD:', body.data?.full_name);
            console.log('📦 FULL REQUEST BODY:', JSON.stringify(body, null, 2));
          } catch (e) {
            console.log('⚠️ Could not parse request body:', options.body);
          }
        }
      }

      return originalFetch.apply(this, arguments).then(response => {
        if (typeof url === 'string' && url.includes('/auth/v1/signup')) {
          const endTime = Date.now();
          console.log('📬 SIGNUP RESPONSE RECEIVED:');
          console.log('📊 Response status:', response.status);
          console.log('⏱️ Response time:', endTime - startTime, 'ms');
        }
        return response;
      });
    };

    return 'Network monitoring enabled. All signup requests will be logged.';
  };

  console.log('✅ Test functions available in console:');
  console.log('  - testUIRateLimit() - Tests UI behavior');
  console.log('  - monitorSignupRequests() - Monitor network requests');
  (window as any).testOnboardingUIRateLimit = (window as any).testOnboardingUIRateLimit;
}