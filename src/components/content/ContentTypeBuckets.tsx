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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.04
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
      translateZ: 0
    }
  }
};

const ContentTypeBuckets = ({ onAddIdea, pillarId }: ContentTypeBucketsProps) => {
  const { toast } = useToast();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    { id: "blog", name: "Blog Posts", description: "Long-form written content", items: [] },
    { id: "video", name: "Video Content", description: "Video-based content", items: [] },
    { id: "social", name: "Social Media", description: "Short-form posts", items: [] },
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

  const pillarShadowColors = {
    "1": "shadow-[0_4px_20px_-4px_rgba(244,241,255,0.25)]",
    "2": "shadow-[0_4px_20px_-4px_rgba(233,228,255,0.25)]",
    "3": "shadow-[0_4px_20px_-4px_rgba(212,201,255,0.25)]",
    "4": "shadow-[0_4px_20px_-4px_rgba(192,180,255,0.25)]",
    "5": "shadow-[0_4px_20px_-4px_rgba(166,153,255,0.25)]",
    "6": "shadow-[0_4px_20px_-4px_rgba(140,126,255,0.25)]",
    "7": "shadow-[0_4px_20px_-4px_rgba(120,107,255,0.25)]",
    "8": "shadow-[0_4px_20px_-4px_rgba(100,86,255,0.25)]",
    "9": "shadow-[0_4px_20px_-4px_rgba(80,66,255,0.25)]",
    "10": "shadow-[0_4px_20px_-4px_rgba(60,40,255,0.25)]",
    "11": "shadow-[0_4px_20px_-4px_rgba(40,30,250,0.25)]",
    "12": "shadow-[0_4px_20px_-4px_rgba(20,16,249,0.25)]",
    "13": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "14": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "15": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "16": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "17": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "18": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "19": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "20": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "21": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "22": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "23": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "24": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "25": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "26": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "27": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "28": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "29": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "30": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "31": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "32": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "33": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "34": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "35": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "36": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "37": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "38": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "39": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "40": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "41": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "42": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "43": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "44": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "45": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "46": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "47": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "48": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "49": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "50": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "51": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "52": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "53": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "54": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "55": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "56": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "57": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "58": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "59": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "60": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "61": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "62": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "63": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "64": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "65": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "66": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "67": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "68": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "69": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "70": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "71": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "72": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "73": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "74": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "75": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "76": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "77": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "78": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "79": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "80": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "81": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "82": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "83": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "84": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "85": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "86": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "87": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "88": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "89": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "90": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "91": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "92": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "93": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "94": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "95": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "96": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "97": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "98": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "99": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
    "100": "shadow-[0_4px_20px_-4px_rgba(0,0,255,0.25)]",
  };

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

  return (
    <div className="mt-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex justify-between items-center mb-3"
      >
        <h2 className="text-xl font-semibold">Content Formats</h2>
      </motion.div>
      
      {isAddingFormat && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mb-3 flex flex-col gap-2"
          style={{ willChange: "transform, opacity" }}
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
        style={{ willChange: "transform, opacity" }}
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
              willChange: "transform, opacity",
              backfaceVisibility: "hidden"
            }}
            variants={cardVariants}
            layout
          >
            <Collapsible
              open={expandedCardId === type.id}
              onOpenChange={() => setExpandedCardId(expandedCardId === type.id ? null : type.id)}
              className={`transition-all duration-150 ease-in-out ${expandedCardId === type.id ? 'w-[300px]' : 'w-[200px]'}`}
            >
              <Card 
                className={`rounded-lg relative group transition-all 
                  ${pillarShadowColors[pillarId as keyof typeof pillarShadowColors] || pillarShadowColors["5"]}
                  ${expandedCardId === type.id ? 'w-[300px] bg-gradient-to-r from-[#F4F1FF]/5 to-[#E9E4FF]/5' : 'w-[200px] bg-white/80'} 
                  hover:shadow-[0_8px_28px_-4px_rgba(155,135,245,0.3)]`}
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
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.15 }}
                style={{ willChange: "transform" }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAddingFormat(!isAddingFormat)}
                  className={`w-[200px] h-[80px] flex items-center justify-center p-0 border-2 rounded-lg ${pillarShadowColors[pillarId as keyof typeof pillarShadowColors] || pillarShadowColors["5"]} hover:bg-[#F4F1FF]/5`}
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
