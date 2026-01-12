import { useState, useEffect, useRef } from "react";
import { Eye, ExternalLink, Upload, X, Maximize, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { VisionBoardData } from "@/types/planner";
import { StorageKeys, getString, remove, setString } from "@/lib/storage";

export const VisionBoardButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visionBoardData, setVisionBoardData] = useState<VisionBoardData | null>(null);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [activeSection, setActiveSection] = useState<"upload" | "link" | "view">("view");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedData = getString(StorageKeys.visionBoardData);
    if (savedData) {
      setVisionBoardData(JSON.parse(savedData));
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const fileType = file.type;
    if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
      toast.error("Please upload an image (JPG, PNG) or PDF file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileDataUrl = e.target?.result as string;
      
      const newVisionBoard: VisionBoardData = {
        type: fileType === "application/pdf" ? "pdf" : "image",
        content: fileDataUrl,
        title: title || "My Vision Board"
      };

      setVisionBoardData(newVisionBoard);
      setString(StorageKeys.visionBoardData, JSON.stringify(newVisionBoard));
      setActiveSection("view");
      toast.success("Vision board uploaded!");
    };

    reader.onerror = () => {
      toast.error("Error reading file");
    };

    reader.readAsDataURL(file);
  };

  const handleLinkUpload = () => {
    if (!linkUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

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
    setString(StorageKeys.visionBoardData, JSON.stringify(newVisionBoard));
    setActiveSection("view");
    toast.success("Vision board link saved!");
  };

  const handleRemoveVisionBoard = () => {
    setVisionBoardData(null);
    remove(StorageKeys.visionBoardData);
    setTitle("");
    setLinkUrl("");
    toast.success("Vision board removed");
  };

  const openExternalLink = () => {
    if (visionBoardData?.type === "link" && visionBoardData.content) {
      window.open(visionBoardData.content, "_blank", "noopener,noreferrer");
    }
  };

  const openPDFInNewTab = () => {
    if (visionBoardData?.type === "pdf" && visionBoardData.content) {
      const pdfWindow = window.open();
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>${visionBoardData.title || 'PDF Vision Board'}</title>
              <style>
                body, html {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  overflow: hidden;
                }
                embed {
                  width: 100%;
                  height: 100%;
                }
              </style>
            </head>
            <body>
              <embed src="${visionBoardData.content}" type="application/pdf" width="100%" height="100%">
            </body>
          </html>
        `);
        pdfWindow.document.close();
      } else {
        toast.error("Unable to open PDF. Please check your popup settings.");
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveSection("view");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleFullScreen = () => {
    setIsFullScreenOpen(!isFullScreenOpen);
  };

  const renderContent = () => {
    if (visionBoardData && activeSection === "view") {
      if (visionBoardData.type === "image") {
        return (
          <div className="relative w-full">
            <div className="relative">
              <img 
                src={visionBoardData.content}
                alt="Vision Board"
                className="w-full h-auto max-h-[400px] object-contain rounded-md cursor-pointer"
                onError={() => toast.error("Unable to load image.")}
                onClick={toggleFullScreen}
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 rounded-full"
                onClick={handleRemoveVisionBoard}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-2 right-2 bg-background/80 rounded-full"
                onClick={toggleFullScreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      } else if (visionBoardData.type === "pdf") {
        return (
          <div className="flex flex-col items-center gap-4 border rounded-md p-6 relative">
            <FileText className="h-16 w-16 text-primary" />
            <p className="text-center font-medium">PDF Vision Board</p>
            <Button 
              onClick={openPDFInNewTab}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
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
        );
      } else {
        return (
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
        );
      }
    }

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
            External Link
          </Button>
        </div>
      </div>
    );
  };

  const renderFullScreenDialog = () => {
    if (!visionBoardData || visionBoardData.type !== "image" || visionBoardData.content.includes("application/pdf")) {
      return null;
    }

    return (
      <div 
        className={`fixed inset-0 z-[100] bg-black ${isFullScreenOpen ? 'flex' : 'hidden'} items-center justify-center`}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 rounded-full z-[101]"
          onClick={toggleFullScreen}
        >
          <X className="h-4 w-4" />
        </Button>
        <img 
          src={visionBoardData.content}
          alt="Vision Board"
          className="max-w-full max-h-full object-contain px-4"
          onError={() => toast.error("Unable to load image.")}
        />
      </div>
    );
  };

  return (
    <>
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
      
      {renderFullScreenDialog()}
    </>
  );
};
