import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Video, Image as ImageIcon, X } from "lucide-react";
import { ContentType, ProductionCard, StageCompletions } from "../types";

interface ContentFlowDialogProps {
  activeStep: number | null;
  onClose: () => void;
  children: React.ReactNode;
  slideDirection: 'left' | 'right';
  contentType?: ContentType;
  onContentTypeChange?: (type: ContentType) => void;
  onSelectContentTypeAndProceed?: (type: ContentType) => void;
  card?: ProductionCard | null;
  onToggleStage?: (stage: keyof StageCompletions) => void;
}

const ContentFlowDialog: React.FC<ContentFlowDialogProps> = ({
  activeStep,
  onClose,
  children,
  slideDirection,
  contentType = 'video',
  onContentTypeChange,
  onSelectContentTypeAndProceed,
  card,
  onToggleStage,
}) => {

  // Background colors for each step — keyed by step number
  // For video: 1=Ideate, 2=Script, 3=Film, 4=Edit, 5=Schedule
  // For image: 1=Ideate, 2=Concept, 3=Edit, 4=Schedule
  const videoBackgrounds: Record<number, string> = {
    0: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30",
    3: "bg-gradient-to-br from-[#FFF9EE] via-white to-[#FFF9EE]/30",
    4: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30",
    5: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]",
  };

  const imageBackgrounds: Record<number, string> = {
    0: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",     // Ideate
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30", // Concept
    3: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30", // Edit
    4: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]",   // Schedule
  };

  const videoMaxWidths: Record<number, string> = {
    0: "sm:max-w-[600px]",
    1: "sm:max-w-[900px]",
    2: "sm:max-w-[900px]",
    3: "sm:max-w-[1100px]",
    4: "sm:max-w-[950px]",
    5: "sm:max-w-[1200px]",
  };

  const imageMaxWidths: Record<number, string> = {
    0: "sm:max-w-[600px]",
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

  const isTypePickerStep = activeStep === 0;

  return (
    <Dialog open={activeStep !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          "overflow-hidden border-0 shadow-2xl p-0 flex flex-col transition-all duration-300",
          isTypePickerStep ? "h-auto max-h-[90vh]" : "h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)]",
          activeStep !== null ? stepBackgrounds[activeStep] || 'bg-white' : 'bg-white',
          activeStep !== null ? stepMaxWidths[activeStep] || 'sm:max-w-[900px]' : 'sm:max-w-[900px]'
        )}
      >
        {/* Content type picker - step 0 */}
        {isTypePickerStep && (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center justify-center flex-1 px-10 py-16">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-1.5 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                What are you creating?
              </h2>
              <p className="text-[13px] text-gray-400 mb-10">
                Pick one to start your workflow
              </p>

              <div className="flex gap-5 w-full max-w-sm">
                {/* Video option */}
                <button
                  onClick={() => onSelectContentTypeAndProceed?.('video')}
                  className="flex-1 relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 group hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(97,42,79,0.15)]"
                  style={{ background: 'linear-gradient(145deg, rgba(97,42,79,0.15), rgba(97,42,79,0.05))' }}
                >
                  <div className="relative bg-white rounded-[15px] px-6 py-8 flex flex-col items-center gap-5 h-full group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-[#612A4F]/[0.03] transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ background: 'linear-gradient(145deg, #612A4F, #8B5A7C)' }}
                    >
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900">Video</p>
                  </div>
                </button>

                {/* Image option */}
                <button
                  onClick={() => onSelectContentTypeAndProceed?.('image')}
                  className="flex-1 relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 group hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(97,42,79,0.15)]"
                  style={{ background: 'linear-gradient(145deg, rgba(97,42,79,0.15), rgba(97,42,79,0.05))' }}
                >
                  <div className="relative bg-white rounded-[15px] px-6 py-8 flex flex-col items-center gap-5 h-full group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-[#612A4F]/[0.03] transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ background: 'linear-gradient(145deg, #612A4F, #8B5A7C)' }}
                    >
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900">Image</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Regular step content */}
        {!isTypePickerStep && (
          <div className="flex flex-col flex-1 overflow-hidden">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContentFlowDialog;
