
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import DialogHeader from "./ideaDialog/DialogHeader";
import DialogContentBody from "./ideaDialog/DialogContent";

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
  format = "text",
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-[650px] md:max-w-[750px]">
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
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaCreationDialog;
