
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
import { defaultMenuItems, settingsItem, helpItem } from '@/data/sidebarMenuItems';
import { MenuItem } from '@/types/sidebar';
import SidebarMenuItemComponent from './sidebar/SidebarMenuItemComponent';
import AddPageForm from './sidebar/AddPageForm';
import SidebarFooterSection from './sidebar/SidebarFooterSection';
import { toast } from 'sonner';
import { StorageKeys, getString, setString } from '@/lib/storage';

const Sidebar = () => {
  const getSavedMenuItems = (): MenuItem[] => {
    const saved = getString(StorageKeys.sidebarMenuItems);
    if (!saved) return defaultMenuItems;
    try {
      const parsed = JSON.parse(saved) as MenuItem[];
      // Build a lookup from default items so we always have valid icons
      const defaultByTitle = new Map(defaultMenuItems.map(d => [d.title, d]));
      // Re-attach icons from defaults (functions can't survive JSON serialization)
      const restored = parsed
        .map(item => {
          const def = defaultByTitle.get(item.title);
          if (def) return { ...def, ...item, icon: def.icon };
          return null; // drop unknown items that lost their icon
        })
        .filter(Boolean) as MenuItem[];
      // Add any new default items not yet in the saved list
      for (const def of defaultMenuItems) {
        if (!restored.find(r => r.title === def.title)) {
          restored.push(def);
        }
      }
      return restored;
    } catch {
      return defaultMenuItems;
    }
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getSavedMenuItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const { state } = useSidebar();

  const handleDeleteItem = (itemTitle: string) => {
    const updatedItems = menuItems.filter(item => item.title !== itemTitle);
    setMenuItems(updatedItems);
    setString(StorageKeys.sidebarMenuItems, JSON.stringify(updatedItems));
    toast.success(`"${itemTitle}" removed from sidebar`);
  };

  return (
    <SidebarContainer collapsible="icon">
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
      <SidebarHeader className="relative z-10 px-2 pt-4 pb-3">
        <div className={`flex items-center h-[42px] ${state === 'collapsed' ? 'justify-center' : 'gap-3 pl-2'}`}>
          {/* Logo Mark */}
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
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

          {/* Brand Name & Tagline — only when expanded */}
          {state === 'expanded' && (
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
          )}
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
