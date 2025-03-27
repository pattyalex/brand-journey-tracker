import { useState } from "react";
import { PlusCircle, Link as LinkIcon, ImageIcon, X, Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InspirationSectionProps {
  inspirationText: string;
  onInspirationTextChange: (value: string) => void;
  inspirationLinks: string[];
  onAddInspirationLink: (link: string) => void;
  onRemoveInspirationLink: (index: number) => void;
  inspirationImages: string[];
  onAddInspirationImage: (image: string) => void;
  onRemoveInspirationImage: (index: number) => void;
}

const InspirationSection = ({
  inspirationText,
  onInspirationTextChange,
  inspirationLinks,
  onAddInspirationLink,
  onRemoveInspirationLink,
  inspirationImages,
  onAddInspirationImage,
  onRemoveInspirationImage
}: InspirationSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const handleAddLink = () => {
    if (currentLink.trim()) {
      onAddInspirationLink(currentLink.trim());
      setCurrentLink("");
      setShowLinkDialog(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onAddInspirationImage(dataUrl);
        setUploadedImage(null);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const hasInspiration = inspirationText.trim() !== '' || inspirationLinks.length > 0 || inspirationImages.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb size={18} className="text-purple-500" />
        <h3 className="text-sm font-medium text-purple-700">Inspiration</h3>
        {hasInspiration && (
          <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-600 border-purple-200">
            {inspirationLinks.length + inspirationImages.length}
          </Badge>
        )}
      </div>

      <Textarea
        placeholder="If you're inspired by or looking to recreate another piece of content, upload it here."
        className="min-h-[60px] resize-y text-sm border-purple-200 focus-visible:ring-purple-400"
        value={inspirationText}
        onChange={(e) => onInspirationTextChange(e.target.value)}
      />

      <div className="flex items-center flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor="image-upload" className="cursor-pointer bg-purple-50 flex items-center justify-center rounded border border-purple-200 hover:bg-purple-100 text-purple-700 transition-colors h-7 w-7">
                <ImageIcon className="h-3.5 w-3.5" />
              </Label>
            </TooltipTrigger>
            <TooltipContent className="min-w-[120px] px-4 py-1.5 text-center" sideOffset={5} align="end">
              <p className="text-xs">Upload image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowLinkDialog(true)}
                className="h-6 w-6 p-0 flex items-center justify-center bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <LinkIcon className="h-2.5 w-2.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="min-w-[90px] px-4 py-1.5 text-center" sideOffset={5} align="end">
              <p className="text-xs">Add link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {inspirationLinks.map((link, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="flex items-center gap-1 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 h-5 px-1 py-0 text-[10px]"
          >
            <LinkIcon className="h-2 w-2" />
            <span className="max-w-[150px] truncate text-[10px]">{link}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveInspirationLink(index)}
              className="h-3 w-3 p-0 hover:bg-transparent hover:text-purple-800"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        ))}
      </div>

      {inspirationImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {inspirationImages.map((image, index) => (
            <div key={index} className="relative group aspect-square bg-purple-50 rounded overflow-hidden border border-purple-200">
              <img
                src={image}
                alt={`Inspiration ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveInspirationImage(index)}
                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white/90"
              >
                <X className="h-3 w-3 text-purple-600" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">Add Inspiration Link</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Enter link URL..."
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              className="text-sm border-purple-200 focus-visible:ring-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLinkDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              size="sm"
              onClick={handleAddLink}
              variant="vision"
              disabled={!currentLink.trim()}
            >
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspirationSection;
