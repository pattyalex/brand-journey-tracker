import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard, StageCompletions } from "../types";
import { STAGE_ORDER, STAGE_LABELS, DEFAULT_STAGE_COMPLETIONS, COLUMN_TO_STAGE } from "../utils/productionConstants";

interface StageTimelineProps {
  card: ProductionCard;
  onToggleStage: (stage: keyof StageCompletions) => void;
  className?: string;
}

const AUTO_STAGES: Set<keyof StageCompletions> = new Set(['ideate', 'toSchedule']);

const StageTimeline: React.FC<StageTimelineProps> = ({ card, onToggleStage, className }) => {
  const completions = card.stageCompletions || DEFAULT_STAGE_COMPLETIONS;
  const currentStage = COLUMN_TO_STAGE[card.columnId];

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      <p className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-3">
        Stage Progress
      </p>
      <div className="relative">
        {STAGE_ORDER.map((stage, index) => {
          const isComplete = completions[stage];
          const isCurrent = stage === currentStage;
          const isAuto = AUTO_STAGES.has(stage);
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <div key={stage} className="flex items-start gap-3 relative">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className="absolute left-[9px] top-[20px] w-[2px] h-[calc(100%-4px)]"
                  style={{ backgroundColor: isComplete ? '#612A4F' : '#E8E2E5' }}
                />
              )}
              {/* Circle indicator */}
              <div className="relative flex-shrink-0 mt-[2px]">
                <div
                  className={cn(
                    "w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors duration-200",
                    isComplete
                      ? "bg-[#612A4F]"
                      : isCurrent
                        ? "bg-white border-2 border-[#612A4F]"
                        : "bg-white border-2 border-[#D8D0DB]"
                  )}
                >
                  {isComplete && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                </div>
              </div>
              {/* Label and action */}
              <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[13px] leading-tight",
                      isCurrent ? "font-semibold text-[#612A4F]" : "font-medium text-[#6B5A63]"
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-[#8B7082] bg-[#F5F2F4] px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                {/* Toggle or auto label */}
                <div className="mt-1">
                  {isAuto ? (
                    <span className="text-[11px] text-[#A99BA3]">
                      {isComplete ? 'Auto-completed' : 'Auto-completes'}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStage(stage);
                      }}
                      className={cn(
                        "text-[11px] font-medium transition-colors duration-150",
                        isComplete
                          ? "text-[#612A4F] hover:text-[#8B7082]"
                          : "text-[#8B7082] hover:text-[#612A4F]"
                      )}
                    >
                      {isComplete ? 'Completed — undo' : 'Mark as complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageTimeline;
