
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

interface SidebarMenuItemProps {
  item: MenuItem;
  onDelete: (title: string) => void;
}

const SidebarMenuItemComponent = ({ item, onDelete }: SidebarMenuItemProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = currentPath === item.url;
  
  // Initialize expanded state from localStorage or default to false
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem(`sidebar-expanded-${item.title}`);
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const navigate = useNavigate();
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`sidebar-expanded-${item.title}`, JSON.stringify(isExpanded));
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
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={handleMenuItemClick}
        isActive={isActive}
      >
        {item.icon && <item.icon size={16} />}
        <span>{item.title}</span>
        
        {item.isDeletable && (
          <SidebarMenuAction onClick={(e) => {
            e.stopPropagation();
            onDelete(item.title);
          }}>
            <Trash2 size={14} />
          </SidebarMenuAction>
        )}
        
        {item.subItems && item.subItems.length > 0 && (
          <span 
            onClick={handleArrowClick}
            data-expand-arrow="true"
            className="ml-auto"
          >
            {isExpanded ? 
              <ChevronDown size={14} /> : 
              <ChevronRight size={14} />
            }
          </span>
        )}
      </SidebarMenuButton>
      
      {item.subItems && item.subItems.length > 0 && isExpanded && (
        <SidebarMenuSub>
          {item.subItems.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(subItem.url);
                }}
                isActive={currentPath === subItem.url}
              >
                {subItem.icon && <subItem.icon size={14} />}
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarMenuItemComponent;
