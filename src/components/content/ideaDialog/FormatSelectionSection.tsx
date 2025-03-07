
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormatSelectionSectionProps {
  format: string;
  onFormatChange: (value: string) => void;
}

const FormatSelectionSection = ({
  format,
  onFormatChange,
}: FormatSelectionSectionProps) => {
  const [customFormat, setCustomFormat] = useState("");
  const [showCustomFormat, setShowCustomFormat] = useState(false);

  const contentFormats = [
    { value: "photo/image", label: "Photo/Image" },
    { value: "pov", label: "POV" },
    { value: "skit", label: "Skit" },
    { value: "tutorial", label: "Tutorial" },
    { value: "vlog", label: "Vlog" },
    { value: "review", label: "Review" },
    { value: "fitcheck", label: "Fit Check" },
    { value: "grwm", label: "GRWM" },
    { value: "story", label: "Story Time" },
    { value: "interview", label: "Interview" },
    { value: "podcast", label: "Podcast" },
    { value: "challenge", label: "Challenge" },
    { value: "unboxing", label: "Unboxing" },
    { value: "bts", label: "Behind The Scenes" },
    { value: "custom", label: "+ Add Custom Format" },
  ];

  const handleFormatChange = (value: string) => {
    if (value === "custom") {
      setShowCustomFormat(true);
      return;
    }

    setShowCustomFormat(false);
    onFormatChange(value);
  };

  const handleCustomFormatSubmit = () => {
    if (customFormat.trim()) {
      onFormatChange(customFormat.trim());
      setShowCustomFormat(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="content-format">Content Format</Label>
      {showCustomFormat ? (
        <div className="flex gap-2">
          <Input
            id="custom-format"
            value={customFormat}
            onChange={(e) => setCustomFormat(e.target.value)}
            placeholder="Enter custom format..."
            className="flex-1"
          />
          <Button 
            onClick={handleCustomFormatSubmit}
            disabled={!customFormat.trim()}
          >
            Add
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCustomFormat(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Select value={format} onValueChange={handleFormatChange}>
          <SelectTrigger id="content-format" className="w-full">
            <SelectValue placeholder="Select content format" />
          </SelectTrigger>
          <SelectContent>
            {contentFormats.map((formatOption) => (
              <SelectItem 
                key={formatOption.value} 
                value={formatOption.value}
              >
                {formatOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default FormatSelectionSection;
