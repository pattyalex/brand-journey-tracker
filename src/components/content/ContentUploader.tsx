import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Pencil } from "lucide-react";
import { ContentItem } from "@/types/content";
import IdeaCreationDialog from "./IdeaCreationDialog";

interface ContentUploaderProps {
  pillarId: string;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
  onContentUpdated?: (pillarId: string, content: ContentItem) => void;
  contentToEdit?: ContentItem | null;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
  alwaysShowAddNewIdea?: boolean;
}

const ContentUploader = ({ 
  pillarId, 
  onContentAdded, 
  onContentUpdated,
  contentToEdit = null,
  isEditMode = false,
  onCancelEdit,
  alwaysShowAddNewIdea = false
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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  
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
        
        if (contentToEdit.scheduledDate) {
          setScheduledDate(new Date(contentToEdit.scheduledDate));
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
      scheduledDate: scheduledDate,
    };

    if (isEditMode && onContentUpdated && contentToEdit) {
      onContentUpdated(pillarId, contentItem);
    } else {
      onContentAdded(pillarId, contentItem);

      if (scheduledDate) {
        try {
          const existingScheduledContents = localStorage.getItem('scheduledContents');
          let scheduledContents: any[] = [];
          
          if (existingScheduledContents) {
            scheduledContents = JSON.parse(existingScheduledContents);
          }
          
          scheduledContents.push({
            ...contentItem,
            dateCreated: contentItem.dateCreated.toISOString(),
            scheduledDate: scheduledDate.toISOString(),
            pillarId: pillarId,
            pillarName: document.querySelector(`button[value="${pillarId}"]`)?.textContent || "Unknown"
          });
          
          localStorage.setItem('scheduledContents', JSON.stringify(scheduledContents));
        } catch (error) {
          console.error("Error saving scheduled content:", error);
        }
      }
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
    setScheduledDate(undefined);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    if (isEditMode && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <FileText className="mr-2 h-4 w-4" /> 
        Add New Idea
      </Button>
      
      <IdeaCreationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        onTitleChange={setTitle}
        scriptText={textContent}
        onScriptTextChange={setTextContent}
        formatText={formatText}
        onFormatTextChange={setFormatText}
        shootDetails={shootDetails}
        onShootDetailsChange={setShootDetails}
        captionText={captionText}
        onCaptionTextChange={setCaptionText}
        platforms={platformsList}
        currentPlatform={currentPlatform}
        onCurrentPlatformChange={setCurrentPlatform}
        onAddPlatform={handleAddPlatform}
        onRemovePlatform={handleRemovePlatform}
        tags={tagsList}
        currentTag={currentTag}
        onCurrentTagChange={setCurrentTag}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        scheduledDate={scheduledDate}
        onScheduledDateChange={setScheduledDate}
        onSave={handleSubmit}
        onCancel={handleClose}
        isEditMode={isEditMode}
        dialogTitle={isEditMode ? "Edit Idea" : "Add New Idea"}
      />
    </>
  );
};

export default ContentUploader;
