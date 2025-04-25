
import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentFiltersProps {
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformChange: (platform: string) => void;
  pillars: { id: string; name: string }[];
  selectedPillars: string[];
  onPillarChange: (pillarId: string) => void;
  statuses: string[];
  selectedStatuses: string[];
  onStatusChange: (status: string) => void;
}

const ContentFilters = ({
  platforms,
  selectedPlatforms,
  onPlatformChange,
  pillars,
  selectedPillars,
  onPillarChange,
  statuses,
  selectedStatuses,
  onStatusChange,
}: ContentFiltersProps) => {
  const hasActiveFilters = selectedPlatforms.length > 0 || selectedPillars.length > 0 || selectedStatuses.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`gap-2 ${hasActiveFilters ? "bg-purple-50 border-purple-200 text-purple-700" : ""}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              {selectedPlatforms.length + selectedPillars.length + selectedStatuses.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {platforms.length > 0 && (
          <>
            <DropdownMenuLabel>Platforms</DropdownMenuLabel>
            {platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={selectedPlatforms.includes(platform)}
                onCheckedChange={() => onPlatformChange(platform)}
              >
                {platform}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {pillars.length > 0 && (
          <>
            <DropdownMenuLabel>Pillars</DropdownMenuLabel>
            {pillars.map((pillar) => (
              <DropdownMenuCheckboxItem
                key={pillar.id}
                checked={selectedPillars.includes(pillar.id)}
                onCheckedChange={() => onPillarChange(pillar.id)}
              >
                {pillar.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {statuses.length > 0 && (
          <>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => onStatusChange(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContentFilters;
