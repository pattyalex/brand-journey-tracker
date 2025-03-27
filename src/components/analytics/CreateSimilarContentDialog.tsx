
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import DialogHeader from "@/components/content/ideaDialog/DialogHeader";
import SimilarContentForm from "./similiarContent/DialogContent";
import { Pillar } from "@/pages/BankOfContent";

interface CreateSimilarContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentDetails: {
    title: string;
    platform: string;
    link?: string;
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
  const [title, setTitle] = useState(contentDetails?.title ? `Recreate: ${contentDetails.title}` : "");
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
  
  // Inspiration text with just a single concise sentence
  const [inspirationText, setInspirationText] = useState(contentDetails ? 
    `This content is inspired by "${contentDetails.title}" which performed well on ${contentDetails.platform}.` : "");
  
  const [inspirationLinks, setInspirationLinks] = useState<string[]>(
    contentDetails?.link ? [contentDetails.link] : []
  );
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState("");
  const [isPillarSelected, setIsPillarSelected] = useState(false);
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [] },
    { id: "2", name: "Pillar 2", content: [] },
    { id: "3", name: "Pillar 3", content: [] }
  ]);

  // Update fields when contentDetails changes
  useEffect(() => {
    if (contentDetails) {
      setTitle(`Recreate: ${contentDetails.title}`);
      setPlatformsList(contentDetails.platform ? [contentDetails.platform] : []);
      
      // Set simplified inspiration text
      setInspirationText(
        `This content is inspired by "${contentDetails.title}" which performed well on ${contentDetails.platform}.`
      );
      
      // Set inspiration link if available
      if (contentDetails.link) {
        setInspirationLinks([contentDetails.link]);
      }
    }
  }, [contentDetails]);

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

  useEffect(() => {
    setIsPillarSelected(!!selectedPillarId);
    setBucketId("");
  }, [selectedPillarId]);

  const handlePillarChange = (pillarId: string) => {
    setSelectedPillarId(pillarId);
  };

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
    if (!selectedPillarId) {
      toast.error("Please select a pillar for this content");
      return;
    }

    try {
      const savedPillars = localStorage.getItem("pillars") || JSON.stringify(pillars);
      const existingPillars: Pillar[] = JSON.parse(savedPillars);
      
      const targetPillarIndex = existingPillars.findIndex(p => p.id === selectedPillarId);
      
      if (targetPillarIndex !== -1) {
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
          platforms: platformsList,
          bucketId
        };
        
        existingPillars[targetPillarIndex].content.push(newContentItem);
        
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

  const getSelectedPillarName = () => {
    const pillar = pillars.find(p => p.id === selectedPillarId);
    return pillar ? pillar.name : "selected pillar";
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
            <SimilarContentForm
              title={title}
              onTitleChange={setTitle}
              bucketId={bucketId}
              onBucketChange={setBucketId}
              pillarId={selectedPillarId}
              onPillarChange={handlePillarChange}
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
            />
          </div>
          
          <DialogFooter className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <TooltipProvider delayDuration={50}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSave}
                    disabled={!selectedPillarId || !title.trim()}
                    className={!selectedPillarId ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Create
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="px-4 py-2 text-sm text-center min-w-[200px]">
                  Your content will be saved to<br /><strong>{getSelectedPillarName()}</strong> in <strong>Idea Development</strong>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
          
          {!selectedPillarId && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Please select a pillar to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSimilarContentDialog;
