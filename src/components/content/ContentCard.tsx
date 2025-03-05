
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Calendar, PlusCircle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { getTagColorClasses } from "@/utils/tagColors";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
}

// Predefined property colors
const propertyColorOptions = {
  "priority-high": "bg-red-100 text-red-800 border-red-300",
  "priority-medium": "bg-amber-100 text-amber-800 border-amber-300",
  "priority-low": "bg-green-100 text-green-800 border-green-300",
  "status-pending": "bg-purple-100 text-purple-800 border-purple-300",
  "status-in-progress": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "status-completed": "bg-blue-100 text-blue-800 border-blue-300",
  "type-video": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  "type-article": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "type-image": "bg-teal-100 text-teal-800 border-teal-300",
  "default": "bg-gray-100 text-gray-800 border-gray-300"
};

const ContentCard = ({
  content,
  index,
  pillar,
  pillars,
  onDeleteContent,
  onMoveContent,
  onEditContent
}: ContentCardProps) => {
  const [newProperty, setNewProperty] = useState("");
  const [selectedColor, setSelectedColor] = useState("default");
  const [customProperties, setCustomProperties] = useState<{name: string, color: string}[]>(
    content.customProperties || []
  );
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  // Save custom properties to localStorage when they change
  const saveCustomProperties = (updatedProperties: {name: string, color: string}[]) => {
    // First update our local state
    setCustomProperties(updatedProperties);
    
    try {
      // Get the existing content from localStorage
      const storedContent = localStorage.getItem(`pillar-content-${pillar.id}`);
      if (storedContent) {
        const contentItems = JSON.parse(storedContent);
        
        // Find and update the specific content item
        const updatedContentItems = contentItems.map((item: any) => {
          if (item.id === content.id) {
            return { ...item, customProperties: updatedProperties };
          }
          return item;
        });
        
        // Save back to localStorage
        localStorage.setItem(`pillar-content-${pillar.id}`, JSON.stringify(updatedContentItems));
      }
    } catch (error) {
      console.error("Failed to save custom properties:", error);
    }
  };

  const addCustomProperty = () => {
    if (!newProperty.trim()) {
      toast.error("Property name cannot be empty");
      return;
    }
    
    const updatedProperties = [
      ...customProperties, 
      { name: newProperty.trim(), color: selectedColor }
    ];
    
    saveCustomProperties(updatedProperties);
    setNewProperty("");
    setSelectedColor("default");
    setIsAddingProperty(false);
    toast.success(`Added property: ${newProperty.trim()}`);
  };

  const removeCustomProperty = (propertyToRemove: string) => {
    const updatedProperties = customProperties.filter(
      prop => prop.name !== propertyToRemove
    );
    saveCustomProperties(updatedProperties);
    toast.success(`Removed property: ${propertyToRemove}`);
  };

  return (
    <Draggable key={content.id} draggableId={content.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? 'opacity-70' : 'opacity-100'}`}
        >
          <Card 
            className={`overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {content.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {content.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              {customProperties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {customProperties.map((prop) => (
                    <div
                      key={prop.name}
                      className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${propertyColorOptions[prop.color] || propertyColorOptions.default}`}
                    >
                      {prop.name}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomProperty(prop.name);
                        }}
                        className="hover:bg-white/30 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-1 mb-2">
                {content.tags && content.tags.length > 0 ? (
                  content.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-1 rounded-full ${getTagColorClasses(tag)}`}
                    >
                      {tag}
                    </span>
                  ))
                ) : null}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {content.dateCreated ? formatDistanceToNow(new Date(content.dateCreated), { addSuffix: true }) : 'Unknown date'}
                </span>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteContent(content.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onEditContent(content.id)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                
                {/* Property dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Property
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 p-3 bg-white" align="start">
                    {!isAddingProperty ? (
                      <>
                        <p className="text-sm font-medium mb-2">Add custom property</p>
                        <DropdownMenuItem 
                          onClick={() => setIsAddingProperty(true)}
                          className="flex items-center"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          <span>New property</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Property name:</p>
                          <Input
                            placeholder="Enter property name"
                            value={newProperty}
                            onChange={(e) => setNewProperty(e.target.value)}
                            className="h-8"
                          />
                          
                          <p className="text-sm font-medium mt-3">Choose color:</p>
                          <div className="grid grid-cols-2 gap-1">
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "priority-high" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["priority-high"]}`}
                              onClick={() => setSelectedColor("priority-high")}
                            >
                              High Priority
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "priority-medium" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["priority-medium"]}`}
                              onClick={() => setSelectedColor("priority-medium")}
                            >
                              Medium Priority
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "priority-low" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["priority-low"]}`}
                              onClick={() => setSelectedColor("priority-low")}
                            >
                              Low Priority
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "status-pending" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["status-pending"]}`}
                              onClick={() => setSelectedColor("status-pending")}
                            >
                              Pending
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "status-in-progress" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["status-in-progress"]}`}
                              onClick={() => setSelectedColor("status-in-progress")}
                            >
                              In Progress
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "status-completed" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["status-completed"]}`}
                              onClick={() => setSelectedColor("status-completed")}
                            >
                              Completed
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "type-video" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["type-video"]}`}
                              onClick={() => setSelectedColor("type-video")}
                            >
                              Video
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "type-article" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["type-article"]}`}
                              onClick={() => setSelectedColor("type-article")}
                            >
                              Article
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "type-image" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["type-image"]}`}
                              onClick={() => setSelectedColor("type-image")}
                            >
                              Image
                            </div>
                            <div 
                              className={`cursor-pointer p-2 rounded-md ${selectedColor === "default" ? "ring-2 ring-offset-1 ring-primary" : ""} ${propertyColorOptions["default"]}`}
                              onClick={() => setSelectedColor("default")}
                            >
                              Default
                            </div>
                          </div>
                          
                          <div className="flex justify-between gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setIsAddingProperty(false)}
                              className="w-1/2"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={addCustomProperty}
                              className="w-1/2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center">
                <Select
                  onValueChange={(value) => onMoveContent(value, content.id)}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Move to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars
                      .filter(p => p.id !== pillar.id)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default ContentCard;
