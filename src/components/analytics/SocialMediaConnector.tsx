
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, Youtube, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialMediaConnectorProps {
  connectedPlatforms: string[];
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

const platforms = [
  { name: "Instagram", icon: Instagram, color: "bg-pink-500" },
  { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { name: "Twitter", icon: Twitter, color: "bg-sky-400" },
  { name: "YouTube", icon: Youtube, color: "bg-red-500" }
];

const SocialMediaConnector: React.FC<SocialMediaConnectorProps> = ({
  connectedPlatforms,
  onConnect,
  onDisconnect
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const handleConnect = () => {
    if (selectedPlatform && accessToken.trim()) {
      onConnect(selectedPlatform);
      setAccessToken("");
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="border border-border/40">
      <CardHeader>
        <CardTitle className="text-xl">Connected Platforms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform.name);
            
            return (
              <div key={platform.name} className="relative">
                {isConnected && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => onDisconnect(platform.name)}
                          className="absolute -top-2 -right-2 rounded-full bg-background border border-border z-10 p-1"
                        >
                          <X size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Disconnect</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-lg border ${
                    isConnected ? platform.color + " text-white" : "bg-muted hover:bg-muted/80"
                  } transition-colors cursor-pointer`}
                  onClick={() => {
                    if (!isConnected) {
                      setSelectedPlatform(platform.name);
                      setIsDialogOpen(true);
                    }
                  }}
                >
                  <platform.icon size={28} />
                </div>
                <p className="text-xs text-center mt-1">{platform.name}</p>
              </div>
            );
          })}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect {selectedPlatform}</DialogTitle>
                <DialogDescription>
                  Enter your access token to connect your {selectedPlatform} account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="token">Access Token</Label>
                  <Input
                    id="token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Enter your access token"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect}>Connect</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaConnector;
