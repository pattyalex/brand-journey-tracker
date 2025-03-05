
import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
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

  const handleDeleteItem = (itemTitle: string) => {
    const updatedItems = menuItems.filter(item => item.title !== itemTitle);
    setMenuItems(updatedItems);
    localStorage.setItem('sidebarMenuItems', JSON.stringify(updatedItems));
    toast.success(`"${itemTitle}" removed from sidebar`);
  };

  return (
    <SidebarContainer>
      <div className="p-4">
        <h2 className="text-2xl font-playfair font-bold text-primary">HeyMegan</h2>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between pr-2">
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="xs"
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
