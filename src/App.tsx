import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import { MobileInterstitialWrapper } from "./components/MobileInterstitial";

// Lazy load all pages for optimal code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const GetStarted = lazy(() => import('./pages/GetStarted'));
const CollabManagement = lazy(() => import('./pages/CollabManagement'));
const StrategyDemo = lazy(() => import('./pages/StrategyDemo'));
const HomePage = lazy(() => import('./pages/HomePage'));
const OnboardingFlow = lazy(() => import('./pages/OnboardingFlow'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Production = lazy(() => import('./pages/Production'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const StrategyGrowth = lazy(() => import('./pages/StrategyGrowth'));
const TaskBoard = lazy(() => import('./pages/TaskBoard'));
const Brands = lazy(() => import('./pages/Brands'));
const MembershipPage = lazy(() => import('./components/MembershipPage').then(m => ({ default: m.MembershipPage })));
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

// Loading component - invisible to prevent flash during lazy load
const PageLoader = () => null;

// Import useAuth hook
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Redirect component for landing page — but intercept auth tokens first
const LandingRedirect = () => {
  React.useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    // If Supabase redirected here with auth tokens, forward to auth/callback
    if (hash.includes('access_token') || hash.includes('error') || search.includes('code=')) {
      window.location.href = '/auth/callback' + search + hash;
      return;
    }
    window.location.href = '/landing.html';
  }, []);
  return null;
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoaded, hasCompletedOnboarding } = useAuth();

  // Wait for auth to load before making any decisions
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fcf9fe' }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif text-xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
        >
          M
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/landing.html';
    return null;
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Wrap with mobile interstitial for protected routes
  return <MobileInterstitialWrapper>{children}</MobileInterstitialWrapper>;
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
              <Route path="/" element={<LandingRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

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
              <Route path="/membership" element={
                <ProtectedRoute>
                  <MembershipPage />
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