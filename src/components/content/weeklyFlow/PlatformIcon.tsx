
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
  Scroll,
  Film,
  Video,
  Play,
  Image,
  Settings,
  Music,
  Headphones,
  BookOpen,
  Book,
  CircleDollarSign,
  BarChart,
  PieChart,
  LineChart,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Package,
  Pencil,
  Edit,
  MessageSquare,
  MessageCircle,
  Phone,
  Globe,
  Heart,
  Star,
  Award,
  Trophy
} from "lucide-react";

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
}

// Colorful backgrounds for icons
const getIconStyle = (icon: string) => {
  const styles: Record<string, { bg: string, iconColor: string }> = {
    "camera": { bg: "bg-gradient-to-tr from-red-100 to-red-200", iconColor: "text-red-600" },
    "laptop": { bg: "bg-gradient-to-tr from-blue-100 to-blue-200", iconColor: "text-blue-600" },
    "scroll": { bg: "bg-gradient-to-tr from-amber-100 to-amber-200", iconColor: "text-amber-600" },
    "user-cog": { bg: "bg-gradient-to-tr from-slate-100 to-slate-200", iconColor: "text-slate-600" },
    "mic": { bg: "bg-gradient-to-tr from-pink-100 to-pink-200", iconColor: "text-pink-600" },
    "lightbulb": { bg: "bg-gradient-to-tr from-yellow-100 to-yellow-200", iconColor: "text-yellow-600" },
    "calendar": { bg: "bg-gradient-to-tr from-teal-100 to-teal-200", iconColor: "text-teal-600" },
    "shirt": { bg: "bg-gradient-to-tr from-purple-100 to-purple-200", iconColor: "text-purple-600" },
    "dress": { bg: "bg-gradient-to-tr from-purple-100 to-purple-200", iconColor: "text-purple-600" },
    "at-sign": { bg: "bg-gradient-to-tr from-orange-100 to-orange-200", iconColor: "text-orange-600" },
    "target": { bg: "bg-gradient-to-tr from-red-100 to-red-200", iconColor: "text-red-600" },
    "wallet": { bg: "bg-gradient-to-tr from-green-100 to-green-200", iconColor: "text-green-600" },
    "film": { bg: "bg-gradient-to-tr from-indigo-100 to-indigo-200", iconColor: "text-indigo-600" },
    "video": { bg: "bg-gradient-to-tr from-cyan-100 to-cyan-200", iconColor: "text-cyan-600" },
    "play": { bg: "bg-gradient-to-tr from-red-100 to-red-200", iconColor: "text-red-600" },
    "image": { bg: "bg-gradient-to-tr from-emerald-100 to-emerald-200", iconColor: "text-emerald-600" },
    "settings": { bg: "bg-gradient-to-tr from-gray-100 to-gray-200", iconColor: "text-gray-600" },
    "edit": { bg: "bg-gradient-to-tr from-violet-100 to-violet-200", iconColor: "text-violet-600" },
    "pencil": { bg: "bg-gradient-to-tr from-blue-100 to-blue-200", iconColor: "text-blue-600" },
    "pen-line": { bg: "bg-gradient-to-tr from-blue-100 to-blue-200", iconColor: "text-blue-600" },
    "instagram": { bg: "bg-gradient-to-tr from-pink-100 to-purple-200", iconColor: "text-purple-600" },
    "youtube": { bg: "bg-gradient-to-tr from-red-100 to-red-200", iconColor: "text-red-600" },
    "mail": { bg: "bg-gradient-to-tr from-blue-100 to-blue-200", iconColor: "text-blue-600" },
    "file-text": { bg: "bg-gradient-to-tr from-gray-100 to-gray-200", iconColor: "text-gray-600" },
  };

  return styles[icon] || { bg: "bg-gray-100", iconColor: "text-gray-600" };
};

