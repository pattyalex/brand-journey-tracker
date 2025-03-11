
import { LucideIcon, Instagram, Youtube, Twitter, Facebook, Linkedin, TikTok, Globe, Mail, MessageCircle, Image, Video, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconSelectorProps {
  selectedIcon: LucideIcon | null;
  onSelectIcon: (icon: LucideIcon) => void;
}

const PLATFORM_ICONS: LucideIcon[] = [
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  TikTok,
  Globe,
  Mail,
  MessageCircle,
  Image,
  Video,
  Link
];

const IconSelector = ({ selectedIcon, onSelectIcon }: IconSelectorProps) => {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PLATFORM_ICONS.map((Icon, index) => {
        const isSelected = selectedIcon === Icon;
        return (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "aspect-square h-10 w-10",
              isSelected && "ring-2 ring-purple-500 ring-offset-2 bg-purple-50"
            )}
            onClick={() => onSelectIcon(Icon)}
          >
            <Icon className={cn("h-5 w-5", isSelected ? "text-purple-500" : "text-gray-500")} />
          </Button>
        );
      })}
    </div>
  );
};

export default IconSelector;
