
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Calendar } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
    <Draggable key={content.id} draggableId={content.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? 'opacity-70' : 'opacity-100'}`}
        >
          <Card 
            className={`overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : ''} relative`}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {content.title}
                {date && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(date, "MMM d")}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {content.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-1 mb-2">
                {content.tags && content.tags.length > 0 ? (
                  content.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-1 rounded-full ${getTagColorClasses(tag)}`}
                    >
                      {tag}
                    </span>
                  ))
                ) : null}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {content.dateCreated ? formatDistanceToNow(new Date(content.dateCreated), { addSuffix: true }) : 'Unknown date'}
                </span>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline" 
                    size="xs"
                    aria-label="Schedule"
                    className="h-7 w-7 p-0"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="xs"
                  onClick={() => onDeleteContent(content.id)}
                  aria-label="Delete"
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="xs"
                  onClick={() => onEditContent(content.id)}
                  aria-label="Edit"
                  className="h-7 w-7 p-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ContentCard;
