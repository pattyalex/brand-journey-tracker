
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileType } from "lucide-react";

interface FormatSelectionSectionProps {
  format: string;
  onFormatChange: (value: string) => void;
}

const FormatSelectionSection = ({
  format,
  onFormatChange,
}: FormatSelectionSectionProps) => {
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
  ];

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 mb-1">
        <FileType size={18} className="text-gray-500" />
        <Label htmlFor="content-format">Content Format</Label>
      </div>
      <Select value={format} onValueChange={onFormatChange}>
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
    </div>
  );
};

export default FormatSelectionSection;
