
import { Label } from "@/components/ui/label";
import TagsInput from "../TagsInput";
import { Tag } from "lucide-react";

interface TagsSectionProps {
  tags: string[];
  currentTag: string;
  onCurrentTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

const TagsSection = ({
  tags,
  currentTag,
  onCurrentTagChange,
  onAddTag,
  onRemoveTag,
}: TagsSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Tag size={18} className="text-green-500" />
        <Label htmlFor="tags">Status</Label>
      </div>
      <TagsInput
        tags={tags}
        currentTag={currentTag}
        onTagChange={onCurrentTagChange}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        placeholder="Add status tags (e.g., To Film, To Edit)"
      />
    </div>
  );
};

export default TagsSection;
