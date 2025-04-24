
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface HooksListProps {
  hooks: string[];
  onSelectHook: (hook: string) => void;
}

const HooksList = ({ hooks, onSelectHook }: HooksListProps) => {
  return (
    <div className="flex-1 border rounded-md overflow-hidden">
      <ScrollArea className="h-full w-full" scrollHideDelay={0}>
        <div className="grid gap-3 p-4 pr-6">
          {hooks.map((hook, index) => (
            <div
              key={index}
              onClick={() => onSelectHook(hook)}
              className="p-3 border rounded-md cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors flex justify-between items-center"
            >
              <div className="text-sm">{hook}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHook(hook);
                }}
                className="opacity-70 hover:opacity-100"
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Select hook</span>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HooksList;

