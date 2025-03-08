
import { useState, useEffect } from "react";
import { Eye, ExternalLink, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { VisionBoardData } from "@/types/planner";

export const VisionBoardButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visionBoardData, setVisionBoardData] = useState<VisionBoardData | null>(null);
  const [activeTab, setActiveTab] = useState<"view" | "upload">("view");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [title, setTitle] = useState("");

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
    setActiveTab("view");
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
    setActiveTab("view");
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Vision Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {visionBoardData ? visionBoardData.title || "Vision Board" : "Vision Board"}
          </DialogTitle>
          <DialogDescription>
            Visualize your goals and aspirations to stay motivated.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "view" | "upload")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="pt-4">
            {visionBoardData ? (
              <div className="flex flex-col items-center gap-4">
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <p className="text-center text-muted-foreground">
                  No vision board found. Add one by going to the Upload tab.
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Vision Board
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="My Vision Board"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="https://example.com/my-vision-board.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button onClick={handleImageUpload}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the URL of an image to use as your vision board
                </p>
              </div>

              <div className="my-4 text-center">
                <p className="text-sm text-muted-foreground">OR</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="external-link">External Link (Pinterest, etc.)</Label>
                <div className="flex gap-2">
                  <Input
                    id="external-link"
                    placeholder="https://pinterest.com/my-vision-board"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <Button onClick={handleLinkUpload}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a link to an external vision board (Pinterest, etc.)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
