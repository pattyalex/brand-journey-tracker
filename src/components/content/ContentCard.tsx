
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Pencil, Calendar 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onScheduleContent?: (contentId: string, scheduledDate: Date) => void;
}

const ContentCard = ({
  content,
  index,
  pillar,
  pillars,
  onDeleteContent,
  onEditContent,
  onScheduleContent
}: ContentCardProps) => {
  const [date, setDate] = useState<Date | undefined>(content.scheduledDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    setDate(selectedDate);
    
    if (onScheduleContent) {
      onScheduleContent(content.id, selectedDate);
      toast.success(`Scheduled "${content.title}" for ${format(selectedDate, "PPP")}`);
    } else {
      // Fallback if the onScheduleContent prop isn't provided
      // Store the scheduled content in localStorage
      const scheduledContents = JSON.parse(localStorage.getItem('scheduledContents') || '[]');
      const updatedContent = { ...content, scheduledDate: selectedDate };
      
      // Check if this content is already scheduled
      const existingIndex = scheduledContents.findIndex((item: ContentItem) => item.id === content.id);
      
      if (existingIndex >= 0) {
        scheduledContents[existingIndex] = updatedContent;
      } else {
        scheduledContents.push(updatedContent);
      }
      
      localStorage.setItem('scheduledContents', JSON.stringify(scheduledContents));
      toast.success(`Scheduled "${content.title}" for ${format(selectedDate, "PPP")}`);
    }
    
    setCalendarOpen(false);
  };

  return (
    <Card 
      className={`overflow-hidden relative h-full border-2 w-full`}
    >
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-bold mb-1 line-clamp-2">
          {content.title}
          {date && (
            <Badge variant="outline" className="ml-2 text-xs">
              <CalendarIcon className="h-2 w-2 mr-1" />
              {format(date, "MMM d")}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {content.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {content.tags && content.tags.length > 0 ? (
            content.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-0.5 rounded-full ${getTagColorClasses(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : null}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {content.dateCreated ? formatDistanceToNow(new Date(content.dateCreated), { addSuffix: true }) : 'Unknown date'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline" 
              size="sm"
              aria-label="Schedule"
              className="h-7 w-7 p-0"
            >
              <CalendarIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <div className="p-2">
              <h3 className="text-sm font-medium mb-2">Schedule Post</h3>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteContent(content.id)}
            aria-label="Delete"
            className="h-7 w-7 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditContent(content.id)}
            aria-label="Edit"
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
