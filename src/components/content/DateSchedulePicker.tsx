
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
    <div className={cn(
      "grid gap-2 p-3 border border-gray-200 rounded-md bg-white shadow-sm max-w-[300px]", 
      className
    )}>
      {label && <div className="text-sm font-medium">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal border-gray-300 w-full",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : (
              <span className="flex flex-col items-start">
                <span>Pick a date</span>
                <span>for scheduling</span>
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              console.log("Date selected:", selectedDate);
              onDateChange(selectedDate);
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSchedulePicker;
