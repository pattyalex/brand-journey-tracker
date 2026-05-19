import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableMonthPillProps {
  month: string;
  fullMonth: string;
  isSelected: boolean;
  isDropTarget: boolean;
  onClick: () => void;
}

const DroppableMonthPill: React.FC<DroppableMonthPillProps> = ({
  month,
  fullMonth,
  isSelected,
  isDropTarget,
  onClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `month-${fullMonth}`,
  });

  const showDropHighlight = isOver || isDropTarget;

  return (
    <div ref={setNodeRef}>
      <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
          showDropHighlight
            ? 'bg-[#612A4F]/10 text-[#612A4F] border border-[#612A4F]/30 scale-105'
            : isSelected
            ? 'bg-[#612A4F] text-white shadow-sm'
            : 'bg-gray-50 text-gray-500 hover:text-[#612A4F] hover:bg-gray-100 border border-gray-100'
        }`}
      >
        {month}
      </button>
    </div>
  );
};

export default DroppableMonthPill;
