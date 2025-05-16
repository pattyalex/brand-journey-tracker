import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toaster } from "@/components/ui/toaster";
import { useLocation } from 'react-router-dom';

const ToggleSidebarButton = () => {
  const { state, toggleSidebar } = useSidebar();
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';

  if (!hasCompletedOnboarding) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-4 z-50 rounded-full bg-white/90 shadow-md hover:bg-white"
            style={{ left: state === "collapsed" ? "1rem" : "calc(240px + 1rem)" }}
            onClick={toggleSidebar}
          >
            {state === "collapsed" ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Store sidebar state in localStorage
  const [sidebarKey, setSidebarKey] = useState(0);
  const location = useLocation();
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
  const isPublicRoute = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/onboarding';

  useEffect(() => {
    // Force a re-render after component mounts to ensure
    // localStorage state is applied properly
    setSidebarKey(prev => prev + 1);
  }, []);

  // Show sidebar only if user has completed onboarding and is not on a public route
  const showSidebar = hasCompletedOnboarding && !isPublicRoute;

  return (
    <SidebarProvider key={sidebarKey}>
      <div className="min-h-screen flex w-full bg-background">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 p-6 overflow-auto relative ${!showSidebar ? 'w-full' : ''}`}>
          {showSidebar && <ToggleSidebarButton />}
          {children}
          <Toaster/>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;