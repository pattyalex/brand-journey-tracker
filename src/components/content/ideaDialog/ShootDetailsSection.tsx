
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <Label htmlFor="shoot-details">Shoot Details</Label>
      <Textarea
        id="shoot-details"
        value={shootDetails}
        onChange={(e) => onShootDetailsChange(e.target.value)}
        placeholder="Enter details about the shoot, such as location, outfits, props needed..."
        className="min-h-[100px] resize-y"
      />
    </div>
  );
};

export default ShootDetailsSection;
