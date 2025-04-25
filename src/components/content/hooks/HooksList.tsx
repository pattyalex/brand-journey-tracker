
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Select hook</span>
            </Button>
          </div>
        ))}

        <div className="mt-4 mb-4 px-2 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={onGenerateMore} 
                  disabled={isGenerating}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <RotateCcw className="h-9 w-9" />
                  <span className="sr-only">More Hooks</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More Hooks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </ScrollArea>
  );
};

export default HooksList;
