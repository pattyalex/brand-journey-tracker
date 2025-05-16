
import React from 'react';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ToggleSidebarButton = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("fixed top-4 left-4 z-50 h-8 w-8")}
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
};

export default ToggleSidebarButton;
