
import { useRef, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";
import { useSidebar } from "@/components/ui/sidebar";

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
  
  // Adjust layout when sidebar state changes
  useEffect(() => {
    setExpandedClass(state === "collapsed" ? "writing-expanded" : "");
  }, [state]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      );
      onTextSelection(selectedText);
    }
  };

  return (
    <div className={`space-y-4 pr-4 transition-all duration-300 ${expandedClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Brain Dump Your Ideas
        </h2>
      </div>
      <div className="h-[calc(100vh-140px)]">
        <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] flex flex-col">
          <SimpleTextFormattingToolbar onFormat={onFormatText} />
          
          <ScrollArea className="h-full w-full flex-1">
            <Textarea
              ref={textareaRef}
              value={writingText}
              onChange={handleTextChange}
              onSelect={handleTextSelection}
              placeholder="Start writing your content ideas here..."
              className="min-h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-sm p-4"
              style={{ position: 'relative', height: '100%' }}
            />
          </ScrollArea>
          {/* Removed the thick red scrollbar indicator */}
        </div>
      </div>
    </div>
  );
};

export default WritingSpace;
