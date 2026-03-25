import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for password recovery in the URL hash (type=recovery)
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        // Redirect to reset password page with the hash intact
        window.location.href = '/reset-password' + window.location.search + hash;
        return;
      }

      // Handle PKCE code flow (email confirmation)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error);
          navigate('/login');
          return;
        }
      }

      // Check if this is a password recovery session
      let isRecovery = false;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          isRecovery = true;
          navigate('/reset-password');
        }
      });

      // Small delay to let PASSWORD_RECOVERY event fire if applicable
      await new Promise(resolve => setTimeout(resolve, 500));
      subscription.unsubscribe();

      if (isRecovery) return;

      // Now get the session (works for both hash and code flows)
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const user = session.user;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // Brand new user — no profile yet, send to onboarding
          navigate('/onboarding');
        } else if (!profile.has_completed_onboarding) {
          // Existing profile but onboarding not marked complete —
          // mark it complete now (returning user) and go to dashboard
          await supabase
            .from('profiles')
            .update({ has_completed_onboarding: true })
            .eq('id', user.id);
          navigate('/home-page');
        } else {
          navigate('/home-page');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fcf9fe' }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif text-xl animate-pulse"
        style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
      >
        M
      </div>
    </div>
  );
}
