import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { openLoginModal, isAuthenticated, isAuthLoaded, loginOpen } = useAuth();
  const navigate = useNavigate();
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    // Wait for auth to load before making any decisions
    if (!isAuthLoaded) {
      return;
    }

    // If already authenticated, redirect to home-page (no modal)
    if (isAuthenticated) {
      navigate('/home-page', { replace: true });
      return;
    }

    // Not authenticated - open the login modal
    if (!loginOpen && !hasDecided) {
      setHasDecided(true);
      openLoginModal();
    }
  }, [isAuthLoaded, isAuthenticated, loginOpen, hasDecided, navigate, openLoginModal]);

  // While loading, show a loading state
  if (!isAuthLoaded) {
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

      {/* Center content - just shows while modal loads */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
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
      </div>
    </div>
  );
};

export default LoginPage;
