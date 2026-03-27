import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, ArrowRight, ArrowLeft, Save, Send, CalendarDays, X } from "lucide-react";
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
}

const ReadyToPostStep: React.FC<ReadyToPostStepProps> = ({
  onNavigateToStep,
  onClose,
  onConfirmReady,
  onSaveAndExit,
  completedSteps = [],
  contentType = "video",
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<StepView>("question");

  const handleYes = () => {
    onConfirmReady();
    setView("celebration");
  };

  return (
    <>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Stepper Progress + Back button */}
      <div className="pt-6 pb-4 flex items-start px-6">
        <button
          onClick={() => onNavigateToStep?.(4)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors pt-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <div className="flex-1">
          <ContentFlowProgress
            currentStep={5}
            contentType={contentType}
            onStepClick={onNavigateToStep}
            completedSteps={completedSteps}
          />
        </div>
        {/* Spacer to keep stepper centered */}
        <div className="w-[52px]" />
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
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
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
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Save and come back later
                </button>
                <button
                  onClick={() => setView("question")}
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
              {/* Animated celebration icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                  delay: 0.15,
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
              >
                <PartyPopper className="w-11 h-11 text-amber-600" />
              </motion.div>

              {/* Floating sparkle accents */}
              <motion.div
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { x: -120, y: -60, delay: 0.5, size: "w-2 h-2" },
                  { x: 130, y: -40, delay: 0.6, size: "w-1.5 h-1.5" },
                  { x: -80, y: 30, delay: 0.7, size: "w-1.5 h-1.5" },
                  { x: 100, y: 50, delay: 0.55, size: "w-2 h-2" },
                  { x: -140, y: 10, delay: 0.65, size: "w-1 h-1" },
                  { x: 150, y: -10, delay: 0.75, size: "w-1 h-1" },
                ].map((spark, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${spark.size} rounded-full bg-gradient-to-br from-amber-300 to-yellow-400`}
                    style={{ left: spark.x, top: spark.y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: spark.delay,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  />
                ))}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                You did it!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500 mb-2 leading-relaxed"
              >
                This content has been moved to{" "}
                <span className="font-semibold text-[#612A4F]">Ready to Post</span>.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mb-10 leading-relaxed max-w-sm"
              >
                Head over to the Planner & Calendar to pick the perfect date and time to publish.
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
                    navigate("/content-planning");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#612A4F] text-sm font-medium text-white hover:bg-[#4A1F3D] transition-all duration-200 shadow-[0_2px_12px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_20px_rgba(97,42,79,0.35)]"
                >
                  <CalendarDays className="w-4 h-4" />
                  Go to Planner & Calendar
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-5 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Stay here for now
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
