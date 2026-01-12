
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { StorageKeys, setString } from '@/lib/storage';

interface AddPageFormProps {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  onCancel: () => void;
}

const AddPageForm = ({ menuItems, setMenuItems, onCancel }: AddPageFormProps) => {
  const [newPageTitle, setNewPageTitle] = useState('');

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
    setString(StorageKeys.sidebarMenuItems, JSON.stringify(updatedItems));
    
    toast.success(`"${newPageTitle}" added to sidebar`);
    onCancel();
  };

  return (
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
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </SidebarMenuItem>
  );
};

export default AddPageForm;
