
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { contentFormatsByPillar, getString } from "@/lib/storage";

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
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!pillarId) {
      setContentFormats([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const savedFormats = getString(contentFormatsByPillar(pillarId));
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
    } finally {
      setIsLoading(false);
    }
  }, [pillarId]);

  return (
    <motion.div 
      className="grid gap-2 py-3 overflow-visible"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-1">
        <Flame size={18} className="text-black" />
        <Label htmlFor="format-select" className="text-sm font-medium">
          Content Format
        </Label>
      </div>
      <Select 
        value={bucketId} 
        onValueChange={onBucketChange}
        disabled={!pillarId}
      >
        <SelectTrigger 
          id="format-select" 
          className={`w-full h-10 pl-3 ${!pillarId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SelectValue placeholder={!pillarId ? "Select a pillar first" : "Select a content format"} />
        </SelectTrigger>
        <SelectContent>
          {contentFormats.length > 0 ? (
            contentFormats.map((format) => (
              <SelectItem key={format.id} value={format.id}>
                {format.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-formats" disabled>
              {isLoading ? "Loading formats..." : "No formats available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default BucketSelectionSection;
