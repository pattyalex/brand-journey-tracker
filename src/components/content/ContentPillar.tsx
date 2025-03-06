
import { useState, useEffect, useRef } from "react";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ContentCard from "./ContentCard";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Layout, LayoutGrid } from "lucide-react";
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
  const [isSingleRowLayout, setIsSingleRowLayout] = useState(true);

  useEffect(() => {
    console.log("ContentPillar received pillar:", pillar.id, pillar.name);
    console.log("ContentPillar content count:", pillar.content.length);
    console.log("ContentPillar content items:", pillar.content);
  }, [pillar]);
  
  const filteredContent = searchQuery
    ? pillar.content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
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

  const toggleLayout = () => {
    setIsSingleRowLayout(!isSingleRowLayout);
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

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLayout}
          className="text-xs flex items-center gap-1"
        >
          {isSingleRowLayout ? (
            <>
              <LayoutGrid className="h-4 w-4" />
              <span>Grid Layout</span>
            </>
          ) : (
            <>
              <Layout className="h-4 w-4" />
              <span>Row Layout</span>
            </>
          )}
        </Button>
      </div>
      
      {filteredContent.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground">
            {searchQuery 
              ? "No matching content found" 
              : "No ideas yet. Create a new idea to get started."}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="relative">
            {isSingleRowLayout && showLeftArrow && (
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
              className={`${isSingleRowLayout ? "overflow-x-auto pb-4 hide-scrollbar" : "overflow-visible"}`}
              style={isSingleRowLayout ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
            >
              <Droppable 
                droppableId={`content-cards-${pillar.id}`} 
                direction={isSingleRowLayout ? "horizontal" : "vertical"}
                type="CONTENT"
              >
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      ${isSingleRowLayout 
                        ? "flex space-x-6 min-w-min pb-4 pl-2 pr-2" 
                        : "grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 pl-2 pr-2"}
                    `}
                  >
                    {filteredContent.map((content, index) => (
                      <div key={content.id} className={`${isSingleRowLayout ? "min-w-[320px] max-w-[320px]" : ""}`}>
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
            
            {isSingleRowLayout && showRightArrow && (
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
        </DragDropContext>
      )}
    </div>
  );
};

export default ContentPillar;
