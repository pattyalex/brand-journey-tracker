
import { useRef, useEffect, useState } from "react";
import { Pencil, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";
import { useSidebar } from "@/components/ui/sidebar";
import MeganAIChat from "./MeganAIChat";
import TitleHookSuggestions from "./TitleHookSuggestions";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface WritingSpaceProps {
  writingText: string;
  onTextChange: (text: string) => void;
  onTextSelection: (selectedText: string) => void;
  onFormatText: (formatType: string, formatValue?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

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
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = writingText;
      let newText = text;
      let newCursorPos = end;
      const selectedText = text.substring(start, end);

      if (selectedText) {
        let formattedText = selectedText;
        switch (formatType) {
          case 'bold':
            formattedText = `**${selectedText}**`;
            newCursorPos = start + formattedText.length;
            break;
          case 'italic':
            formattedText = `*${selectedText}*`;
            newCursorPos = start + formattedText.length;
            break;
          case 'underline':
            formattedText = `__${selectedText}__`;
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
              formattedText = `<div style="text-align: left">${selectedText}</div>`;
            } else if (formatValue === 'center') {
              formattedText = `<div style="text-align: center">${selectedText}</div>`;
            } else if (formatValue === 'right') {
              formattedText = `<div style="text-align: right">${selectedText}</div>`;
            }
            newCursorPos = start + formattedText.length;
            break;
          case 'size':
            if (formatValue === 'small') {
              formattedText = `<small>${selectedText}</small>`;
            } else if (formatValue === 'large') {
              formattedText = `### ${selectedText}`;
            } else if (formatValue === 'x-large') {
              formattedText = `## ${selectedText}`;
            }
            newCursorPos = start + formattedText.length;
            break;
          default:
            break;
        }
        newText = text.substring(0, start) + formattedText + text.substring(end);
        onTextChange(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 10);
      } else {
        let formattingTemplate = '';
        switch (formatType) {
          case 'bold':
            formattingTemplate = '**bold text**';
            break;
          case 'italic':
            formattingTemplate = '*italic text*';
            break;
          case 'underline':
            formattingTemplate = '__underlined text__';
            break;
          case 'bullet':
            formattingTemplate = '\n- bullet point';
            break;
          case 'numbered':
            formattingTemplate = '\n1. numbered item';
            break;
          case 'align':
            if (formatValue === 'left') {
              formattingTemplate = '<div style="text-align: left">left aligned text</div>';
            } else if (formatValue === 'center') {
              formattingTemplate = '<div style="text-align: center">centered text</div>';
            } else if (formatValue === 'right') {
              formattingTemplate = '<div style="text-align: right">right aligned text</div>';
            }
            break;
          case 'size':
            if (formatValue === 'small') {
              formattingTemplate = '<small>small text</small>';
            } else if (formatValue === 'large') {
              formattingTemplate = '### large text';
            } else if (formatValue === 'x-large') {
              formattingTemplate = '## extra large text';
            }
            break;
          default:
            break;
        }
        if (formattingTemplate) {
          newText = text.substring(0, start) + formattingTemplate + text.substring(start);
          onTextChange(newText);
          const cursorPos = start + formattingTemplate.length;
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(start + 2, cursorPos - 2);
            }
          }, 10);
        }
      }
    }
    onFormatText(formatType, formatValue);
  };

  return (
    <motion.div 
      className={`space-y-4 pr-2 transition-all duration-300 ${expandedClass}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Brainstorm
        </h2>
        
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer transition-all duration-150 hover:bg-[#FDE1D3] active:scale-95 rounded-md text-primary shadow-sm px-3"
              onClick={() => {
                const sparklesButton = document.querySelector('[aria-label="Show title hook suggestions"]') as HTMLButtonElement;
                if (sparklesButton) {
                  sparklesButton.click();
                }
              }}
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
              <span className="text-sm font-medium">Hook Ideas</span>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer transition-all duration-150 hover:bg-[#FDE1D3] active:scale-95 rounded-md shadow-sm"
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
          </motion.div>
        </div>
      </motion.div>
      
      <div className="hidden">
        <TitleHookSuggestions onSelectHook={(hook) => {
          if (textareaRef.current) {
            const cursorPos = textareaRef.current.selectionStart;
            const textBefore = writingText.substring(0, cursorPos);
            const textAfter = writingText.substring(cursorPos);
            onTextChange(textBefore + hook + textAfter);
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = cursorPos + hook.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
              }
            }, 10);
          } else {
            onTextChange(writingText + hook);
          }
        }} />
      </div>

      <motion.div 
        className="h-[calc(100vh-140px)]"
        variants={itemVariants}
        layout
      >
        <motion.div 
          className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] ${isMeganOpen ? "flex flex-row" : "flex flex-col"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={`${isMeganOpen ? "w-1/2 border-r border-gray-200 flex flex-col" : "w-full flex-1 flex flex-col"}`}>
            <SimpleTextFormattingToolbar onFormat={handleFormatClick} />
            <div className="h-full w-full flex-1 relative">
              {/* Live editable markdown: textarea overlays markdown preview */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 select-none">
                <div className="p-4 min-h-full bg-white w-full h-full overflow-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <p className="my-2">{children}</p>,
                      h2: ({children}) => <h2 className="text-2xl font-bold mb-2 mt-4">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-bold mb-2 mt-3">{children}</h3>,
                      ul: ({children}) => <ul className="list-disc ml-5 my-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal ml-5 my-2">{children}</ol>,
                      li: ({children}) => <li className="my-1">{children}</li>,
                      a: ({href, children}) => <a href={href} className="text-blue-500 hover:underline">{children}</a>
                    }}
                  >
                    {writingText}
                  </ReactMarkdown>
                </div>
              </div>
              {/* Transparent textarea overlays the markdown preview exactly */}
              <textarea
                ref={textareaRef}
                value={writingText}
                onChange={handleTextChange}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
                  handleTextSelection(selectedText);
                }}
                placeholder="Start writing your content ideas here..."
                className="absolute top-0 left-0 w-full h-full min-h-full border-0 bg-transparent text-gray-600 text-sm p-4 z-10 focus-visible:ring-0 resize-none outline-none"
                style={{
                  color: 'transparent',
                  caretColor: '#222',
                  background: "transparent",
                  resize: "none",
                  // Make the text invisible except caret, so Markdown below is always visible.
                  WebkitTextFillColor: 'transparent',
                  MozAppearance: 'none',
                  overflow: 'auto',
                }}
                aria-label="Writing space markdown editor"
                spellCheck
              />
            </div>
          </div>
          
          {isMeganOpen && (
            <motion.div 
              className="w-1/2 h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <MeganAIChat 
                onClose={() => setIsMeganOpen(false)} 
                contextData={{
                  script: writingText,
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WritingSpace;

// NOTE TO USER: This file is now over 350 lines long! Please consider asking me to refactor it into smaller components for easier maintenance.

