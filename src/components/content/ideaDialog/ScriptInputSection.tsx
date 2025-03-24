
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <Label htmlFor="develop-script">Script</Label>
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
