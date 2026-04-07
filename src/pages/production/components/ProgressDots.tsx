import React from "react";
import { ContentType, StageCompletions } from "../types";
import { STAGE_ORDER, DEFAULT_STAGE_COMPLETIONS } from "../utils/productionConstants";

const IMAGE_STAGE_ORDER: (keyof StageCompletions)[] = [
  'ideate', 'scriptAndConcept', 'toEdit', 'readyToPost',
];

interface ProgressDotsProps {
  stageCompletions?: StageCompletions;
  hasContentType?: boolean;
  contentType?: ContentType;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ stageCompletions, hasContentType = false, contentType }) => {
  const completions = { ...(stageCompletions || DEFAULT_STAGE_COMPLETIONS) };
  // First dot (ideate) is filled once the user has picked a content type
  if (hasContentType) {
    completions.ideate = true;
  }

  const stages = contentType === 'image' ? IMAGE_STAGE_ORDER : STAGE_ORDER;

  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage) => (
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
