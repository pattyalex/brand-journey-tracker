import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="mt-4 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Buckets</h2>
        
        <Button 
          variant="outline" 
          onClick={() => setIsAddingBucket(!isAddingBucket)}
          className="flex items-center gap-2 h-10 px-4 py-2 rounded-xl border-2"
        >
          <Plus className="h-5 w-5" />
          Add Bucket
        </Button>
      </div>
      
      {isAddingBucket && (
        <div className="mb-6 flex flex-col gap-2">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {contentTypes.map((type) => (
          <Card 
            key={type.id} 
            className="border rounded-xl p-4 hover:border-gray-300 transition-all cursor-pointer"
            onClick={() => onAddIdea(type.id)}
          >
            <div className="flex items-center gap-3 mb-2">
              <type.icon className="h-5 w-5 flex-shrink-0 text-gray-700" />
              <div className="flex items-center gap-1">
                <span className="text-md font-medium">👤</span>
                <span className="text-md font-medium">{type.name}</span>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mt-1">
              {type.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentTypeBuckets;
