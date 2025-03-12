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
import { 
  Camera, 
  Laptop, 
  FileText, 
  UserCog, 
  Mic,
  Lightbulb,
  Calendar,
  Shirt,
  AtSign,
  Target,
  Wallet,
  PenLine,
  Scroll,
  Instagram,
  Youtube,
  Mail,
  Film,
  Video,
  Play,
  Image,
  Settings,
  Music,
  Headphones,
  BookOpen,
  Book,
  CircleDollarSign,
  BarChart,
  PieChart,
  LineChart,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Package,
  Pencil,
  Edit,
  MessageSquare,
  MessageCircle,
  Phone,
  Globe,
  Heart,
  Star,
  Award,
  Trophy
} from "lucide-react";

interface AddPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (platform: Platform) => void;
}

const PLATFORM_ICONS = [
  { icon: "camera", component: Camera },
  { icon: "laptop", component: Laptop },
  { icon: "file-text", component: FileText },
  { icon: "pen-line", component: PenLine },
  { icon: "scroll", component: Scroll },
  { icon: "user-cog", component: UserCog },
  { icon: "mic", component: Mic },
  { icon: "lightbulb", component: Lightbulb },
  { icon: "calendar", component: Calendar },
  { icon: "shirt", component: Shirt },
  { icon: "at-sign", component: AtSign },
  { icon: "target", component: Target },
  { icon: "wallet", component: Wallet },
  { icon: "instagram", component: Instagram },
  { icon: "youtube", component: Youtube },
  { icon: "film", component: Film },
  { icon: "video", component: Video },
  { icon: "play", component: Play },
  { icon: "image", component: Image },
  { icon: "mail", component: Mail },
  { icon: "settings", component: Settings },
  { icon: "music", component: Music },
  { icon: "headphones", component: Headphones },
  { icon: "book-open", component: BookOpen },
  { icon: "book", component: Book },
  { icon: "pencil", component: Pencil },
  { icon: "edit", component: Edit },
  { icon: "circle-dollar-sign", component: CircleDollarSign },
  { icon: "bar-chart", component: BarChart },
  { icon: "pie-chart", component: PieChart },
  { icon: "line-chart", component: LineChart },
  { icon: "shopping-bag", component: ShoppingBag },
  { icon: "shopping-cart", component: ShoppingCart },
  { icon: "store", component: Store },
  { icon: "truck", component: Truck },
  { icon: "package", component: Package },
  { icon: "message-square", component: MessageSquare },
  { icon: "message-circle", component: MessageCircle },
  { icon: "phone", component: Phone },
  { icon: "globe", component: Globe },
  { icon: "heart", component: Heart },
  { icon: "star", component: Star },
  { icon: "award", component: Award },
  { icon: "trophy", component: Trophy }
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                placeholder="e.g., Film, Edit, Script"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Platform Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {PLATFORM_ICONS.map(({ icon, component: Icon }) => (
                  <Button
                    key={icon}
                    type="button"
                    variant="outline"
                    className={`aspect-square h-10 ${selectedIcon === icon ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                    title={icon.replace(/-/g, ' ')}
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
