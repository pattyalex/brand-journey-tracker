
import { useState, useEffect } from "react";
import { Pencil, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import MeganAIChat from "./MeganAIChat";
import TitleHookSuggestions from "./TitleHookSuggestions";
import { motion } from "framer-motion";
import TipTapEditor from "./TipTapEditor";
import RichTextToolbar from "./RichTextToolbar";
import { useEditor } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

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
  const { state } = useSidebar();
  const [expandedClass, setExpandedClass] = useState("");
  const [isMeganOpen, setIsMeganOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState(() => {
    // Convert plain markdown to HTML if needed for initial content
    if (!writingText.trim().startsWith('<')) {
      return `<p>${writingText.replace(/\n/g, '</p><p>')}</p>`;
    }
    return writingText;
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onTextChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      if (selectedText) {
        onTextSelection(selectedText);
      }
    },
  });

  useEffect(() => {
    setExpandedClass(state === "collapsed" ? "writing-expanded" : "");
  }, [state]);

  useEffect(() => {
    if (editor && writingText !== editor.getHTML()) {
      editor.commands.setContent(writingText);
    }
  }, [writingText, editor]);

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
          if (editor) {
            editor.commands.focus();
            editor.commands.insertContent(hook);
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
            <RichTextToolbar editor={editor} />
            <div className="h-full w-full flex-1 overflow-auto bg-white">
              <TipTapEditor 
                content={htmlContent}
                onChange={(html) => {
                  setHtmlContent(html);
                  onTextChange(html);
                }}
                onSelectionChange={onTextSelection}
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
                  script: htmlContent,
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
