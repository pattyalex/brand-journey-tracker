
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageUploadButtonProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadButton = ({ onImageUpload }: ImageUploadButtonProps) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="image-upload" className="cursor-pointer bg-purple-50 flex items-center justify-center rounded border border-purple-200 hover:bg-purple-100 text-purple-700 transition-colors h-7 w-7">
              <ImageIcon className="h-3.5 w-3.5" />
            </Label>
          </TooltipTrigger>
          <TooltipContent className="min-w-[120px] px-4 py-1.5 text-center" sideOffset={10} align="start">
            <p className="text-xs">Upload image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageUpload}
      />
    </>
  );
};

export default ImageUploadButton;
