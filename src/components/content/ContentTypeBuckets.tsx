
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileVideo, ImageIcon, Link, List, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";

export type ContentType = {
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
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [newBucketName, setNewBucketName] = useState("");
  const [isAddingBucket, setIsAddingBucket] = useState(false);

  // Load buckets from localStorage
  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`pillar-buckets-${pillarId}`);
      
      if (savedBuckets) {
        const parsedBuckets = JSON.parse(savedBuckets);
        setContentTypes(parsedBuckets);
      } else {
        // Default buckets if none exist
        const defaultBuckets = [
          { id: "blog", name: "Blog Posts", icon: "FileText", items: [] },
          { id: "video", name: "Video Content", icon: "FileVideo", items: [] },
          { id: "social", name: "Social Media", icon: "List", items: [] },
          { id: "image", name: "Image Content", icon: "ImageIcon", items: [] },
        ];
        setContentTypes(defaultBuckets);
        localStorage.setItem(`pillar-buckets-${pillarId}`, JSON.stringify(defaultBuckets));
      }
    } catch (error) {
      console.error("Failed to load buckets:", error);
      // Set default buckets if load fails
      setContentTypes([
        { id: "blog", name: "Blog Posts", icon: "FileText", items: [] },
        { id: "video", name: "Video Content", icon: "FileVideo", items: [] },
        { id: "social", name: "Social Media", icon: "List", items: [] },
        { id: "image", name: "Image Content", icon: "ImageIcon", items: [] },
      ]);
    }
  }, [pillarId]);

  // Save buckets to localStorage when they change
  useEffect(() => {
    if (contentTypes.length > 0) {
      try {
        localStorage.setItem(`pillar-buckets-${pillarId}`, JSON.stringify(contentTypes));
      } catch (error) {
        console.error("Failed to save buckets:", error);
      }
    }
  }, [contentTypes, pillarId]);

  const handleAddBucket = () => {
    if (!newBucketName.trim()) return;
    
    const newBucket = {
      id: `custom-${Date.now()}`, 
      name: newBucketName, 
      icon: "Link",  // default icon
      items: [] 
    };
    
    setContentTypes([...contentTypes, newBucket]);
    setNewBucketName("");
    setIsAddingBucket(false);
    toast.success(`New bucket "${newBucketName}" added`);
  };

  const getIconComponent = (iconName: string): React.ElementType => {
    switch (iconName) {
      case "FileText": return FileText;
      case "FileVideo": return FileVideo;
      case "List": return List;
      case "ImageIcon": return ImageIcon;
      default: return Link;
    }
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
        {contentTypes.map((type) => {
          const IconComponent = getIconComponent(type.icon);
          return (
            <Card key={type.id} className="hover:border-purple-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {type.name}
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
          );
        })}
      </div>
    </div>
  );
};

export default ContentTypeBuckets;
