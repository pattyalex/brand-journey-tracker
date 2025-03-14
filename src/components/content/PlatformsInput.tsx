
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlatformsInputProps {
  platforms: string[];
  currentPlatform: string;
  onPlatformChange: (value: string) => void;
  onAddPlatform: () => void;
  onRemovePlatform: (platform: string) => void;
  placeholder?: string;
}

const PlatformsInput = ({
  platforms,
  currentPlatform,
  onPlatformChange,
  onAddPlatform,
  onRemovePlatform,
  placeholder = "Add platforms where this content will be published (e.g., Instagram, TikTok, etc.)"
}: PlatformsInputProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input
          value={currentPlatform}
          onChange={(e) => onPlatformChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddPlatform())}
          className="flex-1"
        />
        <Button type="button" onClick={onAddPlatform} variant="outline" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-2">
        {platforms.map((platform, index) => (
          <span 
            key={index} 
            className="bg-purple-100 text-purple-800 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            {platform}
            <button 
              type="button" 
              onClick={() => onRemovePlatform(platform)}
              className="text-purple-800 hover:text-purple-900"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlatformsInput;
