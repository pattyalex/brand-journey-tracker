
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";

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
            className={`overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {content.title}
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
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteContent(content.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditContent(content.id)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              
              <div className="flex items-center">
                <Select
                  onValueChange={(value) => onMoveContent(value, content.id)}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Move to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars
                      .filter(p => p.id !== pillar.id)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ContentCard;
