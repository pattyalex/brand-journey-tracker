import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Eagerly load components
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import GetStarted from './pages/GetStarted';
import CollabManagement from './pages/CollabManagement';
import StrategyDemo from './pages/StrategyDemo';
import HomePage from './pages/HomePage';
import OnboardingFlow from './pages/OnboardingFlow';
import LandingPage from './pages/LandingPage';

// Lazy load all other pages
const TrendingContent = lazy(() => import('./pages/TrendingContent'));
const BankOfContent = lazy(() => import('./pages/BankOfContent'));
const ContentIdeation = lazy(() => import('./pages/ContentIdeation'));
const ContentPlanning = lazy(() => import('./pages/ContentPlanning'));
const ContentCalendar = lazy(() => import('./pages/ContentCalendar'));
const StrategyGrowth = lazy(() => import('./pages/StrategyGrowth'));
const Analytics = lazy(() => import('./pages/Analytics'));
const QuickNotes = lazy(() => import('./pages/QuickNotes'));
const TaskBoard = lazy(() => import('./pages/TaskBoard'));
const Settings = lazy(() => import('./pages/Settings'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const Help = lazy(() => import('./pages/Help'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const WeeklyContentTasks = lazy(() => import('./pages/WeeklyContentTasks'));
const SocialMediaScheduler = lazy(() => import('./pages/SocialMediaScheduler'));
const Index = lazy(() => import('./pages/Index'));
const PartnershipsManagement = lazy(() => import('./pages/PartnershipsManagement'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-20 h-20 bg-muted rounded-full mb-4"></div>
      <div className="h-4 w-32 bg-muted rounded"></div>
    </div>
  </div>
);

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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />

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
              <Route path="/bank-of-content" element={
                <ProtectedRoute>
                  <BankOfContent />
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
              <Route path="/terms-and-conditions" element={
                <ProtectedRoute>
                  <TermsAndConditions />
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
              <Route path="/partnerships-management" element={
                <ProtectedRoute>
                  <PartnershipsManagement />
                </ProtectedRoute>
              } />
              <Route path="/trending" element={
                <ProtectedRoute>
                  <TrendingContent />
                </ProtectedRoute>
              } />
              <Route path="/collab-management" element={
                <ProtectedRoute>
                  <CollabManagement />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="mb-4 text-gray-700">The application encountered an error. Please try refreshing the page.</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
              {this.state.error?.message || "Unknown error"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;
import SignupForm from './SignupForm'