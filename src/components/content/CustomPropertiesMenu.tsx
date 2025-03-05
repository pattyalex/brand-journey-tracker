
import { useState } from "react";
import { ContentItem } from "@/types/content";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Tag } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "bg-red-100 text-red-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-orange-100 text-orange-800",
];

interface CustomPropertiesMenuProps {
  content: ContentItem;
  onUpdate: (updatedContent: ContentItem) => void;
}

const CustomPropertiesMenu = ({ content, onUpdate }: CustomPropertiesMenuProps) => {
  const [newProperty, setNewProperty] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProperty = () => {
    if (!newProperty.trim()) {
      toast.error("Please enter a property name");
      return;
    }

    // Check if property already exists
    if (content.customProperties?.some(p => p.name.toLowerCase() === newProperty.toLowerCase())) {
      toast.error("This property already exists");
      return;
    }

    const updatedProperties = [
      ...(content.customProperties || []),
      { name: newProperty.trim(), color: selectedColor }
    ];

    onUpdate({
      ...content,
      customProperties: updatedProperties
    });

    setNewProperty("");
    setIsAdding(false);
    toast.success("Property added");
  };

  const handleRemoveProperty = (propertyName: string) => {
    const updatedProperties = content.customProperties?.filter(p => p.name !== propertyName) || [];
    
    onUpdate({
      ...content,
      customProperties: updatedProperties
    });
    
    toast.success("Property removed");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Tag className="h-4 w-4 mr-1" />
          Properties
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isAdding ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Property name"
              value={newProperty}
              onChange={(e) => setNewProperty(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="flex flex-wrap gap-1 my-1">
              {COLORS.map((color, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full ${color.split(' ')[0]} flex items-center justify-center cursor-pointer`}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${index + 1}`}
                >
                  {color === selectedColor && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddProperty} className="w-full">
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {content.customProperties && content.customProperties.length > 0 ? (
              <>
                <div className="p-2">
                  <div className="text-sm font-medium mb-1">Current Properties</div>
                  <div className="flex flex-col gap-1">
                    {content.customProperties.map((prop, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs ${prop.color}`}>
                          {prop.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveProperty(prop.name)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomPropertiesMenu;
