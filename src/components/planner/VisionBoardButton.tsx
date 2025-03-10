
import { useState, useEffect, useRef } from "react";
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
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [activeSection, setActiveSection] = useState<"upload" | "link" | "view">("view");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load vision board data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("visionBoardData");
    if (savedData) {
      setVisionBoardData(JSON.parse(savedData));
    }
  }, []);

  // Handle actual file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("No file selected");
      return;
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
      toast.error("Please upload an image (JPG, PNG) or PDF file");
      return;
    }

    // Convert file to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileDataUrl = e.target?.result as string;
      
      const newVisionBoard: VisionBoardData = {
        type: "image",
        content: fileDataUrl,
        title: title || "My Vision Board"
      };

      setVisionBoardData(newVisionBoard);
      localStorage.setItem("visionBoardData", JSON.stringify(newVisionBoard));
      setActiveSection("view");
      toast.success("Vision board uploaded!");
    };

    reader.onerror = () => {
      toast.error("Error reading file");
    };

    reader.readAsDataURL(file);
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
    setTitle("");
    setLinkUrl("");
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

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <Button 
              onClick={triggerFileUpload} 
              className="w-full py-8 border-dashed border-2"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Click to upload image or PDF
            </Button>
            <p className="text-xs text-muted-foreground">
              Select a JPG, PNG or PDF file from your computer
            </p>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setActiveSection("view")}>Cancel</Button>
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
                {visionBoardData.content.includes("application/pdf") ? (
                  <div className="flex flex-col items-center gap-4 border rounded-md p-4">
                    <p>PDF Vision Board</p>
                    <Button 
                      onClick={() => window.open(visionBoardData.content, "_blank")}
                    >
                      View PDF
                    </Button>
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
                  <>
                    <img 
                      src={visionBoardData.content}
                      alt="Vision Board"
                      className="w-full h-auto max-h-[400px] object-contain rounded-md"
                      onError={() => toast.error("Unable to load image.")}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 rounded-full"
                      onClick={handleRemoveVisionBoard}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
                Upload
              </Button>
              <Button onClick={() => setActiveSection("link")} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Link
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
