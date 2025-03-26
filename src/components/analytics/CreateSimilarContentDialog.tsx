
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DialogHeader from "@/components/content/ideaDialog/DialogHeader";
import DialogContentBody from "@/components/content/ideaDialog/DialogContent";

interface CreateSimilarContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentDetails: {
    title: string;
    platform: string;
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const CreateSimilarContentDialog = ({
  open,
  onOpenChange,
  contentDetails,
  onSave,
  onCancel,
}: CreateSimilarContentDialogProps) => {
  const [title, setTitle] = useState(contentDetails ? `Similar to: ${contentDetails.title}` : "");
  const [bucketId, setBucketId] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [visualNotes, setVisualNotes] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [format, setFormat] = useState("text");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [platformsList, setPlatformsList] = useState<string[]>(
    contentDetails?.platform ? [contentDetails.platform] : []
  );
  const [inspirationText, setInspirationText] = useState(contentDetails ? 
    `This content is inspired by "${contentDetails.title}" which performed well on ${contentDetails.platform}.` : "");
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);

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

  const handleSave = () => {
    // Here we could implement saving the content to a backend or state
    toast.success("Content idea saved successfully");
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] w-[90vw]">
        <div className="h-full flex flex-col">
          <DialogHeader 
            title="Create Similar Content" 
            isMeganOpen={false} 
            toggleMegan={() => {}} 
          />
          
          <div className="flex-1">
            <DialogContentBody
              title={title}
              onTitleChange={setTitle}
              bucketId={bucketId}
              onBucketChange={setBucketId}
              pillarId=""
              format={format}
              onFormatChange={setFormat}
              scriptText={scriptText}
              onScriptTextChange={setScriptText}
              visualNotes={visualNotes}
              onVisualNotesChange={setVisualNotes}
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
            />
          </div>
          
          <DialogFooter className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSimilarContentDialog;
