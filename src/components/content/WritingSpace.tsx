
import { useRef, useEffect, useState } from "react";
import { Pencil, Sparkles } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import MeganAIChat from "./MeganAIChat";
import TitleHookSuggestions from "./TitleHookSuggestions";
import { motion } from "framer-motion";
import RichTextEditor, { RichTextEditorRef } from "@/components/RichTextEditor";
import { toast } from "@/hooks/use-toast";

interface WritingSpaceProps {
  value: string;
  onChange: (val: string) => void;
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
  value,
  onChange,
}: WritingSpaceProps) => {
  const { state } = useSidebar();
  const [expandedClass, setExpandedClass] = useState("");
  const [isMeganOpen, setIsMeganOpen] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    setExpandedClass(state === "collapsed" ? "writing-expanded" : "");
  }, [state]);

  const handleHookSelect = (hook: string) => {
    if (editorRef.current) {
      editorRef.current.insertHook(hook);
    }
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
              <span className="text-sm font-medium">Hook Generation</span>
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
              aria-label={isMeganOpen ? "Hide Megan" : "Ask Megan AI"}
            >
              {isMeganOpen ? (
                <span className="px-3 py-1.5 text-primary hover:text-primary/90 font-medium">Hide Megan</span>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 w-full">
                  <span className="text-primary hover:text-primary/90 font-medium">Ask Megan AI</span>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    M
                  </div>
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <TitleHookSuggestions onSelectHook={handleHookSelect} />

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
            <RichTextEditor 
              ref={editorRef}
              value={value} 
              onChange={onChange} 
            />
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
                  script: value,
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
