
import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import FallbackPage from "./FallbackPage";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import "./App.css";

// Lazy load other pages to avoid initial load issues
const HomePage = lazy(() => import("./pages/HomePage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContentIdeation = lazy(() => import("./pages/ContentIdeation"));
const ContentPlanning = lazy(() => import("./pages/ContentPlanning"));
const ContentCalendar = lazy(() => import("./pages/ContentCalendar"));
const Analytics = lazy(() => import("./pages/Analytics"));
const TaskBoard = lazy(() => import("./pages/TaskBoard"));
const BankOfContent = lazy(() => import("./pages/BankOfContent"));
const WeeklyContentTasks = lazy(() => import("./pages/WeeklyContentTasks"));
const CollabManagement = lazy(() => import("./pages/CollabManagement"));
const StrategyGrowth = lazy(() => import("./pages/StrategyGrowth"));
const StrategyDemo = lazy(() => import("./pages/StrategyDemo"));
const Settings = lazy(() => import("./pages/Settings"));
const PartnershipsManagement = lazy(() => import("./pages/PartnershipsManagement"));
const TrendingContent = lazy(() => import("./pages/TrendingContent"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const IncomeTracker = lazy(() => import("./pages/IncomeTracker"));
const VisionBoard = lazy(() => import("./pages/VisionBoard"));
const QuickNotes = lazy(() => import("./pages/QuickNotes"));
const SocialMediaScheduler = lazy(() => import("./pages/SocialMediaScheduler"));
const Research = lazy(() => import("./pages/Research"));
const Help = lazy(() => import("./pages/Help"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    try {
      // Simple auth check - no complex operations that might fail
      const authStatus = localStorage.getItem('isLoggedIn') === 'true';
      const onboardingStatus = localStorage.getItem('onboardingComplete') === 'true';
      
      setIsAuthenticated(authStatus);
      setIsOnboardingComplete(onboardingStatus);
      
      console.log("Auth initialized:", { authStatus, onboardingStatus });
    } catch (error) {
      console.error("Error during initialization:", error);
      // Default to not authenticated if localStorage fails
      setIsAuthenticated(false);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
      // Mark the app as ready after a short delay to ensure UI updates
      setTimeout(() => setAppReady(true), 300);
    }
  }, []);

  // Loading state while initializing
  if (isLoading || !appReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading application...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // Protected route component with simplified logic
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated && !isOnboardingComplete) {
      console.log("Redirecting to landing page");
      return <Navigate to="/landing" replace />;
    }
    return <>{children}</>;
  };

  // Basic fallback for lazy-loaded components
  const PageLoadingFallback = (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading page...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <ThemeProvider defaultTheme="light">
        <Suspense fallback={PageLoadingFallback}>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/error" element={<FallbackPage />} />

            {/* Root route with conditional redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated || isOnboardingComplete ? 
                  <HomePage /> : 
                  <Navigate to="/landing" replace />
              } 
            />

            {/* Protected routes - simplified */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/content-ideation" element={<ProtectedRoute><ContentIdeation /></ProtectedRoute>} />
            <Route path="/content-planning" element={<ProtectedRoute><ContentPlanning /></ProtectedRoute>} />
            <Route path="/content-calendar" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/task-board" element={<ProtectedRoute><TaskBoard /></ProtectedRoute>} />
            <Route path="/bank-of-content" element={<ProtectedRoute><BankOfContent /></ProtectedRoute>} />
            <Route path="/weekly-content-tasks" element={<ProtectedRoute><WeeklyContentTasks /></ProtectedRoute>} />
            <Route path="/collab-management" element={<ProtectedRoute><CollabManagement /></ProtectedRoute>} />
            <Route path="/strategy-growth" element={<ProtectedRoute><StrategyGrowth /></ProtectedRoute>} />
            <Route path="/strategy-demo" element={<ProtectedRoute><StrategyDemo /></ProtectedRoute>} />
            <Route path="/partnerships-management" element={<ProtectedRoute><PartnershipsManagement /></ProtectedRoute>} />
            <Route path="/income-tracker" element={<ProtectedRoute><IncomeTracker /></ProtectedRoute>} />
            <Route path="/trending-content" element={<ProtectedRoute><TrendingContent /></ProtectedRoute>} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/vision-board" element={<ProtectedRoute><VisionBoard /></ProtectedRoute>} />
            <Route path="/quick-notes" element={<ProtectedRoute><QuickNotes /></ProtectedRoute>} />
            <Route path="/social-media-scheduler" element={<ProtectedRoute><SocialMediaScheduler /></ProtectedRoute>} />
            <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </ThemeProvider>
    </Router>
  );
}

export default App;
