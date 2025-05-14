
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Instagram, Linkedin, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

interface ConnectSocialMediaProps {
  userData: {
    connectedAccounts: string[];
  };
  updateUserData: (data: Partial<{ connectedAccounts: string[] }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ConnectSocialMedia: React.FC<ConnectSocialMediaProps> = ({ 
  userData, 
  updateUserData, 
  onNext, 
  onBack 
}) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "tiktok", name: "TikTok", icon: FaTiktok },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin },
    { id: "twitter", name: "Twitter/X", icon: Twitter },
  ];
  
  const isConnected = (platformId: string) => {
    return userData.connectedAccounts.includes(platformId);
  };
  
  const handleConnect = (platformId: string) => {
    if (isConnected(platformId)) {
      // Disconnect
      updateUserData({
        connectedAccounts: userData.connectedAccounts.filter(id => id !== platformId)
      });
    } else {
      // Connect - In a real implementation, this would trigger an OAuth flow
      setIsConnecting(platformId);
      
      // Simulate connection process
      setTimeout(() => {
        setIsConnecting(null);
        updateUserData({
          connectedAccounts: [...userData.connectedAccounts, platformId]
        });
      }, 1500);
    }
  };
  
  const canProceed = userData.connectedAccounts.length >= 2;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Add your social accounts</h1>
        <p className="text-gray-500 mt-2">
          Connect at least two platforms to get the most out of Hey Megan
        </p>
      </div>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full">
                {typeof platform.icon === 'function' ? (
                  <platform.icon className="h-5 w-5" />
                ) : (
                  <platform.icon size={20} />
                )}
              </div>
              <span>{platform.name}</span>
            </div>
            
            <Button
              type="button"
              variant={isConnected(platform.id) ? "default" : "outline"}
              size="sm"
              disabled={isConnecting !== null}
              onClick={() => handleConnect(platform.id)}
              className={isConnected(platform.id) ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isConnecting === platform.id ? (
                "Connecting..."
              ) : isConnected(platform.id) ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Connected
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        ))}
        
        {!canProceed && (
          <p className="text-sm text-amber-600">
            Please connect at least two social media accounts to continue
          </p>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={onNext} 
          disabled={!canProceed || isConnecting !== null}
          className="w-full"
        >
          Continue
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onBack}
          className="w-full"
          disabled={isConnecting !== null}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default ConnectSocialMedia;
