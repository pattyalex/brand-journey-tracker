
import { Home, FolderOpen, FileText, Settings, ListTodo, Lightbulb, Layout } from 'lucide-react';
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
  SidebarMenuSubButton
} from "@/components/ui/sidebar";

const menuItems = [
  { title: 'Dashboard', icon: Home, url: '/' },
  { title: 'Daily Agenda', icon: ListTodo, url: '/daily-agenda' },
  { 
    title: 'Projects', 
    icon: FolderOpen, 
    url: '/projects',
    subItems: [
      { title: 'Vision Board & Goals', icon: Lightbulb, url: '/projects/vision-board' }
    ]
  },
  { title: 'Documents', icon: FileText, url: '/documents' },
  { title: 'Settings', icon: Settings, url: '/settings' },
];

const Sidebar = () => {
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
