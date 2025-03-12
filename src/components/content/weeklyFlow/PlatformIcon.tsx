
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
  Target,
  Wallet,
  Scroll
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
      case "scroll":
        return <Scroll size={size} className={className} />; // Adding Scroll icon for script (pen and paper)
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
      case "dress":
        return <Shirt size={size} className={className} />; // Using Shirt as the closest icon for dress
      case "at-sign":
        return <AtSign size={size} className={className} />;
      case "target":
        return <Target size={size} className={className} />; // Target icon for strategy
      case "wallet":
        return <Wallet size={size} className={className} />;
      default:
        return null;
    }
  };

  return getIcon();
};

export default PlatformIcon;
