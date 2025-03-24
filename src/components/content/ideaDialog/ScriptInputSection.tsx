
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface ScriptInputSectionProps {
  scriptText: string;
  onScriptTextChange: (value: string) => void;
}

const ScriptInputSection = ({
  scriptText,
  onScriptTextChange,
}: ScriptInputSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-muted-foreground" />
        <Label htmlFor="develop-script">Script</Label>
      </div>
      <Textarea
        id="develop-script"
        value={scriptText}
        onChange={(e) => onScriptTextChange(e.target.value)}
        placeholder="Write your script here..."
        className="min-h-[350px] resize-y" // Increased height for the column layout
      />
    </div>
  );
};

export default ScriptInputSection;
