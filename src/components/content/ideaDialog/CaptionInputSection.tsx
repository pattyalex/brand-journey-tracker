
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

interface CaptionInputSectionProps {
  captionText: string;
  onCaptionTextChange: (value: string) => void;
}

const CaptionInputSection = ({
  captionText,
  onCaptionTextChange,
}: CaptionInputSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-amber-500" />
        <Label htmlFor="caption-text" className="text-amber-700 font-medium">Caption</Label>
      </div>
      <Textarea
        id="caption-text"
        value={captionText}
        onChange={(e) => onCaptionTextChange(e.target.value)}
        placeholder="Draft a caption for your content when posting to social media platforms..."
        className="min-h-[100px] resize-y border-amber-200 focus-visible:ring-amber-400"
      />
    </div>
  );
};

export default CaptionInputSection;
