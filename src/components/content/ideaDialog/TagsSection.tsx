
import { Label } from "@/components/ui/label";
import TagsInput from "../TagsInput";

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
      <Label htmlFor="tags">Tags</Label>
      <TagsInput
        tags={tags}
        currentTag={currentTag}
        onTagChange={onCurrentTagChange}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        placeholder="Add tags (e.g., To Film, To Edit, To Post, Finalize Details)"
      />
    </div>
  );
};

export default TagsSection;
