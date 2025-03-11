
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
import { Instagram, Youtube, FileText, Mail } from "lucide-react";

interface AddPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (platform: Platform) => void;
}

const PLATFORM_ICONS = [
  { icon: "instagram", component: Instagram },
  { icon: "youtube", component: Youtube },
  { icon: "file-text", component: FileText },
  { icon: "mail", component: Mail },
];

const AddPlatformDialog = ({ open, onOpenChange, onAdd }: AddPlatformDialogProps) => {
  const [platformName, setPlatformName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");

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
      setSelectedIcon("");
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
              <div className="grid grid-cols-3 gap-2">
                {PLATFORM_ICONS.map(({ icon, component: Icon }) => (
                  <Button
                    key={icon}
                    type="button"
                    variant="outline"
                    className={`aspect-square h-10 ${selectedIcon === icon ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <Icon className={`h-5 w-5 ${selectedIcon === icon ? 'text-purple-500' : 'text-gray-500'}`} />
                  </Button>
                ))}
              </div>
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
