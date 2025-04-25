
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageGallery = ({ images, onRemoveImage }: ImageGalleryProps) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {images.map((image, index) => (
        <div key={index} className="relative group aspect-square bg-purple-50 rounded overflow-hidden border border-purple-200">
          <img
            src={image}
            alt={`Inspiration ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveImage(index)}
            className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white/90"
          >
            <X className="h-3 w-3 text-purple-600" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
