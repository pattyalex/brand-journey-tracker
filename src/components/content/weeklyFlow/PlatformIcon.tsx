
import React from "react";
import { Platform } from "@/types/content-flow";
import { 
  Instagram, 
  Youtube, 
  FileText, 
  Mail, 
  Camera, 
  Laptop, 
  PenLine, 
  UserCog, 
  Mic,
  Lightbulb,
  Calendar,
  Shirt,
  AtSign,
  Megaphone,
  Wallet
} from "lucide-react";

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
      case "camera":
        return <Camera size={size} className={className} />;
      case "laptop":
        return <Laptop size={size} className={className} />;
      case "pen-line":
        return <PenLine size={size} className={className} />;
      case "user-cog":
        return <UserCog size={size} className={className} />;
      case "mic":
        return <Mic size={size} className={className} />;
      case "lightbulb":
        return <Lightbulb size={size} className={className} />;
      case "calendar":
        return <Calendar size={size} className={className} />;
      case "shirt":
        return <Shirt size={size} className={className} />;
      case "at-sign":
        return <AtSign size={size} className={className} />;
      case "megaphone":
        return <Megaphone size={size} className={className} />;
      case "wallet":
        return <Wallet size={size} className={className} />;
      default:
        return null;
    }
  };

  return getIcon();
};

export default PlatformIcon;
