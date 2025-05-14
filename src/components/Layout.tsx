
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from './ui/sidebar';
import Sidebar from './Sidebar';
import ToggleSidebarButton from './sidebar/ToggleSidebarButton';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Store sidebar state in localStorage
  const [sidebarKey, setSidebarKey] = useState(0);
  const location = useLocation();

  // Check if user is authenticated (has completed onboarding)
  const isAuthenticated = () => {
    return localStorage.getItem('userAuthenticated') === 'true';
  };

  // Check if current route is dashboard (landing page)
  const isDashboard = location.pathname === '/';

  // Only show sidebar for authenticated users and not on the main dashboard
  const showSidebar = isAuthenticated() && !isDashboard;

  useEffect(() => {
    // Force a re-render after component mounts to ensure
    // localStorage state is applied properly
    setSidebarKey(prev => prev + 1);
  }, []);

  return (
    <SidebarProvider key={sidebarKey}>
      <div className="min-h-screen flex w-full bg-background">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 p-6 overflow-auto relative`}>
          {showSidebar && <ToggleSidebarButton />}
          {children}
          <Toaster/> {/* Added Toaster component */}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
