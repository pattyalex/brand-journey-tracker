import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { signUp } from '@/auth';
import { supabase } from '@/lib/supabase';
import EmailVerificationStatus from "@/components/EmailVerificationStatus";

// Google icon component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

interface SignUpFormProps {
  onSuccess: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [step, setStep] = useState<'name' | 'email' | 'password'>('name');

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setError('Failed to sign up with Google. Please try again.');
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to start Google sign up. Please try again.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error('Google sign up error:', err);
      setError('Failed to sign up with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'name') {
      setStep('email');
      return;
    }

    if (step === 'email') {
      setStep('password');
      return;
    }

    // Handle signup
    setLoading(true);

    try {
      const result = await signUp(email, password, name);

      if (result.success) {
        if (result.needsVerification) {
          setShowEmailVerification(true);
          setPendingVerificationEmail(email);
        } else {
          onSuccess();
        }
      } else {
        setError(result.error?.message || 'Failed to create account');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    setShowEmailVerification(false);
    setPendingVerificationEmail('');
    onSuccess();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.25), 0 0 0 1px rgba(139, 112, 130, 0.08)'
        }}
      >
        <div className="p-8">
          {showEmailVerification ? (
            <div className="py-4">
              <EmailVerificationStatus
                email={pendingVerificationEmail}
                onVerificationComplete={handleEmailVerificationComplete}
                onBack={() => setShowEmailVerification(false)}
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center text-white font-serif text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 8px 20px rgba(97, 42, 79, 0.35)'
                  }}
                >
                  M
                </div>
                <h2
                  className="text-[22px] font-semibold mb-1"
                  style={{ color: '#1a1523' }}
                >
                  Create your account
                </h2>
                <p style={{ color: '#6b6478', fontSize: '14px' }}>
                  Start your 14-day free trial today
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-5 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-60 mb-5"
                style={{
                  borderColor: '#e5e5e5',
                  background: '#fff',
                  color: '#1a1523',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {step === 'name' && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium"
                        style={{ color: '#1a1523' }}
                      >
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-lg border transition-all outline-none text-sm"
                        style={{
                          borderColor: '#e5e5e5',
                          color: '#1a1523',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                        fontSize: '14px'
                      }}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {step === 'email' && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium"
                        style={{ color: '#1a1523' }}
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-lg border transition-all outline-none text-sm"
                        style={{
                          borderColor: '#e5e5e5',
                          color: '#1a1523',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                        fontSize: '14px'
                      }}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {step === 'password' && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                        style={{ color: '#1a1523' }}
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="At least 10 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        minLength={10}
                        className="w-full px-3.5 py-2.5 rounded-lg border transition-all outline-none text-sm"
                        style={{
                          borderColor: '#e5e5e5',
                          color: '#1a1523',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                      />
                      <p className="text-xs" style={{ color: '#8B7082' }}>
                        Must include uppercase letter and special character
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                        fontSize: '14px'
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>

              {/* Terms */}
              <p className="text-xs text-center mt-4" style={{ color: '#8B7082' }}>
                By signing up, you agree to our{' '}
                <a href="/terms" target="_blank" className="underline hover:no-underline" style={{ color: '#612a4f' }}>
                  Terms
                </a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="underline hover:no-underline" style={{ color: '#612a4f' }}>
                  Privacy Policy
                </a>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!showEmailVerification && (
          <div
            className="px-8 py-4 text-center border-t"
            style={{ borderColor: '#f0f0f0', background: '#fafafa' }}
          >
            <p className="text-sm" style={{ color: '#6b6478' }}>
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium transition-colors hover:underline"
                style={{ color: '#612a4f' }}
              >
                Sign in
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
