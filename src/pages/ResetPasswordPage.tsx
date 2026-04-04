import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Handle PKCE code exchange if present
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (err) {
          console.error('Code exchange failed:', err);
          setLinkExpired(true);
          return;
        }
      }

      // Wait for session to be available
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
    };

    // Also listen for PASSWORD_RECOVERY event (hash-based flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
      }
    });

    init();

    // If no session after 5 seconds, the link is likely expired
    const timeout = setTimeout(() => {
      setSessionReady((ready) => {
        if (!ready) setLinkExpired(true);
        return ready;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Add a timeout so the user isn't stuck forever if the session is invalid
      const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: 'Request timed out. Your reset link may have expired. Please request a new one.' } }), 15000)
      );

      const updatePromise = supabase.auth.updateUser({ password });
      const result = await Promise.race([updatePromise, timeoutPromise]);

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('Failed to update password. Your reset link may have expired — please request a new one from the settings page.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderColor: 'rgba(139, 112, 130, 0.2)',
    background: 'rgba(255, 255, 255, 0.8)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, rgba(250, 247, 249, 0.95) 0%, rgba(245, 240, 243, 0.98) 100%)'
    }}>
      <div className="w-full max-w-md mx-auto p-6">
        <div className="rounded-2xl p-8" style={{
          background: 'white',
          boxShadow: '0 8px 32px rgba(97, 42, 79, 0.12)',
          border: '1px solid rgba(139, 112, 130, 0.1)'
        }}>
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#7a3868' }} />
              <h2 className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#2a1f26' }}>
                Password updated
              </h2>
              <p className="mb-6" style={{ color: '#8a7a85', fontSize: '15px' }}>
                Your password has been successfully changed.
              </p>
              <a
                href="/production"
                className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl text-white font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                  boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)',
                  fontSize: '15px',
                  textDecoration: 'none'
                }}
              >
                Go to Dashboard
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center text-white font-serif text-xl"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)'
                  }}>
                  M
                </div>
                <h2 className="text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#2a1f26' }}>
                  Set new password
                </h2>
                <p style={{ color: '#8a7a85', fontSize: '15px' }}>
                  Enter your new password below
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {linkExpired ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#dc2626' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: '#2a1f26' }}>Reset link expired</p>
                  <p className="text-sm mb-5" style={{ color: '#8a7a85' }}>
                    This link is no longer valid. Please request a new one from your account settings.
                  </p>
                  <a
                    href="/my-account"
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-white font-medium transition-all text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)',
                      textDecoration: 'none'
                    }}
                  >
                    Go to Settings
                  </a>
                </div>
              ) : !sessionReady ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-[#7a3868] rounded-full animate-spin mx-auto mb-4" />
                  <p style={{ color: '#8a7a85', fontSize: '14px' }}>Verifying reset link...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#4d3e48' }}>
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7082' }} />
                      <input
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#8B7082'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 112, 130, 0.2)'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#4d3e48' }}>
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7082' }} />
                      <input
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    className="w-full py-3.5 rounded-xl text-white font-medium transition-all"
                    style={{
                      background: loading ? '#8B7082' : 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                      boxShadow: '0 4px 12px rgba(97, 42, 79, 0.3)',
                      fontSize: '15px'
                    }}
                  >
                    {loading ? 'Updating...' : 'Update password'}
                  </button>

                  <div className="text-center pt-2">
                    <a href="/login" className="inline-flex items-center gap-2 text-sm" style={{ color: '#8B7082' }}>
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </a>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
