
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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

export default ToggleSidebarButton;
export const sidebar = { ToggleSidebarButton };
