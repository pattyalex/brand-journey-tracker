import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StageCompletions } from "../types";
import { STAGE_ORDER, STAGE_LABELS, DEFAULT_STAGE_COMPLETIONS } from "../utils/productionConstants";

interface ProgressDotsProps {
  stageCompletions?: StageCompletions;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ stageCompletions }) => {
  const completions = stageCompletions || DEFAULT_STAGE_COMPLETIONS;
  const completedCount = STAGE_ORDER.filter(s => completions[s]).length;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                className="w-[6px] h-[6px] rounded-full transition-colors duration-200"
                style={
                  completions[stage]
                    ? { backgroundColor: '#612A4F' }
                    : { backgroundColor: 'transparent', border: '1.5px solid #C4B5C9' }
                }
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="bg-[#2D2D2D] text-white border-0 px-3 py-2 rounded-lg shadow-lg max-w-[200px]"
        >
          <p className="text-[11px] font-semibold mb-1">Stage progress ({completedCount}/{STAGE_ORDER.length})</p>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            Each dot represents a step in your content workflow. Open the card to mark stages as complete.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProgressDots;
