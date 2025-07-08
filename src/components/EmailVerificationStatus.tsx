
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { resendVerificationEmail, checkEmailVerification } from '@/auth';

interface EmailVerificationStatusProps {
  email: string;
  onVerificationComplete: () => void;
  onBack?: () => void;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  email,
  onVerificationComplete,
  onBack
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Auto-check verification status every 5 seconds
    const interval = setInterval(async () => {
      if (!isChecking) {
        await checkVerificationStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isChecking]);

  useEffect(() => {
    // Handle resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const checkVerificationStatus = async () => {
    setIsChecking(true);
    
    try {
      const result = await checkEmailVerification();
      
      if (result.success && result.isVerified) {
        setMessage('Email verified successfully!');
        setMessageType('success');
        setTimeout(() => {
          onVerificationComplete();
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setMessage('');
    
    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setMessage('Verification email sent! Check your inbox and spam folder.');
        setMessageType('success');
        setResendCooldown(60); // 60 second cooldown
      } else {
        setMessage(result.error?.message || 'Failed to resend verification email');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to resend verification email');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleManualCheck = async () => {
    await checkVerificationStatus();
    if (!message) {
      setMessage('Still waiting for verification. Please check your email.');
      setMessageType('info');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Click the verification link in your email to activate your account.
          </p>
          <p className="text-xs text-muted-foreground">
            Don't see the email? Check your spam folder.
          </p>
        </div>

        {message && (
          <Alert className={`${
            messageType === 'success' ? 'border-green-500 bg-green-50' :
            messageType === 'error' ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : messageType === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Mail className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={`${
              messageType === 'success' ? 'text-green-800' :
              messageType === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full"
            variant="default"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                I've Verified My Email
              </>
            )}
          </Button>

          <Button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            className="w-full"
            variant="outline"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>

          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full"
            >
              Back to Sign Up
            </Button>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Auto-checking verification status...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationStatus;
