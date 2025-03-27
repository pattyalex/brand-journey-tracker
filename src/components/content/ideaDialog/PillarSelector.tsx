
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
import { Flame } from "lucide-react";

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
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-blue-700" />
        <Label htmlFor="pillar-selector" className="font-medium text-blue-900">
          Destination Pillar <span className="text-red-500">*</span>
        </Label>
      </div>
      <Select value={pillarId} onValueChange={handleSelectChange}>
        <SelectTrigger 
          id="pillar-selector" 
          className={`w-full bg-white border-blue-200 ${!pillarId ? 'border-blue-300 ring-1 ring-blue-200' : ''}`}
        >
          <SelectValue placeholder="Select from your saved Pillars" />
        </SelectTrigger>
        <SelectContent>
          {pillars.map((pillar) => (
            <SelectItem key={pillar.id} value={pillar.id}>
              {pillar.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-blue-600">
        {!pillarId ? (
          <span className="text-blue-500">Select which pillar this content will be added to</span>
        ) : (
          "Content formats will be loaded from this pillar"
        )}
      </p>
    </div>
  );
};

export default PillarSelector;
