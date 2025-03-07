
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <Label htmlFor="caption-text">Caption</Label>
      <Textarea
        id="caption-text"
        value={captionText}
        onChange={(e) => onCaptionTextChange(e.target.value)}
        placeholder="Draft a caption for your content when posting to social media platforms..."
        className="min-h-[100px] resize-y"
      />
    </div>
  );
};

export default CaptionInputSection;
