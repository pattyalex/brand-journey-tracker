import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProductionCard, ContentType } from "../types";
import { VIDEO_STEP_TO_STAGE, IMAGE_STEP_TO_STAGE, DEFAULT_STAGE_COMPLETIONS } from "../utils/productionConstants";

interface Step {
  label: string;
  shortLabel?: string;
}

const VIDEO_STEPS: Step[] = [
  { label: "Bank of Ideas", shortLabel: "Ideas" },
  { label: "Script & Concept", shortLabel: "Script" },
  { label: "Film", shortLabel: "Film" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "Ready to Post", shortLabel: "Ready" },
];

const IMAGE_STEPS: Step[] = [
  { label: "Bank of Ideas", shortLabel: "Ideas" },
  { label: "Concept", shortLabel: "Concept" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "Ready to Post", shortLabel: "Ready" },
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
  const steps = contentType === 'image' ? IMAGE_STEPS : VIDEO_STEPS;
  const totalSteps = steps.length;
  const maxStepIndex = totalSteps - 1;

  return (
    <div className={cn("w-full px-4 py-1 relative z-20", className)}>
      <div className="flex items-center gap-3 max-w-lg mx-auto">
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

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center relative z-10 flex-1">
                {/* Circle indicator - read-only status, click to navigate */}
                <button
                  onClick={() => canNavigate && onStepClick(stepNumber)}
                  disabled={!canNavigate}
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none",
                    isActuallyCompleted && !isCurrent && "w-5 h-5 bg-[#612A4F] border-[1.5px] border-[#612A4F] text-white",
                    !isActuallyCompleted && isVisited && "w-5 h-5 bg-white border-[1.5px] border-[#612A4F]",
                    isCurrent && isActuallyCompleted && "w-9 h-9 bg-[#612A4F] border-[2px] border-[#612A4F] text-white shadow-sm",
                    isCurrent && !isActuallyCompleted && "w-9 h-9 bg-white border-[2px] border-[#612A4F] text-[#612A4F] shadow-sm",
                    isPending && !isActuallyCompleted && "w-5 h-5 bg-gray-100 border-[1.5px] border-gray-300",
                    canNavigate && "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30",
                    !canNavigate && "cursor-default",
                  )}
                >
                  {isActuallyCompleted && !isCurrent && (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  )}
                  {isCurrent && isActuallyCompleted && (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  )}
                </button>

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

      </div>
    </div>
  );
};

export const getStepCount = (contentType: ContentType = 'video') =>
  contentType === 'image' ? IMAGE_STEPS.length : VIDEO_STEPS.length;

export default ContentFlowProgress;
