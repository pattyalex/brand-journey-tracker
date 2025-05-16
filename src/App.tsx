import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ContentCalendar from './pages/ContentCalendar';
import BankOfContent from './pages/BankOfContent';
import Analytics from './pages/Analytics';
import TaskBoard from './pages/TaskBoard';
import TrendingContent from './pages/TrendingContent';
import Settings from './pages/Settings';
import MyAccount from './pages/MyAccount';
import Help from './pages/Help';
import CollabManagement from './pages/CollabManagement';
import StrategyGrowth from './pages/StrategyGrowth';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/home-page" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/task-board" element={<TaskBoard />} />
            <Route path="/trending" element={<TrendingContent />} />
            <Route path="/bank-of-content" element={<BankOfContent />} />
            <Route path="/content-calendar" element={<ContentCalendar />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/collab-management" element={<CollabManagement />} />
            <Route path="/strategy-growth" element={<StrategyGrowth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;