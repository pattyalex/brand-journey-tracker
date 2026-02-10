import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
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

const LoginModal: React.FC = () => {
  const { loginOpen, closeLoginModal, login } = useAuth();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');

  const handleGoogleSignIn = async () => {
    if (!isSignInLoaded) return;

    setGoogleLoading(true);
    setError('');

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/home-page',
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'email') {
      // Move to password step
      setStep('password');
      return;
    }

    // Handle login
    setLoading(true);

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === 'complete') {
        login();
        closeLoginModal();
        window.location.href = '/home-page';
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    setShowEmailVerification(false);
    setPendingVerificationEmail('');
    login();
    closeLoginModal();
    navigate('/home-page');
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    closeLoginModal();
  };

  return (
    <Dialog open={loginOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-0 overflow-hidden max-w-[400px] bg-transparent shadow-none [&>button]:hidden">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.25), 0 0 0 1px rgba(139, 112, 130, 0.08)'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-black/5 z-10"
            style={{ color: '#8B7082' }}
          >
            <X className="w-5 h-5" />
          </button>

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
                    Sign in to HeyMeg
                  </h2>
                  <p style={{ color: '#6b6478', fontSize: '14px' }}>
                    Welcome back! Please sign in to continue
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-5 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
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

                {/* Email/Password Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {step === 'email' ? (
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
                  ) : (
                    <>
                      {/* Show email being used */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 mb-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1">{email}</span>
                        <button
                          type="button"
                          onClick={() => setStep('email')}
                          className="text-xs font-medium hover:underline"
                          style={{ color: '#612a4f' }}
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium"
                            style={{ color: '#1a1523' }}
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              window.location.href = '/forgot-password';
                            }}
                            className="text-xs font-medium transition-colors hover:underline"
                            style={{ color: '#612a4f' }}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
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
                Don't have an account?{' '}
                <a
                  href="/onboarding"
                  className="font-medium transition-colors hover:underline"
                  style={{ color: '#612a4f' }}
                >
                  Sign up
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
