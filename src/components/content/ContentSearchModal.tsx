import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { formatDistanceToNow } from "date-fns";
import { getTagColorClasses } from "@/utils/tagColors";

interface ContentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  content: ContentItem[];
  pillars: Pillar[];
}

const ContentSearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  onChangeSearchQuery,
  content,
  pillars
}: ContentSearchModalProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    onChangeSearchQuery(localSearchQuery);
  };

  const filteredContent = localSearchQuery
    ? content.filter(item => 
        item.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(localSearchQuery.toLowerCase()))
      )
    : [];

  const getPillarName = (contentId: string) => {
    const pillar = pillars.find(p => 
      p.content.some(c => c.id === contentId)
    );
    return pillar?.name || "Unknown";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Content</DialogTitle>
          <DialogDescription>
            Find content across all your pillars
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-8"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        <ScrollArea className="h-[400px] mt-4">
          {filteredContent.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {localSearchQuery 
                  ? "No matching content found" 
                  : "Enter a search term to find content"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-3 p-3 border rounded-md hover:bg-accent/10 transition-colors"
                >
                  {item.format === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      className="w-20 h-20 object-cover rounded-md" 
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-md">
                      <span className="text-2xl">
                        {item.format === 'video' ? '🎬' : 
                         item.format === 'document' ? '📄' : '📝'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(item.dateCreated, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-0.5 rounded-full ${getTagColorClasses(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <span>{getPillarName(item.id)}</span>
                    <ArrowRight className="h-3 w-3 mx-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSearchModal;
