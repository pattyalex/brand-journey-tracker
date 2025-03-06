
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

const HOOK_SUGGESTIONS = [
  "I tried this trend and... you won't believe what happened",
  "The one thing I wish I knew before...",
  "Here's why everyone is talking about...",
  "This changed my routine forever...",
  "Unpopular opinion, but...",
  "What no one tells you about...",
  "The secret to my success with...",
  "The truth about... that nobody admits",
  "My honest review of...",
  "This hack saved me hours of...",
  "It's date night, and here's my outfit",
  "POV: When you finally...",
  "Day in the life of a...",
  "How I turned my passion into...",
  "3 things I've learned about..."
];

const TitleHookSuggestions = ({ onSelectHook }: TitleHookSuggestionsProps) => {
  const [open, setOpen] = useState(false);

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setOpen(false);
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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="p-3 bg-muted/50 border-b">
            <h3 className="font-medium text-sm">Catchy Hook Ideas</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any suggestion to use it as your title
            </p>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {HOOK_SUGGESTIONS.map((hook, index) => (
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TitleHookSuggestions;
