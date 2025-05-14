import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
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

// Simple error fallback
const ErrorFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="mb-4">We're having trouble loading the application.</p>
      <div className="flex space-x-4">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/landing';
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Data & Reset
        </button>
      </div>
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

            {/* Root route with redirection to landing */}
            <Route path="/" element={<Navigate to="/landing" replace />} />

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