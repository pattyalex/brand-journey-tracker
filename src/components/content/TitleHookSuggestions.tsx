
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

// Categories only without example hooks
const HOOK_CATEGORIES = [
  "Inspirational Hooks",
  "Educational Hooks",
  "Entertaining Hooks",
  "Promotional Hooks",
  "Industry Specific Hooks",
  "Question Hooks"
];

const TitleHookSuggestions = ({ onSelectHook }: TitleHookSuggestionsProps) => {
  const [open, setOpen] = useState(false);
  const [customHook, setCustomHook] = useState("");

  const handleSelectHook = (category: string) => {
    onSelectHook(category);
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
              Click on any category to use it as your title
            </p>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            <div className="p-1">
              {HOOK_CATEGORIES.map((category, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto text-sm rounded-none hover:bg-accent"
                  onClick={() => handleSelectHook(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="p-1">
              <h4 className="font-semibold text-sm px-3 py-2 text-primary">+ Create your own</h4>
              <div className="px-3 py-2 flex gap-2">
                <input
                  type="text"
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border rounded-md"
                  placeholder="Type a name for your own category of hooks..."
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
