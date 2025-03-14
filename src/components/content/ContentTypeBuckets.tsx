
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileVideo, ImageIcon, Link, List, Plus, Trash2 } from "lucide-react";
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
  icon: React.ElementType;
  description: string;
  items: ContentItem[];
};

interface ContentTypeBucketsProps {
  onAddIdea: (bucketId: string) => void;
  pillarId: string;
}

const ContentTypeBuckets = ({ onAddIdea, pillarId }: ContentTypeBucketsProps) => {
  const { toast } = useToast();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    { id: "blog", name: "Blog Posts", icon: FileText, description: "Long-form written content", items: [] },
    { id: "video", name: "Video Content", icon: FileVideo, description: "Video-based content", items: [] },
    { id: "social", name: "Social Media", icon: List, description: "Short-form posts", items: [] },
    { id: "image", name: "Image Content", icon: ImageIcon, description: "Visual content", items: [] },
  ]);
  
  const [newBucketName, setNewBucketName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [editingBucketId, setEditingBucketId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`content-buckets-${pillarId}`);
      if (savedBuckets) {
        const parsedBuckets = JSON.parse(savedBuckets);
        const bucketsWithIcons = parsedBuckets.map((bucket: any) => {
          let icon;
          switch (bucket.iconType) {
            case 'FileText': icon = FileText; break;
            case 'FileVideo': icon = FileVideo; break;
            case 'List': icon = List; break;
            case 'ImageIcon': icon = ImageIcon; break;
            default: icon = Link; break;
          }
          return { 
            ...bucket, 
            icon,
            description: bucket.description || "" // Ensure description exists
          };
        });
        setContentTypes(bucketsWithIcons);
      }
    } catch (error) {
      console.error("Failed to load content buckets:", error);
    }
  }, [pillarId]);

  useEffect(() => {
    try {
      const bucketsToSave = contentTypes.map(bucket => {
        let iconType = 'Link';
        if (bucket.icon === FileText) iconType = 'FileText';
        if (bucket.icon === FileVideo) iconType = 'FileVideo';
        if (bucket.icon === List) iconType = 'List';
        if (bucket.icon === ImageIcon) iconType = 'ImageIcon';
        
        return {
          ...bucket,
          iconType,
          icon: undefined
        };
      });
      
      localStorage.setItem(`content-buckets-${pillarId}`, JSON.stringify(bucketsToSave));
    } catch (error) {
      console.error("Failed to save content buckets:", error);
    }
  }, [contentTypes, pillarId]);

  useEffect(() => {
    if (editingBucketId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingBucketId]);

  useEffect(() => {
    if (isEditingDescription && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleAddBucket = () => {
    if (!newBucketName.trim()) return;
    
    setContentTypes([
      ...contentTypes,
      { 
        id: `custom-${Date.now()}`, 
        name: newBucketName, 
        icon: Link, 
        description: newDescription,
        items: [] 
      }
    ]);
    
    setNewBucketName("");
    setNewDescription("");
    setIsAddingBucket(false);
  };

  const handleDoubleClick = (bucketId: string, currentName: string, currentDesc: string) => {
    setEditingBucketId(bucketId);
    setEditingName(currentName);
    setEditingDescription(currentDesc);
  };

  const handleDescriptionDoubleClick = (bucketId: string, description: string) => {
    setEditingBucketId(bucketId);
    setIsEditingDescription(true);
    setEditingDescription(description);
  };

  const handleEditSubmit = () => {
    if (!editingBucketId) {
      return;
    }

    setContentTypes(contentTypes.map(type => 
      type.id === editingBucketId ? 
        { ...type, 
          name: editingName.trim() ? editingName : type.name, 
          description: editingDescription 
        } : type
    ));
    
    setEditingBucketId(null);
    setIsEditingDescription(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingBucketId(null);
      setIsEditingDescription(false);
    }
  };

  const handleBlur = () => {
    handleEditSubmit();
  };

  const handleDeleteBucket = (e: React.MouseEvent, bucketId: string) => {
    e.stopPropagation();
    
    if (["blog", "video", "social", "image"].includes(bucketId)) {
      toast({
        title: "Cannot delete default bucket",
        description: "Default content buckets cannot be removed",
        variant: "destructive",
      });
      return;
    }
    
    setContentTypes(contentTypes.filter(type => type.id !== bucketId));
    
    if (expandedCardId === bucketId) {
      setExpandedCardId(null);
    }
    
    toast({
      title: "Bucket deleted",
      description: "The content bucket has been removed",
    });
  };

  const handleCardClick = (bucketId: string) => {
    if (editingBucketId === bucketId) return;
    
    setExpandedCardId(prev => prev === bucketId ? null : bucketId);
  };

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Content Buckets</h2>
      </div>
      
      {isAddingBucket && (
        <div className="mb-3 flex flex-col gap-2">
          <Input
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
            placeholder="Bucket name"
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
            <Button onClick={handleAddBucket} size="sm">Add</Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsAddingBucket(false);
                setNewBucketName("");
                setNewDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
        {contentTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`w-[160px] h-[80px] hover:border-purple-300 transition-all cursor-pointer group ${
              expandedCardId === type.id ? 
                'scale-125 border-purple-300 shadow-lg z-20 bg-white' : 
                'hover:scale-[1.02]'
            }`}
            onClick={() => handleCardClick(type.id)}
          >
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className={`absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 text-gray-500 hover:text-gray-700 hover:bg-gray-100 ${
                ["blog", "video", "social", "image"].includes(type.id) ? "cursor-not-allowed" : ""
              }`}
              onClick={(e) => handleDeleteBucket(e, type.id)}
              title={["blog", "video", "social", "image"].includes(type.id) ? "Cannot delete default bucket" : "Delete bucket"}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <CardHeader className={`p-1 pb-0 ${expandedCardId === type.id ? 'pt-2' : ''}`}>
              <CardTitle 
                className="text-sm flex items-center gap-1.5"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(type.id, type.name, type.description || "");
                }}
                title="Double-click to edit"
              >
                <type.icon className="h-3 w-3 flex-shrink-0" />
                {editingBucketId === type.id && !isEditingDescription ? (
                  <Input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleBlur}
                    className="h-6 py-0 px-1 min-w-0 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate">
                    {type.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className={`p-1 pt-0 ${expandedCardId === type.id ? 'pb-2' : ''}`}>
              <div
                className="h-8 overflow-hidden"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDescriptionDoubleClick(type.id, type.description || "");
                }}
                title="Double-click to edit description"
              >
                {editingBucketId === type.id && isEditingDescription ? (
                  <Input
                    ref={descInputRef}
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleBlur}
                    className="h-6 py-0 px-1 min-w-0 text-sm mt-1"
                    placeholder="Short description"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {type.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={() => setIsAddingBucket(!isAddingBucket)}
                className="w-[160px] h-[80px] flex items-center justify-center p-0"
              >
                <Plus className="h-5 w-5 text-purple-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add bucket</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ContentTypeBuckets;
