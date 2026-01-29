
import React from 'react';
import { Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceSentCellProps {
  value: string;
  onChange: (value: string) => void;
}

const InvoiceSentCell = ({ value, onChange }: InvoiceSentCellProps) => {
  const isYes = value === "Yes";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 w-full justify-center font-normal",
            isYes ? "text-green-600" : "text-gray-400"
          )}
        >
          <span className="text-lg">
            {isYes ? "✓" : "—"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[120px] !bg-white !border !border-gray-200 !shadow-md">
        <DropdownMenuItem onClick={() => onChange("Yes")}>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          <span>Yes</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("No")}>
          <X className="h-4 w-4 mr-2 text-red-500" />
          <span className="text-red-500">No</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceSentCell;
