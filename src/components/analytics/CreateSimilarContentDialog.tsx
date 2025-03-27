
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DialogHeader from "@/components/content/ideaDialog/DialogHeader";
import DialogContentBody from "@/components/content/ideaDialog/DialogContent";
import { Pillar } from "@/pages/BankOfContent";

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
  const [selectedPillarId, setSelectedPillarId] = useState("1");
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [] },
    { id: "2", name: "Pillar 2", content: [] },
    { id: "3", name: "Pillar 3", content: [] }
  ]);

  // Load pillars from localStorage if available
  useEffect(() => {
    try {
      const savedPillars = localStorage.getItem("pillars");
      if (savedPillars) {
        setPillars(JSON.parse(savedPillars));
      }
    } catch (error) {
      console.error("Error loading pillars:", error);
    }
  }, []);

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
    // Get the existing pillar data
    try {
      const savedPillars = localStorage.getItem("pillars") || JSON.stringify(pillars);
      const existingPillars: Pillar[] = JSON.parse(savedPillars);
      
      // Find the selected pillar
      const targetPillarIndex = existingPillars.findIndex(p => p.id === selectedPillarId);
      
      if (targetPillarIndex !== -1) {
        // Create the new content item
        const newContentItem = {
          id: `content-${Date.now()}`,
          title: title,
          description: scriptText.substring(0, 100) + (scriptText.length > 100 ? "..." : ""),
          url: JSON.stringify({
            script: scriptText,
            visualNotes,
            shootDetails,
            caption: captionText,
            platforms: platformsList,
            bucketId,
            inspirationText,
            inspirationLinks,
            inspirationImages
          }),
          format: "",
          dateCreated: new Date(),
          tags: tagsList,
          platforms: platformsList
        };
        
        // Add the new content to the selected pillar
        existingPillars[targetPillarIndex].content.push(newContentItem);
        
        // Save the updated pillars back to localStorage
        localStorage.setItem("pillars", JSON.stringify(existingPillars));
        
        const pillarName = existingPillars[targetPillarIndex].name;
        toast.success(`Content idea added to ${pillarName}`, {
          description: "Navigate to Idea Development to see your new content"
        });
      } else {
        toast.error("Selected pillar not found");
      }
    } catch (error) {
      console.error("Error saving content to pillar:", error);
      toast.error("Failed to save content to pillar");
    }
    
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
              pillarId={selectedPillarId}
              format=""
              onFormatChange={() => {}}
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
            >
              {/* PillarSelector will be shown in DialogContentBody */}
            </DialogContentBody>
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
