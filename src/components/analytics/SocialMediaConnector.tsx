
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Linkedin, Music, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

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

  // Define available platforms with their actual logos
  const platforms = [
    {
      id: "Instagram",
      name: "Instagram",
      logoUrl: "/lovable-uploads/4d0fd149-7d80-4e04-b2f0-c7dcff4da3b5.png",
      icon: <Instagram className="h-5 w-5" />, // Fallback icon
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "TikTok",
      name: "TikTok",
      logoUrl: "/lovable-uploads/4d0fd149-7d80-4e04-b2f0-c7dcff4da3b5.png",
      icon: <Music className="h-5 w-5" />, // Fallback icon
      color: "bg-black",
    },
    {
      id: "YouTube",
      name: "Youtube",
      logoUrl: "/lovable-uploads/4d0fd149-7d80-4e04-b2f0-c7dcff4da3b5.png",
      icon: <Youtube className="h-5 w-5" />, // Fallback icon
      color: "bg-red-600",
    },
    {
      id: "LinkedIn",
      name: "LinkedIn",
      logoUrl: "/lovable-uploads/4d0fd149-7d80-4e04-b2f0-c7dcff4da3b5.png",
      icon: <Linkedin className="h-5 w-5" />, // Fallback icon
      color: "bg-blue-600",
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

  const handleDeletePlatform = (platformId: string) => {
    // First disconnect if it's connected
    if (connectedPlatforms.includes(platformId)) {
      onDisconnect(platformId);
    }
    
    // Then remove from custom platforms if it's a custom one
    if (platformId.startsWith('custom-')) {
      setCustomPlatforms(customPlatforms.filter(p => p.id !== platformId));
    }
  };

  // Function to check if a platform should have delete button
  const canDeletePlatform = (platformId: string) => {
    return platformId !== "Instagram" && platformId !== "TikTok";
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

  // Get logo for each platform
  const getPlatformLogo = (platformId: string) => {
    // Use proper logos based on platform ID
    switch(platformId) {
      case "Instagram":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2176 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="white"/>
            </svg>
          </div>
        );
      case "TikTok":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.321 5.562C18.7362 4.91084 18.4275 4.07264 18.45 3.212C18.45 3.141 18.45 3.075 18.45 3H14.953V15.443C14.9394 16.0957 14.6942 16.7229 14.258 17.2068C13.8219 17.6906 13.2239 17.9992 12.574 18.075C12.4294 18.0583 12.2834 18.05 12.137 18.05C11.6411 18.0575 11.1529 18.1762 10.7133 18.3959C10.2736 18.6155 9.89443 18.9295 9.60724 19.3114C9.32005 19.6933 9.1341 20.1323 9.06538 20.5934C8.99666 21.0544 9.04742 21.5242 9.21342 21.9607C9.37942 22.3971 9.65622 22.7866 10.0195 23.0958C10.3827 23.4051 10.8215 23.6251 11.2963 23.7366C11.7711 23.848 12.2678 23.8475 12.7424 23.7349C13.217 23.6223 13.6553 23.4013 14.0178 23.0912C14.3803 22.7811 14.6562 22.3909 14.8212 21.9541C14.9863 21.5173 15.036 21.0474 14.9663 20.5864C14.8967 20.1254 14.7099 19.6866 14.422 19.305V19.305C14.2356 19.0603 14.0062 18.8508 13.746 18.686V13.772C13.746 13.772 16.015 13.472 17.256 12.372C17.3062 12.3318 17.3536 12.2886 17.398 12.243C17.473 12.173 18.722 11.05 19.321 8.991V8.991C19.699 9.237 20.111 9.434 20.545 9.578C21.0173 9.72782 21.5079 9.81804 22.004 9.847V6.347C21.6254 6.35244 21.2503 6.29834 20.8932 6.18673C20.536 6.07513 20.2025 5.90775 19.909 5.689C19.7125 5.6498 19.5201 5.59334 19.334 5.521L19.321 5.562Z" fill="white"/>
            </svg>
          </div>
        );
      case "YouTube":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.498 6.186C23.3624 5.74219 23.1189 5.3368 22.787 5.00759C22.4551 4.67837 22.0449 4.43903 21.596 4.314C19.7734 3.7935 12.0004 3.7935 12.0004 3.7935C12.0004 3.7935 4.22737 3.7935 2.40437 4.314C1.95546 4.43903 1.54528 4.67837 1.21338 5.00759C0.881484 5.3368 0.637984 5.74219 0.502375 6.186C0.001375 8.02742 0.001375 11.793 0.001375 11.793C0.001375 11.793 0.001375 15.5586 0.502375 17.4C0.637984 17.8438 0.881484 18.2492 1.21338 18.5784C1.54528 18.9076 1.95546 19.147 2.40437 19.272C4.22737 19.7925 12.0004 19.7925 12.0004 19.7925C12.0004 19.7925 19.7734 19.7925 21.5964 19.272C22.0453 19.147 22.4555 18.9076 22.7874 18.5784C23.1193 18.2492 23.3628 17.8438 23.4984 17.4C23.9994 15.5586 23.9994 11.793 23.9994 11.793C23.9994 11.793 23.9994 8.02742 23.498 6.186ZM9.54837 15.0945V8.49145L15.8144 11.793L9.54837 15.0945Z" fill="white"/>
            </svg>
          </div>
        );
      case "LinkedIn":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z" fill="white"/>
            </svg>
          </div>
        );
      default:
        // For custom platforms
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl">
            <Plus className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
        <div className="flex flex-wrap gap-4">
          {combinedPlatforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform.id);
            const isCustom = platform.id.startsWith('custom-');
            
            return (
              <div key={platform.id} className="flex flex-col items-center">
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-16 w-16 rounded-lg mb-2 flex items-center justify-center ${
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
                    {getPlatformLogo(platform.id)}
                  </Button>
                  
                  {/* Delete button - only show for platforms that can be deleted */}
                  {canDeletePlatform(platform.id) && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlatform(platform.id);
                      }}
                      title={`Delete ${platform.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
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
