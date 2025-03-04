
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Plus } from "lucide-react";
import { ContentItem, ContentFormat } from "@/types/content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentUploaderProps {
  pillarId: string;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
}

const ContentUploader = ({ pillarId, onContentAdded }: ContentUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<ContentFormat>("text");
  const [contentUrl, setContentUrl] = useState("");
  const [tags, setTags] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleAddTag = () => {
    if (currentTag.trim() && !tagsList.includes(currentTag.trim())) {
      setTagsList([...tagsList, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect content format from file type
      if (selectedFile.type.startsWith('image/')) {
        setFormat('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setFormat('video');
      } else {
        setFormat('document');
      }
      
      // Create temporary URL for preview
      const fileUrl = URL.createObjectURL(selectedFile);
      setContentUrl(fileUrl);
    }
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
      description,
      format,
      url: contentUrl || "https://via.placeholder.com/500", // Default placeholder if no URL
      dateCreated: new Date(),
      tags: tagsList,
      size: file?.size,
    };

    onContentAdded(pillarId, newContent);
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFormat("text");
    setContentUrl("");
    setTagsList([]);
    setCurrentTag("");
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <DialogDescription>
            Upload or link content to add to your bank
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="format">Content Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ContentFormat)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {format !== 'text' && (
            <div className="grid gap-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={
                  format === 'image' ? 'image/*' : 
                  format === 'video' ? 'video/*' : 
                  '.pdf,.doc,.docx,.txt'
                }
              />
              <p className="text-xs text-muted-foreground">
                or
              </p>
              <Label htmlFor="url">Content URL</Label>
              <Input
                id="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://example.com/content"
                disabled={!!file}
              />
            </div>
          )}
          
          {format === 'text' && (
            <div className="grid gap-2">
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="Enter your text content here"
                rows={5}
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {tagsList.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-secondary/20 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" /> Add Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
