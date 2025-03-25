import { useState, useEffect, useRef } from "react";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import ContentCard from "./ContentCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.platforms && item.platforms.some(platform => 
          platform.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : pillar.content;

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    const newItems = Array.from(filteredContent);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    if (onReorderContent) {
      onReorderContent(newItems);
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
      handleScroll();
      setShowRightArrow(scrollContainer.scrollWidth > scrollContainer.clientWidth);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filteredContent]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, x: 80 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.45,
        delay: 0.15,
        ease: "easeOut"
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div 
        className="space-y-2 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {filteredContent.length === 0 ? (
          <motion.div 
            className="text-center p-8 border border-dashed rounded-lg bg-muted/30"
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No matching content found" 
                : "No ideas yet. Create a new idea to get started."}
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            {filteredContent.length > 3 && showLeftArrow && (
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
              className="overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'thin' }}
            >
              <Droppable droppableId="content-cards" direction="horizontal">
                {(provided) => (
                  <motion.div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 min-w-min px-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {filteredContent.map((content, index) => (
                        <Draggable
                          key={content.id}
                          draggableId={content.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'opacity-70' : 'opacity-100'} max-w-[360px]`}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                              variants={itemVariants}
                            >
                              <ContentCard
                                content={content}
                                index={index}
                                pillar={pillar}
                                pillars={pillars}
                                onDeleteContent={onDeleteContent}
                                onEditContent={onEditContent}
                              />
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>
            </div>
            
            {filteredContent.length > 3 && showRightArrow && (
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
        )}
      </motion.div>
    </DragDropContext>
  );
};

export default ContentPillar;
