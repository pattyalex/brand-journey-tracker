import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/supabaseClient";
import { signIn } from "@/auth";
import EmailVerificationStatus from "@/components/EmailVerificationStatus";

const LoginModal: React.FC = () => {
  const { loginOpen, closeLoginModal, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.success) {
        login();
        closeLoginModal();
        navigate('/home-page');
      } else if (result.needsVerification) {
        setPendingVerificationEmail(email);
        setShowEmailVerification(true);
      } else {
        setError(result.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleEmailVerificationComplete = () => {
    setShowEmailVerification(false);
    setPendingVerificationEmail('');
    login();
    closeLoginModal();
    navigate('/home-page');
  };

return (
    <Dialog open={loginOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-[425px]">
        {showEmailVerification ? (
          <div className="p-4">
            <EmailVerificationStatus
              email={pendingVerificationEmail}
              onVerificationComplete={handleEmailVerificationComplete}
              onBack={() => setShowEmailVerification(false)}
            />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{showSignUp ? 'Sign Up' : 'Log In'}</DialogTitle>
              <DialogDescription>
                {showSignUp 
                  ? 'Create your account to get started' 
                  : 'Enter your email and password to access your account'
                }
              </DialogDescription>
            </DialogHeader>
          
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;