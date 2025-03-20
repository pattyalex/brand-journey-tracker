import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Pencil, CalendarClock, FileText, CornerUpLeft
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DateSchedulePicker from "./DateSchedulePicker";

interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onScheduleContent?: (contentId: string, scheduledDate: Date) => void;
  onRestoreToIdeas?: (content: ContentItem, originalPillarId?: string) => void;
  originalPillarId?: string;
}

const ContentCard = ({
  content,
  index,
  pillar,
  pillars,
  onDeleteContent,
  onEditContent,
  onScheduleContent,
  onRestoreToIdeas,
  originalPillarId
}: ContentCardProps) => {
  const [date, setDate] = useState<Date | undefined>(content.scheduledDate);
  const [formatName, setFormatName] = useState<string>("Post");
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  
  const determinePillarToRestoreTo = () => {
    console.log(`[ContentCard] Determining pillar to restore to for "${content.title}" (ID: ${content.id}):`);
    console.log(`- originalPillarId prop: ${originalPillarId || "undefined"}`);
    console.log(`- content.originalPillarId: ${content.originalPillarId || "undefined"}`);
    console.log(`- content.bucketId: ${content.bucketId || "undefined"}`);
    console.log(`- current pillar: ${pillar.id || "undefined"}`);
    
    if (originalPillarId) {
      console.log(`[ContentCard] Using provided originalPillarId: ${originalPillarId}`);
      return originalPillarId;
    } 
    
    if (content.originalPillarId) {
      console.log(`[ContentCard] Using content's originalPillarId: ${content.originalPillarId}`);
      return content.originalPillarId;
    }
    
    if (content.bucketId) {
      console.log(`[ContentCard] Using content's bucketId: ${content.bucketId}`);
      return content.bucketId;
    }
    
    console.log(`[ContentCard] No pillar ID found, card won't be properly restored`);
    return undefined;
  };
  
  const pillarToRestoreTo = determinePillarToRestoreTo();
  
  const getTargetPillarName = () => {
    if (!pillarToRestoreTo) {
      return "Unknown Pillar";
    }
    
    const targetPillar = pillars.find(p => p.id === pillarToRestoreTo);
    
    if (targetPillar) {
      return targetPillar.name;
    }
    
    return `Pillar ${pillarToRestoreTo}`;
  };
  
  const targetPillarName = getTargetPillarName();
  
  useEffect(() => {
    if (content.bucketId) {
      try {
        const savedFormats = localStorage.getItem(`content-formats-${pillar.id}`);
        if (savedFormats) {
          const parsedFormats = JSON.parse(savedFormats);
          const format = parsedFormats.find((f: any) => f.id === content.bucketId);
          if (format) {
            setFormatName(format.name);
          }
        }
      } catch (error) {
        console.error("Failed to load content format name:", error);
      }
    }
  }, [content.bucketId, pillar.id]);
  
  const getContentFormat = () => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    
    if (content.format === 'text' && content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        return parsedContent.format || formatName;
      } catch {
        return formatName;
      }
    }
    
    return formatName;
  };

  const getPlatforms = () => {
    if (content.platforms && content.platforms.length > 0) {
      return content.platforms;
    }
    
    if (content.format === 'text' && content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        if (parsedContent.platforms && Array.isArray(parsedContent.platforms)) {
          return parsedContent.platforms;
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  const getUniqueTags = () => {
    if (!content.tags || !Array.isArray(content.tags)) return [];
    
    return [...new Set(content.tags)];
  };

  const platforms = getPlatforms();
  const uniqueTags = getUniqueTags();
  const contentFormat = getContentFormat();

  const handleSchedule = () => {
    setShowScheduler(!showScheduler);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && onScheduleContent) {
      onScheduleContent(content.id, newDate);
      toast.success(`"${content.title}" scheduled for ${format(newDate, "MMMM d, yyyy")}`);
      setShowScheduler(false);
    }
  };

  const handleSendToCalendar = () => {
    try {
      let readyToScheduleContent = [];
      const storedContent = localStorage.getItem('readyToScheduleContent');
      
      if (storedContent) {
        readyToScheduleContent = JSON.parse(storedContent);
      }
      
      const existingIndex = readyToScheduleContent.findIndex((item: ContentItem) => item.id === content.id);
      
      if (existingIndex >= 0) {
        toast.info(`"${content.title}" is already in your calendar`);
        return;
      }
      
      const contentToSchedule = {
        ...content,
        format: contentFormat,
        platforms: platforms,
        tags: uniqueTags,
        originalPillarId: content.originalPillarId || pillar.id
      };
      
      readyToScheduleContent.push(contentToSchedule);
      localStorage.setItem('readyToScheduleContent', JSON.stringify(readyToScheduleContent));
      
      onDeleteContent(content.id);
      
      toast.success(`"${content.title}" sent to Content Calendar`);
    } catch (error) {
      console.error("Error sending to calendar:", error);
      toast.error("Failed to send to Content Calendar");
    }
  };

  const handleRestoreToIdeas = () => {
    if (onRestoreToIdeas) {
      if (!pillarToRestoreTo) {
        toast.warning(`"${content.title}" has no original pillar information`, {
          description: "Will try to restore based on available information",
          duration: 5000
        });
      }
      
      console.log(`[ContentCard] Restoring content "${content.title}" to pillar ID: ${pillarToRestoreTo || "undefined"}`);
      
      onRestoreToIdeas(content, pillarToRestoreTo);
      
      toast.success(`"${content.title}" will be restored to Idea Development`, {
        description: `Navigate to Idea Development to see this content in ${targetPillarName}`,
        duration: 5000
      });
      
      setTimeout(() => {
        toast.info("To see your restored content, go to Idea Development page", {
          duration: 8000,
          action: {
            label: "Got it",
            onClick: () => {}
          }
        });
      }, 500);
    }
  };

  return (
    <Card className="overflow-hidden relative h-full border-2 w-full">
      {onRestoreToIdeas && (
        <div className="absolute top-2 right-2 z-10">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Restore to Ideas"
                  className="h-8 w-8 p-0 bg-white hover:bg-blue-50 hover:text-blue-600"
                  onClick={handleRestoreToIdeas}
                >
                  <CornerUpLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black border shadow-md">
                <p>Restore to Idea Development ({targetPillarName})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-bold mb-1 line-clamp-2">
          {content.title}
          {date && (
            <Badge variant="outline" className="ml-2 text-xs">
              {format(date, "MMM d")}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {content.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {contentFormat && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileText className="h-3 w-3 mr-0.5" />
              {contentFormat}
            </span>
          )}
          
          {platforms.length > 0 && platforms.slice(0, 2).map((platform, index) => (
            <span 
              key={`platform-${index}`} 
              className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full"
            >
              {platform}
            </span>
          ))}
          
          {uniqueTags.length > 0 ? (
            uniqueTags.slice(0, 2).map((tag, index) => (
              <span 
                key={`tag-${index}`} 
                className={`text-xs px-2 py-0.5 rounded-full ${getTagColorClasses(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : null}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <span>
            {content.dateCreated ? formatDistanceToNow(new Date(content.dateCreated), { addSuffix: true }) : 'Unknown date'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Schedule Content"
                  className="h-8 w-8 p-0"
                  onClick={handleSchedule}
                >
                  <CalendarClock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black border shadow-md">
                <p>Schedule content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteContent(content.id)}
            aria-label="Delete"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditContent(content.id)}
            aria-label="Edit"
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      {showScheduler && (
        <div className="absolute bottom-16 left-0 p-2 bg-white rounded-md shadow-lg z-20 w-full">
          <DateSchedulePicker 
            date={date}
            onDateChange={handleDateChange}
            label="Schedule for"
            className="w-full"
          />
        </div>
      )}
    </Card>
  );
};

export default ContentCard;
