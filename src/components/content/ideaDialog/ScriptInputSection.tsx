
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ScriptInputSectionProps {
  scriptText: string;
  onScriptTextChange: (value: string) => void;
}

const ScriptInputSection = ({
  scriptText,
  onScriptTextChange,
}: ScriptInputSectionProps) => {
  return (
    <div className="grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 mb-1 ml-4">
        <FileText size={18} className="text-gray-600" />
        <Label htmlFor="develop-script" className="font-medium">Script</Label>
      </div>
      <Textarea
        id="develop-script"
        value={scriptText}
        onChange={(e) => onScriptTextChange(e.target.value)}
        placeholder="Write your script here..."
        className="min-h-[385px] resize-y focus-visible:ring-gray-400" 
      />
    </div>
  );
};

export default ScriptInputSection;
