
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface VisualNotesSectionProps {
  visualNotes: string;
  onVisualNotesChange: (value: string) => void;
}

const VisualNotesSection = ({
  visualNotes,
  onVisualNotesChange,
}: VisualNotesSectionProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="visual-notes">Visual Notes</Label>
      <Textarea
        id="visual-notes"
        value={visualNotes}
        onChange={(e) => onVisualNotesChange(e.target.value)}
        placeholder="Describe different shots and angles you want to capture to convey your ideas..."
        className="min-h-[150px] resize-y"
      />
    </div>
  );
};

export default VisualNotesSection;