const PlatformIcon = ({ platform, size = 12, className = "" }: PlatformIconProps) => {
  const { bg, iconColor } = getIconStyle(platform.icon);
  
  const getIcon = () => {
    switch (platform.icon) {
      case "instagram":
        return <Instagram size={size} className={`${iconColor} ${className}`} />;
      case "youtube":
        return <Youtube size={size} className={`${iconColor} ${className}`} />;
      case "file-text":
        return <FileText size={size} className={`${iconColor} ${className}`} />;
      case "mail":
        return <Mail size={size} className={`${iconColor} ${className}`} />;
      case "camera":
        return <Camera size={size} className={`${iconColor} ${className}`} />;
      case "laptop":
        return <Laptop size={size} className={`${iconColor} ${className}`} />;
      case "pen-line":
        return <PenLine size={size} className={`${iconColor} ${className}`} />;
      case "scroll":
        return <Scroll size={size} className={`${iconColor} ${className}`} />;
      case "user-cog":
        return <UserCog size={size} className={`${iconColor} ${className}`} />;
      case "mic":
        return <Mic size={size} className={`${iconColor} ${className}`} />;
      case "lightbulb":
        return <Lightbulb size={size} className={`${iconColor} ${className}`} />;
      case "calendar":
        return <Calendar size={size} className={`${iconColor} ${className}`} />;
      case "shirt":
        return <Shirt size={size} className={`${iconColor} ${className}`} />;
      case "dress":
        return <Shirt size={size} className={`${iconColor} ${className}`} />;
      case "at-sign":
        return <AtSign size={size} className={`${iconColor} ${className}`} />;
      case "target":
        return <Target size={size} className={`${iconColor} ${className}`} />;
      case "wallet":
        return <Wallet size={size} className={`${iconColor} ${className}`} />;
      case "film":
        return <Film size={size} className={`${iconColor} ${className}`} />;
      case "video":
        return <Video size={size} className={`${iconColor} ${className}`} />;
      case "play":
        return <Play size={size} className={`${iconColor} ${className}`} />;
      case "image":
        return <Image size={size} className={`${iconColor} ${className}`} />;
      case "settings":
        return <Settings size={size} className={`${iconColor} ${className}`} />;
      case "music":
        return <Music size={size} className={`${iconColor} ${className}`} />;
      case "headphones":
        return <Headphones size={size} className={`${iconColor} ${className}`} />;
      case "book-open":
        return <BookOpen size={size} className={`${iconColor} ${className}`} />;
      case "book":
        return <Book size={size} className={`${iconColor} ${className}`} />;
      case "circle-dollar-sign":
        return <CircleDollarSign size={size} className={`${iconColor} ${className}`} />;
      case "bar-chart":
        return <BarChart size={size} className={`${iconColor} ${className}`} />;
      case "pie-chart":
        return <PieChart size={size} className={`${iconColor} ${className}`} />;
      case "line-chart":
        return <LineChart size={size} className={`${iconColor} ${className}`} />;
      case "shopping-bag":
        return <ShoppingBag size={size} className={`${iconColor} ${className}`} />;
      case "shopping-cart":
        return <ShoppingCart size={size} className={`${iconColor} ${className}`} />;
      case "store":
        return <Store size={size} className={`${iconColor} ${className}`} />;
      case "truck":
        return <Truck size={size} className={`${iconColor} ${className}`} />;
      case "package":
        return <Package size={size} className={`${iconColor} ${className}`} />;
      case "message-square":
        return <MessageSquare size={size} className={`${iconColor} ${className}`} />;
      case "message-circle":
        return <MessageCircle size={size} className={`${iconColor} ${className}`} />;
      case "phone":
        return <Phone size={size} className={`${iconColor} ${className}`} />;
      case "globe":
        return <Globe size={size} className={`${iconColor} ${className}`} />;
      case "heart":
        return <Heart size={size} className={`${iconColor} ${className}`} />;
      case "star":
        return <Star size={size} className={`${iconColor} ${className}`} />;
      case "award":
        return <Award size={size} className={`${iconColor} ${className}`} />;
      case "trophy":
        return <Trophy size={size} className={`${iconColor} ${className}`} />;
      case "edit":
        return <Edit size={size} className={`${iconColor} ${className}`} />;
      case "pencil":
        return <Pencil size={size} className={`${iconColor} ${className}`} />;
      default:
        return null;
    }
  };

  return <div className={`${bg} rounded-full p-1 flex items-center justify-center`}>{getIcon()}</div>;
};

export default PlatformIcon;
