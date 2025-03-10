
import { useState, useEffect } from "react";
import { Eye, ExternalLink, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { VisionBoardData } from "@/types/planner";

export const VisionBoardButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visionBoardData, setVisionBoardData] = useState<VisionBoardData | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [title, setTitle] = useState("");
  const [activeSection, setActiveSection] = useState<"upload" | "link" | "view">("view");

  // Load vision board data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("visionBoardData");
    if (savedData) {
      setVisionBoardData(JSON.parse(savedData));
    }
  }, []);

  // Handle image upload through URL
  const handleImageUpload = () => {
    if (!imageUrl) {
      toast.error("Please enter an image URL");
      return;
    }

    const newVisionBoard: VisionBoardData = {
      type: "image",
      content: imageUrl,
      title: title || "My Vision Board"
    };

    setVisionBoardData(newVisionBoard);
    localStorage.setItem("visionBoardData", JSON.stringify(newVisionBoard));
    setActiveSection("view");
    toast.success("Vision board image saved!");
  };

  // Handle link upload
  const handleLinkUpload = () => {
    if (!linkUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Simple URL validation
    if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    const newVisionBoard: VisionBoardData = {
      type: "link",
      content: linkUrl,
      title: title || "My Vision Board"
    };

    setVisionBoardData(newVisionBoard);
    localStorage.setItem("visionBoardData", JSON.stringify(newVisionBoard));
    setActiveSection("view");
    toast.success("Vision board link saved!");
  };

  // Handle removing the vision board
  const handleRemoveVisionBoard = () => {
    setVisionBoardData(null);
    localStorage.removeItem("visionBoardData");
    setImageUrl("");
    setLinkUrl("");
    setTitle("");
    toast.success("Vision board removed");
  };

  // Open external link in a new tab
  const openExternalLink = () => {
    if (visionBoardData?.type === "link" && visionBoardData.content) {
      window.open(visionBoardData.content, "_blank", "noopener,noreferrer");
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveSection("view");
    }
  };

  const renderContent = () => {
    if (activeSection === "upload") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My Vision Board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/my-vision-board.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of an image to use as your vision board
            </p>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setActiveSection("view")}>Cancel</Button>
            <Button onClick={handleImageUpload}>Save</Button>
          </div>
        </div>
      );
    }
    
    if (activeSection === "link") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My Vision Board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="external-link">External Link URL</Label>
            <Input
              id="external-link"
              placeholder="https://pinterest.com/my-vision-board"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter a link to an external vision board (Pinterest, etc.)
            </p>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setActiveSection("view")}>Cancel</Button>
            <Button onClick={handleLinkUpload}>Save</Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center gap-4">
        {visionBoardData ? (
          <>
            {visionBoardData.type === "image" ? (
              <div className="relative w-full">
                <img 
                  src={visionBoardData.content}
                  alt="Vision Board"
                  className="w-full h-auto max-h-[400px] object-contain rounded-md"
                  onError={() => toast.error("Unable to load image. Please check the URL.")}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 rounded-full"
                  onClick={handleRemoveVisionBoard}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <p className="text-center">
                  Your vision board is linked to an external website.
                </p>
                <div className="flex gap-2">
                  <Button onClick={openExternalLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Vision Board
                  </Button>
                  <Button variant="outline" onClick={handleRemoveVisionBoard}>
                    <X className="h-4 w-4 mr-2" />
                    Remove Link
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <p className="text-center text-muted-foreground mb-4">
              Choose how to create your vision board:
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setActiveSection("upload")} variant="vision">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button onClick={() => setActiveSection("link")} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                External Link
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Vision Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {visionBoardData ? visionBoardData.title || "Vision Board" : "Vision Board"}
          </DialogTitle>
          <DialogDescription>
            Visualize your goals and aspirations to stay motivated.
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
