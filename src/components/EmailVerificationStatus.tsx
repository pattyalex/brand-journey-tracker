import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { resendVerificationEmail, checkEmailVerification } from '@/auth';
import { supabase } from '@/lib/supabase';

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

        // Send welcome email now that email is verified (fire and forget)
        const apiBase = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        const userName = verifiedUser?.user_metadata?.full_name || verifiedUser?.user_metadata?.name || '';
        fetch(`${apiBase}/api/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: userName }),
        }).catch(err => console.error('Failed to send welcome email:', err));

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
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.25), 0 0 0 1px rgba(139, 112, 130, 0.08)'
        }}
      >
        <div className="p-8">
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #e8d5e1 0%, #d4c1d8 100%)',
                boxShadow: '0 8px 20px rgba(97, 42, 79, 0.15)'
              }}
            >
              <Mail className="h-8 w-8" style={{ color: '#612a4f' }} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2
              className="text-[22px] font-semibold mb-2"
              style={{ color: '#1a1523' }}
            >
              Check Your Email
            </h2>
            <p className="text-sm mb-1" style={{ color: '#6b6478' }}>
              We've sent a verification link to
            </p>
            <p className="text-sm font-semibold" style={{ color: '#612a4f' }}>
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div
            className="text-center mb-6 p-4 rounded-xl"
            style={{ background: '#f8f4f7' }}
          >
            <p className="text-sm mb-2" style={{ color: '#4d3e48' }}>
              Click the verification link in your email to activate your account.
            </p>
            <p className="text-xs" style={{ color: '#8B7082' }}>
              Don't see the email? Check your spam folder.
            </p>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert
              className="mb-5"
              style={{
                borderColor: messageType === 'success' ? '#51cf66' : messageType === 'error' ? '#ff6b6b' : '#612a4f',
                background: messageType === 'success' ? '#e6fcf5' : messageType === 'error' ? '#ffe5e5' : '#f8f4f7'
              }}
            >
              {messageType === 'success' ? (
                <CheckCircle className="h-4 w-4" style={{ color: '#51cf66' }} />
              ) : messageType === 'error' ? (
                <AlertCircle className="h-4 w-4" style={{ color: '#ff6b6b' }} />
              ) : (
                <Mail className="h-4 w-4" style={{ color: '#612a4f' }} />
              )}
              <AlertDescription
                className="text-sm"
                style={{
                  color: messageType === 'success' ? '#2b8a3e' : messageType === 'error' ? '#c92a2a' : '#612a4f'
                }}
              >
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {/* I've Verified My Email Button - Primary */}
            <button
              onClick={handleManualCheck}
              disabled={isChecking}
              className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:shadow-lg"
              style={{
                background: isChecking
                  ? '#8B7082'
                  : 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                boxShadow: '0 4px 12px rgba(97, 42, 79, 0.25)',
                fontSize: '14px'
              }}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  I've Verified My Email
                </>
              )}
            </button>

            {/* Resend Email Button - Secondary */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:bg-gray-50"
              style={{
                background: '#fff',
                border: '1.5px solid #e5e5e5',
                color: '#1a1523',
                fontSize: '14px'
              }}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Mail className="h-4 w-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </button>

            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                style={{
                  background: 'transparent',
                  color: '#612a4f',
                  fontSize: '14px'
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign Up
              </button>
            )}
          </div>

          {/* Auto-check Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#8B7082' }}>
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Auto-checking verification status...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationStatus;
