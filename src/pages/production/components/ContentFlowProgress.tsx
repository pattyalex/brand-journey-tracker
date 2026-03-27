import React, { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductionCard, ContentType } from "../types";
import { VIDEO_STEP_TO_STAGE, IMAGE_STEP_TO_STAGE, DEFAULT_STAGE_COMPLETIONS } from "../utils/productionConstants";

interface Step {
  label: string;
  shortLabel?: string;
}

const VIDEO_STEPS: Step[] = [
  { label: "Bank of Ideas", shortLabel: "Ideas" },
  { label: "Script and Concept", shortLabel: "Script" },
  { label: "Film", shortLabel: "Film" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "Ready to Post", shortLabel: "Ready" },
  { label: "To Schedule", shortLabel: "Schedule" },
];

const IMAGE_STEPS: Step[] = [
  { label: "Bank of Ideas", shortLabel: "Ideas" },
  { label: "Concept", shortLabel: "Concept" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "Ready to Post", shortLabel: "Ready" },
  { label: "To Schedule", shortLabel: "Schedule" },
];

/**
 * Calculates which steps are completed based on the card's actual data.
 * For video cards (or default): 5-step flow.
 * For image cards: 4-step flow.
 */
export const getCompletedSteps = (card: ProductionCard | null | undefined): number[] => {
  if (!card) return [];

  const contentType = card.contentType || 'video';
  const stageCompletions = card.stageCompletions || DEFAULT_STAGE_COMPLETIONS;
  const stepToStage = contentType === 'image' ? IMAGE_STEP_TO_STAGE : VIDEO_STEP_TO_STAGE;

  const completed = new Set<number>();

  // Step 1 (Ideas) is always complete if a card exists
  completed.add(1);

  // Add steps marked complete via stageCompletions (manual toggle)
  for (const [stepStr, stage] of Object.entries(stepToStage)) {
    const step = Number(stepStr);
    if (stageCompletions[stage]) {
      completed.add(step);
    }
  }

  return Array.from(completed).sort((a, b) => a - b);
};

interface ContentFlowProgressProps {
  currentStep: number;
  contentType?: ContentType;
  allCompleted?: boolean;
  /** Array of step numbers that have been actually completed (not just visited) */
  completedSteps?: number[];
  className?: string;
  onStepClick?: (step: number) => void;
  onToggleComplete?: (step: number) => void;
}

const ContentFlowProgress: React.FC<ContentFlowProgressProps> = ({
  currentStep,
  contentType = 'video',
  allCompleted = false,
  completedSteps = [],
  className,
  onStepClick,
  onToggleComplete,
}) => {
  const [justUnchecked, setJustUnchecked] = useState<number | null>(null);

  useEffect(() => {
    if (justUnchecked !== null) {
      const timer = setTimeout(() => setJustUnchecked(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [justUnchecked]);

  const steps = contentType === 'image' ? IMAGE_STEPS : VIDEO_STEPS;
  const totalSteps = steps.length;
  const maxStepIndex = totalSteps - 1;

  return (
    <div className={cn("w-full px-4 py-1", className)}>
      <div className="flex items-center gap-3 max-w-lg mx-auto">

      {/* Previous step arrow */}
      {onStepClick && currentStep > 1 ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStepClick(currentStep - 1)}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#8B7082] hover:text-[#612A4F] hover:bg-[#612A4F]/10 transition-all duration-200 mt-[-12px]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="bg-gray-500 text-white">
              <p>Previous step</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}

      <div className="flex items-center justify-between relative flex-1 max-w-md">
        {/* Connecting line background */}
        <div className="absolute top-[14px] left-6 right-6 h-[1.5px] bg-gray-200" />

        {/* Progress line */}
        <div
          className="absolute top-[14px] left-6 h-[1.5px] transition-all duration-500"
          style={{
            backgroundColor: '#612A4F',
            width: allCompleted
              ? 'calc(100% - 3rem)'
              : currentStep === 1
                ? '0%'
                : `calc(${((currentStep - 1) / maxStepIndex) * 100}% - ${(currentStep - 1) * 0.5}rem)`
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActuallyCompleted = allCompleted || completedSteps.includes(stepNumber);
          const isCurrent = !allCompleted && stepNumber === currentStep;
          const isVisited = stepNumber < currentStep;
          const isPending = !allCompleted && stepNumber > currentStep;
          const canNavigate = onStepClick && stepNumber !== currentStep;
          const canToggle = !!onToggleComplete;

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center relative z-10 flex-1">
                {/* Circle indicator */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip open={justUnchecked === stepNumber && stepNumber !== 1 ? true : undefined}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          if (canToggle) {
                            e.stopPropagation();
                            if (isActuallyCompleted) {
                              setJustUnchecked(stepNumber);
                            } else {
                              setJustUnchecked(null);
                            }
                            onToggleComplete(stepNumber);
                          } else if (canNavigate) {
                            onStepClick(stepNumber);
                          }
                        }}
                        className={cn(
                          "rounded-full flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none",
                          isActuallyCompleted && !isCurrent && "w-5 h-5 bg-[#612A4F] border-[1.5px] border-[#612A4F] text-white cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30",
                          !isActuallyCompleted && isVisited && "w-5 h-5 bg-white border-[1.5px] border-[#612A4F] cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30",
                          isCurrent && "w-9 h-9 bg-white border-[2px] border-[#612A4F] text-[#612A4F] shadow-sm cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30",
                          isPending && !isActuallyCompleted && "w-5 h-5 bg-gray-100 border-[1.5px] border-gray-300 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30",
                        )}
                      >
                        {isActuallyCompleted && !isCurrent && (
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        )}
                        {isCurrent && isActuallyCompleted && (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        )}
                      </button>
                    </TooltipTrigger>
                    {canToggle && (justUnchecked === stepNumber || !isActuallyCompleted) && (
                      <TooltipContent side="top" sideOffset={6} className="bg-gray-500 text-white">
                        <p>{justUnchecked === stepNumber ? 'Incomplete step' : 'Mark as complete'}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Step label - clickable to navigate */}
                <button
                  onClick={() => canNavigate && onStepClick(stepNumber)}
                  disabled={!canNavigate}
                  className={cn(
                    "font-medium mt-2 text-center leading-tight focus:outline-none",
                    canNavigate && "cursor-pointer hover:underline",
                    !canNavigate && "cursor-default",
                    (isActuallyCompleted || isVisited) && "text-[11px] text-[#612A4F]",
                    isCurrent && "text-xs text-[#612A4F]",
                    isPending && !isActuallyCompleted && "text-[11px] text-gray-400"
                  )}
                >
                  {step.shortLabel}
                </button>
              </div>

            </React.Fragment>
          );
        })}
      </div>

      {/* Next step arrow */}
      {onStepClick && currentStep < totalSteps && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStepClick(currentStep + 1)}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#8B7082] hover:text-[#612A4F] hover:bg-[#612A4F]/10 transition-all duration-200 mt-[-12px]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="bg-gray-500 text-white">
              <p>Next step</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      </div>
    </div>
  );
};

export default ContentFlowProgress;
