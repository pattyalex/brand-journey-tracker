
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FinalPaymentDueDateCellProps {
  value: string;
  onChange: (value: string) => void;
}

const FinalPaymentDueDateCell = ({ value, onChange }: FinalPaymentDueDateCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse date from string if it exists
  const date = value && value !== "—" ? new Date(value) : undefined;
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    } else {
      onChange("—");
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn("h-8 w-full justify-start text-left font-normal", !date && "text-gray-400")}
        >
          {date ? (
            format(date, "MMM d, yyyy")
          ) : (
            "—"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 !bg-white !border !border-gray-200 !shadow-md" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

export default FinalPaymentDueDateCell;
