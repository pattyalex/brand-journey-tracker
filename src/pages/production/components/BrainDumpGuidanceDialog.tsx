import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StageTimeline from "./StageTimeline";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, Check, X, Video, Image as ImageIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ContentFlowProgress from "./ContentFlowProgress";
import StepCompleteFooter from "./StepCompleteFooter";
import { ContentType } from "../types";

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
  completedSteps?: number[];
  contentType?: ContentType;
  onContentTypeChange?: (type: ContentType) => void;
  card?: import("../types").ProductionCard | null;
  onToggleStage?: (stage: keyof import("../types").StageCompletions) => void;
  onToggleComplete?: (step: number) => void;
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
  completedSteps = [],
  contentType = 'video',
  onContentTypeChange,
  card,
  onToggleStage,
  onToggleComplete,
}) => {
  const [shakeButton, setShakeButton] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

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
      {/* Close Button */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-7 right-4 p-1.5 rounded-full hover:bg-[#612A4F]/10 text-gray-400 hover:text-[#612A4F] transition-colors z-30 focus:outline-none"
              tabIndex={-1}
            >
              <X className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="bg-gray-500 text-white">
            <p>Save & Exit</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Stepper Progress */}
      <div className="pt-6 pb-8">
        <ContentFlowProgress currentStep={1} contentType={contentType} onStepClick={onNavigateToStep} completedSteps={completedSteps} onToggleComplete={onToggleComplete} />
      </div>

      {/* Content Area */}
      <div className="px-6 pt-4 pb-4 flex-1 overflow-y-auto flex flex-col">
        {/* Title/Hook Label + Title Input */}
        <div className="mb-2">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider">Hook</label>
        </div>
        <div className="border-b border-gray-200 pb-2 mb-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title..."
                  tabIndex={-1}
                  autoComplete="off"
                  className="w-full px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0] truncate"
                />
              </TooltipTrigger>
              {title && title.length > 30 && (
                <TooltipContent side="bottom" className="max-w-md">
                  {title}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Content Type Dropdown */}
        <div className="mb-2">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider">Media Type</label>
        </div>
        <div className="mb-8">
          {onContentTypeChange && (
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => onContentTypeChange('video')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors",
                  contentType === 'video'
                    ? "bg-[#612A4F] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <Video className="w-3.5 h-3.5" />
                Video
              </button>
              <button
                onClick={() => onContentTypeChange('image')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors border-l border-gray-200",
                  contentType === 'image'
                    ? "bg-[#612A4F] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image
              </button>
            </div>
          )}
        </div>

        {/* Notes/Brain Dump Area */}
        <div className="flex flex-col flex-1">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider mb-2">
            Brain dump
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"Capture your raw ideas here, we'll refine later...\nNothing to say? Just hit Next."}
            className="min-h-[300px] flex-1 resize-none rounded-lg focus:outline-none focus:ring-0 transition-all text-sm leading-relaxed bg-white p-4 placeholder:italic" style={{ border: '0.5px solid #e5e7eb' }}
          />
        </div>
      </div>

      <StepCompleteFooter stepNumber={1} completedSteps={completedSteps} onToggleComplete={onToggleComplete} showNextStep={!!onNavigateToStep} onNextStep={onNavigateToStep ? () => onNavigateToStep(2) : undefined} />
    </>
  );

  if (embedded) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-row bg-gradient-to-b from-[#8B7082]/10 via-white to-white">
        <div className="flex-1 flex flex-col overflow-hidden">
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
        </div>
        {card && onToggleStage && (
          <div className="w-[200px] flex-shrink-0 border-l border-[#E8E2E5] p-4 overflow-y-auto bg-[#FDFBFC]">
            <StageTimeline card={card} onToggleStage={onToggleStage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrainDumpGuidanceDialog;
