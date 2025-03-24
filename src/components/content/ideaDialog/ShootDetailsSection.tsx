
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
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Camera size={18} className="text-muted-foreground" />
        <Label htmlFor="shoot-details">Shoot Details</Label>
      </div>
      <Textarea
        id="shoot-details"
        value={shootDetails}
        onChange={(e) => onShootDetailsChange(e.target.value)}
        placeholder="Enter details about the shoot, such as location, outfits, props needed..."
        className="min-h-[150px] resize-y" // Increased height for better balance in the layout
      />
    </div>
  );
};

export default ShootDetailsSection;
