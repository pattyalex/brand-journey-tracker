
import { useState } from "react";
import { PlusCircle, Link as LinkIcon, ImageIcon, X } from "lucide-react";
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-md border p-0 shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-50">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">
              Inspiration {hasInspiration && <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-600">{inspirationLinks.length + inspirationImages.length}</Badge>}
            </h4>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-3">
        <div className="grid gap-2 text-sm">
          <Textarea
            placeholder="If you're recreating or inspired by another piece of content, write notes about it here..."
            className="min-h-[60px] resize-y text-sm"
            value={inspirationText}
            onChange={(e) => onInspirationTextChange(e.target.value)}
          />

          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a link..."
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleAddLink}
                className="h-8 w-8 p-0"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {inspirationLinks.map((link, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <LinkIcon className="h-3 w-3" />
                  <span className="max-w-[200px] truncate">{link}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveInspirationLink(index)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <Label htmlFor="image-upload" className="cursor-pointer bg-slate-50 flex items-center gap-1 px-2 py-1 rounded border text-xs hover:bg-slate-100">
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

            {inspirationImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {inspirationImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square bg-gray-100 rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`Inspiration ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveInspirationImage(index)}
                      className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InspirationSection;
