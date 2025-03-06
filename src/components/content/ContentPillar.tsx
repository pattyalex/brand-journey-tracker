
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ContentCard from "./ContentCard";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
  const [isGridView, setIsGridView] = useState(() => {
    // Load saved preference from localStorage or default to true (grid view)
    const saved = localStorage.getItem(`layout-${pillar.id}`);
    return saved ? saved === 'grid' : true;
  });

  useEffect(() => {
    console.log("ContentPillar received pillar:", pillar.id, pillar.name);
    console.log("ContentPillar content count:", pillar.content.length);
    console.log("ContentPillar content items:", pillar.content);
  }, [pillar]);
  
  // Save layout preference when it changes
  useEffect(() => {
    localStorage.setItem(`layout-${pillar.id}`, isGridView ? 'grid' : 'row');
  }, [isGridView, pillar.id]);
  
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
    setIsGridView(prev => !prev);
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
    if (isGridView) {
      return [filteredContent]; // In grid view, return all content in a single array
    }
    
    // In row view, group content into groups of 3 items
    const rows = [];
    for (let i = 0; i < filteredContent.length; i += 3) {
      rows.push(filteredContent.slice(i, i + 3));
    }
    return rows;
  };

  const contentRows = getContentRows();

  return (
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
        <>
          <div className="flex justify-end mb-2">
            <div className="flex items-center space-x-2">
              <List className={`h-4 w-4 ${!isGridView ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch 
                checked={isGridView}
                onCheckedChange={toggleLayout}
                aria-label="Toggle layout view"
              />
              <Grid2X2 className={`h-4 w-4 ${isGridView ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
          
          {isGridView ? (
            // Grid view layout
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable 
                droppableId={`content-cards-${pillar.id}`} 
                direction="vertical"
              >
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-4 p-2"
                  >
                    {filteredContent.map((content, index) => (
                      <div key={content.id}>
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
            </DragDropContext>
          ) : (
            // Row view layout with multiple rows of 3 items each
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
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable 
                        droppableId={`content-cards-row-${rowIndex}-${pillar.id}`} 
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
                                  index={index + (rowIndex * 3)}
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
                    </DragDropContext>
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
        </>
      )}
    </div>
  );
};

export default ContentPillar;
