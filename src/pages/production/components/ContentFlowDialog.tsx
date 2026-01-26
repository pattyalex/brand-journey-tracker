import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContentFlowDialogProps {
  activeStep: number | null;
  onClose: () => void;
  children: React.ReactNode;
  slideDirection: 'left' | 'right';
}

const ContentFlowDialog: React.FC<ContentFlowDialogProps> = ({
  activeStep,
  onClose,
  children,
  slideDirection,
}) => {

  // Background colors for each step
  const stepBackgrounds: Record<number, string> = {
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white", // Ideate - mauve tint
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30", // Script - blue
    3: "bg-gradient-to-br from-[#FFF9EE] via-white to-[#FFF9EE]/30", // Film - warm amber
    4: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30", // Edit - pink
    5: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]", // Schedule - lilac
    6: "bg-gradient-to-br from-emerald-50 via-white to-green-50", // Post/Archive - green
  };

  // Different max widths for different steps
  const stepMaxWidths: Record<number, string> = {
    1: "sm:max-w-[900px]",   // Ideate
    2: "sm:max-w-[900px]",   // Script
    3: "sm:max-w-[1100px]",  // Film (Storyboard needs more width)
    4: "sm:max-w-[950px]",   // Edit
    5: "sm:max-w-[1200px]",  // Schedule (needs more width for calendar)
    6: "sm:max-w-[900px]",   // Post/Archive
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={activeStep !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          "h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden border-0 shadow-2xl p-0 flex flex-col transition-all duration-300",
          activeStep ? stepBackgrounds[activeStep] || 'bg-white' : 'bg-white',
          activeStep ? stepMaxWidths[activeStep] || 'sm:max-w-[900px]' : 'sm:max-w-[900px]'
        )}
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={activeStep}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ContentFlowDialog;
