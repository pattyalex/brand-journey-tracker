
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TitleHookSuggestions from "../TitleHookSuggestions";

interface TitleInputSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
}

const TitleInputSection = ({
  title,
  onTitleChange,
}: TitleInputSectionProps) => {
  return (
    <div className="grid gap-4">
      <Label htmlFor="idea-title" className="text-sm font-medium">Title</Label>
      <div className="relative flex items-center">
        <Input
          id="idea-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a catchy hook for your idea..."
          className="pr-16"
        />
        <TitleHookSuggestions onSelectHook={(hook) => onTitleChange(hook)} />
      </div>
    </div>
  );
};

export default TitleInputSection;
