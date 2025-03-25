
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from './pages/Dashboard';
import BankOfContent from './pages/BankOfContent';
import ContentIdeation from './pages/ContentIdeation';
import ContentCalendar from './pages/ContentCalendar';
import StrategyGrowth from './pages/StrategyGrowth';
import IncomeTracker from './pages/IncomeTracker';
import Analytics from './pages/Analytics';
import QuickNotes from './pages/QuickNotes';
import GetStarted from './pages/GetStarted';
import TaskBoard from './pages/TaskBoard';
import Settings from './pages/Settings';
import MyAccount from './pages/MyAccount';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import WeeklyContentTasks from './pages/WeeklyContentTasks';
import ContentPlanning from './pages/ContentPlanning';
import SocialMediaScheduler from './pages/SocialMediaScheduler';
import Index from './pages/Index';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <Router>
        <Routes>
          {/* Main navigation routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/index" element={<Index />} />
          <Route path="/bank-of-content" element={<BankOfContent />} />
          <Route path="/content-ideation" element={<ContentIdeation />} />
          <Route path="/content-planning" element={<ContentPlanning />} />
          <Route path="/content-calendar" element={<ContentCalendar />} />
          <Route path="/strategy-growth" element={<StrategyGrowth />} />
          <Route path="/income-tracker" element={<IncomeTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/quick-notes" element={<QuickNotes />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/task-board" element={<TaskBoard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/help" element={<Help />} />
          <Route path="/weekly-content" element={<WeeklyContentTasks />} />
          <Route path="/social-media-scheduler" element={<SocialMediaScheduler />} />
          
          {/* 404 route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
