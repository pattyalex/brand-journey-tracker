
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"

// Eagerly load components with known issues
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import GetStarted from './pages/GetStarted';
import CollabManagement from './pages/CollabManagement';  // Import eagerly instead of lazily

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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/index" element={<Index />} />
            <Route path="/bank-of-content" element={<BankOfContent />} />
            <Route path="/content-ideation" element={<ContentIdeation />} />
            <Route path="/content-planning" element={<ContentPlanning />} />
            <Route path="/content-calendar" element={<ContentCalendar />} />
            <Route path="/strategy-growth" element={<StrategyGrowth />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/quick-notes" element={<QuickNotes />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/task-board" element={<TaskBoard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/help" element={<Help />} />
            <Route path="/weekly-content" element={<WeeklyContentTasks />} />
            <Route path="/social-media-scheduler" element={<SocialMediaScheduler />} />
            <Route path="/partnerships-management" element={<PartnershipsManagement />} />
            <Route path="/trending" element={<TrendingContent />} />
            <Route path="/collab-management" element={<CollabManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
