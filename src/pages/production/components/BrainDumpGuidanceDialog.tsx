import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentFlowProgress from "./ContentFlowProgress";

interface BrainDumpGuidanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  onMoveToScript?: () => void;
  title: string;
  setTitle: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  onNavigateToStep?: (step: number) => void;
  slideDirection?: 'left' | 'right';
  embedded?: boolean;
}

const BrainDumpGuidanceDialog: React.FC<BrainDumpGuidanceDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  onMoveToScript,
  title,
  setTitle,
  notes,
  setNotes,
  onNavigateToStep,
  slideDirection = 'right',
  embedded = false,
}) => {
  const [shakeButton, setShakeButton] = useState(false);

  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
    setShakeButton(true);
    setTimeout(() => setShakeButton(false), 600);
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
    }),
  };

  const dialogContent = (
    <>
      {/* Stepper Progress */}
      <div className="pt-6 pb-2">
        <ContentFlowProgress currentStep={1} onStepClick={onNavigateToStep} />
      </div>

      {/* Content Area */}
      <div className="px-6 pt-4 pb-4 flex-1 overflow-y-auto">
        {/* Title Input */}
        <div className="border-b border-gray-200 pb-2 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title..."
            tabIndex={-1}
            autoComplete="off"
            className="w-full px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0]"
          />
        </div>

        {/* Notes/Brain Dump Area */}
        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider mb-2">
            Notes & Brainstorming
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write freely here... no need to organize, just capture your thoughts..."
            className="min-h-[300px] flex-1 resize-none border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8B7082]/20 focus:border-[#8B7082]/30 transition-all text-sm leading-relaxed bg-white p-4"
          />
        </div>

        {/* Move to Script Button */}
        <div className="flex justify-center mt-12">
          <Button
            variant="ghost"
            onClick={onMoveToScript}
            className="text-[#612A4F] hover:text-[#4A1F3D] hover:bg-[#612A4F]/10"
          >
            Move to Script <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex justify-end gap-3 px-6 pt-2 pb-4 bg-white flex-shrink-0">
        <motion.div
          animate={shakeButton ? { x: [0, -8, 8, -8, 8, 0], scale: [1, 1.02, 1.02, 1.02, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={onSave}
            className="bg-[#612A4F] hover:bg-[#4E2240] text-white"
          >
            Stop Here, Finish Later
          </Button>
        </motion.div>
      </div>
    </>
  );

  if (embedded) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-b from-[#8B7082]/10 via-white to-white">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key="ideate-content"
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {dialogContent}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BrainDumpGuidanceDialog;
