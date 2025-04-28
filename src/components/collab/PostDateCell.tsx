
import React, { useState } from 'react';
import { format } from "date-fns";
import { Smartphone } from "lucide-react"; 
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
            {/* Custom iPhone-style icon */}
            <div className="relative h-4 w-[3.5px] bg-blue-500 flex-shrink-0 rounded-sm">
              <div className="absolute top-[-1px] left-[-3px] h-[18px] w-[9.5px] border-2 border-blue-500 rounded-[3px]"></div>
              <div className="absolute top-[-3px] left-[-1.5px] h-[1.5px] w-[4.5px] bg-blue-500 rounded-t-sm"></div>
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
