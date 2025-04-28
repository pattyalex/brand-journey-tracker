
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface DepositPaidCellProps {
  value: string;
  onChange: (value: string) => void;
}

const DepositPaidCell = ({ value, onChange }: DepositPaidCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the current value
  const isYes = value.toLowerCase().startsWith('yes');
  const isNA = value.toLowerCase() === 'n/a';
  const amount = isYes 
    ? value.match(/\$[\d,.]+/) 
      ? value.match(/\$[\d,.]+/)?.[0] || ''
      : ''
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  const handleRadioChange = (val: string) => {
    if (val === "yes") {
      const amountStr = amount ? ` - ${amount}` : '';
      onChange(`Yes${amountStr}`);
    } else if (val === "no") {
      onChange("No");
    } else if (val === "n/a") {
      onChange("N/A");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    if (newAmount) {
      onChange(`Yes - ${newAmount.startsWith('$') ? newAmount : `$${newAmount}`}`);
    } else {
      onChange("Yes");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-full justify-start text-left font-normal"
        >
          {value || "No"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-4" side="bottom">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <RadioGroup 
            value={isNA ? "n/a" : (isYes ? "yes" : "no")}
            onValueChange={handleRadioChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="n/a" id="n/a" />
              <Label htmlFor="n/a">N/A</Label>
            </div>
          </RadioGroup>
          
          {isYes && (
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Amount</Label>
              <Input 
                id="depositAmount"
                placeholder="$0.00"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            size="sm" 
            className="w-full mt-4"
          >
            <Check className="mr-2 h-4 w-4" /> Done
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default DepositPaidCell;
