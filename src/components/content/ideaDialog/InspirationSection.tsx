
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ImageUploadButton from "./inspiration/ImageUploadButton";
import LinkManager from "./inspiration/LinkManager";
import ImageGallery from "./inspiration/ImageGallery";
import AddLinkDialog from "./inspiration/AddLinkDialog";

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
        <h3 className="text-sm font-medium text-purple-700">Inspiration Gallery</h3>
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
        <ImageUploadButton onImageUpload={handleImageUpload} />
        <LinkManager
          links={inspirationLinks}
          onRemoveLink={onRemoveInspirationLink}
          onOpenLinkDialog={() => setShowLinkDialog(true)}
        />
      </div>

      <ImageGallery 
        images={inspirationImages}
        onRemoveImage={onRemoveInspirationImage}
      />

      <AddLinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        currentLink={currentLink}
        onCurrentLinkChange={setCurrentLink}
        onAddLink={handleAddLink}
      />
    </div>
  );
};

export default InspirationSection;
