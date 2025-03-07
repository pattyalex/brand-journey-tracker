
import { Label } from "@/components/ui/label";
import DateSchedulePicker from "../DateSchedulePicker";

interface SchedulingSectionProps {
  scheduledDate?: Date;
  onScheduledDateChange?: (date: Date | undefined) => void;
}

const SchedulingSection = ({
  scheduledDate,
  onScheduledDateChange,
}: SchedulingSectionProps) => {
  if (!onScheduledDateChange) return null;
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="scheduled-date">Schedule to Calendar</Label>
      <DateSchedulePicker 
        date={scheduledDate} 
        onDateChange={onScheduledDateChange}
        label=""
      />
    </div>
  );
};

export default SchedulingSection;
