import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import ToggleSidebarButton from "./sidebar/ToggleSidebarButton";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const Layout = ({ children, hideSidebar = false }: LayoutProps) => {
  // Store sidebar state in localStorage
  const [sidebarKey, setSidebarKey] = useState(0);
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const location = useLocation();

  // Determine if sidebar should be shown
  const shouldShowSidebar = !hideSidebar && 
    (isAuthenticated && hasCompletedOnboarding || 
    // Always hide sidebar on landing page
    location.pathname !== "/");

  useEffect(() => {
    // Force a re-render after component mounts to ensure
    // localStorage state is applied properly
    setSidebarKey(prev => prev + 1);
  }, []);

  return (
    <SidebarProvider key={sidebarKey}>
      <div className="min-h-screen flex w-full bg-background">
        {shouldShowSidebar && <Sidebar />}
        <main className={`flex-1 p-6 overflow-auto relative ${!shouldShowSidebar ? 'w-full' : ''}`}>
          {shouldShowSidebar && <ToggleSidebarButton />}
          {children}
          <Toaster/>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;