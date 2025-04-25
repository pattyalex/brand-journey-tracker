
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus } from "lucide-react";

interface HooksListProps {
  hooks: string[];
  onSelectHook: (hook: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
}

const HooksList = ({ hooks, onSelectHook, onGenerateMore, isGenerating }: HooksListProps) => {
  return (
    <ScrollArea className="h-[350px] w-full pb-4" type="always">
      <div className="px-2 pb-48 pt-1">
        <div className="mb-4 px-2">
          <Button
            onClick={onGenerateMore}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                More Hook Ideas
              </>
            )}
          </Button>
        </div>

        {hooks.map((hook, index) => (
          <div
            key={index}
            onClick={() => onSelectHook(hook)}
            className="p-3 border rounded-md cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors flex justify-between items-center mb-3"
          >
            <div className="text-sm">{hook}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onSelectHook(hook);
              }}
              className="opacity-70 hover:opacity-100 shrink-0"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Select hook</span>
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default HooksList;
