import React from "react";
import { StageCompletions } from "../types";
import { STAGE_ORDER, DEFAULT_STAGE_COMPLETIONS } from "../utils/productionConstants";

interface ProgressDotsProps {
  stageCompletions?: StageCompletions;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ stageCompletions }) => {
  const completions = stageCompletions || DEFAULT_STAGE_COMPLETIONS;

  return (
    <div className="flex items-center gap-1.5">
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
  );
};

export default ProgressDots;
