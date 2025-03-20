
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateSchedulePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  className?: string;
}

const DateSchedulePicker = ({
  date,
  onDateChange,
  label = "Schedule for post",
  className,
}: DateSchedulePickerProps) => {
  return (
    <div className={cn("grid gap-1", className)}>
      {label && <div className="text-xs font-medium">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            className={cn(
              "justify-start text-left font-normal min-w-[70px] max-w-full px-1.5 py-0.5 h-6",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {date ? format(date, "PPP") : (
              <span className="flex flex-col items-start text-xs leading-tight">
                <span>Pick a date</span>
                <span className="text-[10px]">for scheduling</span>
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            className="p-1.5 pointer-events-auto scale-90 origin-top-left"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSchedulePicker;
