
import { useState, useEffect } from "react";
import { Lightbulb, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import ContentPillar from "./ContentPillar";
import ContentUploader from "./ContentUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IdeaSectionProps {
  pillar: Pillar;
  pillars: Pillar[];
  searchQuery: string;
  onNewIdeaClick: () => void;
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onReorderContent: (newItems: ContentItem[]) => void;
  editingContent: ContentItem | null;
  isEditing: boolean;
  onContentUpdated: (pillarId: string, content: ContentItem) => void;
  onCancelEdit: () => void;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
  onAddToBucket: (bucketId: string) => void;
}

const IdeaSection = ({
  pillar,
  pillars,
  searchQuery,
  onNewIdeaClick,
  onDeleteContent,
  onMoveContent,
  onEditContent,
  onReorderContent,
  editingContent,
  isEditing,
  onContentUpdated,
  onCancelEdit,
  onContentAdded,
  onAddToBucket
}: IdeaSectionProps) => {
  const [bucketFilter, setBucketFilter] = useState<string>("all");
  const [contentBuckets, setContentBuckets] = useState<{id: string, name: string}[]>([]);
  
  // Load content buckets from localStorage
  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`content-buckets-${pillar.id}`);
      if (savedBuckets) {
        setContentBuckets(JSON.parse(savedBuckets));
      } else {
        // Default buckets if none found
        const defaultBuckets = [
          { id: "blog", name: "Blog Posts" },
          { id: "video", name: "Video Content" },
          { id: "social", name: "Social Media" },
          { id: "image", name: "Image Content" },
        ];
        setContentBuckets(defaultBuckets);
      }
    } catch (error) {
      console.error("Failed to load content buckets:", error);
    }
  }, [pillar.id]);

  // Filter content by bucket
  const getFilteredContent = () => {
    if (bucketFilter === "all") {
      return pillar.content;
    }
    
    return pillar.content.filter(item => {
      // Check if item has a bucketId directly or in the URL JSON
      if (item.bucketId === bucketFilter) {
        return true;
      }
      
      // Check in URL JSON for older format
      try {
        if (item.url) {
          const urlData = JSON.parse(item.url);
          return urlData.bucketId === bucketFilter;
        }
      } catch (e) {
        // If parsing fails, it's not JSON, so this item doesn't have a bucket
      }
      
      return false;
    });
  };

  // Count items by bucket
  const countByBucket = (bucketId: string): number => {
    return pillar.content.filter(item => {
      if (item.bucketId === bucketId) {
        return true;
      }
      
      try {
        if (item.url) {
          const urlData = JSON.parse(item.url);
          return urlData.bucketId === bucketId;
        }
      } catch (e) {
        // Not JSON format
      }
      
      return false;
    }).length;
  };

  return (
    <div className="space-y-3 pl-2 pr-3">
      {/* Add New Idea button first */}
      <div className="flex justify-end">
        <ContentUploader 
          pillarId={pillar.id}
          onContentAdded={onContentAdded}
          onContentUpdated={onContentUpdated}
          contentToEdit={editingContent}
          isEditMode={isEditing}
          onCancelEdit={onCancelEdit}
        />
      </div>
      
      {/* Pillar Ideas heading and filter on the same line */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" /> 
          {pillar.name} Ideas
        </h2>
        
        {/* Bucket filter dropdown placed inline with the heading */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by bucket:</span>
          <Select value={bucketFilter} onValueChange={setBucketFilter}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="All Buckets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              {contentBuckets.map(bucket => (
                <SelectItem key={bucket.id} value={bucket.id}>
                  {bucket.name} ({countByBucket(bucket.id)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ContentPillar
        pillar={{
          ...pillar,
          content: getFilteredContent()
        }}
        pillars={pillars}
        onDeleteContent={onDeleteContent}
        onMoveContent={onMoveContent}
        onEditContent={onEditContent}
        searchQuery={searchQuery}
        onReorderContent={onReorderContent}
      />
    </div>
  );
};

export default IdeaSection;
