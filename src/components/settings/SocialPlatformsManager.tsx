
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Plus, 
  Trash2,
  Music 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Platform type
interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  username?: string;
}

const SocialPlatformsManager = () => {
  // Available platforms
  const defaultPlatforms: Platform[] = [
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <Music className="h-5 w-5" />,
      color: "bg-black",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="h-5 w-5" />,
      color: "bg-red-600",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-blue-600",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-blue-700",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-blue-400",
    }
  ];

  // State for connected platforms
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([
    { ...defaultPlatforms[0], username: "@creator" } // Start with Instagram connected by default
  ]);
  
  // State for add platform dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [username, setUsername] = useState("");

  // Get available platforms (not already connected)
  const getAvailablePlatforms = () => {
    return defaultPlatforms.filter(
      platform => !connectedPlatforms.some(connected => connected.id === platform.id)
    );
  };

  // Handle adding a platform
  const handleAddPlatform = () => {
    if (selectedPlatform && username.trim()) {
      setConnectedPlatforms([
        ...connectedPlatforms,
        { ...selectedPlatform, username }
      ]);
      toast.success(`Added ${selectedPlatform.name}`);
      setIsAddDialogOpen(false);
      setSelectedPlatform(null);
      setUsername("");
    }
  };

  // Handle removing a platform
  const handleRemovePlatform = (platformId: string) => {
    // Prevent removing the last platform
    if (connectedPlatforms.length <= 1) {
      toast.error("You must keep at least one platform connected");
      return;
    }
    
    setConnectedPlatforms(
      connectedPlatforms.filter(platform => platform.id !== platformId)
    );
    toast.success("Platform removed");
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Connect your social media accounts to enhance your profile. At least one platform must remain connected.
        </p>
      </div>

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {connectedPlatforms.map((platform) => (
          <div 
            key={platform.id} 
            className="flex items-center justify-between p-3 border rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${platform.color} text-white`}>
                {platform.icon}
              </div>
              <div>
                <p className="font-medium">{platform.name}</p>
                <p className="text-sm text-muted-foreground">{platform.username}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePlatform(platform.id)}
              disabled={connectedPlatforms.length <= 1}
              title={connectedPlatforms.length <= 1 ? "You must keep at least one platform" : "Remove platform"}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Platform Button */}
      {getAvailablePlatforms().length > 0 && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Platform
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Media Platform</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <Label htmlFor="platform">Select Platform</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {getAvailablePlatforms().map((platform) => (
                    <Button
                      key={platform.id}
                      type="button"
                      variant={selectedPlatform?.id === platform.id ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-20 gap-2"
                      onClick={() => setSelectedPlatform(platform)}
                    >
                      <div className={`p-2 rounded-full ${platform.color} text-white`}>
                        {platform.icon}
                      </div>
                      <span className="text-xs">{platform.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedPlatform(null);
                  setUsername("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPlatform}
                disabled={!selectedPlatform || !username.trim()}
              >
                Add Platform
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SocialPlatformsManager;
