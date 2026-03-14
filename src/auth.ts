
import { supabase } from '@/lib/supabase'

export interface SignUpResult {
  success: boolean;
  needsVerification?: boolean;
  email?: string;
  user?: any;
  userId?: string;
  userData?: any;
  profileData?: any;
  error?: {
    message: string;
    type: string;
    isRateLimit?: boolean;
  };
}

export interface VerificationResult {
  success: boolean;
  isVerified?: boolean;
  error?: {
    message: string;
    type: string;
  };
}

export async function signUp(email: string, password: string, fullName: string): Promise<SignUpResult> {
  const signupSessionId = Math.random().toString(36).substring(2, 15);
  console.log(`=== STARTING SIGNUP PROCESS ===`);
  console.log(`Session ID: ${signupSessionId}`);

  const userEnteredEmail = email;
  console.log(`🎯 userEnteredEmail assigned: "${userEnteredEmail}"`);

  const cleanedEmail = userEnteredEmail.trim().toLowerCase();
  console.log(`Cleaned email: "${cleanedEmail}"`);

  try {
    console.log(`🚀 Calling supabase.auth.signUp with email confirmation enabled...`);

    const { data, error } = await supabase.auth.signUp({
      email: userEnteredEmail,
      password: password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    console.log(`📬 Signup response received:`, {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.status,
      emailConfirmed: data?.user?.email_confirmed_at
    });

    if (error) {
      console.error(`❌ Auth signup failed (Session: ${signupSessionId}):`, error);

      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          error: {
            message: 'Too many signup attempts. Please wait a moment and try again.',
            type: 'RATE_LIMITED',
            isRateLimit: true
          }
        };
      }

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
          message: 'Account creation failed. Please try again.',
          type: 'SIGNUP_ERROR',
          isRateLimit: false
        }
      };
    }

    const userId = data.user.id;
    const isEmailConfirmed = !!data.user.email_confirmed_at;
    
    console.log('✅ Supabase Auth user created successfully:', userId);
    console.log('📧 Email confirmation status:', isEmailConfirmed ? 'CONFIRMED' : 'PENDING');

    // Create profile immediately regardless of email confirmation status
    await createUserRecords(userId, userEnteredEmail, fullName);

    if (!isEmailConfirmed) {
      console.log('📧 Email verification required');
      return {
        success: true,
        needsVerification: true,
        email: userEnteredEmail,
        user: data.user,
        userId: userId
      };
    }

    return { 
      success: true, 
      needsVerification: false,
      email: userEnteredEmail,
      user: data.user,
      userId: userId
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

async function createUserRecords(userId: string, email: string, fullName: string) {
  console.log('Creating user records in database...');
  
  // Insert into profiles table
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
    throw new Error(`Failed to create user profile: ${profileInsertError.message}`);
  }

  console.log('✅ User records created successfully');
}

export async function resendVerificationEmail(email: string): Promise<VerificationResult> {
  console.log('🔄 Resending verification email for:', email);
  
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('❌ Resend verification failed:', error);
      return {
        success: false,
        error: {
          message: error.message,
          type: 'RESEND_ERROR'
        }
      };
    }

    console.log('✅ Verification email resent successfully');
    return {
      success: true
    };

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to resend verification email',
        type: 'RESEND_ERROR'
      }
    };
  }
}

export async function checkEmailVerification(): Promise<VerificationResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Failed to check user verification:', error);
      return {
        success: false,
        error: {
          message: 'Failed to check verification status',
          type: 'CHECK_ERROR'
        }
      };
    }

    if (!user) {
      return {
        success: false,
        error: {
          message: 'No user found',
          type: 'NO_USER'
        }
      };
    }

    const isVerified = !!user.email_confirmed_at;
    console.log('📧 Email verification status:', isVerified ? 'VERIFIED' : 'PENDING');

    return {
      success: true,
      isVerified: isVerified
    };

  } catch (error) {
    console.error('❌ Check verification error:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to check verification status',
        type: 'CHECK_ERROR'
      }
    };
  }
}

export async function signIn(email: string, password: string): Promise<SignUpResult> {
  console.log('🔑 Attempting to sign in user:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Sign in failed:', error);
      return {
        success: false,
        error: {
          message: error.message,
          type: 'SIGNIN_ERROR'
        }
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: {
          message: 'Sign in failed - no user returned',
          type: 'SIGNIN_ERROR'
        }
      };
    }

    const isEmailConfirmed = !!data.user.email_confirmed_at;
    console.log('📧 User email confirmation status:', isEmailConfirmed ? 'CONFIRMED' : 'PENDING');

    if (!isEmailConfirmed) {
      return {
        success: false,
        needsVerification: true,
        email: email,
        user: data.user,
        error: {
          message: 'Please verify your email address before signing in',
          type: 'EMAIL_NOT_VERIFIED'
        }
      };
    }

    console.log('✅ User signed in successfully');
    return {
      success: true,
      email: email,
      user: data.user,
      userId: data.user.id
    };

  } catch (error) {
    console.error('❌ Sign in error:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Sign in failed',
        type: 'SIGNIN_ERROR'
      }
    };
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).resendVerificationEmail = resendVerificationEmail;
  (window as any).checkEmailVerification = checkEmailVerification;
}
