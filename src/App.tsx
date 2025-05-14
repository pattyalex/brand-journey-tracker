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

  useEffect(() => {
    // Application initialization
    try {
      // Perform any necessary initialization here
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
            onClick={() => window.location.reload()}
          >
            Reload Application
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
                  return localStorage.getItem('onboardingComplete') === 'true'
                    ? <Navigate to="/dashboard" replace />
                    : <Navigate to="/landing" replace />;
                } catch (error) {
                  console.error("Error accessing localStorage:", error);
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