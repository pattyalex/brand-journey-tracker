import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, GripVertical } from "lucide-react";
import { GoalProgressStatus, progressStatuses } from "./types";

interface SortableGoalItemProps {
  goal: {
    id: string;
    text: string;
    status: GoalProgressStatus;
    linkedGoalId?: string;
  };
  onStatusChange: (status: GoalProgressStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  linkedGoalIndex?: number;
}

const SortableGoalItem: React.FC<SortableGoalItemProps> = ({
  goal,
  onStatusChange,
  onEdit,
  onDelete,
  isEditing,
  editingText,
  onEditingTextChange,
  onSave,
  onCancelEdit,
  linkedGoalIndex,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: goal.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1000 : 'auto' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid rgba(139, 115, 130, 0.1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        background: 'white',
      }}
      className={`flex items-center gap-3 group bg-white hover:shadow-md transition-shadow duration-200`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Goal Text */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancelEdit();
            }}
            autoFocus
            className="h-8 text-sm"
          />
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm cursor-pointer hover:text-[#612A4F] transition-colors"
              style={{
                color: '#3d3a38'
              }}
              onClick={onEdit}
            >
              {goal.text}
            </span>
            {goal.linkedGoalId && linkedGoalIndex !== undefined && (
              <span
                className="px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: 'rgba(107, 74, 94, 0.1)',
                  color: '#6b4a5e',
                  borderRadius: '6px'
                }}
              >
                ↗ Goal {linkedGoalIndex + 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Tabs */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {progressStatuses.map((status) => {
          const isActive = goal.status === status.value;
          const button = (
            <button
              onClick={() => onStatusChange(status.value)}
              className="transition-all duration-200"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? status.bgColor : 'transparent',
                color: isActive ? status.activeColor : '#b0a8ac',
                border: isActive ? `1px solid ${status.color}40` : '1px solid transparent',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {status.label}
            </button>
          );

          // Only show tooltip for "Fully Completed!"
          if (status.value === 'completed') {
            return (
              <TooltipProvider key={status.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Impeccable Work, Congrats!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return <span key={status.value}>{button}</span>;
        })}
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SortableGoalItem;
