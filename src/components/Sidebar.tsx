
import { Home, FolderOpen, FileText, Settings, ListTodo, Lightbulb, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
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
  SidebarMenuAction,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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

const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/', isDeletable: false },
  { title: 'Projects', icon: FolderOpen, url: '/projects', isDeletable: false },
  { title: 'Daily Agenda', icon: ListTodo, url: '/daily-agenda', isDeletable: true },
  { title: 'Vision Board & Goals', icon: Lightbulb, url: '/projects/vision-board', isDeletable: true },
  { title: 'Documents', icon: FileText, url: '/documents', isDeletable: true },
];

const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false };

const Sidebar = () => {
  const getSavedMenuItems = () => {
    const saved = localStorage.getItem('sidebarMenuItems');
    return saved ? JSON.parse(saved) : defaultMenuItems;
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getSavedMenuItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleDeleteItem = (itemTitle: string) => {
    const updatedItems = menuItems.filter(item => item.title !== itemTitle);
    setMenuItems(updatedItems);
    localStorage.setItem('sidebarMenuItems', JSON.stringify(updatedItems));
    toast.success(`"${itemTitle}" removed from sidebar`);
  };

  const handleAddPage = () => {
    if (!newPageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    if (menuItems.some(item => item.title.toLowerCase() === newPageTitle.toLowerCase())) {
      toast.error("A page with this title already exists");
      return;
    }

    const newPage: MenuItem = {
      title: newPageTitle,
      icon: FileText,
      url: `/${newPageTitle.toLowerCase().replace(/\s+/g, '-')}`,
      isDeletable: true
    };

    const updatedItems = [...menuItems, newPage];
    setMenuItems(updatedItems);
    localStorage.setItem('sidebarMenuItems', JSON.stringify(updatedItems));
    
    setNewPageTitle('');
    setShowAddForm(false);
    toast.success(`"${newPageTitle}" added to sidebar`);
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  
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
              
              {showAddForm && (
                <SidebarMenuItem>
                  <div className="flex flex-col gap-2 px-2 py-3">
                    <Input 
                      placeholder="Page title" 
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                      className="h-8"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="xs" 
                        onClick={handleAddPage}
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => {
                          setShowAddForm(false);
                          setNewPageTitle('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
              
              <SidebarSeparator className="my-2" />
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={settingsItem.url} className="flex items-center gap-2">
                    <settingsItem.icon size={20} />
                    <span>{settingsItem.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
