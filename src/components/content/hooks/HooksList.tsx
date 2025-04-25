
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface HooksListProps {
  hooks: string[];
  onSelectHook: (hook: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
}

const HooksList = ({ hooks, onSelectHook, onGenerateMore, isGenerating }: HooksListProps) => {
  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    
    // Scroll to the rich text editor in the writing space
    // First try to find the editor by its actual component class
    let editorElement = document.querySelector(".ProseMirror");
    
    // If not found, try the container
    if (!editorElement) {
      editorElement = document.querySelector("[class*='rich-text']") || 
                      document.querySelector("[class*='editor']") ||
                      document.querySelector(".EditorContent");
    }
    
    // Fallback to a more general container
    if (!editorElement) {
      editorElement = document.querySelector(".rounded-lg.border.border-gray-200") ||
                      document.querySelector(".writing-space");
    }
    
    console.log("Found editor element:", editorElement);
    
    if (editorElement) {
      setTimeout(() => {
        editorElement!.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
        console.log("Scrolling to editor element");
      }, 100);
    } else {
      console.log("Editor element not found for scrolling");
    }
    
    toast({
      title: "Hook selected!",
      description: "The hook has been added to your content."
    });
  };

  return (
    <ScrollArea className="h-[350px] w-full pb-4" type="always">
      <div className="px-2 pb-48 pt-1">
        {hooks.map((hook, index) => (
          <div
            key={index}
            className="p-3 border rounded-md cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors flex justify-between items-center mb-3"
            onClick={() => handleSelectHook(hook)}
          >
            <div className="text-sm">{hook}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleSelectHook(hook);
              }}
              className="opacity-70 hover:opacity-100 shrink-0"
            >
              <Check className="h-4 w-4" />
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
                  <RotateCcw className="h-12 w-12" />
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
