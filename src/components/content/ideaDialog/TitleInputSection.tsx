
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
    <div className="grid gap-2">
      <Label htmlFor="idea-title">Title</Label>
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
