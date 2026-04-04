import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Mail } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { openLoginModal, closeLoginModal, isAuthenticated, isAuthLoaded, loginOpen, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasDecided, setHasDecided] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const isAccountDeleted = searchParams.get('deleted') === 'true';

  useEffect(() => {
    // Wait for auth to load before making any decisions
    if (!isAuthLoaded || verifyingSession) {
      return;
    }

    // If apparently authenticated, verify the session is actually valid server-side
    if (isAuthenticated && !hasDecided) {
      setVerifyingSession(true);

      const verifyTimeout = setTimeout(() => {
        // If getUser hangs, treat as stale session
        setVerifyingSession(false);
        supabase.auth.signOut();
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        setHasDecided(true);
        openLoginModal();
      }, 8000);

      supabase.auth.getUser().then(({ data: { user }, error }) => {
        clearTimeout(verifyTimeout);
        setVerifyingSession(false);
        if (user && !error) {
          // Session is genuinely valid — close modal (releases Radix scroll lock) and redirect
          closeLoginModal();
          navigate('/production', { replace: true });
        } else {
          // Stale/expired session — clear it and show login
          supabase.auth.signOut();
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) localStorage.removeItem(key);
          });
          setHasDecided(true);
          openLoginModal();
        }
      });
      return;
    }

    // Not authenticated - open the login modal (unless account was just deleted)
    if (!loginOpen && !hasDecided && !isAccountDeleted) {
      setHasDecided(true);
      openLoginModal();
    }
  }, [isAuthLoaded, isAuthenticated, loginOpen, hasDecided, navigate, openLoginModal, verifyingSession]);

  // While loading or verifying session, show a loading state
  if (!isAuthLoaded || verifyingSession) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: '#fcf9fe' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-serif text-2xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
          }}
        >
          M
        </div>
      </div>
    );
  }

  // If authenticated, don't render anything (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Show the branded background for unauthenticated users
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: '#fcf9fe',
      }}
    >
      {/* Decorative background matching landing page */}
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

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {isAccountDeleted ? (
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#612a4f]/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-[#612a4f]" />
            </div>
            <h1 className="text-2xl text-[#2d2a26] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Your account has been deleted
            </h1>
            <p className="text-sm text-[#8B7082] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              All your data has been permanently removed.
            </p>
            <p className="text-sm text-[#8B7082] mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              We're sorry to see you go. If you ever want to come back, you're always welcome.
            </p>
            <a
              href="/landing.html"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-medium transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 16px rgba(97, 42, 79, 0.3)'
              }}
            >
              Back to HeyMeg
            </a>
          </div>
        ) : (
          <div className="text-center">
            {/* Logo */}
            <a
              href="/landing.html"
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white font-serif text-2xl mb-6 transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                boxShadow: '0 8px 24px rgba(97, 42, 79, 0.3)'
              }}
            >
              M
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
