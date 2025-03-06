
import { useRef } from "react";
import { Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";

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

  return (
    <div className="space-y-4 pr-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Brain Dump Your Ideas
        </h2>
      </div>
      <div className="h-[calc(100vh-240px)]">
        <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] flex flex-col">
          <SimpleTextFormattingToolbar onFormat={onFormatText} />
          
          <ScrollArea className="h-full w-full flex-1">
            <Textarea
              ref={textareaRef}
              value={writingText}
              onChange={(e) => onTextChange(e.target.value)}
              onTextSelect={onTextSelection}
              placeholder="Start writing your content ideas here..."
              className="min-h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-sm absolute inset-0 px-4 py-4"
            />
          </ScrollArea>
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gray-200 opacity-60"></div>
        </div>
      </div>
    </div>
  );
};

export default WritingSpace;
