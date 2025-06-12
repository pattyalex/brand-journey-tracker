
import React from 'react';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ToggleSidebarButton = () => {
  const { toggleSidebar, state } = useSidebar();
  
  // Adjust position based on sidebar state
  const leftPosition = state === 'collapsed' ? 'left-4' : 'left-64';

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("fixed top-4 z-50 h-8 w-8 transition-all duration-200", leftPosition)}
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
};

export default ToggleSidebarButton;
