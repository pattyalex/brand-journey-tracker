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

  const collapsedPosition = getCollapsedPosition(location.pathname);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed z-50 h-8 w-8 transition-all duration-200 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50",
            isCollapsed
              ? collapsedPosition
              : "top-[2.75rem] left-[10.5rem]"
          )}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4} align="start">
        {isCollapsed ? "Open sidebar" : "Close sidebar"}
      </TooltipContent>
    </Tooltip>
  );
};

export default ToggleSidebarButton;
