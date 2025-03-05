
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  myAccountItem: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, myAccountItem }: SidebarFooterSectionProps) => {
  return (
    <SidebarFooter className="mt-auto">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href={settingsItem.url} className="flex items-center gap-2">
              <settingsItem.icon size={20} />
              <span>{settingsItem.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href={myAccountItem.url} className="flex items-center gap-2">
              <myAccountItem.icon size={20} />
              <span>{myAccountItem.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;
