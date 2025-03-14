
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BucketSelectionSectionProps {
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
}

type ContentBucket = {
  id: string;
  name: string;
  description: string;
};

const BucketSelectionSection = ({
  bucketId,
  onBucketChange,
  pillarId
}: BucketSelectionSectionProps) => {
  const [contentBuckets, setContentBuckets] = useState<ContentBucket[]>([]);
  
  useEffect(() => {
    try {
      const savedBuckets = localStorage.getItem(`content-buckets-${pillarId}`);
      if (savedBuckets) {
        const parsedBuckets = JSON.parse(savedBuckets);
        setContentBuckets(parsedBuckets);
      } else {
        // Default buckets if none found in localStorage
        setContentBuckets([
          { id: "blog", name: "Blog Posts", description: "Long-form written content" },
          { id: "video", name: "Video Content", description: "Video-based content" },
          { id: "social", name: "Social Media", description: "Short-form posts" },
          { id: "image", name: "Image Content", description: "Visual content" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load content buckets:", error);
    }
  }, [pillarId]);

  return (
    <div className="space-y-2">
      <Label htmlFor="bucket-select" className="text-sm font-medium">
        Content Bucket
      </Label>
      <Select 
        value={bucketId} 
        onValueChange={onBucketChange}
      >
        <SelectTrigger id="bucket-select" className="w-full">
          <SelectValue placeholder="Select a content bucket" />
        </SelectTrigger>
        <SelectContent>
          {contentBuckets.map((bucket) => (
            <SelectItem key={bucket.id} value={bucket.id}>
              {bucket.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {bucketId && (
        <p className="text-xs text-gray-500 mt-1">
          {contentBuckets.find(b => b.id === bucketId)?.description || ""}
        </p>
      )}
    </div>
  );
};

export default BucketSelectionSection;
