
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Trash2, ArrowUpRight, MoveRight, Calendar, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";

interface ContentPillarProps {
  pillar: Pillar;
  pillars: Pillar[];
  onRename: (newName: string) => void;
  onDelete: () => void;
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  searchQuery: string;
}

const ContentPillar = ({
  pillar,
  pillars,
  onRename,
  onDelete,
  onDeleteContent,
  onMoveContent,
  searchQuery
}: ContentPillarProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(pillar.name);
  
  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName);
      setIsRenaming(false);
    }
  };

  const startRenaming = () => {
    setNewName(pillar.name);
    setIsRenaming(true);
  };
  
  // Filter content if search query exists
  const filteredContent = searchQuery
    ? pillar.content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pillar.content;

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'document': return '📄';
      case 'text': return '📝';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {isRenaming ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-[200px]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <Button size="sm" onClick={handleRename}>Save</Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsRenaming(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{pillar.name}</h2>
            <Button variant="ghost" size="xs" onClick={startRenaming}>
              <PenLine className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="xs" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      
      {filteredContent.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground">
            {searchQuery 
              ? "No matching content found" 
              : "No content yet. Upload something to get started."}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((content) => (
              <Card key={content.id} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {content.format === 'image' ? (
                    <img
                      src={content.url}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <span className="text-4xl">{getFormatIcon(content.format)}</span>
                    </div>
                  )}
                </div>
                
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {content.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {content.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-secondary/20 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {formatDistanceToNow(content.dateCreated, { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteContent(content.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  
                  <div className="flex items-center">
                    <Select
                      onValueChange={(value) => onMoveContent(value, content.id)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="Move to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pillars
                          .filter(p => p.id !== pillar.id)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ContentPillar;
