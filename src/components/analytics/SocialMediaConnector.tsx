
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Linkedin, Music } from "lucide-react";

interface SocialMediaConnectorProps {
  connectedPlatforms: string[];
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

const SocialMediaConnector: React.FC<SocialMediaConnectorProps> = ({
  connectedPlatforms,
  onConnect,
  onDisconnect,
}) => {
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
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {platforms.map((platform) => {
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaConnector;
