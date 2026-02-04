import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

// Position mapping for collapsed state based on page
const getCollapsedPosition = (pathname: string): string => {
  switch (pathname) {
    case '/task-board':
      // Planner - inline with "All Tasks" header
      return 'top-[1.1rem] left-4';
    case '/production':
      // Content Hub - position below column headers
      return 'top-[3.5rem] left-3';
    case '/strategy-growth':
      // Strategy - inline with tabs
      return 'top-[1.8rem] left-4';
    case '/brands':
      // Partnerships - safe top position
      return 'top-[2.5rem] left-4';
    default:
      // Default position for other pages
      return 'top-[2.75rem] left-4';
  }
};

const ToggleSidebarButton = () => {
  const { toggleSidebar, state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  // Don't render when collapsed - the sidebar header has its own toggle
  if (isCollapsed) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed z-50 h-8 w-8 transition-all duration-200 hover:bg-[#F5F0F3] rounded-lg top-[1.55rem] left-[10.5rem]"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <ChevronLeft className="h-5 w-5 text-[#8B7082] hover:text-[#612A4F]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4} align="start">
        Close sidebar
      </TooltipContent>
    </Tooltip>
  );
};

export default ToggleSidebarButton;
