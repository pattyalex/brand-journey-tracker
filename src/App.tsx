import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import FallbackPage from "./FallbackPage";
import "./App.css";

// Simple loading component
const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
      <p className="text-muted-foreground">Please wait while we set things up</p>
    </div>
  </div>
);

function App() {
  // Track loading state
  const [isLoading, setIsLoading] = useState(true);
  // Track initialization errors
  const [initError, setInitError] = useState<Error | null>(null);
  // Track runtime errors
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught in App:", event.error);
      setRuntimeError(event.error || new Error("Unknown runtime error"));
      // Prevent the default browser error handling
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    // Application initialization
    try {
      // Clear any localStorage that might be corrupted
      try {
        // Test localStorage access
        const testKey = '__test_storage__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (storageError) {
        console.warn("LocalStorage error detected, clearing storage:", storageError);
        localStorage.clear();
      }
      
      console.log("App initializing...");
      
      // Simulate loading time but with proper error handling
      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log("App initialization complete");
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("App initialization error:", error);
      setInitError(error instanceof Error ? error : new Error('Unknown initialization error'));
      setIsLoading(false);
    }
  }, []);

  // Handle initialization errors
  if (initError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Initialization Error</h2>
          <p className="mb-4">{initError.message}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              localStorage.clear(); // Clear potentially corrupted state
              window.location.reload();
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
  
  // Handle runtime errors
  if (runtimeError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
          <p className="mb-4">{runtimeError.message || "An unexpected error occurred"}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2 w-full"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/landing';
            }}
          >
            Reset & Go to Landing
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Main application render with proper error handling
  return (
    <Router>
      <ThemeProvider defaultTheme="light">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />

            {/* Application routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* Root route with conditional redirect based on authentication */}
            <Route path="/" element={
              (() => {
                try {
                  // First check if localStorage is available
                  const testKey = '__test_storage__';
                  localStorage.setItem(testKey, 'test');
                  localStorage.removeItem(testKey);
                  
                  // Now safely access the onboarding state
                  return localStorage.getItem('onboardingComplete') === 'true'
                    ? <Navigate to="/dashboard" replace />
                    : <Navigate to="/landing" replace />;
                } catch (error) {
                  console.error("Error accessing localStorage:", error);
                  // Clear potentially corrupted localStorage
                  try {
                    localStorage.clear();
                  } catch (e) {
                    console.error("Failed to clear localStorage:", e);
                  }
                  return <Navigate to="/landing" replace />;
                }
              })()
            } />

            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </ThemeProvider>
    </Router>
  );
}

export default App;