
import { Home, FolderOpen, FileText, Settings, Lightbulb, Trash2, Plus, CreditCard, Database } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
  SidebarSeparator,
  SidebarFooter
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

// Define default menu items
const defaultMenuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, url: '/', isDeletable: false },
  { title: 'Projects', icon: FolderOpen, url: '/projects', isDeletable: false },
  { title: 'Bank of Content', icon: Database, url: '/bank-of-content', isDeletable: false },
  { title: 'Content Ideation', icon: Lightbulb, url: '/content-ideation', isDeletable: true },
  { title: 'Documents', icon: FileText, url: '/documents', isDeletable: true },
];

const settingsItem: MenuItem = { title: 'Settings', icon: Settings, url: '/settings', isDeletable: false };
const myAccountItem: MenuItem = { title: 'My Account', icon: CreditCard, url: '/my-account', isDeletable: false };

const Sidebar = () => {
  const getSavedMenuItems = () => {
    try {
      const saved = localStorage.getItem('sidebarMenuItems');
      if (!saved) return defaultMenuItems;
      
      const parsedItems = JSON.parse(saved);
      
      // Ensure Bank of Content is always included
      const hasBankOfContent = parsedItems.some((item: MenuItem) => item.title === 'Bank of Content');
      if (!hasBankOfContent) {
        const bankOfContentItem = defaultMenuItems.find(item => item.title === 'Bank of Content');
        if (bankOfContentItem) {
          parsedItems.push(bankOfContentItem);
        }
      }
      return parsedItems;
    } catch (error) {
      console.error("Error loading sidebar items:", error);
      return defaultMenuItems;
    }
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getSavedMenuItems());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleDeleteItem = (itemTitle: string) => {
    // Never allow deletion of Bank of Content
    if (itemTitle === 'Bank of Content') {
      toast.error("Bank of Content cannot be removed");
      return;
    }
    
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
                  <SidebarMenuButton 
                    asChild
                    className={item.title === 'Bank of Content' ? 
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      {item.icon && <item.icon size={20} />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  
                  {item.isDeletable && item.title !== 'Bank of Content' && (
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
                            <Link to={subItem.url} className="flex items-center gap-2">
                              {subItem.icon && <subItem.icon size={16} />}
                              <span>{subItem.title}</span>
                            </Link>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to={settingsItem.url} className="flex items-center gap-2">
                {settingsItem.icon && <settingsItem.icon size={20} />}
                <span>{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to={myAccountItem.url} className="flex items-center gap-2">
                {myAccountItem.icon && <myAccountItem.icon size={20} />}
                <span>{myAccountItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
