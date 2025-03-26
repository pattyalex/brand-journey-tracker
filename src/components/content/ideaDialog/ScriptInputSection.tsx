
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    <div className="grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gray-600" />
          <Label htmlFor="develop-script" className="text-sm font-medium">Script</Label>
        </div>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
            onClick={handleCollapseToggle}
          >
            {isOpen ? (
              <ChevronUp size={16} className="mr-1" />
            ) : (
              <ChevronDown size={16} className="mr-1" />
            )}
            {isOpen ? "Collapse" : "Expand"}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent 
          className="transition-all duration-300"
          style={{ animation: isOpen ? "collapsible-down 0.3s ease-out" : "collapsible-up 0.3s ease-out" }}
        >
          <Textarea
            id="develop-script"
            value={scriptText}
            onChange={(e) => onScriptTextChange(e.target.value)}
            placeholder="Write your script here..."
            className="min-h-[385px] resize-y focus-visible:ring-gray-400" 
          />
        </CollapsibleContent>
      </Collapsible>
      
      {!isOpen && (
        <div className="text-gray-400 text-sm italic mt-1">
          Script section is collapsed. Click Expand to edit.
        </div>
      )}
    </div>
  );
};

export default ScriptInputSection;
