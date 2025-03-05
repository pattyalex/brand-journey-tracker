
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Draggable } from "react-beautiful-dnd";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { MoreHorizontal, Trash2, Edit, ArrowLeftRight, ExternalLink, Image, File, FileText, Video } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { getTagColorClasses } from "@/utils/tagColors";
import CustomPropertiesMenu from "./CustomPropertiesMenu";
import { toast } from "sonner";

interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
}

const ContentCard = ({
  content,
  index,
  pillar,
  pillars,
  onDeleteContent,
  onMoveContent,
  onEditContent
}: ContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Update content when custom properties change
  const handleUpdateContent = (updatedContent: ContentItem) => {
    // Find the content in the current pillar and update it
    const pillarIndex = pillars.findIndex(p => p.id === pillar.id);
    
    if (pillarIndex !== -1) {
      const contentIndex = pillars[pillarIndex].content.findIndex(c => c.id === content.id);
      
      if (contentIndex !== -1) {
        // Create a deep copy of the pillars array
        const updatedPillars = JSON.parse(JSON.stringify(pillars));
        // Update the specific content item
        updatedPillars[pillarIndex].content[contentIndex] = updatedContent;
        
        // Update localStorage
        localStorage.setItem('contentPillars', JSON.stringify(updatedPillars));
        
        // Force a re-render by updating the window location
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const getContentIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'image':
        return <Image className="h-4 w-4 mr-1" />;
      case 'video':
        return <Video className="h-4 w-4 mr-1" />;
      case 'document':
        return <File className="h-4 w-4 mr-1" />;
      case 'text':
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  const otherPillars = pillars.filter(p => p.id !== pillar.id);

  return (
    <Draggable draggableId={content.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="bg-white overflow-hidden transition-all duration-200">
            <CardHeader className="p-3 pb-0 flex justify-between items-start space-y-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  {getContentIcon(content.format)}
                  <span>{content.format.charAt(0).toUpperCase() + content.format.slice(1)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDistanceToNow(content.dateCreated, { addSuffix: true })}</span>
                </div>
                <h3 
                  className="font-medium text-base leading-tight cursor-pointer hover:text-blue-600 transition-colors truncate"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {content.title}
                </h3>
              </div>
              
              <div className="flex">
                <CustomPropertiesMenu content={content} onUpdate={handleUpdateContent} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditContent(content.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    
                    {otherPillars.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full p-2 flex items-center text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-default">
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Move to
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                          {otherPillars.map(p => (
                            <DropdownMenuItem key={p.id} onClick={() => onMoveContent(p.id, content.id)}>
                              {p.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onDeleteContent(content.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className={`p-3 ${isExpanded ? '' : 'hidden'}`}>
              <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
              
              {/* Display custom properties */}
              {content.customProperties && content.customProperties.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Properties:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.customProperties.map((prop, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-0.5 rounded-full ${prop.color}`}
                      >
                        {prop.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {content.platforms && content.platforms.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Platforms:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.platforms.map((platform, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {content.tags && content.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-0.5 rounded-full ${getTagColorClasses(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-3 pt-0 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ContentCard;
