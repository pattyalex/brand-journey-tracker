
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Pencil, FileText, Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
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
  const navigate = useNavigate();
  
  const getContentFormat = () => {
    if (content.format === 'text' && content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        return parsedContent.format;
      } catch {
        return null;
      }
    }
    return null;
  };

  const contentFormat = getContentFormat();

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

  const platforms = getPlatforms();

  const handleSendToCalendar = () => {
    const scheduledContents = JSON.parse(localStorage.getItem('scheduledContents') || '[]');
    
    const existingIndex = scheduledContents.findIndex((item: ContentItem) => item.id === content.id);
    
    if (existingIndex >= 0) {
      toast.info(`"${content.title}" is already in your calendar`);
    } else {
      scheduledContents.push(content);
      localStorage.setItem('scheduledContents', JSON.stringify(scheduledContents));
      toast.success(`"${content.title}" sent to Content Calendar`);
    }
    
    navigate('/content-calendar');
  };

  return (
    <Card className="overflow-hidden relative h-full border-2 w-full">
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
          
          {content.tags && content.tags.length > 0 ? (
            content.tags.slice(0, 2).map((tag, index) => (
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
          <Button
            variant="outline"
            size="sm"
            aria-label="Send to Calendar"
            className="h-8 flex items-center gap-1 px-2"
            onClick={handleSendToCalendar}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Calendar</span>
          </Button>
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
    </Card>
  );
};

export default ContentCard;
