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
  // Simplified state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Router>
      <ThemeProvider>
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
              localStorage.getItem('onboardingComplete') === 'true' 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/landing" replace />
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