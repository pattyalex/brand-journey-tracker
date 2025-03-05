
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types/sidebar';
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleMenuClick = (e: React.MouseEvent) => {
    if (item.subItems && item.subItems.length > 0) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
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
            <span className="ml-auto">
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
