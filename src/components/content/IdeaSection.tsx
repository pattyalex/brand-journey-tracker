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
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [contentBuckets, setContentBuckets] = useState<{id: string, name: string}[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`content-buckets-${pillar.id}`);
      if (savedBuckets) {
        setContentBuckets(JSON.parse(savedBuckets));
      } else {
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

  useEffect(() => {
    console.log("Extracting platforms from content items...");
    const platforms = new Set<string>();
    
    pillar.content.forEach(item => {
      if (item.platforms && Array.isArray(item.platforms)) {
        item.platforms.forEach(platform => {
          platforms.add(platform);
          console.log("Found platform:", platform);
        });
      }
      
      try {
        if (item.url) {
          const urlData = JSON.parse(item.url);
          if (urlData.platforms && Array.isArray(urlData.platforms)) {
            urlData.platforms.forEach((platform: string) => {
              platforms.add(platform);
              console.log("Found platform in URL:", platform);
            });
          }
        }
      } catch (e) {
        // If parsing fails, ignore
      }
    });
    
    const platformArray = Array.from(platforms).sort();
    console.log("Available platforms:", platformArray);
    setAvailablePlatforms(platformArray);
  }, [pillar.content]);

  const getFilteredContent = () => {
    return pillar.content.filter(item => {
      let matchesBucketFilter = true;
      let matchesPlatformFilter = true;
      
      if (bucketFilter !== "all") {
        matchesBucketFilter = false;
        
        if (item.bucketId === bucketFilter) {
          matchesBucketFilter = true;
        } else {
          try {
            if (item.url) {
              const urlData = JSON.parse(item.url);
              if (urlData.bucketId === bucketFilter) {
                matchesBucketFilter = true;
              }
            }
          } catch (e) {
            // If parsing fails, it's not JSON
          }
        }
      }
      
      if (platformFilter !== "all") {
        matchesPlatformFilter = false;
        
        if (item.platforms && Array.isArray(item.platforms)) {
          if (item.platforms.includes(platformFilter)) {
            matchesPlatformFilter = true;
          }
        }
        
        if (!matchesPlatformFilter) {
          try {
            if (item.url) {
              const urlData = JSON.parse(item.url);
              if (urlData.platforms && Array.isArray(urlData.platforms)) {
                if (urlData.platforms.includes(platformFilter)) {
                  matchesPlatformFilter = true;
                }
              }
            }
          } catch (e) {
            // If parsing fails, ignore
          }
        }
      }
      
      return matchesBucketFilter && matchesPlatformFilter;
    });
  };

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

  const countByPlatform = (platform: string): number => {
    return pillar.content.filter(item => {
      if (item.platforms && Array.isArray(item.platforms)) {
        if (item.platforms.includes(platform)) {
          return true;
        }
      }
      
      try {
        if (item.url) {
          const urlData = JSON.parse(item.url);
          if (urlData.platforms && Array.isArray(urlData.platforms)) {
            return urlData.platforms.includes(platform);
          }
        }
      } catch (e) {
        // If parsing fails, ignore
      }
      
      return false;
    }).length;
  };

  return (
    <div className="space-y-3 pl-2 pr-3">
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
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" /> 
          {pillar.name} Ideas
        </h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by bucket:</span>
            <Select value={bucketFilter} onValueChange={setBucketFilter}>
              <SelectTrigger className="h-8 w-full md:w-[180px]">
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
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by platform:</span>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="h-8 w-full md:w-[180px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {availablePlatforms.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform} ({countByPlatform(platform)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
