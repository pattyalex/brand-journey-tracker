
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ScriptInputSectionProps {
  scriptText: string;
  onScriptTextChange: (value: string) => void;
  onCollapseChange?: (isOpen: boolean) => void;
}

const ScriptInputSection = ({
  scriptText,
  onScriptTextChange,
  onCollapseChange,
}: ScriptInputSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCollapseToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  return (
    <div className={`transition-all duration-200 ${isOpen ? 'bg-white rounded-lg p-4 border shadow-sm hover:shadow-md' : 'bg-gray-50 rounded p-2 border shadow-sm hover:shadow-md flex items-center justify-between'}`}>
      {isOpen ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-600" />
              <Label htmlFor="develop-script" className="text-sm font-medium">Script</Label>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
              onClick={handleCollapseToggle}
            >
              <ChevronUp size={16} className="mr-1" />
              Collapse
            </Button>
          </div>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent 
              className="transition-all duration-300"
              style={{ animation: "collapsible-down 0.3s ease-out" }}
            >
              <Textarea
                id="develop-script"
                value={scriptText}
                onChange={(e) => onScriptTextChange(e.target.value)}
                placeholder="Write your script here or collapse this section if you don't need a script for this content idea."
                className="min-h-[385px] resize-y focus-visible:ring-gray-400" 
              />
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Script</span>
            {scriptText && (
              <span className="text-xs text-gray-500 italic">
                ({scriptText.length > 0 ? `${scriptText.slice(0, 25)}${scriptText.length > 25 ? '...' : ''}` : 'Empty'})
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-gray-500 hover:text-gray-700"
            onClick={handleCollapseToggle}
          >
            <ChevronDown size={14} />
            <span className="sr-only">Expand</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default ScriptInputSection;
