import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Video, Image as ImageIcon } from "lucide-react";
import { ContentType } from "../types";

interface ContentFlowDialogProps {
  activeStep: number | null;
  onClose: () => void;
  children: React.ReactNode;
  slideDirection: 'left' | 'right';
  contentType?: ContentType;
  onContentTypeChange?: (type: ContentType) => void;
}

const ContentFlowDialog: React.FC<ContentFlowDialogProps> = ({
  activeStep,
  onClose,
  children,
  slideDirection,
  contentType = 'video',
  onContentTypeChange,
}) => {

  // Background colors for each step — keyed by step number
  // For video: 1=Ideate, 2=Script, 3=Film, 4=Edit, 5=Schedule
  // For image: 1=Ideate, 2=Concept, 3=Edit, 4=Schedule
  const videoBackgrounds: Record<number, string> = {
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30",
    3: "bg-gradient-to-br from-[#FFF9EE] via-white to-[#FFF9EE]/30",
    4: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30",
    5: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]",
  };

  const imageBackgrounds: Record<number, string> = {
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",     // Ideate
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30", // Concept
    3: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30", // Edit
    4: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]",   // Schedule
  };

  const videoMaxWidths: Record<number, string> = {
    1: "sm:max-w-[900px]",
    2: "sm:max-w-[900px]",
    3: "sm:max-w-[1100px]",
    4: "sm:max-w-[950px]",
    5: "sm:max-w-[1200px]",
  };

  const imageMaxWidths: Record<number, string> = {
    1: "sm:max-w-[900px]",   // Ideate
    2: "sm:max-w-[900px]",   // Concept
    3: "sm:max-w-[950px]",   // Edit
    4: "sm:max-w-[1200px]",  // Schedule
  };

  const stepBackgrounds = contentType === 'image' ? imageBackgrounds : videoBackgrounds;
  const stepMaxWidths = contentType === 'image' ? imageMaxWidths : videoMaxWidths;

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -150 : 150,
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
        {/* Video / Image Toggle */}
        {onContentTypeChange && (
          <div className="flex justify-center pt-4 pb-0 flex-shrink-0 z-10">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => onContentTypeChange('video')}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  contentType === 'video'
                    ? "bg-[#612A4F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Video className="w-3.5 h-3.5" />
                Video
              </button>
              <button
                onClick={() => onContentTypeChange('image')}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  contentType === 'image'
                    ? "bg-[#612A4F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`${activeStep}-${contentType}`}
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
