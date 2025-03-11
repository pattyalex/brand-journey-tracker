
import { useState, useEffect } from "react";
import { CategoryDefinition } from "@/types/planner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, CircleIcon, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
  categories: CategoryDefinition[];
  onAddCategory?: (category: Omit<CategoryDefinition, "id">) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onCategorySelect,
  categories,
  onAddCategory,
}: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#9b87f5");
  
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !onAddCategory) return;
    
    onAddCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });
    
    setNewCategoryName("");
    setIsAdding(false);
  };
  
  const defaultColors = [
    "#9b87f5", // Primary Purple
    "#F97316", // Bright Orange
    "#0EA5E9", // Ocean Blue
    "#D946EF", // Magenta Pink
    "#10B981", // Green
    "#F43F5E", // Red
    "#8E9196", // Neutral Gray
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 px-3 flex items-center justify-start"
        >
          {selectedCategoryData ? (
            <>
              <CircleIcon 
                className="h-3 w-3" 
                style={{ color: selectedCategoryData.color }} 
                fill={selectedCategoryData.color} 
              />
              <span>{selectedCategoryData.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select category</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          {isAdding ? (
            <div className="space-y-2 p-1">
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-8"
                placeholder="New category"
              />
              
              <Label htmlFor="category-color">Color</Label>
              <div className="flex gap-1.5 flex-wrap my-1">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full hover:scale-110 transition-transform",
                      newCategoryColor === color && "ring-2 ring-black ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-6 h-6 p-0 border-0"
                />
              </div>
              
              <div className="flex justify-between mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="font-medium text-sm px-1">Categories</div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-7"
                    onClick={() => {
                      onCategorySelect(category.id);
                      setOpen(false);
                    }}
                  >
                    <CircleIcon 
                      className="h-3 w-3" 
                      style={{ color: category.color }} 
                      fill={category.color} 
                    />
                    <span>{category.name}</span>
                    {selectedCategory === category.id && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                ))}
                
                {selectedCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground h-7"
                    onClick={() => {
                      onCategorySelect(undefined);
                      setOpen(false);
                    }}
                  >
                    Clear selection
                  </Button>
                )}
                
                {onAddCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-7 text-primary"
                    onClick={() => setIsAdding(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add new category</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
