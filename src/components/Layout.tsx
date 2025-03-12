
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Store sidebar state in localStorage
  const [sidebarKey, setSidebarKey] = useState(0);
  
  useEffect(() => {
    // Force a re-render after component mounts to ensure
    // localStorage state is applied properly
    setSidebarKey(prev => prev + 1);
  }, []);
  
  return (
    <SidebarProvider key={sidebarKey}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
