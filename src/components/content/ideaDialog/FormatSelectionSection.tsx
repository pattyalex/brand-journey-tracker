
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
    { value: "photo/image", label: "Photo/Image", color: "#7C3AED" },
    { value: "pov", label: "POV", color: "#0CA678" },
    { value: "skit", label: "Skit", color: "#E67E22" },
    { value: "tutorial", label: "Tutorial", color: "#9B59B6" },
    { value: "vlog", label: "Vlog", color: "#3498DB" },
    { value: "review", label: "Review", color: "#C0392B" },
    { value: "fitcheck", label: "Fit Check", color: "#16A085" },
    { value: "grwm", label: "GRWM", color: "#D35400" },
    { value: "story", label: "Story Time", color: "#7C3AED" },
    { value: "interview", label: "Interview", color: "#0CA678" },
    { value: "podcast", label: "Podcast", color: "#E67E22" },
    { value: "challenge", label: "Challenge", color: "#9B59B6" },
    { value: "unboxing", label: "Unboxing", color: "#3498DB" },
    { value: "bts", label: "Behind The Scenes", color: "#C0392B" },
  ];

  const selectedFormat = contentFormats.find(f => f.value === format);

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 mb-1">
        <FileType size={18} className="text-gray-500" />
        <Label htmlFor="content-format">Content Format</Label>
      </div>
      <Select value={format} onValueChange={onFormatChange}>
        <SelectTrigger 
          id="content-format" 
          className="w-full transition-all duration-300"
          style={selectedFormat ? {
            borderColor: `${selectedFormat.color}40`,
            borderWidth: '1px',
            background: 'white',
          } : undefined}
        >
          <SelectValue placeholder="Select content format" />
        </SelectTrigger>
        <SelectContent>
          {contentFormats.map((formatOption) => (
            <SelectItem 
              key={formatOption.value} 
              value={formatOption.value}
              className="flex items-center transition-colors hover:bg-opacity-10"
              style={{
                backgroundColor: format === formatOption.value ? `${formatOption.color}10` : undefined
              }}
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ 
                    backgroundColor: formatOption.color,
                    opacity: 0.7
                  }}
                />
                {formatOption.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedFormat && (
        <div 
          className="mt-1 px-3 py-1.5 text-xs inline-flex items-center rounded-md transition-all duration-300 font-medium"
          style={{ 
            backgroundColor: 'white',
            color: selectedFormat.color,
            borderLeft: `1px solid ${selectedFormat.color}40`,
            borderTop: `1px solid ${selectedFormat.color}15`,
            borderRight: `1px solid ${selectedFormat.color}15`,
            borderBottom: `1px solid ${selectedFormat.color}15`,
          }}
        >
          Selected: {selectedFormat.label}
        </div>
      )}
    </div>
  );
};

export default FormatSelectionSection;
