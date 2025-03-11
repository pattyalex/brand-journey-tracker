
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Platform } from "@/types/content-flow";
import { v4 as uuidv4 } from "uuid";
import IconSelector from "./IconSelector";
import { LucideIcon, Instagram, Youtube, Twitter, Facebook, Linkedin, Globe } from "lucide-react";

interface AddPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (platform: Platform) => void;
}

const AddPlatformDialog = ({ open, onOpenChange, onAdd }: AddPlatformDialogProps) => {
  const [platformName, setPlatformName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (platformName.trim() && selectedIcon) {
      onAdd({
        id: uuidv4(),
        name: platformName.trim(),
        icon: selectedIcon
      });
      
      // Reset form
      setPlatformName("");
      setSelectedIcon(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Platform</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="e.g., Instagram, YouTube, Blog"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Platform Icon</Label>
              <IconSelector 
                selectedIcon={selectedIcon} 
                onSelectIcon={setSelectedIcon} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!platformName.trim() || !selectedIcon}
            >
              Add Platform
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlatformDialog;
