
import { useState } from 'react';
import { Check, ChevronsUpDown, Globe, Flag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const locations = [
  { value: "global", label: "Global", icon: Globe },
  { value: "usa", label: "USA", icon: Flag },
];

interface LocationSelectorProps {
  location: string;
  customLocation: string;
  onLocationSelect: (value: string) => void;
  onCustomLocationChange: (value: string) => void;
}

const LocationSelector = ({
  location,
  customLocation,
  onLocationSelect,
  onCustomLocationChange,
}: LocationSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  const handleLocationSelect = (value: string) => {
    onLocationSelect(value);
    setOpen(false);
  };

  const currentLocationLabel = locations.find(loc => loc.value === location)?.label || customLocation || "Select location...";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentLocationLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {locations.map((loc) => (
          <DropdownMenuItem
            key={loc.value}
            onSelect={() => handleLocationSelect(loc.value)}
            className="flex items-center gap-2"
          >
            {location === loc.value && <Check className="h-4 w-4" />}
            {loc.icon && <loc.icon className="h-4 w-4" />}
            {loc.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className="p-0">
          <Input 
            placeholder="Enter custom location..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={customLocation}
            onChange={(e) => {
              onCustomLocationChange(e.target.value);
              if (e.target.value) {
                handleLocationSelect('custom');
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationSelector;
