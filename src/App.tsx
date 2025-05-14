
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import ContentIdeation from "./pages/ContentIdeation";
import ContentPlanning from "./pages/ContentPlanning";
import ContentCalendar from "./pages/ContentCalendar";
import Analytics from "./pages/Analytics";
import TaskBoard from "./pages/TaskBoard";
import BankOfContent from "./pages/BankOfContent";
import WeeklyContentTasks from "./pages/WeeklyContentTasks";
import CollabManagement from "./pages/CollabManagement";
import StrategyGrowth from "./pages/StrategyGrowth";
import StrategyDemo from "./pages/StrategyDemo";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PartnershipsManagement from "./pages/PartnershipsManagement";
import TrendingContent from "./pages/TrendingContent";
import MyAccount from "./pages/MyAccount";
import IncomeTracker from "./pages/IncomeTracker";
import VisionBoard from "./pages/VisionBoard";
import QuickNotes from "./pages/QuickNotes";
import SocialMediaScheduler from "./pages/SocialMediaScheduler";
import Research from "./pages/Research";
import Help from "./pages/Help";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if user is authenticated
      const authStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(authStatus);

      // Check if onboarding is complete
      const onboardingStatus = localStorage.getItem('onboardingComplete') === 'true';
      setIsOnboardingComplete(onboardingStatus);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Default to not authenticated if localStorage fails
      setIsAuthenticated(false);
      setIsOnboardingComplete(false);
    } finally {
      // Set loading to false after checking auth status, regardless of success/failure
      setIsLoading(false);
    }
  }, []);

  // For debugging
  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, isOnboardingComplete, isLoading });
  }, [isAuthenticated, isOnboardingComplete, isLoading]);

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated && !isOnboardingComplete) {
      console.log("Redirecting to landing page from protected route");
      return <Navigate to="/landing" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <ThemeProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />

            {/* Root route with conditional redirect */}
            <Route path="/" element={
              isAuthenticated || isOnboardingComplete ? 
                <HomePage /> : 
                <Navigate to="/landing" replace />
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/content-ideation" element={
              <ProtectedRoute>
                <ContentIdeation />
              </ProtectedRoute>
            } />
            <Route path="/content-planning" element={
              <ProtectedRoute>
                <ContentPlanning />
              </ProtectedRoute>
            } />
            <Route path="/content-calendar" element={
              <ProtectedRoute>
                <ContentCalendar />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/task-board" element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            } />
            <Route path="/bank-of-content" element={
              <ProtectedRoute>
                <BankOfContent />
              </ProtectedRoute>
            } />
            <Route path="/weekly-content-tasks" element={
              <ProtectedRoute>
                <WeeklyContentTasks />
              </ProtectedRoute>
            } />
            <Route path="/collab-management" element={
              <ProtectedRoute>
                <CollabManagement />
              </ProtectedRoute>
            } />
            <Route path="/strategy-growth" element={
              <ProtectedRoute>
                <StrategyGrowth />
              </ProtectedRoute>
            } />
            <Route path="/strategy-demo" element={
              <ProtectedRoute>
                <StrategyDemo />
              </ProtectedRoute>
            } />
            <Route path="/partnerships-management" element={
              <ProtectedRoute>
                <PartnershipsManagement />
              </ProtectedRoute>
            } />
            <Route path="/income-tracker" element={
              <ProtectedRoute>
                <IncomeTracker />
              </ProtectedRoute>
            } />
            <Route path="/trending-content" element={
              <ProtectedRoute>
                <TrendingContent />
              </ProtectedRoute>
            } />
            <Route path="/my-account" element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            } />
            <Route path="/vision-board" element={
              <ProtectedRoute>
                <VisionBoard />
              </ProtectedRoute>
            } />
            <Route path="/quick-notes" element={
              <ProtectedRoute>
                <QuickNotes />
              </ProtectedRoute>
            } />
            <Route path="/social-media-scheduler" element={
              <ProtectedRoute>
                <SocialMediaScheduler />
              </ProtectedRoute>
            } />
            <Route path="/research" element={
              <ProtectedRoute>
                <Research />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </ThemeProvider>
    </Router>
  );
}

export default App;
