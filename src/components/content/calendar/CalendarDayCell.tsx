
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
        "border-t border-l min-h-[120px] p-1",
        !isCurrentMonth ? "bg-gray-50 text-gray-400" : "",
        isCurrentDay ? "bg-blue-50" : "",
        isWeekendDay && isCurrentMonth ? "bg-gray-100" : "",
        isDropTarget ? "ring-2 ring-inset ring-blue-400 bg-blue-50" : ""
      )}
      onClick={() => isCurrentMonth && onDayClick(day)}
      onDragOver={(e) => isCurrentMonth && onDragOver(e, dateStr)}
      onDragLeave={onDragLeave}
      onDrop={(e) => isCurrentMonth && onDrop(e, day)}
    >
      <div className="flex justify-between items-start p-1">
        <div className={cn(
          "text-sm font-medium",
          isCurrentDay ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
        )}>
          {formatDate(day, 'd')}
        </div>
        {isCurrentMonth && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onDayClick(day);
            }}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-1 mt-1 max-h-[90px] overflow-y-auto">
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

