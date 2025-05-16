import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sidebar } from '@/components/sidebar/ToggleSidebarButton';

const ToggleSidebarButton = () => {
  const { toggleSidebar, isOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 h-8 w-8"
      onClick={toggleSidebar}
    >
      {isOpen ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';

    if (!hasCompletedOnboarding) {
      navigate('/');
    }

    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <ToggleSidebarButton />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;