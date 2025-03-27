
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pillar } from "@/pages/BankOfContent";

interface PillarSelectorProps {
  pillarId: string;
  onPillarChange: (value: string) => void;
  pillars: Pillar[];
}

const PillarSelector = ({ pillarId, onPillarChange, pillars }: PillarSelectorProps) => {
  const handleSelectChange = (value: string) => {
    onPillarChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="pillar-selector" className="font-medium">
        Destination Pillar
      </Label>
      <Select value={pillarId} onValueChange={handleSelectChange}>
        <SelectTrigger id="pillar-selector" className="w-full">
          <SelectValue placeholder="Select a pillar" />
        </SelectTrigger>
        <SelectContent>
          {pillars.map((pillar) => (
            <SelectItem key={pillar.id} value={pillar.id}>
              {pillar.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select which pillar this content will be added to
      </p>
    </div>
  );
};

export default PillarSelector;
