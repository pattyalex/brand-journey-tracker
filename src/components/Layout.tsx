
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DragDropContext } from 'react-beautiful-dnd';

const ToggleSidebarButton = () => {
  const { state, toggleSidebar } = useSidebar();
  
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
          <ToggleSidebarButton />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
