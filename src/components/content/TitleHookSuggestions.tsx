
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Sparkles } from "lucide-react";

interface TitleHookSuggestionsProps {
  onSelectHook: (hook: string) => void;
}

// Organize hooks into categories
const CATEGORIZED_HOOKS = {
  "Inspirational Hooks": [
    "Transform your life with this simple...",
    "The one mindset shift that changed everything for me...",
    "How I overcame my biggest challenge and you can too...",
    "This changed my perspective forever..."
  ],
  "Educational Hooks": [
    "5 things I wish I knew before...",
    "The truth about... that nobody admits",
    "What no one tells you about...",
    "Here's what I learned after..."
  ],
  "Entertaining Hooks": [
    "POV: When you finally...",
    "I tried this trend and... you won't believe what happened",
    "This hack saved me hours of...",
    "It's date night, and here's my outfit"
  ],
  "Promotional Hooks": [
    "The secret to my success with...",
    "Here's why everyone is talking about...",
    "How I turned my passion into...",
    "This product changed my routine forever..."
  ],
  "Industry Specific Hooks": [
    "Day in the life of a...",
    "Behind the scenes of my...",
    "What it's really like working in...",
    "Industry secrets they don't want you to know..."
  ]
};

const TitleHookSuggestions = ({ onSelectHook }: TitleHookSuggestionsProps) => {
  const [open, setOpen] = useState(false);
  const [customHook, setCustomHook] = useState("");

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setOpen(false);
  };

  const handleCustomHookSubmit = () => {
    if (customHook.trim()) {
      onSelectHook(customHook);
      setCustomHook("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="xs"
          className="absolute right-[23px] hover:bg-transparent active:scale-95 transition-all duration-150 p-1.5 h-auto"
          aria-label="Show title hook suggestions"
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex flex-col">
          <div className="p-3 bg-muted/50 border-b">
            <h3 className="font-medium text-sm">Catchy Hook Ideas</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any suggestion to use it as your title
            </p>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {Object.entries(CATEGORIZED_HOOKS).map(([category, hooks]) => (
              <div key={category} className="p-1">
                <h4 className="font-semibold text-sm px-3 py-2 text-primary">{category}</h4>
                {hooks.map((hook, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 h-auto text-sm rounded-none hover:bg-accent"
                    onClick={() => handleSelectHook(hook)}
                  >
                    {hook}
                  </Button>
                ))}
              </div>
            ))}
            
            <div className="p-1">
              <h4 className="font-semibold text-sm px-3 py-2 text-primary">+ Create your own</h4>
              <div className="px-3 py-2 flex gap-2">
                <input
                  type="text"
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border rounded-md"
                  placeholder="Type your own hook..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomHookSubmit();
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={handleCustomHookSubmit}
                  disabled={!customHook.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TitleHookSuggestions;
