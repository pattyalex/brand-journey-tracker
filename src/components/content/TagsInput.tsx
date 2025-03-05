
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTagColorClasses } from "@/utils/tagColors";

interface TagsInputProps {
  tags: string[];
  currentTag: string;
  onTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
}

const TagsInput = ({
  tags,
  currentTag,
  onTagChange,
  onAddTag,
  onRemoveTag,
  placeholder = "Add tags..."
}: TagsInputProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input
          value={currentTag}
          onChange={(e) => onTagChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
          className="flex-1"
        />
        <Button type="button" onClick={onAddTag} variant="outline" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 ${getTagColorClasses(tag)}`}
          >
            {tag}
            <button 
              type="button" 
              onClick={() => onRemoveTag(tag)}
              className="hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
