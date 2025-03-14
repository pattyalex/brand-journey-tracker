
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link, Image, Trash2 } from "lucide-react";

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
  const [currentLink, setCurrentLink] = useState("");
  
  const handleAddLink = () => {
    if (currentLink.trim()) {
      onAddInspirationLink(currentLink.trim());
      setCurrentLink("");
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAddInspirationImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="inspirationText" className="text-base font-medium">Inspiration</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Add links, images, or notes that inspired this idea
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="inspirationText" className="text-sm">Notes</Label>
        <Textarea
          id="inspirationText"
          value={inspirationText}
          onChange={(e) => onInspirationTextChange(e.target.value)}
          placeholder="Write what inspired this idea..."
          className="resize-y min-h-[80px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="inspirationLink" className="text-sm">Add Links</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="inspirationLink"
            value={currentLink}
            onChange={(e) => setCurrentLink(e.target.value)}
            placeholder="https://example.com"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={handleAddLink}
            disabled={!currentLink.trim()}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        {inspirationLinks.length > 0 && (
          <div className="space-y-2 mt-2">
            {inspirationLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <Link className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm truncate flex-1 hover:underline"
                >
                  {link}
                </a>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => onRemoveInspirationLink(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="inspirationImage" className="text-sm">Upload Images</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="inspirationImage"
            type="file"
            accept="image/*"
            className="flex-1"
            onChange={handleImageUpload}
          />
        </div>
        
        {inspirationImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {inspirationImages.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Inspiration ${index + 1}`}
                  className="w-full h-auto rounded-md object-cover aspect-video"
                />
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveInspirationImage(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationSection;
