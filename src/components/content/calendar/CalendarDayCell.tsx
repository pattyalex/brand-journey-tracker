
import React from "react";
import { format as formatDate, isSameMonth, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentItem } from "@/types/content";
import CalendarContentItem from "./CalendarContentItem";
import { isWeekend } from "@/utils/calendarUtils";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  dayContent: ContentItem[];
  onDayClick: (day: Date) => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  draggedContent: ContentItem | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, content: ContentItem) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, dateStr: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, day: Date) => void;
  dropTarget: string | null;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  currentMonth,
  dayContent,
  onDayClick,
  onEditContent,
  onDeleteContent,
  draggedContent,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dropTarget,
}) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);
  const isWeekendDay = isWeekend(day);
  const dateStr = formatDate(day, 'yyyy-MM-dd');
  const isDropTarget = dropTarget === dateStr;

  return (
    <div
      data-date={dateStr}
      className={cn(
        "group relative border-r border-b min-h-[120px] p-2 transition-colors hover:bg-gray-50",
        !isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white",
        isDropTarget ? "ring-2 ring-inset ring-blue-400 bg-blue-50" : ""
      )}
      onDragOver={(e) => isCurrentMonth && onDragOver(e, dateStr)}
      onDragLeave={onDragLeave}
      onDrop={(e) => isCurrentMonth && onDrop(e, day)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-sm font-medium",
          isCurrentDay ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" :
          isCurrentMonth ? "text-gray-900" : "text-gray-400"
        )}>
          {formatDate(day, 'd')}
        </span>
        {isCurrentMonth && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDayClick(day);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-blue-50"
            title="Add content"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        {dayContent.map((content) => (
          <CalendarContentItem
            key={content.id}
            content={content}
            onEdit={onEditContent}
            onDelete={onDeleteContent}
            isDragging={draggedContent?.id === content.id}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarDayCell;

