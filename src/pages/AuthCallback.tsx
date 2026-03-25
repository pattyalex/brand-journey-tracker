import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      // Check for password recovery in the URL hash (type=recovery)
      if (hash.includes('type=recovery')) {
        window.location.href = '/reset-password' + window.location.search + hash;
        return;
      }

      // Handle email change confirmation — Supabase sends type=email_change in the hash
      if (hash.includes('type=email_change')) {
        // The hash contains the tokens Supabase needs to finalize the email change.
        // Calling getSession or exchangeCodeForSession will process them automatically.
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Email change confirmation failed:', error);
        } else {
          console.log('✅ Email change confirmed successfully');
          // Also update the profiles table with the new email
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            await supabase
              .from('profiles')
              .update({ email: user.email })
              .eq('id', user.id);
            console.log('✅ Profile email synced to:', user.email);
          }
        }
        navigate('/home-page');
        return;
      }

      // Handle PKCE code flow (email confirmation / signup)
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error);
          navigate('/login');
          return;
        }
        // If this was an email change code, sync the new email to profiles
        if (data?.user?.email) {
          await supabase
            .from('profiles')
            .update({ email: data.user.email })
            .eq('id', data.user.id);
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
