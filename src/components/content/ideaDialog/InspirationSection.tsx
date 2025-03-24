
import { useState } from "react";
import { PlusCircle, Link as LinkIcon, ImageIcon, X, Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        placeholder="If you're recreating or inspired by another piece of content, write notes about it here..."
        className="min-h-[60px] resize-y text-sm border-purple-200 focus-visible:ring-purple-400"
        value={inspirationText}
        onChange={(e) => onInspirationTextChange(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Label htmlFor="image-upload" className="cursor-pointer bg-purple-50 flex items-center gap-1 px-2 py-1 rounded border border-purple-200 text-xs hover:bg-purple-100 text-purple-700 transition-colors h-8">
          <ImageIcon className="h-3 w-3" />
          <span>Upload image</span>
        </Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
          className="h-8 flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 text-xs"
        >
          <LinkIcon className="h-3 w-3" />
          <span>Add link</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {inspirationLinks.map((link, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="flex items-center gap-1 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
          >
            <LinkIcon className="h-3 w-3" />
            <span className="max-w-[200px] truncate">{link}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveInspirationLink(index)}
              className="h-4 w-4 p-0 hover:bg-transparent hover:text-purple-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {inspirationImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-1">
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

      {/* Link Dialog */}
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
