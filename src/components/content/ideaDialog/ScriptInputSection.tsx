
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
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
  const [isOpen, setIsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCollapseToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const handleFormatText = (formatType: string, formatValue?: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = scriptText;
      
      let newText = text;
      let newCursorPos = end;
      
      // Get the selected text
      const selectedText = text.substring(start, end);
      
      if (selectedText) {
        let formattedText = selectedText;
        
        // Apply different formatting based on type
        switch (formatType) {
          case 'bold':
            formattedText = `**${selectedText}**`;
            newCursorPos = start + formattedText.length;
            break;
          case 'italic':
            formattedText = `_${selectedText}_`;
            newCursorPos = start + formattedText.length;
            break;
          case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            newCursorPos = start + formattedText.length;
            break;
          case 'bullet':
            formattedText = `\n- ${selectedText}`;
            newCursorPos = start + formattedText.length;
            break;
          case 'numbered':
            formattedText = `\n1. ${selectedText}`;
            newCursorPos = start + formattedText.length;
            break;
          case 'align':
            if (formatValue === 'left') {
              formattedText = `<div align="left">${selectedText}</div>`;
            } else if (formatValue === 'center') {
              formattedText = `<div align="center">${selectedText}</div>`;
            } else if (formatValue === 'right') {
              formattedText = `<div align="right">${selectedText}</div>`;
            }
            newCursorPos = start + formattedText.length;
            break;
          case 'size':
            if (formatValue === 'small') {
              formattedText = `<small>${selectedText}</small>`;
            } else if (formatValue === 'large') {
              formattedText = `<h3>${selectedText}</h3>`;
            } else if (formatValue === 'x-large') {
              formattedText = `<h2>${selectedText}</h2>`;
            }
            newCursorPos = start + formattedText.length;
            break;
          default:
            break;
        }
        
        // Replace the selected text with the formatted text
        newText = text.substring(0, start) + formattedText + text.substring(end);
        onScriptTextChange(newText);
        
        // Set cursor position after the operation completes
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 10);
      } else {
        // If no text is selected, insert formatting template at cursor position
        let formattingTemplate = '';
        
        switch (formatType) {
          case 'bold':
            formattingTemplate = '**bold text**';
            break;
          case 'italic':
            formattingTemplate = '_italic text_';
            break;
          case 'underline':
            formattingTemplate = '<u>underlined text</u>';
            break;
          case 'bullet':
            formattingTemplate = '\n- bullet point';
            break;
          case 'numbered':
            formattingTemplate = '\n1. numbered item';
            break;
          case 'align':
            if (formatValue === 'left') {
              formattingTemplate = '<div align="left">left aligned text</div>';
            } else if (formatValue === 'center') {
              formattingTemplate = '<div align="center">centered text</div>';
            } else if (formatValue === 'right') {
              formattingTemplate = '<div align="right">right aligned text</div>';
            }
            break;
          case 'size':
            if (formatValue === 'small') {
              formattingTemplate = '<small>small text</small>';
            } else if (formatValue === 'large') {
              formattingTemplate = '<h3>large text</h3>';
            } else if (formatValue === 'x-large') {
              formattingTemplate = '<h2>extra large text</h2>';
            }
            break;
          default:
            break;
        }
        
        if (formattingTemplate) {
          newText = text.substring(0, start) + formattingTemplate + text.substring(start);
          onScriptTextChange(newText);
          
          // Place cursor between formatting tags
          const cursorPos = start + formattingTemplate.length;
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(cursorPos, cursorPos);
            }
          }, 10);
        }
      }
    }
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
              className="transition-all duration-400"
              style={{ animation: "collapsible-down 0.4s ease-out" }}
            >
              <SimpleTextFormattingToolbar onFormat={handleFormatText} />
              <Textarea
                id="develop-script"
                ref={textareaRef}
                value={scriptText}
                onChange={(e) => onScriptTextChange(e.target.value)}
                placeholder="Write your script here or collapse this section if you don't need a script for your content idea..."
                className="min-h-[350px] resize-y focus-visible:ring-gray-400" 
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
    </motion.div>
  );
};

export default ScriptInputSection;
