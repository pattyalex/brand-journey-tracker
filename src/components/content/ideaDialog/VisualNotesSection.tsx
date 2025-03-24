
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface VisualNotesSectionProps {
  visualNotes: string;
  onVisualNotesChange: (value: string) => void;
}

const VisualNotesSection = ({
  visualNotes,
  onVisualNotesChange,
}: VisualNotesSectionProps) => {
  return (
    <div className="grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-2">
        <Image size={18} className="text-gray-600" />
        <Label htmlFor="visual-notes" className="font-medium">Visual Notes</Label>
      </div>
      <Textarea
        id="visual-notes"
        value={visualNotes}
        onChange={(e) => onVisualNotesChange(e.target.value)}
        placeholder="Describe different shots and angles you want to capture to convey your ideas..."
        className="min-h-[150px] resize-y focus-visible:ring-gray-400" 
      />
    </div>
  );
};

export default VisualNotesSection;
