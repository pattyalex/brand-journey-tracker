
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { motion } from "framer-motion";

interface TitleInputSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
}

const TitleInputSection = ({
  title,
  onTitleChange,
}: TitleInputSectionProps) => {
  return (
    <motion.div 
      className="grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div 
        className="flex items-center gap-2 ml-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Target size={18} className="text-gray-500" />
        <Label htmlFor="idea-title" className="text-sm font-medium">Title</Label>
      </motion.div>
      <motion.div 
        className="relative px-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Input
          id="idea-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a catchy hook for your idea..."
          className="w-full h-10 pr-2"
        />
      </motion.div>
    </motion.div>
  );
};

export default TitleInputSection;
