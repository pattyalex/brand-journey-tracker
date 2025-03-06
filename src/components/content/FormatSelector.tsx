
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Common content formats that creators might use
const PREDEFINED_FORMATS = [
  "POV Skit",
  "Tutorial",
  "Vlog",
  "Review",
  "Storytime",
  "Educational",
  "Reaction",
  "Montage",
  "Interview",
  "Day in the Life",
  "Unboxing",
  "Challenge",
  "Q&A",
  "Behind the Scenes"
];

interface FormatSelectorProps {
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

const FormatSelector = ({ selectedFormat, onFormatChange }: FormatSelectorProps) => {
  const [customFormat, setCustomFormat] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleSelectFormat = (value: string) => {
    if (value === "custom") {
      setIsAddingCustom(true);
      return;
    }
    onFormatChange(value);
  };

  const handleAddCustomFormat = () => {
    if (customFormat.trim()) {
      onFormatChange(customFormat.trim());
      setCustomFormat("");
      setIsAddingCustom(false);
    }
  };

  return (
    <div className="space-y-2">
      {isAddingCustom ? (
        <div className="flex items-center gap-2">
          <Input
            value={customFormat}
            onChange={(e) => setCustomFormat(e.target.value)}
            placeholder="Enter custom format..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomFormat();
              }
              if (e.key === "Escape") {
                setIsAddingCustom(false);
              }
            }}
            autoFocus
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddCustomFormat} 
            variant="outline" 
            size="icon"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Select value={selectedFormat || ""} onValueChange={handleSelectFormat}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a content format" />
          </SelectTrigger>
          <SelectContent>
            <div className="py-1 px-1">
              <ScrollArea className="h-[200px]">
                <div className="pr-2">
                  {PREDEFINED_FORMATS.map((format) => (
                    <SelectItem key={format} value={format} className="rounded-sm mb-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {format}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="flex items-center">
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      Add custom format
                    </span>
                  </SelectItem>
                </div>
              </ScrollArea>
            </div>
          </SelectContent>
        </Select>
      )}

      {selectedFormat && (
        <div className="flex items-center mt-2">
          <span className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            {selectedFormat}
          </span>
        </div>
      )}
    </div>
  );
};

export default FormatSelector;
