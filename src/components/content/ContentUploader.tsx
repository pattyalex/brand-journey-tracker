import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Plus } from "lucide-react";
import { ContentItem } from "@/types/content";
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
import ContentUploaderFields from "./ContentUploaderFields";

interface ContentUploaderProps {
  pillarId: string;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
  onContentUpdated?: (pillarId: string, content: ContentItem) => void;
  contentToEdit?: ContentItem | null;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
}

const ContentUploader = ({ 
  pillarId, 
  onContentAdded, 
  onContentUpdated,
  contentToEdit = null,
  isEditMode = false,
  onCancelEdit
}: ContentUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [formatText, setFormatText] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [platformsList, setPlatformsList] = useState<string[]>([]);
  
  useEffect(() => {
    if (contentToEdit && isEditMode) {
      setIsOpen(true);
      setTitle(contentToEdit.title);
      
      try {
        if (contentToEdit.format === 'text') {
          try {
            const parsedContent = JSON.parse(contentToEdit.url);
            setTextContent(parsedContent.script || '');
            setFormatText(parsedContent.format || '');
            setShootDetails(parsedContent.shootDetails || '');
            setCaptionText(parsedContent.caption || '');
            
            if (parsedContent.platforms && Array.isArray(parsedContent.platforms)) {
              setPlatformsList(parsedContent.platforms);
            }
          } catch {
            setTextContent(contentToEdit.url);
          }
        }
        
        setTagsList(contentToEdit.tags || []);
        if (contentToEdit.platforms && Array.isArray(contentToEdit.platforms)) {
          setPlatformsList(contentToEdit.platforms);
        }
      } catch (error) {
        console.error("Error loading content data for editing:", error);
      }
    }
  }, [contentToEdit, isEditMode]);

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
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const contentItem: ContentItem = {
      id: contentToEdit ? contentToEdit.id : `content-${Date.now()}`,
      title,
      description: textContent.slice(0, 100) + (textContent.length > 100 ? "..." : ""),
      format: "text",
      url: JSON.stringify({
        script: textContent,
        format: formatText,
        shootDetails: shootDetails,
        caption: captionText,
        platforms: platformsList
      }),
      dateCreated: contentToEdit ? contentToEdit.dateCreated : new Date(),
      tags: tagsList,
      platforms: platformsList.length > 0 ? platformsList : undefined,
    };

    if (isEditMode && onContentUpdated && contentToEdit) {
      onContentUpdated(pillarId, contentItem);
    } else {
      onContentAdded(pillarId, contentItem);
    }
    
    resetForm();
    setIsOpen(false);
    
    if (isEditMode && onCancelEdit) {
      onCancelEdit();
    }
  };

  const resetForm = () => {
    setTitle("");
    setTextContent("");
    setFormatText("");
    setShootDetails("");
    setCaptionText("");
    setTagsList([]);
    setCurrentTag("");
    setPlatformsList([]);
    setCurrentPlatform("");
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    if (isEditMode && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open && isEditMode && onCancelEdit) {
        onCancelEdit();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          {isEditMode ? (
            <>
              <Pencil className="mr-2 h-4 w-4" /> Edit Idea
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" /> Add New Idea
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Idea" : "Add New Idea"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update your content idea" : "Write down your content ideas and notes"}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-140px)]">
          <ContentUploaderFields
            title={title}
            setTitle={setTitle}
            textContent={textContent}
            setTextContent={setTextContent}
            formatText={formatText}
            setFormatText={setFormatText}
            shootDetails={shootDetails}
            setShootDetails={setShootDetails}
            captionText={captionText}
            setCaptionText={setCaptionText}
            tagsList={tagsList}
            currentTag={currentTag}
            setCurrentTag={setCurrentTag}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            platformsList={platformsList}
            currentPlatform={currentPlatform}
            setCurrentPlatform={setCurrentPlatform}
            handleAddPlatform={handleAddPlatform}
            handleRemovePlatform={handleRemovePlatform}
          />
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? (
              "Update Idea"
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Idea
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
