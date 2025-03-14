
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContentItem } from "@/types/content";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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

const getPillarStickerDesigns = (pillarId: string) => {
  const pillarIndex = parseInt(pillarId) - 1;
  
  const pillarColorSchemes = [
    { 
      bg: "bg-purple-100", 
      border: "border-purple-300", 
      shadow: "shadow-purple-200"
    },
    { 
      bg: "bg-orange-100", 
      border: "border-orange-300", 
      shadow: "shadow-orange-200"
    },
    { 
      bg: "bg-teal-100", 
      border: "border-teal-300", 
      shadow: "shadow-teal-200"
    },
    { 
      bg: "bg-pink-100", 
      border: "border-pink-300", 
      shadow: "shadow-pink-200"
    },
    { 
      bg: "bg-blue-100", 
      border: "border-blue-300", 
      shadow: "shadow-blue-200"
    },
    { 
      bg: "bg-green-100", 
      border: "border-green-300", 
      shadow: "shadow-green-200"
    }
  ];
  
  const colorIndex = pillarIndex >= 0 && pillarIndex < pillarColorSchemes.length 
    ? pillarIndex 
    : 0;
  
  return pillarColorSchemes[colorIndex];
};

const ContentTypeBuckets = ({ onAddIdea, pillarId }: ContentTypeBucketsProps) => {
  const { toast } = useToast();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    { id: "blog", name: "Blog Posts", description: "Long-form written content", items: [] },
    { id: "video", name: "Video Content", description: "Video-based content", items: [] },
    { id: "social", name: "Social Media", description: "Short-form posts", items: [] },
    { id: "image", name: "Image Content", description: "Visual content", items: [] },
  ]);
  
  const stickerDesign = getPillarStickerDesigns(pillarId);
  
  const getPillarAddButtonStyles = () => {
    const pillarIndex = parseInt(pillarId) - 1;
    const colors = [
      "border-purple-300 hover:border-purple-500 text-purple-500 bg-purple-50/50",
      "border-orange-300 hover:border-orange-500 text-orange-500 bg-orange-50/50",
      "border-teal-300 hover:border-teal-500 text-teal-500 bg-teal-50/50",
      "border-pink-300 hover:border-pink-500 text-pink-500 bg-pink-50/50",
      "border-blue-300 hover:border-blue-500 text-blue-500 bg-blue-50/50",
      "border-green-300 hover:border-green-500 text-green-500 bg-green-50/50"
    ];
    return colors[pillarIndex >= 0 && pillarIndex < colors.length ? pillarIndex : 0];
  };
  
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

  const handleCardClick = (formatId: string) => {
    if (editingFormatId === formatId) return;
    
    setExpandedCardId(prev => prev === formatId ? null : formatId);
  };

  const addButtonStyles = getPillarAddButtonStyles();

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Content Formats</h2>
      </div>
      
      {isAddingFormat && (
        <div className="mb-3 flex flex-col gap-2">
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
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        {contentTypes.map((type, index) => (
          <Card 
            key={type.id} 
            className={`w-[200px] relative ${stickerDesign.bg} ${stickerDesign.border} ${stickerDesign.shadow} rounded-lg border-2 hover:shadow-md transition-all cursor-pointer group`}
            style={{ 
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)', 
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleCardClick(type.id)}
          >
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-white/50 rounded-full"
              onClick={(e) => handleDeleteFormat(e, type.id)}
              title="Delete format"
            >
              <Trash2 className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            
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
              
              <div
                className="mt-1 h-8 overflow-hidden"
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
            </div>
          </Card>
        ))}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingFormat(!isAddingFormat)}
                className={`w-[200px] h-[84px] flex items-center justify-center p-0 border-dashed border-2 ${addButtonStyles}`}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add format</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ContentTypeBuckets;
