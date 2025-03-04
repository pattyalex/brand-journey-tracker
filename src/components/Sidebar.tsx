
import { Home, FolderOpen, FileText, Settings, ListTodo, Lightbulb, Trash2 } from 'lucide-react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction
} from "@/components/ui/sidebar";

// Define the proper type for menu items including optional subItems
type MenuItem = {
  title: string;
  icon: React.ComponentType<any>;
  url: string;
  isDeletable?: boolean;
  subItems?: Array<{
    title: string;
    icon: React.ComponentType<any>;
    url: string;
  }>;
};

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/', isDeletable: false },
  { title: 'Daily Agenda', icon: ListTodo, url: '/daily-agenda', isDeletable: true },
  { title: 'Projects', icon: FolderOpen, url: '/projects', isDeletable: true },
  { title: 'Vision Board & Goals', icon: Lightbulb, url: '/projects/vision-board', isDeletable: true },
  { title: 'Documents', icon: FileText, url: '/documents', isDeletable: true },
  { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false },
];

const Sidebar = () => {
  const handleDeleteItem = (itemTitle: string) => {
    console.log(`Delete item: ${itemTitle}`);
    // Implement deletion logic here
  };

  return (
    <SidebarContainer>
      <div className="p-4">
        <h2 className="text-2xl font-playfair font-bold text-primary">HeyMegan</h2>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  
                  {/* Add trash icon for deletable items */}
                  {item.isDeletable && (
                    <SidebarMenuAction 
                      onClick={() => handleDeleteItem(item.title)}
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
