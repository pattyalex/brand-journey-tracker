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

  const platforms = [
    {
      id: "Instagram",
      name: "Instagram",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "TikTok",
      name: "TikTok",
      color: "bg-black",
    },
    {
      id: "YouTube",
      name: "Youtube",
      color: "bg-red-600",
    },
    {
      id: "LinkedIn",
      name: "LinkedIn",
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
      
      setNewPlatformName("");
      setNewPlatformColor("#6d28d9");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeletePlatform = (platformId: string) => {
    if (connectedPlatforms.includes(platformId)) {
      onDisconnect(platformId);
    }
    
    if (platformId.startsWith('custom-')) {
      setCustomPlatforms(customPlatforms.filter(p => p.id !== platformId));
    }
  };

  const canDeletePlatform = (platformId: string) => {
    return platformId !== "Instagram" && platformId !== "TikTok";
  };

  const combinedPlatforms = [
    ...platforms,
    ...customPlatforms.map(custom => ({
      id: custom.id,
      name: custom.name,
      color: `bg-[${custom.color}]`,
    })),
  ];

  const getPlatformLogo = (platformId: string) => {
    switch(platformId) {
      case "Instagram":
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2176 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="white"/>
          </svg>
        );
      case "TikTok":
        return (
          <img 
            src="/lovable-uploads/582bb98d-488d-4d15-b4fb-5c8a59930a4a.png" 
            alt="TikTok Logo" 
            className="w-8 h-8 object-contain" 
          />
        );
      case "YouTube":
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186C23.3624 5.74219 23.1189 5.3368 22.787 5.00759C22.4551 4.67837 22.0449 4.43903 21.596 4.314C19.7734 3.7935 12.0004 3.7935 12.0004 3.7935C12.0004 3.7935 4.22737 3.7935 2.40437 4.314C1.95546 4.43903 1.54528 4.67837 1.21338 5.00759C0.881484 5.3368 0.637984 5.74219 0.502375 6.186C0.001375 8.02742 0.001375 11.793 0.001375 11.793C0.001375 11.793 0.001375 15.5586 0.502375 17.4C0.637984 17.8438 0.881484 18.2492 1.21338 18.5784C1.54528 18.9076 1.95546 19.147 2.40437 19.272C4.22737 19.7925 12.0004 19.7925 12.0004 19.7925C12.0004 19.7925 19.7734 19.7925 21.5964 19.272C22.0453 19.147 22.4555 18.9076 22.7874 18.5784C23.1193 18.2492 23.3628 17.8438 23.4984 17.4C23.9994 15.5586 23.9994 11.793 23.9994 11.793C23.9994 11.793 23.9994 8.02742 23.498 6.186ZM9.54837 15.0945V8.49145L15.8144 11.793L9.54837 15.0945Z" fill="white"/>
          </svg>
        );
      case "LinkedIn":
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z" fill="white"/>
          </svg>
        );
      default:
        return (
          <Plus className="h-6 w-6" />
        );
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Connected Platforms</h2>
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          {combinedPlatforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform.id);
            const isCustom = platform.id.startsWith('custom-');
            
            return (
              <div key={platform.id} className="flex flex-col items-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="relative group">
                      <button
                        className="w-14 h-14 flex items-center justify-center hover:scale-110 transition-all duration-200"
                        onClick={() =>
                          isConnected
                            ? onDisconnect(platform.id)
                            : onConnect(platform.id)
                        }
                      >
                        {getPlatformLogo(platform.id)}
                      </button>
                      
                      {canDeletePlatform(platform.id) && (
                        <button
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlatform(platform.id);
                          }}
                          title={`Delete ${platform.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-60 p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isConnected 
                          ? `Connected. Click to disconnect your ${platform.name} account.` 
                          : `Not connected. Click to connect your ${platform.name} account.`}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                {isConnected && (
                  <span className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span> Connected
                  </span>
                )}
              </div>
            );
          })}
          
          <div className="flex flex-col items-center">
            <button
              className="w-14 h-14 flex items-center justify-center hover:scale-110 transition-all duration-200"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-8 w-8 text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-700">Add Platform</span>
          </div>
        </div>
      </CardContent>

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
                className="focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform-color">Platform Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="platform-color"
                  type="color"
                  value={newPlatformColor}
                  onChange={(e) => setNewPlatformColor(e.target.value)}
                  className="w-16 h-16 p-1 cursor-pointer rounded-md"
                />
                <div className="text-sm text-muted-foreground">
                  Select a brand color for this platform
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAddCustomPlatform} 
              disabled={!newPlatformName.trim()}
            >
              Add Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SocialMediaConnector;
