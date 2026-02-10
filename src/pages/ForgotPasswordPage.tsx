import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Mail, ArrowLeft, CheckCircle, Lock, KeyRound } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Step = 'email' | 'code' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('email');

  // Step 1: Request password reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('code');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.errors?.[0]?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result?.status === 'complete') {
        // Set the session active
        await setActive?.({ session: result.createdSessionId });
        setStep('success');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.errors?.[0]?.message || 'Invalid code or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderColor: 'rgba(139, 112, 130, 0.2)',
    background: 'rgba(255, 255, 255, 0.8)',
    color: '#2a1f26',
    fontSize: '15px'
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: '#fcf9fe' }}
    >
      {/* Decorative background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(220,208,255,0.4) 0%, transparent 55%),
            radial-gradient(ellipse 70% 80% at 95% 50%, rgba(241,211,255,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 10%, rgba(197,216,255,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 50% 90%, rgba(201,201,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse 40% 35% at 30% 30%, rgba(244,209,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse 35% 30% at 75% 70%, rgba(197,216,255,0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 60%)
          `
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div
          className="w-full max-w-[420px] rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #fcf9fe 0%, #f8f4fb 100%)',
            boxShadow: '0 25px 50px -12px rgba(97, 42, 79, 0.25), 0 0 0 1px rgba(139, 112, 130, 0.1)'
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(220,208,255,0.6) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(241,211,255,0.6) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 p-8">
            {step === 'success' ? (
              // Success state
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2
                  className="text-2xl mb-2"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#2a1f26' }}
                >
                  Password reset!
                </h2>
                <p className="mb-6" style={{ color: '#8a7a85', fontSize: '15px' }}>
                  Your password has been successfully changed. You're now signed in.
                </p>
                <button
                  onClick={() => window.location.href = '/home-page'}
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-xl text-white font-medium transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)',
                    fontSize: '15px'
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            ) : step === 'code' ? (
              // Enter code and new password
              <>
                <div className="text-center mb-8">
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center text-white font-serif text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)'
                    }}
                  >
                    M
                  </div>
                  <h2
                    className="text-2xl mb-2"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#2a1f26' }}
                  >
                    Enter your code
                  </h2>
                  <p style={{ color: '#8a7a85', fontSize: '15px' }}>
                    We sent a code to <strong style={{ color: '#4d3e48' }}>{email}</strong>
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* Code input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#4d3e48' }}>
                      Reset Code
                    </label>
                    <div className="relative">
                      <KeyRound
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#8B7082' }}
                      />
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none text-center tracking-widest font-mono text-lg"
                        style={inputStyle}
                        maxLength={6}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 112, 130, 0.2)'}
                      />
                    </div>
                  </div>

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#4d3e48' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#8B7082' }}
                      />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 112, 130, 0.2)'}
                      />
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#4d3e48' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#8B7082' }}
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 112, 130, 0.2)'}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      fontSize: '15px'
                    }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                <p className="text-center mt-6">
                  <button
                    onClick={() => { setStep('email'); setError(''); }}
                    className="inline-flex items-center gap-2 font-medium transition-colors hover:underline"
                    style={{ color: '#612a4f', fontSize: '14px' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Use a different email
                  </button>
                </p>
              </>
            ) : (
              // Enter email (Step 1)
              <>
                <div className="text-center mb-8">
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center text-white font-serif text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)'
                    }}
                  >
                    M
                  </div>
                  <h2
                    className="text-2xl mb-2"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#2a1f26' }}
                  >
                    Reset your password
                  </h2>
                  <p style={{ color: '#8a7a85', fontSize: '15px' }}>
                    Enter your email and we'll send you a reset code
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRequestCode} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                      style={{ color: '#4d3e48' }}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#8B7082' }}
                      />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 112, 130, 0.2)'}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      fontSize: '15px'
                    }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset code'
                    )}
                  </button>
                </form>

                <p className="text-center mt-6">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 font-medium transition-colors hover:underline"
                    style={{ color: '#612a4f', fontSize: '14px' }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
