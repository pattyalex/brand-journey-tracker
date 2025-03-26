
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";

interface ShootDetailsSectionProps {
  shootDetails: string;
  onShootDetailsChange: (value: string) => void;
}

const ShootDetailsSection = ({
  shootDetails,
  onShootDetailsChange,
}: ShootDetailsSectionProps) => {
  return (
    <motion.div 
      layout
      transition={{ 
        layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }
      }}
      className="h-full grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <Camera size={18} className="text-gray-600" />
        <Label htmlFor="shoot-details" className="font-medium">Shoot Details</Label>
      </div>
      <Textarea
        id="shoot-details"
        value={shootDetails}
        onChange={(e) => onShootDetailsChange(e.target.value)}
        placeholder="Enter details about the shoot, such as location, outfits, props needed..."
        className="min-h-[150px] h-full resize-y focus-visible:ring-gray-400" 
      />
    </motion.div>
  );
};

export default ShootDetailsSection;
