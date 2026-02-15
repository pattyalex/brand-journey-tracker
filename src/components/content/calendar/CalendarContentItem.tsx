
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Instagram, Youtube, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { ContentItem } from "@/types/content";
import { formatColors } from "@/utils/calendarUtils";

interface CalendarContentItemProps {
  content: ContentItem;
  onEdit: (content: ContentItem) => void;
  onDelete: (id: string) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, content: ContentItem) => void;
}

const getPlatformIcon = (platform: string) => {
  const lowercasePlatform = platform.toLowerCase();
  
  switch (lowercasePlatform) {
    case 'instagram':
      return <Instagram className="h-3 w-3" />;
    case 'youtube':
      return <Youtube className="h-3 w-3" />;
    case 'twitter':
    case 'x':
      return <AtSign className="h-3 w-3" />;
    default:
      return <AtSign className="h-3 w-3" />;
  }
};

const CalendarContentItem: React.FC<CalendarContentItemProps> = ({
  content,
  onEdit,
  onDelete,
  isDragging,
  onDragStart,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(content.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getContentFormat = (content: ContentItem) => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    return "Post";
  };

  // Check if this is a planner task
  const isPlannerTask = (content as any).isPlannerTask;
  const taskColor = (content as any).color;
  const startTime = (content as any).startTime;
  const isCompleted = (content as any).isCompleted;

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (isPlannerTask) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== content.title) {
      // Update planner data in localStorage
      const plannerDataStr = getString(StorageKeys.plannerData);
      if (plannerDataStr) {
        const plannerData = JSON.parse(plannerDataStr);
        const updatedData = plannerData.map((day: any) => ({
          ...day,
          items: day.items.map((item: any) =>
            item.id === content.id ? { ...item, text: editedTitle.trim() } : item
          )
        }));
        setString(StorageKeys.plannerData, JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(content.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative text-xs p-1 rounded border transition-shadow hover:shadow-sm",
        isEditing ? "cursor-text" : "cursor-grab active:cursor-grabbing",
        isDragging ? "opacity-50" : "",
        isPlannerTask
          ? "border-gray-200"
          : content.format && formatColors[getContentFormat(content)]
          ? formatColors[getContentFormat(content)]
          : "bg-gray-100 text-gray-800 border-gray-300"
      )}
      style={isPlannerTask ? { backgroundColor: taskColor || '#f3f4f6' } : {}}
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, content)}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center gap-1 pr-5">
        {isPlannerTask && startTime && (
          <span className="text-[10px] font-medium flex-shrink-0">{startTime}</span>
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-xs",
              isPlannerTask && isCompleted ? "line-through text-gray-500" : ""
            )}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={cn(
            "truncate flex-1",
            isPlannerTask && isCompleted ? "line-through text-gray-500" : ""
          )}>
            {content.title}
          </span>
        )}
      </div>

      {/* Action buttons - vertically stacked on right */}
      <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(content.id);
          }}
          className="p-0.5 rounded-sm text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
          title="Delete"
        >
          <Trash2 size={10} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(content);
          }}
          className="p-0.5 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
          title="Edit"
        >
          <Pencil size={10} />
        </button>
      </div>

      {content.platforms && content.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 ml-1">
          {content.platforms.map((platform, idx) => (
            <Badge
              key={`cal-platform-${content.id}-${idx}`}
              className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0 rounded-full flex items-center gap-0.5"
            >
              {getPlatformIcon(platform)}
              <span className="text-[9px]">{platform}</span>
            </Badge>
          ))}
        </div>
      )}

      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 ml-1 pb-1">
          {content.tags.slice(0, 2).map((tag, idx) => (
            <Badge
              key={`cal-status-${content.id}-${idx}`}
              variant="outline"
              className="bg-white/50 border-purple-200 text-purple-700 text-[9px] px-1.5 py-0 rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {content.tags.length > 2 && (
            <Badge
              variant="outline"
              className="bg-white/50 border-purple-200 text-purple-700 text-[9px]"
            >
              +{content.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarContentItem;
