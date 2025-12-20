import { useState, useRef, useEffect } from "react";
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
      className={`flex flex-col h-full transition-all duration-300 ${expandedClass}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div
        className="flex-1 h-full"
        variants={itemVariants}
      >
        <motion.div
          className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] ${isMeganOpen ? "flex flex-row" : "flex flex-col"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={`${isMeganOpen ? "w-1/2 border-r border-gray-200 flex flex-col h-full" : "w-full flex-1 flex flex-col h-full"}`}>
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
