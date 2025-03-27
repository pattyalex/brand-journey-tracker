
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TimeFilterSelectProps {
  onDateRangeChange: (range: string) => void;
  onCustomDateChange?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  selectedRange: string;
  className?: string;
}

const TimeFilterSelect: React.FC<TimeFilterSelectProps> = ({
  onDateRangeChange,
  onCustomDateChange,
  selectedRange,
  className,
}) => {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const handleDateSelect = (date: Date | undefined) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(undefined);
    } else if (date && date > startDate) {
      setEndDate(date);
      if (onCustomDateChange) {
        onCustomDateChange(startDate, date);
      }
    } else {
      setStartDate(date);
      setEndDate(undefined);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Select value={selectedRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="last3months">Last 3 months</SelectItem>
          <SelectItem value="last6months">Last 6 months</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>
      
      {selectedRange === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {startDate ? (
                endDate ? (
                  <span>
                    {format(startDate, "LLL dd, y")} - {format(endDate, "LLL dd, y")}
                  </span>
                ) : (
                  format(startDate, "LLL dd, y")
                )
              ) : (
                "Pick dates"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TimeFilterSelect;
