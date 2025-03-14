
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileVideo, ImageIcon, Link, List, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";

type ContentType = {
  id: string;
  name: string;
  icon: React.ElementType;
  items: ContentItem[];
};

interface ContentTypeBucketsProps {
  onAddIdea: (bucketId: string) => void;
  pillarId: string;
}

const ContentTypeBuckets = ({ onAddIdea, pillarId }: ContentTypeBucketsProps) => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    { id: "blog", name: "Blog Posts", icon: FileText, items: [] },
    { id: "video", name: "Video Content", icon: FileVideo, items: [] },
    { id: "social", name: "Social Media", icon: List, items: [] },
    { id: "image", name: "Image Content", icon: ImageIcon, items: [] },
  ]);
  
  const [newBucketName, setNewBucketName] = useState("");
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [editingBucketId, setEditingBucketId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load pillar-specific buckets from localStorage on mount and when pillarId changes
  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`content-buckets-${pillarId}`);
      if (savedBuckets) {
        const parsedBuckets = JSON.parse(savedBuckets);
        // Make sure icons are properly set since they can't be serialized
        const bucketsWithIcons = parsedBuckets.map((bucket: any) => {
          let icon;
          switch (bucket.iconType) {
            case 'FileText': icon = FileText; break;
            case 'FileVideo': icon = FileVideo; break;
            case 'List': icon = List; break;
            case 'ImageIcon': icon = ImageIcon; break;
            default: icon = Link; break;
          }
          return { ...bucket, icon };
        });
        setContentTypes(bucketsWithIcons);
      }
    } catch (error) {
      console.error("Failed to load content buckets:", error);
      toast.error("Failed to load content buckets");
    }
  }, [pillarId]);

  // Save to localStorage whenever contentTypes changes
  useEffect(() => {
    try {
      // Store icon type as string since functions can't be serialized
      const bucketsToSave = contentTypes.map(bucket => {
        let iconType = 'Link';
        if (bucket.icon === FileText) iconType = 'FileText';
        if (bucket.icon === FileVideo) iconType = 'FileVideo';
        if (bucket.icon === List) iconType = 'List';
        if (bucket.icon === ImageIcon) iconType = 'ImageIcon';
        
        return {
          ...bucket,
          iconType,
          // Don't include the actual icon function in storage
          icon: undefined
        };
      });
      
      localStorage.setItem(`content-buckets-${pillarId}`, JSON.stringify(bucketsToSave));
    } catch (error) {
      console.error("Failed to save content buckets:", error);
    }
  }, [contentTypes, pillarId]);

  // Focus the edit input when it appears
  useEffect(() => {
    if (editingBucketId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingBucketId]);

  const handleAddBucket = () => {
    if (!newBucketName.trim()) return;
    
    setContentTypes([
      ...contentTypes,
      { 
        id: `custom-${Date.now()}`, 
        name: newBucketName, 
        icon: Link,  // default icon
        items: [] 
      }
    ]);
    
    setNewBucketName("");
    setIsAddingBucket(false);
    toast.success(`Added "${newBucketName}" bucket`);
  };

  const handleDoubleClick = (bucketId: string, currentName: string) => {
    setEditingBucketId(bucketId);
    setEditingName(currentName);
  };

  const handleEditSubmit = () => {
    if (!editingBucketId || !editingName.trim()) {
      setEditingBucketId(null);
      return;
    }

    setContentTypes(contentTypes.map(type => 
      type.id === editingBucketId ? { ...type, name: editingName } : type
    ));
    
    setEditingBucketId(null);
    toast.success(`Renamed bucket to "${editingName}"`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingBucketId(null);
    }
  };

  const handleBlur = () => {
    handleEditSubmit();
  };

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Content Buckets</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingBucket(!isAddingBucket)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bucket
        </Button>
      </div>
      
      {isAddingBucket && (
        <div className="mb-3 flex items-center gap-2">
          <Input
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
            placeholder="Enter bucket name"
            className="max-w-xs"
            autoFocus
          />
          <Button onClick={handleAddBucket} size="sm">Add</Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsAddingBucket(false);
              setNewBucketName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {contentTypes.map((type) => (
          <Card key={type.id} className="hover:border-purple-300 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle 
                className="text-base flex items-center gap-2"
                onDoubleClick={() => handleDoubleClick(type.id, type.name)}
              >
                <type.icon className="h-4 w-4" />
                {editingBucketId === type.id ? (
                  <Input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleBlur}
                    className="h-6 py-0 px-1 min-w-0"
                    autoFocus
                  />
                ) : (
                  <span className="cursor-pointer" title="Double-click to edit">{type.name}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-16 mb-3">
                {type.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No items yet. Add some ideas!
                  </p>
                ) : (
                  <ul className="text-sm list-disc pl-5">
                    {type.items.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="mb-1 truncate">
                        {item.title}
                      </li>
                    ))}
                    {type.items.length > 3 && (
                      <li className="text-muted-foreground">
                        +{type.items.length - 3} more...
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <Button 
                className="w-full" 
                variant="secondary" 
                size="sm"
                onClick={() => onAddIdea(type.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Idea
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentTypeBuckets;
