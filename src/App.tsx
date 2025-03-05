
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GetStarted from "./pages/GetStarted";
import ContentIdeation from "./pages/ContentIdeation";
import MyAccount from "./pages/MyAccount";
import Analytics from "./pages/Analytics";
import BankOfContent from "./pages/BankOfContent";
import ContentCalendar from "./pages/ContentCalendar";
import StrategyGrowth from "./pages/StrategyGrowth";
import IncomeTracker from "./pages/IncomeTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/workflow" element={<GetStarted />} />
          <Route path="/projects" element={<GetStarted />} />
          <Route path="/content-ideation" element={<ContentIdeation />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/bank-of-content" element={<BankOfContent />} />
          <Route path="/ideas-bank" element={<BankOfContent />} />
          <Route path="/content-calendar" element={<ContentCalendar />} />
          <Route path="/strategy-growth" element={<StrategyGrowth />} />
          <Route path="/income-tracker" element={<IncomeTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
