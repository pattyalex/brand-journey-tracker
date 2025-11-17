
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { defaultMenuItems, settingsItem, myAccountItem, helpItem } from '@/data/sidebarMenuItems';
import { MenuItem } from '@/types/sidebar';
import SidebarMenuItemComponent from './sidebar/SidebarMenuItemComponent';
import AddPageForm from './sidebar/AddPageForm';
import SidebarFooterSection from './sidebar/SidebarFooterSection';
import { toast } from 'sonner';

const Sidebar = () => {
  const getSavedMenuItems = () => {
    const saved = localStorage.getItem('sidebarMenuItems');
    return saved ? JSON.parse(saved) : defaultMenuItems;
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getSavedMenuItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const { state } = useSidebar();

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarState', state);
  }, [state]);

  const handleDeleteItem = (itemTitle: string) => {
    const updatedItems = menuItems.filter(item => item.title !== itemTitle);
    setMenuItems(updatedItems);
    localStorage.setItem('sidebarMenuItems', JSON.stringify(updatedItems));
    toast.success(`"${itemTitle}" removed from sidebar`);
  };

  return (
    <SidebarContainer>
      <SidebarContent className="pt-16">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItemComponent 
                  key={item.title} 
                  item={item} 
                  onDelete={handleDeleteItem}
                />
              ))}
              
              {showAddForm && (
                <AddPageForm 
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  onCancel={() => {
                    setShowAddForm(false);
                  }}
                />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooterSection 
        settingsItem={settingsItem} 
        myAccountItem={myAccountItem}
        helpItem={helpItem}
      />
    </SidebarContainer>
  );
};

export default Sidebar;
