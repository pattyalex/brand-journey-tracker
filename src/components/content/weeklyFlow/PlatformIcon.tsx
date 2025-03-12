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

const PlatformIcon = ({ platform, size = 12, className = "" }: PlatformIconProps) => {
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
        return <Scroll size={size} className={className} />;
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
        return <Shirt size={size} className={className} />;
      case "at-sign":
        return <AtSign size={size} className={className} />;
      case "target":
        return <Target size={size} className={className} />;
      case "wallet":
        return <Wallet size={size} className={className} />;
      case "film":
        return <Film size={size} className={className} />;
      case "video":
        return <Video size={size} className={className} />;
      case "play":
        return <Play size={size} className={className} />;
      case "image":
        return <Image size={size} className={className} />;
      case "settings":
        return <Settings size={size} className={className} />;
      case "music":
        return <Music size={size} className={className} />;
      case "headphones":
        return <Headphones size={size} className={className} />;
      case "book-open":
        return <BookOpen size={size} className={className} />;
      case "book":
        return <Book size={size} className={className} />;
      case "pencil":
        return <Pencil size={size} className={className} />;
      case "edit":
        return <Edit size={size} className={className} />;
      case "circle-dollar-sign":
        return <CircleDollarSign size={size} className={className} />;
      case "bar-chart":
        return <BarChart size={size} className={className} />;
      case "pie-chart":
        return <PieChart size={size} className={className} />;
      case "line-chart":
        return <LineChart size={size} className={className} />;
      case "shopping-bag":
        return <ShoppingBag size={size} className={className} />;
      case "shopping-cart":
        return <ShoppingCart size={size} className={className} />;
      case "store":
        return <Store size={size} className={className} />;
      case "truck":
        return <Truck size={size} className={className} />;
      case "package":
        return <Package size={size} className={className} />;
      case "message-square":
        return <MessageSquare size={size} className={className} />;
      case "message-circle":
        return <MessageCircle size={size} className={className} />;
      case "phone":
        return <Phone size={size} className={className} />;
      case "globe":
        return <Globe size={size} className={className} />;
      case "heart":
        return <Heart size={size} className={className} />;
      case "star":
        return <Star size={size} className={className} />;
      case "award":
        return <Award size={size} className={className} />;
      case "trophy":
        return <Trophy size={size} className={className} />;
      default:
        return null;
    }
  };

  return getIcon();
};

export default PlatformIcon;
