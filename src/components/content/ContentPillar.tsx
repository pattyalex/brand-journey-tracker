
import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Trash2, ArrowUpRight, MoveRight, Calendar, Tag, Pencil } from "lucide-react";
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

interface ContentPillarProps {
  pillar: Pillar;
  pillars: Pillar[];
  onRename: (newName: string) => void;
  onDelete: () => void;
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  searchQuery: string;
  onReorderContent?: (items: ContentItem[]) => void;
}

const ContentPillar = ({
  pillar,
  pillars,
  onRename,
  onDelete,
  onDeleteContent,
  onMoveContent,
  onEditContent,
  searchQuery,
  onReorderContent
}: ContentPillarProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(pillar.name);
  // Add state to track content for debugging
  const [debugContent, setDebugContent] = useState<ContentItem[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  
  // Debug effect to log content changes
  useEffect(() => {
    console.log("ContentPillar content:", pillar.content);
    setDebugContent(pillar.content);
    setItems(pillar.content);
  }, [pillar.content]);

  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName);
      setIsRenaming(false);
    }
  };

  const startRenaming = () => {
    setNewName(pillar.name);
    setIsRenaming(true);
  };
  
  const filteredContent = searchQuery
    ? pillar.content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pillar.content;

  // Function to check if content is "Spring Outfit Proba"
  const isSpringOutfitProba = (content: ContentItem) => {
    return content.title.includes("Spring Outfit Proba");
  };

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
    const newItems = Array.from(filteredContent);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    // Update state
    setItems(newItems);
    
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
            <Droppable droppableId="content-cards">
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
                            className={`overflow-hidden ${isSpringOutfitProba(content) ? 'ring-2 ring-[#9b87f5] bg-purple-50 shadow-md' : ''} ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-lg">
                                {isSpringOutfitProba(content) ? (
                                  <span className="relative font-semibold text-[#7E69AB]">
                                    {content.title}
                                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6BCFA] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
                                    </span>
                                  </span>
                                ) : (
                                  content.title
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
                                  className={isSpringOutfitProba(content) ? 'bg-[#D6BCFA] text-[#6E59A5] hover:bg-[#C4A0FA] border-[#9b87f5]' : ''}
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
