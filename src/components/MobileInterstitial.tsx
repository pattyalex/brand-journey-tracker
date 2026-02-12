import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Mail, X } from 'lucide-react';

interface MobileInterstitialProps {
  onContinue: () => void;
}

const MobileInterstitial: React.FC<MobileInterstitialProps> = ({ onContinue }) => {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendLink = () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (email.trim()) {
      // In production, this would send an actual email
      console.log('Sending desktop link to:', email);
      setEmailSent(true);
      // Don't auto-dismiss - user should open on desktop
    }
  };

  if (emailSent) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
        style={{ background: '#fcf9fe' }}
      >
        {/* Decorative background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 5% 50%, rgba(220,208,255,0.4) 0%, transparent 55%),
              radial-gradient(ellipse 70% 80% at 95% 50%, rgba(241,211,255,0.35) 0%, transparent 50%)
            `
          }}
        />
        <div className="relative z-10 text-center max-w-sm">
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
            }}
          >
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: '#1a1523' }}
          >
            Reminder sent!
          </h2>
          <p className="mb-6" style={{ color: '#6b6478', fontSize: '14px', lineHeight: 1.6 }}>
            Check your inbox for a link to open HeyMeg on your laptop or desktop computer.
          </p>
          <a
            href="/landing.html"
            className="inline-block py-3 px-6 rounded-xl font-medium transition-all hover:opacity-90"
            style={{
              background: 'transparent',
              border: '1px solid #e5e0e3',
              color: '#6b6478',
              fontSize: '14px'
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{
        background: '#fcf9fe',
      }}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(220,208,255,0.4) 0%, transparent 55%),
            radial-gradient(ellipse 70% 80% at 95% 50%, rgba(241,211,255,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 10%, rgba(197,216,255,0.35) 0%, transparent 55%)
          `
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.2), 0 0 0 1px rgba(139, 112, 130, 0.08)',
          }}
        >
          <div className="p-8 text-center">
            {/* Logo */}
            <div
              className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center text-white font-serif text-2xl"
              style={{
                background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                boxShadow: '0 8px 20px rgba(97, 42, 79, 0.35)'
              }}
            >
              M
            </div>

            {/* Icon row */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(122, 56, 104, 0.08)' }}
              >
                <Smartphone className="w-5 h-5" style={{ color: '#8B7082' }} />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4c4cf' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4c4cf' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4c4cf' }} />
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(122, 56, 104, 0.15) 0%, rgba(97, 42, 79, 0.1) 100%)' }}
              >
                <Monitor className="w-5 h-5" style={{ color: '#612a4f' }} />
              </div>
            </div>

            {/* Text */}
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: '#1a1523' }}
            >
              HeyMeg works best on desktop
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: '#6b6478', lineHeight: 1.6 }}
            >
              Our full features work best on a laptop or desktop. Want us to send you a reminder to open HeyMeg on your computer?
            </p>

            {/* Email input (conditional) */}
            {showEmailInput && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e5e0e3',
                    color: '#1a1523',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #7a3868';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid #e5e0e3';
                    e.target.style.background = '#fafafa';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendLink();
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSendLink}
                className="w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                  fontSize: '14px'
                }}
              >
                <Mail className="w-4 h-4" />
                {showEmailInput ? 'Send reminder' : 'Send me a reminder'}
              </button>

              <button
                onClick={onContinue}
                className="w-full py-3 px-4 rounded-xl font-medium transition-all hover:bg-gray-50"
                style={{
                  background: 'transparent',
                  border: '1px solid #e5e0e3',
                  color: '#6b6478',
                  fontSize: '14px'
                }}
              >
                Continue on mobile anyway
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div
            className="px-8 py-4 text-center border-t"
            style={{ borderColor: '#f0f0f0', background: '#fafafa' }}
          >
            <p className="text-xs" style={{ color: '#8a8a8a' }}>
              Mobile app coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that handles the display logic
export const MobileInterstitialWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check if we should show the interstitial
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      const isPopup = window.opener !== null;
      const hasSeenInterstitial = sessionStorage.getItem('heymeg_mobile_interstitial_seen');

      if (isMobile && !isPopup && !hasSeenInterstitial) {
        setShowInterstitial(true);
      }
      setHasChecked(true);
    };

    checkMobile();
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem('heymeg_mobile_interstitial_seen', 'true');
    setShowInterstitial(false);
  };

  // Don't render anything until we've checked
  if (!hasChecked) {
    return null;
  }

  if (showInterstitial) {
    return <MobileInterstitial onContinue={handleContinue} />;
  }

  return <>{children}</>;
};

export default MobileInterstitial;
