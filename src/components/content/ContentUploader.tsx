import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
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
  bucketId?: string;
}

const ContentUploader = ({ 
  pillarId, 
  onContentAdded, 
  onContentUpdated,
  contentToEdit = null,
  isEditMode = false,
  onCancelEdit,
  alwaysShowAddNewIdea = false,
  bucketId: initialBucketId = ""
}: ContentUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [bucketId, setBucketId] = useState(initialBucketId);
  const [textContent, setTextContent] = useState("");
  const [contentFormat, setContentFormat] = useState("text");
  const [visualNotes, setVisualNotes] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [platformsList, setPlatformsList] = useState<string[]>([]);
  
  const [inspirationText, setInspirationText] = useState("");
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (contentToEdit && isEditMode) {
      setIsOpen(true);
      setTitle(contentToEdit.title);
      
      try {
        if (contentToEdit.format === 'text') {
          try {
            const parsedContent = JSON.parse(contentToEdit.url);
            setTextContent(parsedContent.script || '');
            setVisualNotes(parsedContent.visualNotes || '');
            setShootDetails(parsedContent.shootDetails || '');
            setCaptionText(parsedContent.caption || '');
            setBucketId(parsedContent.bucketId || '');
            
            if (parsedContent.inspirationText) {
              setInspirationText(parsedContent.inspirationText);
            }
            if (parsedContent.inspirationLinks && Array.isArray(parsedContent.inspirationLinks)) {
              setInspirationLinks(parsedContent.inspirationLinks);
            }
            if (parsedContent.inspirationImages && Array.isArray(parsedContent.inspirationImages)) {
              setInspirationImages(parsedContent.inspirationImages);
            }
            
            if (parsedContent.platforms && Array.isArray(parsedContent.platforms)) {
              setPlatformsList(parsedContent.platforms);
            }
          } catch {
            setTextContent(contentToEdit.url);
          }
        }
        
        setContentFormat(contentToEdit.format || 'text');
        setTagsList(contentToEdit.tags || []);
        if (contentToEdit.platforms && Array.isArray(contentToEdit.platforms)) {
          setPlatformsList(contentToEdit.platforms);
        }
      } catch (error) {
        console.error("Error loading content data for editing:", error);
      }
    }
  }, [contentToEdit, isEditMode]);

  useEffect(() => {
    setBucketId(initialBucketId);
  }, [initialBucketId]);

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
  
  const handleAddInspirationLink = (link: string) => {
    setInspirationLinks([...inspirationLinks, link]);
  };

  const handleRemoveInspirationLink = (index: number) => {
    setInspirationLinks(inspirationLinks.filter((_, i) => i !== index));
  };

  const handleAddInspirationImage = (image: string) => {
    setInspirationImages([...inspirationImages, image]);
  };

  const handleRemoveInspirationImage = (index: number) => {
    setInspirationImages(inspirationImages.filter((_, i) => i !== index));
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
      format: contentFormat,
      url: JSON.stringify({
        script: textContent,
        visualNotes: visualNotes,
        shootDetails: shootDetails,
        caption: captionText,
        platforms: platformsList,
        bucketId: bucketId,
        inspirationText: inspirationText,
        inspirationLinks: inspirationLinks,
        inspirationImages: inspirationImages
      }),
      dateCreated: contentToEdit ? contentToEdit.dateCreated : new Date(),
      tags: tagsList,
      platforms: platformsList.length > 0 ? platformsList : undefined,
      bucketId: bucketId || undefined,
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
    setBucketId(initialBucketId);
    setTextContent("");
    setContentFormat("text");
    setVisualNotes("");
    setShootDetails("");
    setCaptionText("");
    setTagsList([]);
    setCurrentTag("");
    setPlatformsList([]);
    setCurrentPlatform("");
    setInspirationText("");
    setInspirationLinks([]);
    setInspirationImages([]);
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
        Develop an Idea
      </Button>
      
      <IdeaCreationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        onTitleChange={setTitle}
        bucketId={bucketId}
        onBucketChange={setBucketId}
        pillarId={pillarId}
        scriptText={textContent}
        onScriptTextChange={setTextContent}
        visualNotes={visualNotes}
        onVisualNotesChange={setVisualNotes}
        format={contentFormat}
        onFormatChange={setContentFormat}
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
        inspirationText={inspirationText}
        onInspirationTextChange={setInspirationText}
        inspirationLinks={inspirationLinks}
        onAddInspirationLink={handleAddInspirationLink}
        onRemoveInspirationLink={handleRemoveInspirationLink}
        inspirationImages={inspirationImages}
        onAddInspirationImage={handleAddInspirationImage}
        onRemoveInspirationImage={handleRemoveInspirationImage}
        onSave={handleSubmit}
        onCancel={handleClose}
        isEditMode={isEditMode}
        dialogTitle={isEditMode ? "Edit Idea" : "Add New Idea"}
      />
    </>
  );
};

export default ContentUploader;
