
import { useRef, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";
import { useSidebar } from "@/components/ui/sidebar";
import MeganAIChat from "./MeganAIChat";

interface WritingSpaceProps {
  writingText: string;
  onTextChange: (text: string) => void;
  onTextSelection: (selectedText: string) => void;
  onFormatText: (formatType: string, formatValue?: string) => void;
}

const WritingSpace = ({
  writingText,
  onTextChange,
  onTextSelection,
  onFormatText
}: WritingSpaceProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state } = useSidebar();
  const [expandedClass, setExpandedClass] = useState("");
  const [isMeganOpen, setIsMeganOpen] = useState(false);
  
  // Adjust layout when sidebar state changes
  useEffect(() => {
    setExpandedClass(state === "collapsed" ? "writing-expanded" : "");
  }, [state]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  const handleTextSelection = (selectedText: string) => {
    if (selectedText.trim()) {
      onTextSelection(selectedText);
    }
  };

  const handleFormatClick = (formatType: string, formatValue?: string) => {
    if (textareaRef.current) {
      // Get current selection range
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      // Pass both format info and selection range to parent component
      onFormatText(formatType, formatValue);
      
      // Keep focus on textarea after formatting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  return (
    <div className={`space-y-4 pr-2 transition-all duration-300 ${expandedClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Brainstorm
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer transition-all duration-150 hover:bg-accent/80 active:bg-accent active:scale-95 rounded-md"
          onClick={() => setIsMeganOpen(!isMeganOpen)}
          aria-label={isMeganOpen ? "Hide Megan" : "Ask Megan"}
        >
          {isMeganOpen ? (
            <span className="px-3 py-1.5 text-primary hover:text-primary/90 font-medium">Hide Megan</span>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 w-full">
              <span className="text-primary hover:text-primary/90 font-medium">Ask Megan</span>
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                M
              </div>
            </div>
          )}
        </Button>
      </div>
      <div className="h-[calc(100vh-140px)]">
        <div className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] ${isMeganOpen ? "flex flex-row" : "flex flex-col"}`}>
          <div className={`${isMeganOpen ? "w-1/2 border-r border-gray-200 flex flex-col" : "w-full flex-1 flex flex-col"}`}>
            <SimpleTextFormattingToolbar onFormat={handleFormatClick} />
            
            <div className="h-full w-full flex-1">
              <Textarea
                ref={textareaRef}
                value={writingText}
                onChange={handleTextChange}
                onTextSelect={handleTextSelection}
                placeholder="Start writing your content ideas here..."
                className="min-h-full w-full h-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-sm p-4"
              />
            </div>
          </div>
          
          {isMeganOpen && (
            <div className="w-1/2 h-full">
              <MeganAIChat 
                onClose={() => setIsMeganOpen(false)} 
                contextData={{
                  script: writingText,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingSpace;
