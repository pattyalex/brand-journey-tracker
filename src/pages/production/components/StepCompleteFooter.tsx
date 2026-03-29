import React, { useState, useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StepCompleteFooterProps {
  stepNumber: number;
  completedSteps: number[];
  onToggleComplete?: (step: number) => void;
  hideTooltip?: boolean;
  onNextStep?: () => void;
  showNextStep?: boolean;
}

const StepCompleteFooter: React.FC<StepCompleteFooterProps> = ({
  stepNumber,
  completedSteps,
  onToggleComplete,
  hideTooltip = false,
  onNextStep,
  showNextStep = false,
}) => {
  const isCompleted = completedSteps.includes(stepNumber);
  const [justUnchecked, setJustUnchecked] = useState(false);

  useEffect(() => {
    if (justUnchecked) {
      const timer = setTimeout(() => setJustUnchecked(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [justUnchecked]);

  const handleClick = () => {
    if (isCompleted) {
      setJustUnchecked(true);
    } else {
      setJustUnchecked(false);
    }
    onToggleComplete?.(stepNumber);
  };

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Step Complete</span>
        <TooltipProvider delayDuration={0}>
          <Tooltip open={!hideTooltip && justUnchecked ? true : undefined}>
            <TooltipTrigger asChild>
              <button
                onClick={handleClick}
                className={cn(
                  "w-8 h-8 rounded-full border-[2px] flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-[#612A4F] border-[#612A4F] text-white"
                    : "border-gray-300 bg-white hover:border-[#612A4F]/50"
                )}
              >
                {isCompleted && <Check className="w-3 h-3" strokeWidth={3} />}
              </button>
            </TooltipTrigger>
            {!hideTooltip && (!isCompleted || justUnchecked) && (
              <TooltipContent side="top" sideOffset={6} className="bg-gray-500 text-white">
                <p>{justUnchecked ? "Incomplete Step" : "Mark as Complete"}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {showNextStep && onNextStep && (
          <TooltipProvider delayDuration={0}>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <button
                  onClick={onNextStep}
                  className="ml-2 w-9 h-9 rounded-full flex items-center justify-center text-[#8B7082] hover:text-[#612A4F] hover:bg-[#612A4F]/10 transition-all duration-200 focus:outline-none"
                  tabIndex={-1}
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

export default StepCompleteFooter;
