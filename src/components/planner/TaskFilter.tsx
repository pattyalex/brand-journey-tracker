
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CategoryDefinition, TaskFilter } from "@/types/planner";
import { CheckSquare, Filter, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TaskFilterProps {
  onFilterChange: (filter: TaskFilter) => void;
  filter: TaskFilter;
  categories: CategoryDefinition[];
  onClearFilters: () => void;
}

export const TaskFilterComponent = ({
  onFilterChange,
  filter,
  categories,
  onClearFilters,
}: TaskFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(filter.search || "");
  
  const hasActiveFilters = !!(
    filter.category ||
    filter.completed !== undefined ||
    filter.section ||
    filter.search
  );
  
  const updateFilter = (partialFilter: Partial<TaskFilter>) => {
    onFilterChange({ ...filter, ...partialFilter });
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: searchText });
  };
  
  const handleSearchClear = () => {
    setSearchText("");
    updateFilter({ search: undefined });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-full max-w-[250px]">
        <form onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-8 h-8"
          />
        </form>
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        {searchText && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent p-0"
            onClick={handleSearchClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("gap-1.5", hasActiveFilters && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="bg-primary-foreground text-primary rounded-full w-4 h-4 text-[10px] flex items-center justify-center ml-1">
                {Object.values(filter).filter(v => v !== undefined).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Filter Tasks</h3>
              <Separator />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={filter.category || ""}
                onValueChange={(value) => updateFilter({ category: value || undefined })}
              >
                <SelectTrigger id="category-filter" className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="section-filter">Section</Label>
              <Select
                value={filter.section || ""}
                onValueChange={(value: any) => updateFilter({ section: value || undefined })}
              >
                <SelectTrigger id="section-filter" className="w-full">
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sections</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="midday">Midday</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="completed-filter" className="cursor-pointer">Show completed tasks</Label>
              <Switch
                id="completed-filter"
                checked={filter.completed === true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter({ completed: true });
                  } else if (filter.completed === true) {
                    updateFilter({ completed: undefined });
                  } else {
                    updateFilter({ completed: true });
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="incomplete-filter" className="cursor-pointer">Show incomplete tasks</Label>
              <Switch
                id="incomplete-filter"
                checked={filter.completed === false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter({ completed: false });
                  } else if (filter.completed === false) {
                    updateFilter({ completed: undefined });
                  } else {
                    updateFilter({ completed: false });
                  }
                }}
              />
            </div>
            
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskFilterComponent;
