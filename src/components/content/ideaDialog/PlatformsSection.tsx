
import { Label } from "@/components/ui/label";
import PlatformsInput from "../PlatformsInput";

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
      <Label htmlFor="platforms">Platforms</Label>
      <PlatformsInput
        platforms={platforms}
        currentPlatform={currentPlatform}
        onPlatformChange={onCurrentPlatformChange}
        onAddPlatform={onAddPlatform}
        onRemovePlatform={onRemovePlatform}
        placeholder="Add platforms where this content will be published (e.g., Instagram, TikTok, etc.)"
      />
    </div>
  );
};

export default PlatformsSection;
