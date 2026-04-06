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
    <div
      ref={setNodeRef}
      style={{ paddingBottom: '80px' }}
    >
      <button
        onClick={onClick}
        className="relative px-5 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
        style={{
          borderRadius: '12px',
          background: showDropHighlight
            ? 'linear-gradient(145deg, #b8a0ae 0%, #a08090 100%)'
            : isSelected
            ? 'white'
            : 'rgba(255,255,255,0.1)',
          color: showDropHighlight || isSelected ? '#612A4F' : 'white',
          fontWeight: isSelected ? 700 : 500,
          border: showDropHighlight || isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)',
          boxShadow: showDropHighlight
            ? '0 4px 12px rgba(160, 128, 144, 0.4)'
            : isSelected
            ? '0 4px 12px rgba(97, 42, 79, 0.25)'
            : '0 2px 4px rgba(0, 0, 0, 0.02)',
          transform: showDropHighlight ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {month}
        {showDropHighlight && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a08090' }} />
          </span>
        )}
      </button>
    </div>
  );
};

export default DroppableMonthPill;
