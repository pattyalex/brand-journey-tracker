
import React, { useRef } from 'react';
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCollapseToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  return (
    <motion.div 
      layout="size"
      layoutId="script-section"
      transition={{ 
        layout: { 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1.0],
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      }}
      className={`transition-all duration-400 ${isOpen ? 'bg-white rounded-lg p-4 border shadow-sm hover:shadow-md' : 'bg-gray-50 rounded p-2 border shadow-sm hover:shadow-md flex items-center justify-between'}`}
    >
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
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key="textarea"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                id="develop-script"
                ref={textareaRef}
                value={scriptText}
                onChange={(e) => onScriptTextChange(e.target.value)}
                placeholder="Write your script here or collapse this section if you don't need a script for your content idea..."
                className="min-h-[350px] resize-y focus-visible:ring-gray-400" 
              />
            </motion.div>
          </AnimatePresence>
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
    </motion.div>
  );
};

export default ScriptInputSection;
