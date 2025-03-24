
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Label htmlFor="idea-title" className="text-sm font-medium">Title</Label>
      <div className="relative">
        <Input
          id="idea-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a catchy hook for your idea..."
          className="w-full h-10"
        />
      </div>
    </div>
  );
};

export default TitleInputSection;
