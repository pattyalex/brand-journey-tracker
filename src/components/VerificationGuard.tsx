
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { checkEmailVerification, resendVerificationEmail } from '@/auth';
import { supabase } from '@/lib/supabase';

interface VerificationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const VerificationGuard: React.FC<VerificationGuardProps> = ({ children, fallback }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    checkUserVerification();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkUserVerification();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsVerified(true); // Allow access if no user (not authenticated)
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email || '');
      const isEmailVerified = !!user.email_confirmed_at;
      setIsVerified(isEmailVerified);
      
      console.log('📧 Verification check:', {
        userId: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        isVerified: isEmailVerified
      });

    } catch (error) {
      console.error('Error checking verification:', error);
      setIsVerified(true); // Allow access on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      const result = await resendVerificationEmail(userEmail);
      
      if (result.success) {
        setResendMessage('Verification email sent! Check your inbox and spam folder.');
      } else {
        setResendMessage(result.error?.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (isVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
        {fallback || (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Email Verification Required</CardTitle>
              <CardDescription>
                Please verify your email address to access this feature
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="border-orange-500 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Your account requires email verification. Check your inbox at{' '}
                  <strong>{userEmail}</strong> for a verification link.
                </AlertDescription>
              </Alert>

              {resendMessage && (
                <Alert className={`${
                  resendMessage.includes('sent') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <AlertDescription className={`${
                    resendMessage.includes('sent') ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {resendMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={checkUserVerification}
                  className="w-full"
                  variant="default"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  I've Verified My Email
                </Button>

                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                  variant="outline"
                >
                  {isResending ? (
                    <>
                      <Mail className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default VerificationGuard;
