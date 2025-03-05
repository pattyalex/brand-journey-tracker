
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import MeganAIChat from './content/MeganAIChat';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMeganOpen, setIsMeganOpen] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        {/* Megan AI Chat Button and Modal */}
        {!isMeganOpen ? (
          <Button 
            className="fixed bottom-4 right-4 rounded-full p-3 h-12 w-12 shadow-lg flex items-center justify-center z-50 bg-primary hover:bg-primary/90"
            onClick={() => setIsMeganOpen(true)}
          >
            <div className="font-semibold text-lg text-primary-foreground">M</div>
          </Button>
        ) : (
          <MeganAIChat 
            onClose={() => setIsMeganOpen(false)} 
            isFloating={true}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Layout;
