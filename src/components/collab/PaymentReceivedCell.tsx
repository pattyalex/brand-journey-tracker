
import React from 'react';
import { Check, Clock, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentReceivedCellProps {
  value: string;
  onChange: (value: string) => void;
}

const PaymentReceivedCell = ({ value, onChange }: PaymentReceivedCellProps) => {
  // Determine which status is selected
  const isPaid = value === "Paid";
  const isUnpaid = value === "Unpaid";
  const isOverdue = value === "Overdue";
  
  // Return appropriate icon and color based on status
  const getStatusDetails = () => {
    if (isPaid) {
      return { 
        icon: <Check className="h-4 w-4 mr-2 text-green-600" />,
        textColor: "text-green-600"
      };
    } else if (isUnpaid) {
      return { 
        icon: <Clock className="h-4 w-4 mr-2 text-amber-500" />,
        textColor: "text-amber-500"
      };
    } else if (isOverdue) {
      return { 
        icon: <AlertCircle className="h-4 w-4 mr-2 text-red-500" />,
        textColor: "text-red-500"
      };
    }
    
    // Default to Unpaid if no status is set
    return { 
      icon: <Clock className="h-4 w-4 mr-2 text-amber-500" />,
      textColor: "text-amber-500"
    };
  };
  
  const { icon, textColor } = getStatusDetails();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "h-8 w-full justify-start text-left font-normal",
            textColor
          )}
        >
          <span className="flex items-center">
            {icon}
            {value || "Unpaid"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[120px]">
        <DropdownMenuItem onClick={() => onChange("Paid")} className="text-green-600">
          <Check className="h-4 w-4 mr-2 text-green-600" />
          <span>Paid</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("Unpaid")} className="text-amber-500">
          <Clock className="h-4 w-4 mr-2 text-amber-500" />
          <span>Unpaid</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("Overdue")} className="text-red-500">
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          <span>Overdue</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PaymentReceivedCell;
