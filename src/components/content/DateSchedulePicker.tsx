
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
    <div className={cn("grid gap-0.5 rounded border border-gray-200 bg-gray-50 p-1.5", className)}>
      {label && <div className="text-xs font-medium px-1">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            className={cn(
              "justify-start text-left font-normal min-w-[60px] max-w-full px-1 py-0 h-5 bg-white",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-0.5 h-2.5 w-2.5" />
            {date ? format(date, "MM/dd/yy") : (
              <span className="text-[10px] leading-none flex items-center">Pick date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            className="p-1 pointer-events-auto scale-75 origin-top-left"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSchedulePicker;
