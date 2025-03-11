
import React from "react";
import { Platform } from "@/types/content-flow";
import { Instagram, Youtube, FileText, Mail } from "lucide-react";

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
}

const PlatformIcon = ({ platform, size = 24, className = "" }: PlatformIconProps) => {
  const getIcon = () => {
    switch (platform.icon) {
      case "instagram":
        return <Instagram size={size} className={className} />;
      case "youtube":
        return <Youtube size={size} className={className} />;
      case "file-text":
        return <FileText size={size} className={className} />;
      case "mail":
        return <Mail size={size} className={className} />;
      default:
        return null;
    }
  };

  return getIcon();
};

export default PlatformIcon;
