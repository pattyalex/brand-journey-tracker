
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import './App.css';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import TaskBoard from './pages/TaskBoard';
import IncomeTracker from './pages/IncomeTracker';
import ContentCalendar from './pages/ContentCalendar';
import BankOfContent from './pages/BankOfContent';
import ContentPlanning from './pages/ContentPlanning';
import WeeklyContentTasks from './pages/WeeklyContentTasks';
import Analytics from './pages/Analytics';
import StrategyGrowth from './pages/StrategyGrowth';
import ContentIdeation from './pages/ContentIdeation';
import QuickNotes from './pages/QuickNotes';
import MyAccount from './pages/MyAccount';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Auth from './pages/Auth';
import GetStarted from './pages/GetStarted';
import NotFound from './pages/NotFound';
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/task-board" element={<TaskBoard />} />
          <Route path="/income-tracker" element={<IncomeTracker />} />
          <Route path="/content-calendar" element={<ContentCalendar />} />
          <Route path="/bank-of-content" element={<BankOfContent />} />
          <Route path="/content-planning" element={<ContentPlanning />} />
          <Route path="/weekly-content-tasks" element={<WeeklyContentTasks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/strategy-growth" element={<StrategyGrowth />} />
          <Route path="/content-ideation" element={<ContentIdeation />} />
          <Route path="/quick-notes" element={<QuickNotes />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
