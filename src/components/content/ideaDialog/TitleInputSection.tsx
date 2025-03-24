
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight } from "lucide-react";

interface TitleInputSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
}

const TitleInputSection = ({
  title,
  onTitleChange,
}: TitleInputSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 mb-1">
        <ArrowUpRight size={18} className="text-gray-500" />
        <Label htmlFor="idea-title" className="text-sm font-medium">Title</Label>
      </div>
      <div className="relative">
        <Input
          id="idea-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a catchy hook for your idea..."
          className="w-full h-10 pr-2"
        />
      </div>
    </div>
  );
};

export default TitleInputSection;
