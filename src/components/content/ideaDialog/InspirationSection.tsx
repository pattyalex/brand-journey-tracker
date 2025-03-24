
import { useState } from "react";
import { PlusCircle, Link as LinkIcon, ImageIcon, X, Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

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

  const handleAddLink = () => {
    if (currentLink.trim()) {
      onAddInspirationLink(currentLink.trim());
      setCurrentLink("");
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

      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder="Add a link..."
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              className="h-8 text-xs border-purple-200 focus-visible:ring-purple-400 w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAddLink}
              className="h-8 w-8 p-0 border-purple-200 hover:bg-purple-100 hover:text-purple-700 flex-shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <Label htmlFor="image-upload" className="cursor-pointer bg-purple-50 flex items-center gap-1 px-2 py-1 rounded border border-purple-200 text-xs hover:bg-purple-100 text-purple-700 transition-colors flex-shrink-0">
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
    </div>
  );
};

export default InspirationSection;
