import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";

// Eagerly load main pages for instant navigation
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import GetStarted from './pages/GetStarted';
import CollabManagement from './pages/CollabManagement';
import StrategyDemo from './pages/StrategyDemo';
import HomePage from './pages/HomePage';
import OnboardingFlow from './pages/OnboardingFlow';
import LandingPage from './pages/LandingPage';
import Production from './pages/Production';
import StrategyGrowth from './pages/StrategyGrowth';
import TaskBoard from './pages/TaskBoard';
import Brands from './pages/Brands';

// Lazy load less frequently used pages
const ContentIdeation = lazy(() => import('./pages/ContentIdeation'));
const ContentPlanning = lazy(() => import('./pages/ContentPlanning'));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const Analytics = lazy(() => import('./pages/Analytics'));
const QuickNotes = lazy(() => import('./pages/QuickNotes'));
const Settings = lazy(() => import('./pages/Settings'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const Help = lazy(() => import('./pages/Help'));
const WeeklyContentTasks = lazy(() => import('./pages/WeeklyContentTasks'));
const SocialMediaScheduler = lazy(() => import('./pages/SocialMediaScheduler'));
const Index = lazy(() => import('./pages/Index'));
const EmailVerificationCallback = lazy(() => import('./pages/EmailVerificationCallback'));

// Loading component - invisible to prevent flash during lazy load
const PageLoader = () => null;

// Import useAuth hook
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};



// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <AuthProvider>
            <LoginModal />
            <Toaster />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/auth/callback" element={<EmailVerificationCallback />} />

              {/* Protected routes - require authentication */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/home-page" element={
                <ProtectedRoute>
                  <HomePage />
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
              <Route path="/production" element={
                <ProtectedRoute>
                  <Production />
                </ProtectedRoute>
              } />
              <Route path="/strategy-growth" element={
                <ProtectedRoute>
                  <StrategyGrowth />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/quick-notes" element={
                <ProtectedRoute>
                  <QuickNotes />
                </ProtectedRoute>
              } />
              <Route path="/get-started" element={
                <ProtectedRoute>
                  <GetStarted />
                </ProtectedRoute>
              } />
              <Route path="/task-board" element={
                <ProtectedRoute>
                  <TaskBoard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/my-account" element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />
              <Route path="/weekly-content" element={
                <ProtectedRoute>
                  <WeeklyContentTasks />
                </ProtectedRoute>
              } />
              <Route path="/social-media-scheduler" element={
                <ProtectedRoute>
                  <SocialMediaScheduler />
                </ProtectedRoute>
              } />
              <Route path="/collab-management" element={
                <ProtectedRoute>
                  <CollabManagement />
                </ProtectedRoute>
              } />
              <Route path="/brands" element={
                <ProtectedRoute>
                  <Brands />
                </ProtectedRoute>
              } />
              <Route path="/strategy-demo" element={
                <ProtectedRoute>
                  <StrategyDemo />
                </ProtectedRoute>
              } />
              <Route path="/index" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
                            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;