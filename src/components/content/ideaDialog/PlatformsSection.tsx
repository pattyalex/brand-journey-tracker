
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
      />
      <p className="text-xs text-muted-foreground mt-1">
        Add platforms where this content will be published (e.g., Instagram, YouTube, Blog, etc.). 
        You can later filter content by platform in the Ideas section. This helps you organize content for specific channels.
      </p>
    </div>
  );
};

export default PlatformsSection;
