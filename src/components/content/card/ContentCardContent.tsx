
import { ContentItem } from "@/types/content";
import { CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getTagColorClasses } from "@/utils/tagColors";

interface ContentCardContentProps {
  content: ContentItem;
  contentFormat: string;
  platforms: string[];
  uniqueTags: string[];
}

export const ContentCardContent = ({ 
  content, 
  contentFormat, 
  platforms, 
  uniqueTags 
}: ContentCardContentProps) => {
  return (
    <CardContent className="p-4 pt-0">
      <div className="flex flex-wrap gap-1 mb-2">
        {contentFormat && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <FileText className="h-3 w-3 mr-0.5" />
            {contentFormat}
          </span>
        )}
        
        {platforms.length > 0 && platforms.map((platform, index) => (
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
  );
};
