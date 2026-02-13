import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard, ContentType } from "../types";

interface Step {
  label: string;
  shortLabel?: string;
}

const VIDEO_STEPS: Step[] = [
  { label: "Ideate", shortLabel: "Ideate" },
  { label: "Script Ideas", shortLabel: "Script" },
  { label: "Film", shortLabel: "Film" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "To Schedule", shortLabel: "Schedule" },
];

const IMAGE_STEPS: Step[] = [
  { label: "Ideate", shortLabel: "Ideate" },
  { label: "Concept", shortLabel: "Concept" },
  { label: "To Edit", shortLabel: "Edit" },
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

  if (contentType === 'image') {
    const completed: number[] = [];

    // Step 1 - Ideate: has hook or title
    if (card.hook?.trim() || card.title?.trim()) {
      completed.push(1);
    }

    // Step 2 - Concept: has caption, slides, or visual references
    const hasConceptContent =
      card.caption?.trim() ||
      (card.slides && card.slides.length > 0 && card.slides.some(s => s.content?.trim())) ||
      (card.visualReferences && card.visualReferences.length > 0) ||
      (card.linkPreviews && card.linkPreviews.length > 0);
    if (hasConceptContent) {
      completed.push(2);
    }

    // Step 3 - Edit: all checklist items are checked
    const editItems = card.editingChecklist?.items || [];
    const allItemsChecked = editItems.length > 0 && editItems.every(item => item.checked);
    if (allItemsChecked) {
      completed.push(3);
    }

    // Step 4 - Schedule: has scheduled date
    if (card.scheduledDate) {
      completed.push(4);
    }

    return completed;
  }

  // Video (default) - existing logic
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

  // Step 4 - Edit: all checklist items are checked (notes are optional)
  const editItems = card.editingChecklist?.items || [];
  const allItemsChecked = editItems.length > 0 && editItems.every(item => item.checked);
  if (allItemsChecked) {
    completed.push(4);
  }

  // Step 5 - Schedule: has scheduled date
  if (card.scheduledDate) {
    completed.push(5);
  }

  return completed;
};

interface ContentFlowProgressProps {
  currentStep: number;
  contentType?: ContentType;
  allCompleted?: boolean;
  /** Array of step numbers that have been actually completed (not just visited) */
  completedSteps?: number[];
  className?: string;
  onStepClick?: (step: number) => void;
}

const ContentFlowProgress: React.FC<ContentFlowProgressProps> = ({
  currentStep,
  contentType = 'video',
  allCompleted = false,
  completedSteps = [],
  className,
  onStepClick,
}) => {
  const steps = contentType === 'image' ? IMAGE_STEPS : VIDEO_STEPS;
  const totalSteps = steps.length;
  const maxStepIndex = totalSteps - 1;

  return (
    <div className={cn("w-full px-4 py-1", className)}>
      <div className="flex items-center justify-between relative max-w-md mx-auto">
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
          const isVisited = stepNumber < currentStep;
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
                    isActuallyCompleted && "w-5 h-5 text-[10px] bg-[#612A4F] border-[1.5px] border-[#612A4F] text-white",
                    !isActuallyCompleted && isVisited && "w-5 h-5 text-[10px] bg-white border-[1.5px] border-[#612A4F] text-[#612A4F]",
                    isCurrent && "w-9 h-9 text-sm bg-[#612A4F] border-[2px] border-[#612A4F] text-white shadow-sm",
                    isPending && "w-5 h-5 text-[10px] bg-gray-100 border-[1.5px] border-gray-300 text-gray-400",
                    isClickable && "hover:ring-2 hover:ring-offset-1 hover:ring-[#612A4F]/30"
                  )}
                >
                  {isActuallyCompleted ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <p className={cn(
                  "font-medium mt-2 text-center leading-tight",
                  (isActuallyCompleted || isVisited) && "text-[11px] text-[#612A4F]",
                  isCurrent && "text-xs text-[#612A4F]",
                  isPending && "text-[11px] text-gray-400"
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
