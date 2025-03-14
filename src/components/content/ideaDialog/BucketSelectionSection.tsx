
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "lucide-react";

interface BucketSelectionSectionProps {
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
}

type ContentFormat = {
  id: string;
  name: string;
  description: string;
};

const BucketSelectionSection = ({
  bucketId,
  onBucketChange,
  pillarId
}: BucketSelectionSectionProps) => {
  const [contentFormats, setContentFormats] = useState<ContentFormat[]>([]);
  
  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem(`content-formats-${pillarId}`);
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        setContentFormats(parsedFormats);
      } else {
        // Default formats if none found in localStorage
        setContentFormats([
          { id: "blog", name: "Blog Posts", description: "Long-form written content" },
          { id: "video", name: "Video Content", description: "Video-based content" },
          { id: "social", name: "Social Media", description: "Short-form posts" },
          { id: "image", name: "Image Content", description: "Visual content" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load content formats:", error);
    }
  }, [pillarId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-purple-500" />
        <Label htmlFor="format-select" className="text-sm font-medium">
          Content Format
        </Label>
      </div>
      <Select 
        value={bucketId} 
        onValueChange={onBucketChange}
      >
        <SelectTrigger id="format-select" className="w-full border-dashed border-purple-200 bg-purple-50/50">
          <SelectValue placeholder="Select a content format" />
        </SelectTrigger>
        <SelectContent>
          {contentFormats.map((format) => (
            <SelectItem key={format.id} value={format.id}>
              {format.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {bucketId && (
        <div className="text-xs text-gray-500 mt-2 bg-white p-2 rounded border border-gray-200 shadow-sm rotate-[-0.5deg]">
          {contentFormats.find(f => f.id === bucketId)?.description || ""}
        </div>
      )}
    </div>
  );
};

export default BucketSelectionSection;
