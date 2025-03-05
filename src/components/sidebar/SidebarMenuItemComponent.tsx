
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
  
  const handleMenuClick = (e: React.MouseEvent) => {
    if (item.subItems && item.subItems.length > 0) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
      
      // Only navigate to the item's URL when clicking on the menu item text, not the arrow
      if (!isExpanded && e.currentTarget === e.target) {
        navigate(item.url);
      }
    }
  };
  
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the parent handleMenuClick from firing
    setIsExpanded(!isExpanded);
  };

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <a 
          href={item.url} 
          className="flex items-center gap-2"
          onClick={handleMenuClick}
        >
          <item.icon size={20} />
          <span>{item.title}</span>
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
