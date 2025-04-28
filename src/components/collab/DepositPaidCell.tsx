
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface DepositPaidCellProps {
  value: string;
  onChange: (value: string) => void;
}

const DepositPaidCell = ({ value, onChange }: DepositPaidCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the current value
  const isYes = value.toLowerCase().startsWith('yes');
  const isNo = value.toLowerCase().startsWith('no');
  const isNA = value.toLowerCase() === 'n/a';
  
  // Parse amounts from the value string
  const amountMatch = value.match(/\$[\d,.]+/);
  const amount = isYes && amountMatch ? amountMatch[0] : '';
  
  // Extract the "should pay" amount when No is selected
  const shouldPayMatch = isNo && value.includes('Should pay:') ? 
    value.match(/Should pay:\s*\$[\d,.]+/) : null;
  const shouldPayAmount = shouldPayMatch ? 
    shouldPayMatch[0].replace('Should pay:', '').trim() : '';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  const handleRadioChange = (val: string) => {
    if (val === "yes") {
      const amountStr = amount ? ` - ${amount}` : '';
      onChange(`Yes${amountStr}`);
    } else if (val === "no") {
      const shouldPayStr = shouldPayAmount ? ` - Should pay: ${shouldPayAmount}` : '';
      onChange(`No${shouldPayStr}`);
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
  
  const handleShouldPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShouldPay = e.target.value;
    if (newShouldPay) {
      onChange(`No - Should pay: ${newShouldPay.startsWith('$') ? newShouldPay : `$${newShouldPay}`}`);
    } else {
      onChange("No");
    }
  };

  // Function to render the status icon based on the value
  const renderStatusIcon = () => {
    if (isYes) {
      return <span className="inline-block mr-1">✅</span>;
    } else if (isNo) {
      return <span className="inline-block mr-1">❌</span>;
    }
    return null;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-full justify-start text-left font-normal"
        >
          {renderStatusIcon()}
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
              <Label htmlFor="yes" className="flex items-center">
                <span className="mr-1">✅</span> Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="flex items-center">
                <span className="mr-1">❌</span> No
              </Label>
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
          
          {isNo && (
            <div className="space-y-2">
              <Label htmlFor="shouldPayAmount">Should Pay</Label>
              <Input 
                id="shouldPayAmount"
                placeholder="$0.00"
                value={shouldPayAmount}
                onChange={handleShouldPayChange}
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
