
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TagsInput from "./TagsInput";
import PlatformsInput from "./PlatformsInput";
import DateSchedulePicker from "./DateSchedulePicker";
import MeganAIChat from "./MeganAIChat";
import TitleHookSuggestions from "./TitleHookSuggestions";

interface IdeaCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
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
  scheduledDate?: Date;
  onScheduledDateChange?: (date: Date | undefined) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditMode: boolean;
  dialogTitle?: string;
  xOption?: string;
  onXOptionChange?: (value: string) => void;
}

const IdeaCreationDialog = ({
  open,
  onOpenChange,
  title,
  onTitleChange,
  scriptText,
  onScriptTextChange,
  format = "text",
  onFormatChange,
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
  scheduledDate,
  onScheduledDateChange,
  onSave,
  onCancel,
  isEditMode,
  dialogTitle = "Create New Idea",
  xOption = "A",
  onXOptionChange = () => {},
}: IdeaCreationDialogProps) => {
  const [isMeganOpen, setIsMeganOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-h-[90vh] transition-all duration-300 ${
          isMeganOpen 
            ? "sm:max-w-[900px] md:max-w-[1100px] grid grid-cols-[1fr,320px]" 
            : "sm:max-w-[650px] md:max-w-[750px]"
        }`}
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="relative">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 cursor-pointer transition-all duration-150 hover:bg-accent/80 active:bg-accent active:scale-95 rounded-md"
              onClick={() => setIsMeganOpen(!isMeganOpen)}
              aria-label={isMeganOpen ? "Hide Megan" : "Ask Megan"}
            >
              {isMeganOpen ? (
                <span className="px-3 py-1.5 text-primary hover:text-primary/90 font-medium">Hide Megan</span>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 w-full">
                  <span className="text-primary hover:text-primary/90 font-medium">Ask Megan</span>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    M
                  </div>
                </div>
              )}
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-4 -mr-4">
            <ScrollArea className="h-[calc(90vh-140px)]">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="idea-title">Title</Label>
                  <div className="relative flex items-center">
                    <Input
                      id="idea-title"
                      value={title}
                      onChange={(e) => onTitleChange(e.target.value)}
                      placeholder="Enter a catchy hook for your idea..."
                      className="pr-16"
                    />
                    <TitleHookSuggestions 
                      onSelectHook={(hook) => onTitleChange(hook)}
                    />
                  </div>
                </div>
                
                <div className="h-4"></div>
                
                <div className="grid gap-2">
                  <Label htmlFor="develop-script">Script</Label>
                  <Textarea
                    id="develop-script"
                    value={scriptText}
                    onChange={(e) => onScriptTextChange(e.target.value)}
                    placeholder="Write your script here..."
                    className="min-h-[120px] resize-y"
                  />
                </div>
                
                <div className="h-4"></div>
                
                <div className="grid gap-2">
                  <Label htmlFor="shoot-details">Shoot Details</Label>
                  <Textarea
                    id="shoot-details"
                    value={shootDetails}
                    onChange={(e) => onShootDetailsChange(e.target.value)}
                    placeholder="Enter details about the shoot, such as location, outfits, props needed..."
                    className="min-h-[100px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="caption-text">Caption</Label>
                  <Textarea
                    id="caption-text"
                    value={captionText}
                    onChange={(e) => onCaptionTextChange(e.target.value)}
                    placeholder="Draft a caption for your content when posting to social media platforms..."
                    className="min-h-[100px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="platforms">Platforms</Label>
                  <PlatformsInput
                    platforms={platforms}
                    currentPlatform={currentPlatform}
                    onPlatformChange={onCurrentPlatformChange}
                    onAddPlatform={onAddPlatform}
                    onRemovePlatform={onRemovePlatform}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <TagsInput
                    tags={tags}
                    currentTag={currentTag}
                    onTagChange={onCurrentTagChange}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                    placeholder="Add tags (e.g., To Film, To Edit, To Post)"
                  />
                </div>
                
                {onScheduledDateChange && (
                  <div className="grid gap-2">
                    <Label htmlFor="scheduled-date">Schedule to Calendar</Label>
                    <DateSchedulePicker 
                      date={scheduledDate} 
                      onDateChange={onScheduledDateChange}
                      label=""
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
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
        
        {isMeganOpen && (
          <div className="h-full border-l border-gray-200">
            <MeganAIChat 
              onClose={() => setIsMeganOpen(false)} 
              contextData={{
                title,
                script: scriptText,
                shootDetails
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IdeaCreationDialog;
