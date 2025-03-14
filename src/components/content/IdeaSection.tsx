import { useState, useEffect } from "react";
import { Lightbulb, FileText, Filter, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import ContentPillar from "./ContentPillar";
import ContentUploader from "./ContentUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onAddToBucket: (formatId: string) => void;
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
  const [filterType, setFilterType] = useState<"format" | "platform" | "status">("format");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contentFormats, setContentFormats] = useState<{id: string, name: string}[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem(`content-formats-${pillar.id}`);
      if (savedFormats) {
        setContentFormats(JSON.parse(savedFormats));
      } else {
        const defaultFormats = [
          { id: "blog", name: "Blog Posts" },
          { id: "video", name: "Video Content" },
          { id: "social", name: "Social Media" },
          { id: "image", name: "Image Content" },
        ];
        setContentFormats(defaultFormats);
      }
    } catch (error) {
      console.error("Failed to load content formats:", error);
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

  useEffect(() => {
    console.log("Extracting status tags from content items...");
    const statuses = new Set<string>();
    
    pillar.content.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          statuses.add(tag);
          console.log("Found status tag:", tag);
        });
      }
    });
    
    const statusArray = Array.from(statuses).sort();
    console.log("Available status tags:", statusArray);
    setAvailableStatuses(statusArray);
  }, [pillar.content]);

  const getFilteredContent = () => {
    return pillar.content.filter(item => {
      let matchesFilter = true;
      
      if (filterType === "format" && formatFilter !== "all") {
        matchesFilter = false;
        
        if (item.bucketId === formatFilter) {
          matchesFilter = true;
        } else {
          try {
            if (item.url) {
              const urlData = JSON.parse(item.url);
              if (urlData.bucketId === formatFilter) {
                matchesFilter = true;
              }
            }
          } catch (e) {
            // If parsing fails, it's not JSON
          }
        }
      } else if (filterType === "platform" && platformFilter !== "all") {
        matchesFilter = false;
        
        if (item.platforms && Array.isArray(item.platforms)) {
          if (item.platforms.includes(platformFilter)) {
            matchesFilter = true;
          }
        }
        
        if (!matchesFilter) {
          try {
            if (item.url) {
              const urlData = JSON.parse(item.url);
              if (urlData.platforms && Array.isArray(urlData.platforms)) {
                if (urlData.platforms.includes(platformFilter)) {
                  matchesFilter = true;
                }
              }
            }
          } catch (e) {
            // If parsing fails, ignore
          }
        }
      } else if (filterType === "status" && statusFilter !== "all") {
        matchesFilter = false;
        
        if (item.tags && Array.isArray(item.tags)) {
          if (item.tags.includes(statusFilter)) {
            matchesFilter = true;
          }
        }
      }
      
      return matchesFilter;
    });
  };

  const countByFormat = (formatId: string): number => {
    return pillar.content.filter(item => {
      if (item.bucketId === formatId) {
        return true;
      }
      
      try {
        if (item.url) {
          const urlData = JSON.parse(item.url);
          return urlData.bucketId === formatId;
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

  const countByStatus = (status: string): number => {
    return pillar.content.filter(item => {
      if (item.tags && Array.isArray(item.tags)) {
        return item.tags.includes(status);
      }
      return false;
    }).length;
  };

  const handleFilterTypeChange = (type: "format" | "platform" | "status") => {
    setFilterType(type);
    setFormatFilter("all");
    setPlatformFilter("all");
    setStatusFilter("all");
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
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by:</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  {filterType === "format" ? "Format" : filterType === "platform" ? "Platform" : "Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px] bg-white">
                <DropdownMenuItem onClick={() => handleFilterTypeChange("format")}>
                  Format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterTypeChange("platform")}>
                  Platform
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterTypeChange("status")}>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {filterType === "format" ? (
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="h-8 w-full md:w-[180px]">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  {contentFormats.map(format => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name} ({countByFormat(format.id)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : filterType === "platform" ? (
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
            ) : (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status} ({countByStatus(status)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
