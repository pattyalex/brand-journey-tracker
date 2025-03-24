
import { Label } from "@/components/ui/label";
import PlatformsInput from "../PlatformsInput";
import { Share2 } from "lucide-react";

interface PlatformsSectionProps {
  platforms: string[];
  currentPlatform: string;
  onCurrentPlatformChange: (value: string) => void;
  onAddPlatform: () => void;
  onRemovePlatform: (platform: string) => void;
}

const PlatformsSection = ({
  platforms,
  currentPlatform,
  onCurrentPlatformChange,
  onAddPlatform,
  onRemovePlatform,
}: PlatformsSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Share2 size={18} className="text-blue-500" />
        <Label htmlFor="platforms">Platforms</Label>
      </div>
      <PlatformsInput
        platforms={platforms}
        currentPlatform={currentPlatform}
        onPlatformChange={onCurrentPlatformChange}
        onAddPlatform={onAddPlatform}
        onRemovePlatform={onRemovePlatform}
        placeholder="Add platforms (e.g., Instagram, TikTok)"
      />
    </div>
  );
};

export default PlatformsSection;
