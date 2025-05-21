import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use localStorage to persist auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for Supabase session first
        const { data: { session } } = await supabase.auth.getSession();

        // Fallback to localStorage if no active session
        if (session) {
          setIsAuthenticated(true);
        } else {
          const storedAuth = localStorage.getItem('isAuthenticated');
          if (storedAuth) {
            setIsAuthenticated(storedAuth === 'true');
          }
        }

        const storedOnboarding = localStorage.getItem('hasCompletedOnboarding');
        if (storedOnboarding) {
          setHasCompletedOnboarding(storedOnboarding === 'true');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fall back to localStorage on error
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedOnboarding = localStorage.getItem('hasCompletedOnboarding');

        if (storedAuth) {
          setIsAuthenticated(storedAuth === 'true');
        }

        if (storedOnboarding) {
          setHasCompletedOnboarding(storedOnboarding === 'true');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = async () => {
    try {
      // Try to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsAuthenticated(false);
      localStorage.setItem('isAuthenticated', 'false');
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasCompletedOnboarding, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};