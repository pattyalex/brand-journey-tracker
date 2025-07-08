
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerificationCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'email') {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      console.log('🔍 Processing email verification callback...');
      
      // Verify the token with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        console.error('❌ Email verification failed:', error);
        setStatus('error');
        setMessage(error.message || 'Email verification failed');
        return;
      }

      if (data.user) {
        console.log('✅ Email verified successfully for user:', data.user.id);
        
        // Create user records now that email is verified
        try {
          await createUserRecords(data.user.id, data.user.email!, data.user.user_metadata.full_name);
          console.log('✅ User records created successfully');
        } catch (dbError) {
          console.warn('⚠️ Database record creation failed (user may already exist):', dbError);
          // Don't fail the verification if database records already exist
        }

        setStatus('success');
        setMessage('Email verified successfully! You can now access your account.');
        
        // Log the user in
        login();
        
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Verification failed - no user data returned');
      }

    } catch (error) {
      console.error('❌ Email verification error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const createUserRecords = async (userId: string, email: string, fullName: string) => {
    // Insert into users table
    const { error: usersError } = await supabase
      .from('users')
      .insert([{ id: userId, email: email }]);

    if (usersError && !usersError.message.includes('duplicate')) {
      throw usersError;
    }

    // Insert into profiles table
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        email: email,
        is_on_trial: true,
        trial_ends_at: trialEndDate.toISOString()
      }]);

    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    setMessage('');
    handleEmailVerification();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              status === 'loading' ? 'bg-blue-100' :
              status === 'success' ? 'bg-green-100' :
              'bg-red-100'
            }`}>
              {status === 'loading' ? (
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' ? 'Verifying Email...' :
             status === 'success' ? 'Email Verified!' :
             'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Please wait while we verify your email address' :
             status === 'success' ? 'Your email has been successfully verified' :
             'There was a problem verifying your email'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert className={`${
              status === 'success' ? 'border-green-500 bg-green-50' :
              status === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertDescription className={`${
                status === 'success' ? 'text-green-800' :
                status === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Redirecting to your account...
              </p>
              <Button onClick={() => navigate('/onboarding')} className="w-full">
                Continue to App
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                Go to Home Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationCallback;
