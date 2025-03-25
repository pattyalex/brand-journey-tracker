
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContentItem } from "@/types/content";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";

type ContentType = {
  id: string;
  name: string;
  description: string;
  items: ContentItem[];
};

interface ContentTypeBucketsProps {
  onAddIdea: (formatId: string) => void;
  pillarId: string;
}

const ContentTypeBuckets = ({ onAddIdea, pillarId }: ContentTypeBucketsProps) => {
  const { toast } = useToast();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    { id: "blog", name: "Blog Posts", description: "Long-form written content", items: [] },
    { id: "video", name: "Video Content", description: "Video-based content", items: [] },
    { id: "social", name: "Social Media", description: "Short-form posts", items: [] },
    { id: "image", name: "Image Content", description: "Visual content", items: [] },
  ]);
  
  const [newFormatName, setNewFormatName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAddingFormat, setIsAddingFormat] = useState(false);
  const [editingFormatId, setEditingFormatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const [showFullDescription, setShowFullDescription] = useState<string | null>(null);

  const [cardPositions, setCardPositions] = useState<Record<string, { top: number, left: number }>>({});
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem(`content-formats-${pillarId}`);
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        const formats = parsedFormats.map((format: any) => {
          return { 
            ...format, 
            description: format.description || "" 
          };
        });
        setContentTypes(formats);
      }
    } catch (error) {
      console.error("Failed to load content formats:", error);
    }
  }, [pillarId]);

  useEffect(() => {
    try {
      const formatsToSave = contentTypes.map(format => {
        return {
          ...format
        };
      });
      
      localStorage.setItem(`content-formats-${pillarId}`, JSON.stringify(formatsToSave));
    } catch (error) {
      console.error("Failed to save content formats:", error);
    }
  }, [contentTypes, pillarId]);

  useEffect(() => {
    if (editingFormatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingFormatId]);

  useEffect(() => {
    if (isEditingDescription && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const container = cardsContainerRef.current;
      const cardElements = container.querySelectorAll('[data-card-id]');
      const positions: Record<string, { top: number, left: number }> = {};
      
      cardElements.forEach((cardElement) => {
        const cardId = cardElement.getAttribute('data-card-id');
        if (cardId) {
          const rect = cardElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          positions[cardId] = { 
            top: rect.top - containerRect.top, 
            left: rect.left - containerRect.left 
          };
        }
      });
      
      setCardPositions(positions);
    }
  }, [contentTypes, isAddingFormat, expandedCardId]);

  const handleAddFormat = () => {
    if (!newFormatName.trim()) return;
    
    setContentTypes([
      ...contentTypes,
      { 
        id: `custom-${Date.now()}`, 
        name: newFormatName, 
        description: newDescription,
        items: [] 
      }
    ]);
    
    setNewFormatName("");
    setNewDescription("");
    setIsAddingFormat(false);
  };

  const handleDoubleClick = (formatId: string, currentName: string, currentDesc: string) => {
    setEditingFormatId(formatId);
    setEditingName(currentName);
    setEditingDescription(currentDesc);
  };

  const handleDescriptionDoubleClick = (formatId: string, description: string) => {
    setEditingFormatId(formatId);
    setIsEditingDescription(true);
    setEditingDescription(description);
  };

  const handleEditSubmit = () => {
    if (!editingFormatId) {
      return;
    }

    setContentTypes(contentTypes.map(type => 
      type.id === editingFormatId ? 
        { ...type, 
          name: editingName.trim() ? editingName : type.name, 
          description: editingDescription 
        } : type
    ));
    
    setEditingFormatId(null);
    setIsEditingDescription(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingFormatId(null);
      setIsEditingDescription(false);
    }
  };

  const handleBlur = () => {
    handleEditSubmit();
  };

  const handleDeleteFormat = (e: React.MouseEvent, formatId: string) => {
    e.stopPropagation();
    
    setContentTypes(contentTypes.filter(type => type.id !== formatId));
    
    if (expandedCardId === formatId) {
      setExpandedCardId(null);
    }
    
    toast({
      title: "Format deleted",
      description: "The content format has been removed",
    });
  };

  const toggleCardExpansion = (formatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardId(prev => prev === formatId ? null : formatId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 12
      }
    }
  };

  return (
    <div className="mt-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-3"
      >
        <h2 className="text-xl font-semibold">Content Formats</h2>
      </motion.div>
      
      {isAddingFormat && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mb-3 flex flex-col gap-2"
        >
          <Input
            value={newFormatName}
            onChange={(e) => setNewFormatName(e.target.value)}
            placeholder="Format name"
            className="max-w-xs"
            autoFocus
          />
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="max-w-xs mb-2"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddFormat} size="sm">Add</Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsAddingFormat(false);
                setNewFormatName("");
                setNewDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        ref={cardsContainerRef} 
        className="flex flex-wrap gap-3 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={pillarId}
      >
        {contentTypes.map((type) => (
          <motion.div 
            key={type.id} 
            data-card-id={type.id}
            className={`transition-all duration-200 ease-in-out ${expandedCardId === type.id ? 'z-10' : 'z-0'}`}
            style={{
              position: expandedCardId === type.id ? 'absolute' : 'relative',
              top: expandedCardId === type.id ? cardPositions[type.id]?.top || 0 : 'auto',
              left: expandedCardId === type.id ? cardPositions[type.id]?.left || 0 : 'auto',
            }}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 10px 25px rgba(0,0,0,0.07)",
              transition: { duration: 0.2 }
            }}
          >
            <Collapsible
              open={expandedCardId === type.id}
              onOpenChange={() => setExpandedCardId(expandedCardId === type.id ? null : type.id)}
              className={`transition-all duration-200 ease-in-out ${expandedCardId === type.id ? 'w-[300px]' : 'w-[200px]'}`}
            >
              <Card 
                className={`border rounded-lg shadow-sm relative group hover:border-purple-300 transition-all 
                  ${expandedCardId === type.id ? 'w-[300px] bg-white' : 'w-[200px]'}`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-gray-100"
                  onClick={(e) => handleDeleteFormat(e, type.id)}
                  title="Delete format"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                </Button>
                
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-1 right-8 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {expandedCardId === type.id ? 
                      <ChevronUp className="h-4 w-4 text-purple-500" /> : 
                      <ChevronDown className="h-4 w-4 text-purple-500" />
                    }
                  </Button>
                </CollapsibleTrigger>
                
                <div className="p-3">
                  <div 
                    className="flex items-center gap-2 mb-1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleDoubleClick(type.id, type.name, type.description || "");
                    }}
                    title="Double-click to edit"
                  >
                    {editingFormatId === type.id && !isEditingDescription ? (
                      <Input
                        ref={editInputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleBlur}
                        className="h-7 py-1 px-2 min-w-0 text-sm font-medium"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {type.name}
                      </span>
                    )}
                  </div>
                  
                  <CollapsibleContent className="transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div
                      className="mt-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDescriptionDoubleClick(type.id, type.description || "");
                      }}
                      title="Double-click to edit description"
                    >
                      {editingFormatId === type.id && isEditingDescription ? (
                        <Input
                          ref={descInputRef}
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleBlur}
                          className="h-7 py-1 px-2 min-w-0 text-xs mt-2"
                          placeholder="Short description"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                          {type.description}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                  
                  {!expandedCardId || expandedCardId !== type.id ? (
                    <div
                      className="mt-1 h-8 overflow-hidden relative"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDescriptionDoubleClick(type.id, type.description || "");
                      }}
                      title="Double-click to edit description"
                    >
                      {editingFormatId === type.id && isEditingDescription ? (
                        <Input
                          ref={descInputRef}
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleBlur}
                          className="h-7 py-1 px-2 min-w-0 text-xs"
                          placeholder="Short description"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {type.description}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </Card>
            </Collapsible>
          </motion.div>
        ))}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(249, 244, 255, 0.7)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAddingFormat(!isAddingFormat)}
                  className="w-[200px] h-[80px] flex items-center justify-center p-0"
                >
                  <Plus className="h-5 w-5 text-purple-500" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add format</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

export default ContentTypeBuckets;
