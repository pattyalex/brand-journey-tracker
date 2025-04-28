
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
import { Smartphone } from "lucide-react";

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
          className="h-8 w-full justify-start text-left font-normal pl-1 pr-2"
        >
          <div className="flex items-center w-full">
            <Smartphone size={16} className="text-blue-500 mr-1.5 flex-shrink-0" />
            <span className="truncate text-left">
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
