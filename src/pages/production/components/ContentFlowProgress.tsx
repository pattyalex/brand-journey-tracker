import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  shortLabel?: string;
}

const CONTENT_FLOW_STEPS: Step[] = [
  { label: "Ideate", shortLabel: "Ideate" },
  { label: "Script Ideas", shortLabel: "Script" },
  { label: "Film", shortLabel: "Film" },
  { label: "To Edit", shortLabel: "Edit" },
  { label: "To Schedule", shortLabel: "Schedule" },
  { label: "Post", shortLabel: "Post" },
];

interface ContentFlowProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  allCompleted?: boolean;
  className?: string;
  onStepClick?: (step: number) => void;
}

const ContentFlowProgress: React.FC<ContentFlowProgressProps> = ({
  currentStep,
  allCompleted = false,
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
          className="absolute top-[18px] left-6 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
          style={{
            width: allCompleted
              ? 'calc(100% - 3rem)'
              : currentStep === 1
                ? '0%'
                : `calc(${((currentStep - 1) / 5) * 100}% - ${(currentStep - 1) * 0.5}rem)`
          }}
        />

        {CONTENT_FLOW_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = allCompleted || stepNumber < currentStep;
          const isCurrent = !allCompleted && stepNumber === currentStep;
          const isPending = !allCompleted && stepNumber > currentStep;
          const isClickable = onStepClick && stepNumber !== currentStep;

          return (
            <button
              key={step.label}
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center relative z-10 flex-1 transition-transform",
                isClickable && "cursor-pointer hover:scale-110",
                !isClickable && "cursor-default"
              )}
            >
              {/* Circle indicator */}
              <div
                className={cn(
                  "rounded-full flex items-center justify-center font-semibold transition-all duration-300 border-[1.5px]",
                  isCompleted && "w-6 h-6 text-xs bg-emerald-500 border-emerald-500 text-white",
                  isCurrent && "w-9 h-9 text-sm bg-white border-gray-800 text-gray-800 border-2 shadow-md",
                  isPending && "w-6 h-6 text-xs bg-gray-100 border-gray-300 text-gray-400",
                  isClickable && "hover:ring-2 hover:ring-offset-2 hover:ring-emerald-300"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Step label - compact */}
              <p className={cn(
                "text-[10px] font-medium mt-1 text-center leading-tight",
                isCompleted && "text-emerald-600",
                isCurrent && "text-gray-800",
                isPending && "text-gray-400"
              )}>
                {step.shortLabel}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentFlowProgress;
