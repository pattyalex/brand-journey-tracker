
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ContentCard from "./ContentCard";
import { toast } from "sonner";

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

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    const newItems = Array.from(pillar.content);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    if (onReorderContent) {
      onReorderContent(newItems);
      toast.success("Content order updated");
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
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4"
                >
                  {filteredContent.map((content, index) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      index={index}
                      pillar={pillar}
                      pillars={pillars}
                      onDeleteContent={onDeleteContent}
                      onMoveContent={onMoveContent}
                      onEditContent={onEditContent}
                    />
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
