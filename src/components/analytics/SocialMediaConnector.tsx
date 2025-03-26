
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Twitter, Linkedin, Twitch, Music } from "lucide-react";

interface SocialMediaConnectorProps {
  connectedPlatforms: string[];
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

// Custom TikTok SVG icon component - improved version with musical note style
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M15 8v8a4 4 0 0 1-4 4" />
    <line x1="15" y1="4" x2="15" y2="12" />
    <path d="M19 12l-4-1" />
    <path d="M19 8l-4 1" />
  </svg>
);

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
      icon: <TikTokIcon className="h-5 w-5" />,
      color: "bg-black",
    },
    {
      id: "Twitter",
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-blue-400",
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

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
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
