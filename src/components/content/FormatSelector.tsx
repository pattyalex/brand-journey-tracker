
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
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
const DEFAULT_PREDEFINED_FORMATS = [
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
  const [formats, setFormats] = useState<string[]>(() => {
    // Try to load saved formats from localStorage, fallback to defaults
    const savedFormats = localStorage.getItem("contentFormats");
    return savedFormats ? JSON.parse(savedFormats) : DEFAULT_PREDEFINED_FORMATS;
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const SCROLL_STEP = 120; // Amount to scroll with each button click

  // Save formats to localStorage whenever they change
  const saveFormats = (newFormats: string[]) => {
    localStorage.setItem("contentFormats", JSON.stringify(newFormats));
    setFormats(newFormats);
  };

  const handleSelectFormat = (value: string) => {
    if (value === "custom") {
      setIsAddingCustom(true);
      return;
    }
    onFormatChange(value);
  };

  const handleAddCustomFormat = () => {
    if (customFormat.trim()) {
      const newFormat = customFormat.trim();
      
      // Only add if not already in the list
      if (!formats.includes(newFormat)) {
        const newFormats = [...formats, newFormat];
        saveFormats(newFormats);
      }
      
      onFormatChange(newFormat);
      setCustomFormat("");
      setIsAddingCustom(false);
    }
  };

  const handleDeleteFormat = (formatToDelete: string, e: React.MouseEvent) => {
    // Stop the event from bubbling up to the parent SelectItem
    e.stopPropagation();
    
    // Filter out the format to delete
    const newFormats = formats.filter(format => format !== formatToDelete);
    saveFormats(newFormats);
    
    // If the currently selected format is being deleted, clear the selection
    if (selectedFormat === formatToDelete) {
      onFormatChange("");
    }
  };

  const handleClearSelectedFormat = () => {
    onFormatChange("");
  };

  const handleScrollUp = () => {
    const newPosition = Math.max(0, scrollPosition - SCROLL_STEP);
    setScrollPosition(newPosition);
    
    // Find the ScrollArea viewport and scroll it
    const viewport = document.querySelector('.formats-scroll-area [data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = newPosition;
    }
  };

  const handleScrollDown = () => {
    const newPosition = scrollPosition + SCROLL_STEP;
    setScrollPosition(newPosition);
    
    // Find the ScrollArea viewport and scroll it
    const viewport = document.querySelector('.formats-scroll-area [data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = newPosition;
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
          <SelectTrigger className="w-full relative" iconClassName="absolute right-6 mr-0">
            <SelectValue placeholder="Select a content format" />
          </SelectTrigger>
          <SelectContent className="select-none max-h-[300px]">
            <div className="flex items-center justify-center border-b border-gray-100 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleScrollUp}
                className="w-full flex justify-center hover:bg-gray-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[200px] formats-scroll-area">
              <div className="p-2">
                {formats.map((format) => (
                  <SelectItem 
                    key={format} 
                    value={format} 
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 group pr-10 relative mb-1 rounded-md cursor-pointer"
                  >
                    <span>{format}</span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => handleDeleteFormat(format, e)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </SelectItem>
                ))}
                <SelectItem value="custom" className="hover:bg-gray-100 dark:hover:bg-gray-700 mt-2 rounded-md cursor-pointer">
                  <span className="flex items-center">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add custom format
                  </span>
                </SelectItem>
              </div>
            </ScrollArea>
            
            <div className="flex items-center justify-center border-t border-gray-100 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleScrollDown}
                className="w-full flex justify-center hover:bg-gray-100"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </SelectContent>
        </Select>
      )}

      {selectedFormat && (
        <div className="flex items-center mt-2">
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            {selectedFormat}
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={handleClearSelectedFormat}
              className="ml-1 p-0 h-5 w-5 rounded-full hover:bg-blue-200"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        </div>
      )}
    </div>
  );
};

export default FormatSelector;
