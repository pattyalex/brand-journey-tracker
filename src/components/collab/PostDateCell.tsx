
import React, { useState } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PostDateCellProps {
  value: string;
  onChange: (value: string) => void;
}

const PostDateCell = ({ value, onChange }: PostDateCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse date from string if it exists
  const date = value && value !== "Not set" ? new Date(value) : undefined;
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    } else {
      onChange("Not set");
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-full justify-start text-left font-normal"
        >
          <div className="flex items-center gap-2">
            {/* Better iPhone-style icon */}
            <div className="relative h-5 w-3 bg-transparent flex-shrink-0">
              <div className="absolute inset-0 rounded-lg border-2 border-blue-500"></div>
              <div className="absolute top-[2px] left-[0.5px] right-[0.5px] h-[2px] bg-blue-500 rounded"></div>
              <div className="absolute bottom-[3px] left-1/2 h-[2px] w-[2px] bg-blue-500 rounded-full transform -translate-x-1/2"></div>
            </div>
            <span className="truncate">
              {date ? format(date, "MMM d, yyyy") : "Not set"}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto z-[9999]")}
        />
      </PopoverContent>
    </Popover>
  );
};

export default PostDateCell;
