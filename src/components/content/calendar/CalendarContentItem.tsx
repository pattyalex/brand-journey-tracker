
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Instagram, Youtube, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const getContentFormat = (content: ContentItem) => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    return "Post";
  };

  return (
    <div
      className={cn(
        "group cursor-grab border rounded",
        isDragging ? "opacity-50" : "",
        content.format && formatColors[getContentFormat(content)]
          ? formatColors[getContentFormat(content)]
          : "bg-gray-100 text-gray-800 border-gray-300"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, content)}
    >
      <div
        className="text-xs p-1 cursor-pointer flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(content);
        }}
      >
        <div className="flex-1 flex items-center justify-between">
          <span className="truncate">{content.title}</span>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(content);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(content.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {content.platforms && content.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 ml-1">
          {content.platforms.slice(0, 2).map((platform, idx) => (
            <Badge
              key={`cal-platform-${content.id}-${idx}`}
              className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0 rounded-full flex items-center gap-0.5"
            >
              {getPlatformIcon(platform)}
              <span className="text-[9px]">{platform}</span>
            </Badge>
          ))}
          {content.platforms.length > 2 && (
            <Badge className="bg-purple-100 text-purple-800 text-[9px]">
              +{content.platforms.length - 2}
            </Badge>
          )}
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

