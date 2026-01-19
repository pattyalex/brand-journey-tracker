
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { getString, setString, sidebarExpanded } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface SidebarMenuItemProps {
  item: MenuItem;
  onDelete: (title: string) => void;
}

const SidebarMenuItemComponent = ({ item, onDelete }: SidebarMenuItemProps) => {
  // Initialize expanded state from localStorage or default to false
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getString(sidebarExpanded(item.title));
    return savedState ? JSON.parse(savedState) : false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Check if this item or any of its sub-items is active
  const isActive = location.pathname === item.url;
  const isSubItemActive = item.subItems?.some(sub => location.pathname === sub.url) || false;
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    setString(sidebarExpanded(item.title), JSON.stringify(isExpanded));
  }, [isExpanded, item.title]);
  
  // Toggle expanded state when clicking the arrow
  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any parent clicks from firing
    setIsExpanded(!isExpanded);
  };
  
  // Handle click on the entire menu item
  const handleMenuItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If the clicked element is part of the expand/collapse arrow, don't navigate
    if ((e.target as HTMLElement).closest('[data-expand-arrow="true"]')) {
      return;
    }
    
    navigate(item.url);
  };

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive || isSubItemActive}>
        <a
          href={item.url}
          className={cn(
            "flex items-center gap-2",
            (isActive || isSubItemActive) && "bg-gray-100 font-medium"
          )}
          onClick={handleMenuItemClick}
        >
          <item.icon size={20} />
          <span>{item.title}</span>
          {item.subItems && item.subItems.length > 0 && (
            <span
              className="ml-auto cursor-pointer"
              onClick={handleArrowClick}
              data-expand-arrow="true"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}
        </a>
      </SidebarMenuButton>
      
      {item.isDeletable && (
        <SidebarMenuAction 
          onClick={() => onDelete(item.title)}
          showOnHover={true}
          title={`Delete ${item.title}`}
        >
          <Trash2 size={16} />
        </SidebarMenuAction>
      )}
      
      {item.subItems && item.subItems.length > 0 && isExpanded && (
        <SidebarMenuSub>
          {item.subItems.map((subItem) => {
            const isSubActive = location.pathname === subItem.url;
            return (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  size="md"
                  isActive={isSubActive}
                >
                  <a
                    href={subItem.url}
                    className={cn(
                      "flex items-center gap-2",
                      isSubActive && "bg-gray-100 font-medium"
                    )}
                  >
                    <subItem.icon size={16} />
                    <span>{subItem.title}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarMenuItemComponent;
