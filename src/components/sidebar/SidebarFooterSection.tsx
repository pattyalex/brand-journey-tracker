import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { MenuItem } from '@/types/sidebar';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface SidebarFooterSectionProps {
  settingsItem: MenuItem;
  myAccountItem: MenuItem;
  helpItem?: MenuItem;
}

const SidebarFooterSection = ({ settingsItem, myAccountItem, helpItem }: SidebarFooterSectionProps) => {
  const [expandAccount, setExpandAccount] = useState(() => {
    const savedState = localStorage.getItem('sidebar-expand-account');
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expand-account', JSON.stringify(expandAccount));
  }, [expandAccount]);

  const handleAccountExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandAccount(!expandAccount);
  };

  return (
    <SidebarFooter className="mt-auto">
      <SidebarMenu>
        {!settingsItem.hidden && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={settingsItem.url} className="flex items-center gap-2">
                <settingsItem.icon size={20} />
                <span>{settingsItem.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a 
              href={myAccountItem.url} 
              className="flex items-center gap-2"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('[data-expand-arrow="true"]')) {
                  return;
                }
              }}
            >
              <myAccountItem.icon size={20} />
              <span>{myAccountItem.title}</span>
              <span 
                className="ml-auto cursor-pointer" 
                onClick={handleAccountExpand}
                data-expand-arrow="true"
              >
                {expandAccount ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </a>
          </SidebarMenuButton>

          {expandAccount && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild size="md">
                  <a href="/terms-and-conditions" className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Terms and Conditions</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>

        {helpItem && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={helpItem.url} className="flex items-center gap-2">
                <helpItem.icon size={20} />
                <span>{helpItem.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterSection;