
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
import { defaultMenuItems, settingsItem, helpItem } from '@/data/sidebarMenuItems';
import { MenuItem } from '@/types/sidebar';
import SidebarMenuItemComponent from './sidebar/SidebarMenuItemComponent';
import AddPageForm from './sidebar/AddPageForm';
import SidebarFooterSection from './sidebar/SidebarFooterSection';
import { toast } from 'sonner';
import { StorageKeys, getString, setString } from '@/lib/storage';

const Sidebar = () => {
  const getSavedMenuItems = () => {
    const saved = getString(StorageKeys.sidebarMenuItems);
    return saved ? JSON.parse(saved) : defaultMenuItems;
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getSavedMenuItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const { state } = useSidebar();

  // Save sidebar state to localStorage
  useEffect(() => {
    setString(StorageKeys.sidebarState, state);
  }, [state]);

  const handleDeleteItem = (itemTitle: string) => {
    const updatedItems = menuItems.filter(item => item.title !== itemTitle);
    setMenuItems(updatedItems);
    setString(StorageKeys.sidebarMenuItems, JSON.stringify(updatedItems));
    toast.success(`"${itemTitle}" removed from sidebar`);
  };

  return (
    <SidebarContainer>
      {/* Premium background wrapper */}
      <div className="absolute inset-0 bg-[#f9f7f5] border-r border-[#E8E4E6]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Premium Header with Logo */}
      <SidebarHeader className="px-4 pt-5 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background: 'linear-gradient(145deg, #612A4F 0%, #4A1F3D 100%)',
            }}
          >
            <span
              className="text-white text-xl font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              M
            </span>
          </div>

          {/* Brand Name & Tagline */}
          <div className="flex flex-col">
            <h1
              className="text-lg font-semibold text-[#3D2B35]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HeyMeg
            </h1>
            <span className="text-[10px] text-[#8B7082] tracking-wider">
              Creator Studio
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2 relative z-10">
        <SidebarGroup className="pt-0">
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
        helpItem={helpItem}
      />
    </SidebarContainer>
  );
};

export default Sidebar;
