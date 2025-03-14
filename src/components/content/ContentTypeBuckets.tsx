
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
            className="w-[200px] border rounded-lg shadow-sm cursor-pointer hover:border-purple-300 transition-all relative group"
            onClick={() => handleCardClick(type.id)}
          >
            {/* Trash Icon for Deletion - Positioned absolute on the top right */}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className={`absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-gray-100 ${
                ["blog", "video", "social", "image"].includes(type.id) ? "cursor-not-allowed" : ""
              }`}
              onClick={(e) => handleDeleteBucket(e, type.id)}
              title={["blog", "video", "social", "image"].includes(type.id) ? "Cannot delete default bucket" : "Delete bucket"}
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
                <type.icon className="h-4 w-4 flex-shrink-0 text-gray-700" />
                {editingBucketId === type.id && !isEditingDescription ? (
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
                {editingBucketId === type.id && isEditingDescription ? (
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
                variant="ghost" 
                onClick={() => setIsAddingBucket(!isAddingBucket)}
                className="w-[200px] h-[80px] flex items-center justify-center p-0"
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
