
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface ShootDetailsSectionProps {
  shootDetails: string;
  onShootDetailsChange: (value: string) => void;
}

const ShootDetailsSection = ({
  shootDetails,
  onShootDetailsChange,
}: ShootDetailsSectionProps) => {
  return (
    <div className="grid gap-2 bg-white rounded-lg p-4 border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-2">
        <Camera size={18} className="text-gray-600" />
        <Label htmlFor="shoot-details" className="font-medium">Shoot Details</Label>
      </div>
      <Textarea
        id="shoot-details"
        value={shootDetails}
        onChange={(e) => onShootDetailsChange(e.target.value)}
        placeholder="Enter details about the shoot, such as location, outfits, props needed..."
        className="min-h-[150px] resize-y focus-visible:ring-gray-400" 
      />
    </div>
  );
};

export default ShootDetailsSection;
