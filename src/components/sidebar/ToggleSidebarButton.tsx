
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ToggleSidebarButton = () => {
  const { toggleSidebar, state } = useSidebar();

  // Adjust position based on sidebar state
  // Position below the header (h-14 = 56px) with some spacing
  const leftPosition = state === 'collapsed' ? 'left-4' : 'left-[10.5rem]';

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("fixed top-[2.75rem] z-50 h-8 w-8 transition-all duration-200 bg-transparent hover:bg-transparent", leftPosition)}
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      {state === 'collapsed' ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ToggleSidebarButton;
