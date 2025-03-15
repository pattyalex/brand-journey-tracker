
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import DialogHeader from "./ideaDialog/DialogHeader";
import DialogContentBody from "./ideaDialog/DialogContent";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface IdeaCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
  scriptText: string;
  onScriptTextChange: (value: string) => void;
  visualNotes: string;
  onVisualNotesChange: (value: string) => void;
  format?: string;
  onFormatChange?: (value: string) => void;
  shootDetails: string;
  onShootDetailsChange: (value: string) => void;
  captionText: string;
  onCaptionTextChange: (value: string) => void;
  platforms: string[];
  currentPlatform: string;
  onCurrentPlatformChange: (value: string) => void;
  onAddPlatform: () => void;
  onRemovePlatform: (platform: string) => void;
  tags: string[];
  currentTag: string;
  onCurrentTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditMode: boolean;
  dialogTitle?: string;
  xOption?: string;
  onXOptionChange?: (value: string) => void;
  inspirationText?: string;
  onInspirationTextChange?: (value: string) => void;
  inspirationLinks?: string[];
  onAddInspirationLink?: (link: string) => void;
  onRemoveInspirationLink?: (index: number) => void;
  inspirationImages?: string[];
  onAddInspirationImage?: (image: string) => void;
  onRemoveInspirationImage?: (index: number) => void;
}

const IdeaCreationDialog = ({
  open,
  onOpenChange,
  title,
  onTitleChange,
  bucketId,
  onBucketChange,
  pillarId,
  scriptText,
  onScriptTextChange,
  visualNotes = "",
  onVisualNotesChange = () => {},
  format = "Post",
  onFormatChange = () => {},
  shootDetails,
  onShootDetailsChange,
  captionText,
  onCaptionTextChange,
  platforms,
  currentPlatform,
  onCurrentPlatformChange,
  onAddPlatform,
  onRemovePlatform,
  tags,
  currentTag,
  onCurrentTagChange,
  onAddTag,
  onRemoveTag,
  onSave,
  onCancel,
  isEditMode,
  dialogTitle = "Create New Idea",
  inspirationText = "",
  onInspirationTextChange = () => {},
  inspirationLinks = [],
  onAddInspirationLink = () => {},
  onRemoveInspirationLink = () => {},
  inspirationImages = [],
  onAddInspirationImage = () => {},
  onRemoveInspirationImage = () => {},
}: IdeaCreationDialogProps) => {
  const navigate = useNavigate();
  
  const handleSendToSchedule = () => {
    if (!title.trim()) {
      toast.error("Please add a title before sending to schedule");
      return;
    }
    
    // Create content item to be scheduled
    const contentToSchedule = {
      id: Date.now().toString(),
      title,
      description: scriptText || inspirationText || "",
      format, // Use the current format value from props
      dateCreated: new Date(),
      tags: tags || [],
      platforms: platforms || [],
      shootDetails: shootDetails || "",
      caption: captionText || "",
      bucketId: bucketId || "",
      createdAt: new Date(),
      url: "",
      status: "ready"
    };
    
    // Get existing content or initialize empty array
    const existingContent = localStorage.getItem('readyToScheduleContent');
    const readyToScheduleContent = existingContent ? JSON.parse(existingContent) : [];
    
    // Add new content to the array
    readyToScheduleContent.push(contentToSchedule);
    
    // Save back to localStorage
    localStorage.setItem('readyToScheduleContent', JSON.stringify(readyToScheduleContent));
    
    // Close dialog
    onOpenChange(false);
    
    // Show success toast
    toast.success("Content sent to scheduling");
    
    // Navigate to Content Calendar
    navigate("/content-calendar", { state: { fromIdeaDevelopment: true } });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] w-[90vw]">
        <div className="h-full flex flex-col">
          <DialogHeader 
            title={dialogTitle} 
            isMeganOpen={false} 
            toggleMegan={() => {}} 
          />
          
          <div className="flex-1">
            <DialogContentBody
              title={title}
              onTitleChange={onTitleChange}
              bucketId={bucketId}
              onBucketChange={onBucketChange}
              pillarId={pillarId}
              format={format}
              onFormatChange={onFormatChange}
              scriptText={scriptText}
              onScriptTextChange={onScriptTextChange}
              visualNotes={visualNotes}
              onVisualNotesChange={onVisualNotesChange}
              shootDetails={shootDetails}
              onShootDetailsChange={onShootDetailsChange}
              captionText={captionText}
              onCaptionTextChange={onCaptionTextChange}
              platforms={platforms}
              currentPlatform={currentPlatform}
              onCurrentPlatformChange={onCurrentPlatformChange}
              onAddPlatform={onAddPlatform}
              onRemovePlatform={onRemovePlatform}
              tags={tags}
              currentTag={currentTag}
              onCurrentTagChange={onCurrentTagChange}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              inspirationText={inspirationText}
              onInspirationTextChange={onInspirationTextChange}
              inspirationLinks={inspirationLinks}
              onAddInspirationLink={onAddInspirationLink}
              onRemoveInspirationLink={onRemoveInspirationLink}
              inspirationImages={inspirationImages}
              onAddInspirationImage={onAddInspirationImage}
              onRemoveInspirationImage={onRemoveInspirationImage}
            />
          </div>
          
          <DialogFooter className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              {isEditMode ? "Update" : "Create"}
            </Button>
            <Button 
              variant="secondary" 
              className="flex items-center gap-1"
              onClick={handleSendToSchedule}
            >
              <Send className="h-4 w-4" />
              <span>Send to Schedule</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaCreationDialog;
