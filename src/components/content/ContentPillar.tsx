
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ContentCard from "./ContentCard";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
    
    // Get the flat index from row-based indexes
    const sourceRow = parseInt(source.droppableId.split('-').pop() || '0');
    const destRow = parseInt(destination.droppableId.split('-').pop() || '0');
    
    const itemsPerRow = 3;
    const sourceIndex = (sourceRow * itemsPerRow) + source.index;
    const destIndex = (destRow * itemsPerRow) + destination.index;
    
    const newItems = Array.from(pillar.content);
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destIndex, 0, removed);
    
    if (onReorderContent) {
      onReorderContent(newItems);
      toast.success("Content order updated");
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
      // Set right arrow visibility based on content
      setShowRightArrow(scrollContainer.scrollWidth > scrollContainer.clientWidth);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filteredContent]);

  // Function to group content into rows of 3
  const getContentRows = () => {
    // Group content into groups of 3 items
    const rows = [];
    for (let i = 0; i < filteredContent.length; i += 3) {
      rows.push(filteredContent.slice(i, i + 3));
    }
    return rows;
  };

  const contentRows = getContentRows();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4 relative">
        {filteredContent.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No matching content found" 
                : "No ideas yet. Create a new idea to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contentRows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative">
                {row.length > 3 && showLeftArrow && (
                  <Button 
                    onClick={scrollLeft} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10 p-0 bg-white bg-opacity-70 shadow-lg hover:bg-opacity-100 border border-gray-200"
                    variant="outline"
                    size="icon"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                
                <div 
                  ref={scrollContainerRef} 
                  className="flex items-start space-x-4 overflow-x-auto pb-4 hide-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <Droppable 
                    droppableId={`content-cards-row-${rowIndex}`} 
                    direction="horizontal"
                  >
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex space-x-4 min-w-min pb-2 pl-2 pr-2"
                      >
                        {row.map((content, index) => (
                          <div 
                            key={content.id} 
                            className="min-w-[280px] max-w-[280px]"
                          >
                            <ContentCard
                              content={content}
                              index={index}
                              pillar={pillar}
                              pillars={pillars}
                              onDeleteContent={onDeleteContent}
                              onMoveContent={onMoveContent}
                              onEditContent={onEditContent}
                            />
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                
                {row.length > 3 && showRightArrow && (
                  <Button 
                    onClick={scrollRight} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10 p-0 bg-white bg-opacity-70 shadow-lg hover:bg-opacity-100 border border-gray-200"
                    variant="outline"
                    size="icon"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default ContentPillar;
