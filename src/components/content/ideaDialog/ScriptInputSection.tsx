
import React from 'react';
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";

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
  const [isOpen, setIsOpen] = React.useState(true);

  const handleCollapseToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const handleFormatText = () => {
    // Placeholder for future implementation if needed
  };

  return (
    <motion.div 
      layout
      transition={{ 
        layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.2 }
      }}
      className={`transition-all duration-400 ${isOpen ? 'bg-white rounded-lg p-4 border shadow-sm hover:shadow-md' : 'bg-gray-50 rounded p-2 border shadow-sm hover:shadow-md flex items-center justify-between'}`}
    >
      {isOpen ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-600" />
              <span className="text-sm font-medium">Script</span>
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
          
          <SimpleTextFormattingToolbar onFormat={handleFormatText} />
        </>
      ) : (
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Script</span>
          {scriptText && (
            <span className="text-xs text-gray-500 italic">
              ({scriptText.length > 0 ? `${scriptText.slice(0, 25)}${scriptText.length > 25 ? '...' : ''}` : 'Empty'})
            </span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-gray-500 hover:text-gray-700 ml-auto"
            onClick={handleCollapseToggle}
          >
            <ChevronDown size={14} />
            <span className="sr-only">Expand</span>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ScriptInputSection;
