import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import { MobileInterstitialWrapper } from "./components/MobileInterstitial";
import Layout from "./components/Layout";
import { BrandDealsProvider } from "./contexts/BrandDealsContext";

// Lazy-load import functions (stored so we can preload on hover)
const pageImports = {
  Posts: () => import('./pages/Posts'),
  Dashboard: () => import('./pages/Dashboard'),
  NotFound: () => import('./pages/NotFound'),
  GetStarted: () => import('./pages/GetStarted'),
  CollabManagement: () => import('./pages/CollabManagement'),
  StrategyDemo: () => import('./pages/StrategyDemo'),
  HomePage: () => import('./pages/HomePage'),
  OnboardingFlow: () => import('./pages/OnboardingFlow'),
  LoginPage: () => import('./pages/LoginPage'),
  ForgotPasswordPage: () => import('./pages/ForgotPasswordPage'),
  Production: () => import('./pages/Production'),
  AuthCallback: () => import('./pages/AuthCallback'),
  StrategyGrowth: () => import('./pages/StrategyGrowth'),
  TaskBoard: () => import('./pages/TaskBoard'),
  Brands: () => import('./pages/Brands'),
  MembershipPage: () => import('./components/MembershipPage').then(m => ({ default: m.MembershipPage })),
  ContentIdeation: () => import('./pages/ContentIdeation'),
  ContentPlanning: () => import('./pages/ContentPlanning'),
  TermsAndConditions: () => import("./pages/TermsAndConditions"),
  Terms: () => import("./pages/Terms"),
  Privacy: () => import("./pages/Privacy"),
  Contact: () => import("./pages/Contact"),
  Settings: () => import('./pages/Settings'),
  MyAccount: () => import('./pages/MyAccount'),
  Help: () => import('./pages/Help'),
  WeeklyContentTasks: () => import('./pages/WeeklyContentTasks'),
  Index: () => import('./pages/Index'),
  ResetPasswordPage: () => import('./pages/ResetPasswordPage'),
};

// Lazy load all pages for optimal code splitting
const Posts = lazy(pageImports.Posts);
const Dashboard = lazy(pageImports.Dashboard);
const NotFound = lazy(pageImports.NotFound);
const GetStarted = lazy(pageImports.GetStarted);
const CollabManagement = lazy(pageImports.CollabManagement);
const StrategyDemo = lazy(pageImports.StrategyDemo);
const HomePage = lazy(pageImports.HomePage);
const OnboardingFlow = lazy(pageImports.OnboardingFlow);
const LoginPage = lazy(pageImports.LoginPage);
const ForgotPasswordPage = lazy(pageImports.ForgotPasswordPage);
const Production = lazy(pageImports.Production);
const AuthCallback = lazy(pageImports.AuthCallback);
const StrategyGrowth = lazy(pageImports.StrategyGrowth);
const TaskBoard = lazy(pageImports.TaskBoard);
const Brands = lazy(pageImports.Brands);
const MembershipPage = lazy(pageImports.MembershipPage);
const ContentIdeation = lazy(pageImports.ContentIdeation);
const ContentPlanning = lazy(pageImports.ContentPlanning);
const TermsAndConditions = lazy(pageImports.TermsAndConditions);
const Terms = lazy(pageImports.Terms);
const Privacy = lazy(pageImports.Privacy);
const Contact = lazy(pageImports.Contact);
const Settings = lazy(pageImports.Settings);
const MyAccount = lazy(pageImports.MyAccount);
const Help = lazy(pageImports.Help);
const WeeklyContentTasks = lazy(pageImports.WeeklyContentTasks);
const Index = lazy(pageImports.Index);
const ResetPasswordPage = lazy(pageImports.ResetPasswordPage);

// Route-to-preload mapping so sidebar can trigger chunk downloads on hover
const routePreloadMap: Record<string, () => Promise<unknown>> = {
  '/home-page': pageImports.Production,
  '/task-board': pageImports.TaskBoard,
  '/production': pageImports.Production,
  '/brands': pageImports.Brands,
  '/strategy-growth': pageImports.StrategyGrowth,
  '/my-account': pageImports.MyAccount,
  '/settings': pageImports.Settings,
  '/help': pageImports.Help,
  '/posts': pageImports.Posts,
  '/content-ideation': pageImports.ContentIdeation,
  '/content-planning': pageImports.ContentPlanning,
  '/collab-management': pageImports.CollabManagement,
  '/weekly-content': pageImports.WeeklyContentTasks,
  '/get-started': pageImports.GetStarted,
  '/index': pageImports.Index,
  '/strategy-demo': pageImports.StrategyDemo,
};

/** Call this on mouseEnter/focus to preload a route's chunk */
export function preloadRoute(path: string) {
  const loader = routePreloadMap[path];
  if (loader) loader();
}

// Loading fallback — minimal white placeholder so there's no dark flash
const PageLoader = () => (
  <div className="w-full h-full bg-white" />
);

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

// Protected route component — checks auth and subscription status
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoaded, hasActiveSubscription, hasCompletedOnboarding } = useAuth();

  // Still loading auth state
  if (!isAuthLoaded) return null;

  // Not logged in — redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Hasn't finished onboarding yet — let them through to onboarding
  if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;

  // Subscription ended — redirect to membership page
  if (!hasActiveSubscription) return <Navigate to="/membership" replace />;

  return <>{children}</>;
};

// Auth-only route — checks login but allows canceled subscriptions (for settings/account pages)
const AuthOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoaded } = useAuth();
  if (!isAuthLoaded) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Shared layout for protected routes — sidebar stays mounted across navigations
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

// Layout for auth-only routes (no subscription check) — sidebar stays mounted
const AuthOnlyLayout = () => (
  <AuthOnlyRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  </AuthOnlyRoute>
);

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
            <BrandDealsProvider>
            <LoginModal />
            <Toaster />
            <Routes>
              {/* Public routes (no sidebar, own Suspense) */}
              <Route path="/" element={<Suspense fallback={<PageLoader />}><LandingRedirect /></Suspense>} />
              <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
              <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
              <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingFlow /></Suspense>} />
              <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />
              <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
              <Route path="/terms-and-conditions" element={<Suspense fallback={<PageLoader />}><TermsAndConditions /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
              <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
              <Route path="/membership" element={<Suspense fallback={<PageLoader />}><MembershipPage /></Suspense>} />

              {/* Account pages — auth only, no subscription check (so user can manage billing after cancel) */}
              <Route element={<AuthOnlyLayout />}>
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-account" element={<MyAccount />} />
              </Route>

              {/* Protected routes — Layout (sidebar) stays mounted, only page content swaps */}
              <Route element={<ProtectedLayout />}>
                <Route path="/app" element={<Navigate to="/production" replace />} />
                <Route path="/dashboard" element={<Navigate to="/production" replace />} />
                <Route path="/home-page" element={<Navigate to="/production" replace />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/content-ideation" element={<ContentIdeation />} />
                <Route path="/content-planning" element={<ContentPlanning />} />
                <Route path="/production" element={<Production />} />
                <Route path="/strategy-growth" element={<StrategyGrowth />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/task-board" element={<TaskBoard />} />
                <Route path="/help" element={<Help />} />
                <Route path="/weekly-content" element={<WeeklyContentTasks />} />
                <Route path="/collab-management" element={<CollabManagement />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/strategy-demo" element={<StrategyDemo />} />
                <Route path="/index" element={<Index />} />
              </Route>

              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            </Routes>
            </BrandDealsProvider>
        </AuthProvider>
      </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;