import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard } from "../types";

interface Step {
  label: string;
  shortLabel?: string;
}

/**
 * Calculates which steps are completed based on the card's actual data
 */
export const getCompletedSteps = (card: ProductionCard | null | undefined): number[] => {
  if (!card) return [];

  const completed: number[] = [];

  // Step 1 - Ideate: has hook or title
  if (card.hook?.trim() || card.title?.trim()) {
    completed.push(1);
  }

  // Step 2 - Script: has script content
  if (card.script?.trim()) {
    completed.push(2);
  }

  // Step 3 - Film: has filming notes, storyboard, or any checklist items
  const hasFilmingContent =
    card.filmingNotes?.trim() ||
    (card.storyboard && card.storyboard.length > 0) ||
    card.locationChecked ||
    card.outfitChecked ||
    card.propsChecked;
  if (hasFilmingContent) {
    completed.push(3);
  }

  // Step 4 - Edit: has editing checklist with items checked
  const hasEditingContent = card.editingChecklist && (
    card.editingChecklist.reviewedFootage ||
    card.editingChecklist.selectedBestTakes ||
    card.editingChecklist.cutTightened ||
    card.editingChecklist.addedCaptions ||
    card.editingChecklist.colorCorrected ||
    card.editingChecklist.audioLevelsAdjusted ||
    card.editingChecklist.addedMusicSFX ||
    card.editingChecklist.exportedFormats ||
    card.editingChecklist.notes?.trim()
  );
  if (hasEditingContent) {
    completed.push(4);
  }

  // Step 5 - Schedule: has scheduled date
  if (card.scheduledDate) {
    completed.push(5);
  }

  return completed;
};

const CONTENT_FLOW_STEPS: Step[] = [
  { label: "Ideate", shortLabel: "Ideate" },
  { label: "Script Ideas", shortLabel: "Script" },
  { label: "Film", shortLabel: "Film" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "To Schedule", shortLabel: "Schedule" },
];

interface ContentFlowProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  allCompleted?: boolean;
  /** Array of step numbers that have been actually completed (not just visited) */
  completedSteps?: number[];
  className?: string;
  onStepClick?: (step: number) => void;
}

const ContentFlowProgress: React.FC<ContentFlowProgressProps> = ({
  currentStep,
  allCompleted = false,
  completedSteps = [],
  className,
  onStepClick,
}) => {

  return (
    <div className={cn("w-full px-4 py-2", className)}>
      <div className="flex items-center justify-between relative max-w-xl mx-auto">
        {/* Connecting line background */}
        <div className="absolute top-[18px] left-6 right-6 h-[2px] bg-gray-200" />

        {/* Progress line */}
        <div
          className="absolute top-[18px] left-6 h-[2px] transition-all duration-500"
          style={{
            backgroundColor: '#612A4F',
            width: allCompleted
              ? 'calc(100% - 3rem)'
              : currentStep === 1
                ? '0%'
                : `calc(${((currentStep - 1) / 4) * 100}% - ${(currentStep - 1) * 0.5}rem)`
          }}
        />

        {CONTENT_FLOW_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActuallyCompleted = allCompleted || completedSteps.includes(stepNumber);
          const isVisited = stepNumber < currentStep; // Passed through but not necessarily completed
          const isCurrent = !allCompleted && stepNumber === currentStep;
          const isPending = !allCompleted && stepNumber > currentStep;
          const isClickable = onStepClick && stepNumber !== currentStep;

          return (
            <React.Fragment key={step.label}>
              <button
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center relative z-10 flex-1 transition-transform focus:outline-none",
                  isClickable && "cursor-pointer hover:scale-110",
                  !isClickable && "cursor-default"
                )}
              >
                {/* Circle indicator */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                    // Actually completed - filled with checkmark
                    isActuallyCompleted && "w-6 h-6 text-xs bg-[#612A4F] border-[2px] border-[#612A4F] text-white",
                    // Visited but not completed - outline only
                    !isActuallyCompleted && isVisited && "w-6 h-6 text-xs bg-white border-[2px] border-[#612A4F] text-[#612A4F]",
                    // Current step
                    isCurrent && "w-12 h-12 text-lg bg-[#612A4F] border-[2px] border-[#612A4F] text-white shadow-md",
                    // Pending - not visited yet
                    isPending && "w-6 h-6 text-xs bg-gray-100 border-[1.5px] border-gray-300 text-gray-400",
                    isClickable && "hover:ring-2 hover:ring-offset-2 hover:ring-[#612A4F]/30"
                  )}
                >
                  {isActuallyCompleted ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step label - compact */}
                <p className={cn(
                  "font-medium mt-1.5 text-center leading-tight",
                  (isActuallyCompleted || isVisited) && "text-[10px] text-[#612A4F]",
                  isCurrent && "text-xs text-[#612A4F]",
                  isPending && "text-[10px] text-gray-400"
                )}>
                  {step.shortLabel}
                </p>
              </button>

            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ContentFlowProgress;
