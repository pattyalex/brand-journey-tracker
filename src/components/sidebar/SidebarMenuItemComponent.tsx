
import { Trash2 } from 'lucide-react';
import { toast } from "sonner";
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
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <a href={item.url} className="flex items-center gap-2">
          <item.icon size={20} />
          <span>{item.title}</span>
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
      
      {item.subItems && item.subItems.length > 0 && (
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
