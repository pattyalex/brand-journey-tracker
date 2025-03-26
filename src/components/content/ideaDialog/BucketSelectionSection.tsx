
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BucketSelectionSectionProps {
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
}

const BucketSelectionSection = ({
  bucketId,
  onBucketChange,
  pillarId,
}: BucketSelectionSectionProps) => {
  const [buckets, setBuckets] = useState([
    { id: "post", label: "Post" },
    { id: "reel", label: "Reel" },
    { id: "story", label: "Story" },
    { id: "tiktok", label: "TikTok" },
    { id: "youtube", label: "YouTube" },
  ]);

  return (
    <div className="max-w-xs">
      <Select value={bucketId} onValueChange={onBucketChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a content format" />
        </SelectTrigger>
        <SelectContent>
          {buckets.map((bucket) => (
            <SelectItem key={bucket.id} value={bucket.id}>
              {bucket.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BucketSelectionSection;
