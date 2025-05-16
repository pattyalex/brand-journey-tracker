import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import HomePage from '@/pages/HomePage';
import ContentIdeation from '@/pages/ContentIdeation';
import ContentPlanning from '@/pages/ContentPlanning';
import ContentCalendar from '@/pages/ContentCalendar';
import BankOfContent from '@/pages/BankOfContent';
import PartnershipsManagement from '@/pages/PartnershipsManagement';
import StrategyGrowth from '@/pages/StrategyGrowth';
import Analytics from '@/pages/Analytics';
import WeeklyContentTasks from '@/pages/WeeklyContentTasks';
import TaskBoard from '@/pages/TaskBoard';
import IncomeTracker from '@/pages/IncomeTracker';
import MyAccount from '@/pages/MyAccount';
import Help from '@/pages/Help';
import Settings from '@/pages/Settings';
import QuickNotes from '@/pages/QuickNotes';
import VisionBoard from '@/pages/VisionBoard';
import TrendingContent from '@/pages/TrendingContent';
import StrategyDemo from '@/pages/StrategyDemo';
import NotFound from '@/pages/NotFound';
import GetStarted from '@/pages/GetStarted';
import OnboardingFlow from '@/pages/OnboardingFlow';
import Auth from '@/pages/Auth';
import Research from '@/pages/Research';
import SocialMediaScheduler from '@/pages/SocialMediaScheduler';
import CollabManagement from '@/pages/CollabManagement';
import '@/App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes - Layout will handle authentication check */}
          <Route path="/home-page" element={
            <Layout>
              <HomePage />
            </Layout>
          } />
          <Route path="/planner" element={
            <Layout>
              <ContentPlanning />
            </Layout>
          } />
          <Route path="/content-ideation" element={
            <Layout>
              <ContentIdeation />
            </Layout>
          } />
          <Route path="/content-calendar" element={
            <Layout>
              <ContentCalendar />
            </Layout>
          } />
          <Route path="/bank-of-content" element={
            <Layout>
              <BankOfContent />
            </Layout>
          } />
          <Route path="/partnerships" element={
            <Layout>
              <PartnershipsManagement />
            </Layout>
          } />
          <Route path="/strategy" element={
            <Layout>
              <StrategyGrowth />
            </Layout>
          } />
          <Route path="/analytics" element={
            <Layout>
              <Analytics />
            </Layout>
          } />
          <Route path="/weekly-content-workflow" element={
            <Layout>
              <WeeklyContentTasks />
            </Layout>
          } />
          <Route path="/task-board" element={
            <Layout>
              <TaskBoard />
            </Layout>
          } />
          <Route path="/income-tracker" element={
            <Layout>
              <IncomeTracker />
            </Layout>
          } />
          <Route path="/my-account" element={
            <Layout>
              <MyAccount />
            </Layout>
          } />
          <Route path="/help" element={
            <Layout>
              <Help />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="/quick-notes" element={
            <Layout>
              <QuickNotes />
            </Layout>
          } />
          <Route path="/vision-board" element={
            <Layout>
              <VisionBoard />
            </Layout>
          } />
          <Route path="/trending-content" element={
            <Layout>
              <TrendingContent />
            </Layout>
          } />
          <Route path="/strategy-demo" element={
            <Layout>
              <StrategyDemo />
            </Layout>
          } />
          <Route path="/research" element={
            <Layout>
              <Research />
            </Layout>
          } />
          <Route path="/social-media-scheduler" element={
            <Layout>
              <SocialMediaScheduler />
            </Layout>
          } />
          <Route path="/collab-management" element={
            <Layout>
              <CollabManagement />
            </Layout>
          } />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;