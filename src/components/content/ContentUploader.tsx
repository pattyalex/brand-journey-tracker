
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, X, Plus, Tag } from "lucide-react";
import { ContentItem } from "@/types/content";
import { getTagColorClasses } from "@/utils/tagColors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentUploaderProps {
  pillarId: string;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
}

const ContentUploader = ({ pillarId, onContentAdded }: ContentUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [platformsList, setPlatformsList] = useState<string[]>([]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tagsList.includes(currentTag.trim())) {
      setTagsList([...tagsList, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleAddPlatform = () => {
    if (currentPlatform.trim() && !platformsList.includes(currentPlatform.trim())) {
      setPlatformsList([...platformsList, currentPlatform.trim()]);
      setCurrentPlatform("");
    }
  };

  const handleRemovePlatform = (platformToRemove: string) => {
    setPlatformsList(platformsList.filter(platform => platform !== platformToRemove));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    // Create content item
    const newContent: ContentItem = {
      id: `content-${Date.now()}`,
      title,
      description: textContent.slice(0, 100) + (textContent.length > 100 ? "..." : ""), // First 100 chars as description
      format: "text",
      url: textContent, // Store the text content in the url field
      dateCreated: new Date(),
      tags: tagsList,
      platforms: platformsList.length > 0 ? platformsList : undefined,
    };

    onContentAdded(pillarId, newContent);
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setTextContent("");
    setTagsList([]);
    setCurrentTag("");
    setPlatformsList([]);
    setCurrentPlatform("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" /> Add New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add New Idea</DialogTitle>
          <DialogDescription>
            Write down your content ideas and notes
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-140px)]">
          <div className="grid gap-4 py-4 pr-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy hook for your idea"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Write your idea</Label>
              <Textarea
                id="content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Start writing your ideas, notes, or content drafts here..."
                rows={8}
                className="resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="platforms">Platforms</Label>
              <div className="flex gap-2">
                <Input
                  id="platforms"
                  value={currentPlatform}
                  onChange={(e) => setCurrentPlatform(e.target.value)}
                  placeholder="Where do you want to post this content?"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPlatform())}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddPlatform} variant="outline" size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {platformsList.map((platform, index) => (
                  <span 
                    key={index} 
                    className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    {platform}
                    <button 
                      type="button" 
                      onClick={() => handleRemovePlatform(platform)}
                      className="text-primary hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tags (e.g., To Film, To Edit, To Post)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsList.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 ${getTagColorClasses(tag)}`}
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" /> Add Idea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
