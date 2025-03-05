
import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Trash2, ArrowUpRight, MoveRight, Calendar, Tag, Pencil, Edit, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ContentPillarProps {
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  searchQuery: string;
  onReorderContent?: (items: ContentItem[]) => void;
}

const ContentPillar = ({
  pillar,
  pillars,
  onDeleteContent,
  onMoveContent,
  onEditContent,
  searchQuery,
  onReorderContent
}: ContentPillarProps) => {
  // Debug logging to track what's happening with the content
  useEffect(() => {
    console.log("ContentPillar received pillar:", pillar.id, pillar.name);
    console.log("ContentPillar content count:", pillar.content.length);
    console.log("ContentPillar content items:", pillar.content);
  }, [pillar]);
  
  const filteredContent = searchQuery
    ? pillar.content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pillar.content;

  // Function to parse JSON content
  const parseContentData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse content data:", error);
      return { script: jsonString };
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside of a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Reorder the content
    const newItems = Array.from(pillar.content);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    // Notify parent component of reordering
    if (onReorderContent) {
      onReorderContent(newItems);
    }
  };

  return (
    <div className="space-y-4">
      {filteredContent.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground">
            {searchQuery 
              ? "No matching content found" 
              : "No ideas yet. Create a new idea to get started."}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`content-cards-${pillar.id}`}>
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {filteredContent.map((content, index) => (
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
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      )}
    </div>
  );
};

export default ContentPillar;
