
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Linkedin, Music, Twitch, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SocialMediaConnectorProps {
  connectedPlatforms: string[];
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

interface CustomPlatform {
  id: string;
  name: string;
  color: string;
}

const SocialMediaConnector: React.FC<SocialMediaConnectorProps> = ({
  connectedPlatforms,
  onConnect,
  onDisconnect,
}) => {
  const [customPlatforms, setCustomPlatforms] = useState<CustomPlatform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformColor, setNewPlatformColor] = useState("#6d28d9"); // Default purple color

  // Define available platforms
  const platforms = [
    {
      id: "Instagram",
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "TikTok",
      name: "TikTok",
      icon: <Music className="h-5 w-5" />,
      color: "bg-black",
    },
    {
      id: "YouTube",
      name: "Youtube",
      icon: <Youtube className="h-5 w-5" />,
      color: "bg-red-600",
    },
    {
      id: "LinkedIn",
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-blue-600",
    },
    {
      id: "Twitch",
      name: "Twitch",
      icon: <Twitch className="h-5 w-5" />,
      color: "bg-purple-600",
    },
  ];

  const handleAddCustomPlatform = () => {
    if (newPlatformName.trim()) {
      const newPlatform: CustomPlatform = {
        id: `custom-${new Date().getTime()}`,
        name: newPlatformName.trim(),
        color: newPlatformColor,
      };
      
      setCustomPlatforms([...customPlatforms, newPlatform]);
      onConnect(newPlatform.id);
      
      // Reset form
      setNewPlatformName("");
      setNewPlatformColor("#6d28d9");
      setIsAddDialogOpen(false);
    }
  };

  const combinedPlatforms = [
    ...platforms,
    ...customPlatforms.map(custom => ({
      id: custom.id,
      name: custom.name,
      icon: <Plus className="h-5 w-5" />, // Default icon for custom platforms
      color: `bg-[${custom.color}]`,
    })),
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
        <div className="flex flex-wrap gap-4">
          {combinedPlatforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform.id);
            return (
              <div key={platform.id} className="flex flex-col items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-16 w-16 rounded-lg mb-2 ${
                    isConnected ? platform.color : "bg-muted"
                  } ${
                    isConnected ? "text-white" : "text-muted-foreground"
                  } hover:scale-105 transition-transform`}
                  onClick={() =>
                    isConnected
                      ? onDisconnect(platform.id)
                      : onConnect(platform.id)
                  }
                >
                  {platform.icon}
                </Button>
                <span className="text-sm">{platform.name}</span>
                {isConnected && (
                  <span className="text-xs text-green-600 mt-1">Connected</span>
                )}
              </div>
            );
          })}
          
          {/* Add New Platform Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-lg mb-2 bg-muted hover:bg-muted-foreground/20 hover:scale-105 transition-transform"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
            </Button>
            <span className="text-sm">Add Platform</span>
          </div>
        </div>
      </CardContent>

      {/* Add Platform Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Platform</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="Enter platform name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform-color">Platform Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="platform-color"
                  type="color"
                  value={newPlatformColor}
                  onChange={(e) => setNewPlatformColor(e.target.value)}
                  className="w-12 h-12 p-1 cursor-pointer"
                />
                <div className="text-sm text-muted-foreground">
                  Select a color for this platform
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomPlatform} disabled={!newPlatformName.trim()}>
              Add Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SocialMediaConnector;
