
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
    </ThemeProvider>
  );
}

export default App;
