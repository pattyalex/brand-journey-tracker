
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/sidebar';
import { useNavigate } from 'react-router-dom';
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
  
  // Only navigate when clicking the menu item text (not the arrow)
  const handleMenuItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(item.url);
  };
  
  // Toggle expanded state when clicking the arrow
  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any parent clicks from firing
    setIsExpanded(!isExpanded);
  };

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <a 
          href={item.url} 
          className="flex items-center gap-2"
        >
          <item.icon size={20} />
          <span onClick={handleMenuItemClick}>{item.title}</span>
          {item.subItems && item.subItems.length > 0 && (
            <span 
              className="ml-auto cursor-pointer" 
              onClick={handleArrowClick}
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
          {item.subItems.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton 
                asChild 
                size="md"
              >
                <a href={subItem.url} className="flex items-center gap-2">
                  <subItem.icon size={16} />
                  <span>{subItem.title}</span>
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarMenuItemComponent;
