
import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: () => void;
  completeOnboarding: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('hasCompletedOnboarding', hasCompletedOnboarding.toString());
  }, [isAuthenticated, hasCompletedOnboarding]);

  const login = () => setIsAuthenticated(true);
  const completeOnboarding = () => setHasCompletedOnboarding(true);
  const logout = () => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      hasCompletedOnboarding, 
      login, 
      completeOnboarding, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
