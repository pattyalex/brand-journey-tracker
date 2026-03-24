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
import { ArrowRight, X, Video, Image as ImageIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentFlowProgress from "./ContentFlowProgress";
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
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Stepper Progress */}
      <div className="pt-6 pb-8">
        <ContentFlowProgress currentStep={1} contentType={contentType} onStepClick={onNavigateToStep} completedSteps={completedSteps} />
      </div>

      {/* Content Area */}
      <div className="px-6 pt-4 pb-4 flex-1 overflow-y-auto flex flex-col">
        {/* Content Type Dropdown + Title Input */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-8">
          {/* Content Type Dropdown */}
          {onContentTypeChange && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-sm text-gray-700 transition-colors"
              >
                {contentType === 'video' ? <Video className="w-3.5 h-3.5 text-[#612A4F]" /> : <ImageIcon className="w-3.5 h-3.5 text-[#612A4F]" />}
                <span className="font-medium text-[13px]">{contentType === 'video' ? 'Video' : 'Image'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isTypeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsTypeDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-30 overflow-hidden">
                    <button
                      onClick={() => { onContentTypeChange('video'); setIsTypeDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Video className="w-4 h-4 text-[#612A4F]" />
                      <span className={contentType === 'video' ? 'font-semibold text-gray-900' : 'text-gray-600'}>Video</span>
                    </button>
                    <button
                      onClick={() => { onContentTypeChange('image'); setIsTypeDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-[#612A4F]" />
                      <span className={contentType === 'image' ? 'font-semibold text-gray-900' : 'text-gray-600'}>Image</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
                  className="flex-1 px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0] truncate"
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

        {/* Notes/Brain Dump Area */}
        <div className="flex flex-col flex-1">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider mb-2">
            Notes & Brainstorming
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write down any initial thoughts, or skip ahead if your idea is ready to go..."
            className="min-h-[300px] flex-1 resize-none rounded-lg focus:outline-none focus:ring-0 transition-all text-sm leading-relaxed bg-white p-4" style={{ border: '0.5px solid #e5e7eb' }}
          />
        </div>
      </div>

      {/* Bottom bar with Save & Move button */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
        <Button
          size="sm"
          onClick={() => onNavigateToStep?.(2)}
          className="bg-[#612A4F] hover:bg-[#4A1F3D] text-white text-sm"
        >
          Next <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
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
