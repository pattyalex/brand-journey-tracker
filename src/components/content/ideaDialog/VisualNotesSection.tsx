
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { motion } from "framer-motion";

interface VisualNotesSectionProps {
  visualNotes: string;
  onVisualNotesChange: (value: string) => void;
}

const VisualNotesSection = ({
  visualNotes,
  onVisualNotesChange,
}: VisualNotesSectionProps) => {
  return (
    <motion.div 
      layout
      transition={{ 
        layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }
      }}
      className="h-full grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Image size={18} className="text-gray-600" />
        <Label htmlFor="visual-notes" className="font-medium">Visual Notes</Label>
      </div>
      <Textarea
        id="visual-notes"
        value={visualNotes}
        onChange={(e) => onVisualNotesChange(e.target.value)}
        placeholder="Think of angles, visual subliminal hooks, any creative details..."
        className="min-h-[150px] h-full resize-y focus-visible:ring-gray-400" 
      />
    </motion.div>
  );
};

export default VisualNotesSection;
