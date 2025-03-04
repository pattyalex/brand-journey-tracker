
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
  { title: 'Projects', icon: FolderOpen, url: '/projects' },
  { title: 'Vision Board & Goals', icon: Lightbulb, url: '/vision-board' },
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
