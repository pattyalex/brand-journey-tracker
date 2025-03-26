
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div 
      className="grid gap-2 px-4 py-3 mx-2 overflow-visible"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 mb-1 ml-1">
        <FolderIcon size={18} className="text-gray-500" />
        <Label htmlFor="format-select" className="text-sm font-medium">
          Pisica
        </Label>
      </div>
      <Select 
        value={bucketId} 
        onValueChange={onBucketChange}
      >
        <SelectTrigger id="format-select" className="w-full h-10 pl-2">
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
    </motion.div>
  );
};

export default BucketSelectionSection;
