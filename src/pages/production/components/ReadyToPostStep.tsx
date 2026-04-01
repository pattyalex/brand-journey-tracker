import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save, Send, CalendarDays, X, ChevronLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContentFlowProgress from "./ContentFlowProgress";
import { ContentType } from "../types";

type StepView = "question" | "not-ready" | "celebration";

interface ReadyToPostStepProps {
  onNavigateToStep?: (step: number) => void;
  onClose: () => void;
  onConfirmReady: () => void;
  onSaveAndExit: () => void;
  completedSteps?: number[];
  contentType?: ContentType;
  onToggleComplete?: (step: number) => void;
}

const ReadyToPostStep: React.FC<ReadyToPostStepProps> = ({
  onNavigateToStep,
  onClose,
  onConfirmReady,
  onSaveAndExit,
  completedSteps = [],
  contentType = "video",
  onToggleComplete,
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<StepView>("question");

  const handleYes = () => {
    onConfirmReady();
    setView("celebration");
  };

  return (
    <>
      {/* Top bar: Back button (left) and Close button (right) */}
      {onNavigateToStep && (
        <TooltipProvider delayDuration={0}>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <button
                onClick={() => onNavigateToStep(contentType === 'image' ? 3 : 4)}
                className="absolute top-6 left-4 p-2 rounded-full hover:bg-[#612A4F]/10 text-gray-400 hover:text-[#612A4F] transition-colors z-30 focus:outline-none"
                tabIndex={-1}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4} className="bg-gray-500 text-white">
              <p>Previous step</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <TooltipProvider delayDuration={0}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <button
              onClick={onClose}
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
      <div className="pt-6 pb-4">
        <ContentFlowProgress
          currentStep={contentType === 'image' ? 4 : 5}
          contentType={contentType}
          onStepClick={onNavigateToStep}
          completedSteps={completedSteps}
          onToggleComplete={onToggleComplete}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 overflow-y-auto -mt-16">
        <AnimatePresence mode="wait">
          {/* ── STATE 1: The Question ── */}
          {view === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center max-w-md"
            >
              <Send className="w-9 h-9 text-[#612A4F] mb-8" />

              <h2
                className="text-2xl font-semibold text-gray-900 mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Is this content ready to post?
              </h2>
              <p className="text-sm text-gray-500 mb-10 leading-relaxed max-w-sm">
                You've scripted, filmed, and edited. If everything looks good, let's move it forward.
              </p>

              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => setView("not-ready")}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200"
                >
                  Not yet
                </button>
                <button
                  onClick={handleYes}
                  className="flex-1 px-5 py-3 rounded-xl bg-[#612A4F] text-sm font-medium text-white hover:bg-[#4A1F3D] transition-all duration-200 shadow-[0_2px_12px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_20px_rgba(97,42,79,0.35)]"
                >
                  Yes, it's ready!
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STATE 2: Not Ready ── */}
          {view === "not-ready" && (
            <motion.div
              key="not-ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center max-w-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setView("question")}
                        className="p-1.5 rounded-full text-gray-300 hover:text-[#612A4F] hover:bg-[#612A4F]/5 transition-all duration-200"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={14} className="bg-gray-500 text-white">
                      <p>Back to question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <h2
                  className="text-2xl font-semibold text-gray-900"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  No worries, take your time
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-10 leading-relaxed max-w-sm">
                You can save your progress and come back later, or jump back to any step above to keep working.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={onSaveAndExit}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200"
                >
                  Save and come back later
                </button>
                <button
                  onClick={handleYes}
                  className="w-full px-5 py-3 rounded-xl text-sm font-medium text-[#612A4F] hover:bg-[#612A4F]/5 transition-all duration-200"
                >
                  Actually, I think it's ready
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STATE 3: Celebration ── */}
          {view === "celebration" && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center max-w-md"
            >
              {/* Animated checkmark circle */}
              <div className="w-16 h-16 mb-8 relative">
                <svg viewBox="0 0 52 52" className="w-full h-full">
                  {/* Circle */}
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="#612A4F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  />
                  {/* Checkmark */}
                  <motion.path
                    d="M16 27 L22.5 33.5 L36 19"
                    fill="none"
                    stroke="#612A4F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
                  />
                </svg>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center mb-5"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setView("question")}
                        className="p-1.5 mr-2 rounded-full text-gray-300 hover:text-[#612A4F] hover:bg-[#612A4F]/5 transition-all duration-200"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6} className="bg-gray-500 text-white">
                      <p>Back to question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <h2
                  className="text-2xl font-semibold text-gray-900"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  You did it!
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm"
              >
                Head over to the Planner & Calendar to pick the date and time to publish
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 w-full max-w-xs"
              >
                <button
                  onClick={() => {
                    onClose();
                    navigate("/task-board?view=calendar&mode=content&panel=ready-to-post");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#612A4F] text-sm font-medium text-white hover:bg-[#4A1F3D] transition-all duration-200 shadow-[0_2px_12px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_20px_rgba(97,42,79,0.35)]"
                >
                  <CalendarDays className="w-4 h-4" />
                  Go to Planner & Calendar
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-5 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-[#612A4F] hover:bg-[#8B7082]/10 transition-all duration-200"
                >
                  Stay in Content Hub for now
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ReadyToPostStep;
