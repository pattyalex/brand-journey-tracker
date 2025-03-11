
import { useState } from "react";
import { PlannerItem } from "@/types/planner";
import { Plus, Clock, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlannerCheckItem } from "./PlannerCheckItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface PlannerSectionProps {
  title: string;
  items: PlannerItem[];
  section: PlannerItem["section"];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (id: string, newText: string, startTime?: string, endTime?: string) => void;
  onAddItem: (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => void;
  onReorderItems?: (items: PlannerItem[]) => void;
}

export const PlannerSection = ({
  title,
  items,
  section,
  onToggleItem,
  onDeleteItem,
  onEditItem,
  onAddItem,
  onReorderItems
}: PlannerSectionProps) => {
  const [newItemText, setNewItemText] = useState("");
  const [newItemStartTime, setNewItemStartTime] = useState("");
  const [newItemEndTime, setNewItemEndTime] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [editingTimeItemId, setEditingTimeItemId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(
        newItemText, 
        section, 
        newItemStartTime || undefined, 
        newItemEndTime || undefined
      );
      setNewItemText("");
      setNewItemStartTime("");
      setNewItemEndTime("");
      setIsAddingItem(false);
      setShowTimeInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    } else if (e.key === "Escape") {
      setIsAddingItem(false);
      setNewItemText("");
      setNewItemStartTime("");
      setNewItemEndTime("");
      setShowTimeInput(false);
    }
  };

  const handleTimeDoubleClick = (item: PlannerItem) => {
    setEditingTimeItemId(item.id);
  };

  const handleTimeEditSave = (id: string, startTime: string, endTime: string) => {
    onEditItem(id, items.find(item => item.id === id)?.text || "", startTime, endTime);
    setEditingTimeItemId(null);
  };

  const handleTimeEditCancel = () => {
    setEditingTimeItemId(null);
  };

  const handleAddTimeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTimeInput(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderItems) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    onReorderItems(reorderedItems);
  };

  const renderTimeDisplay = (item: PlannerItem) => {
    if (editingTimeItemId === item.id) {
      return (
        <div className="w-full flex-shrink-0 mt-1">
          <div className="flex flex-col space-y-1">
            <Input
              type="time"
              defaultValue={item.startTime || ""}
              className="h-6 py-0 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTimeEditSave(
                    item.id, 
                    (e.target as HTMLInputElement).value, 
                    item.endTime || ""
                  );
                } else if (e.key === "Escape") {
                  handleTimeEditCancel();
                }
              }}
              onBlur={(e) => {
                const nextInput = e.currentTarget.parentElement?.querySelector('input:nth-child(2)');
                if (nextInput) {
                  (nextInput as HTMLInputElement).focus();
                }
              }}
            />
            <Input
              type="time"
              defaultValue={item.endTime || ""}
              className="h-6 py-0 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTimeEditSave(
                    item.id,
                    item.startTime || "",
                    (e.target as HTMLInputElement).value
                  );
                } else if (e.key === "Escape") {
                  handleTimeEditCancel();
                }
              }}
              onBlur={(e) => {
                handleTimeEditSave(
                  item.id,
                  item.startTime || "",
                  (e.target as HTMLInputElement).value
                );
              }}
            />
          </div>
        </div>
      );
    }
    
    if (item.startTime || item.endTime) {
      return (
        <div 
          className="w-full flex-shrink-0 text-xs text-gray-600 mt-1 cursor-pointer"
          onDoubleClick={() => handleTimeDoubleClick(item)}
          title="Double-click to edit time"
        >
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span className="font-medium">
              {item.startTime && item.startTime}
              {item.startTime && item.endTime && " - "}
              {item.endTime && item.endTime}
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="w-full flex-shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary mt-1 flex items-center gap-1">
            <Clock size={10} />
            <span>Add time</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="space-y-2">
            <div className="text-xs font-medium">Set time</div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs">Start:</span>
                <Input 
                  type="time" 
                  className="h-7 w-32" 
                  value={item.startTime || ""}
                  onChange={(e) => {
                    onEditItem(item.id, item.text, e.target.value, item.endTime);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">End:</span>
                <Input 
                  type="time" 
                  className="h-7 w-32" 
                  value={item.endTime || ""}
                  onChange={(e) => {
                    onEditItem(item.id, item.text, item.startTime, e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white overflow-hidden rounded-lg">
      <CardHeader className="pb-2 bg-gray-50 border-b">
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-1">
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-400px)]' : 'h-[calc(100vh-350px)]'}`}>
          <div className="space-y-2 pr-2 pb-1">
            <Droppable droppableId={section}>
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 min-h-[50px]"
                >
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <Draggable 
                        key={item.id} 
                        draggableId={item.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? 'opacity-80 bg-muted' : ''}`}
                          >
                            <div className="flex flex-col w-full group">
                              <div className="flex items-center pl-3">
                                <Checkbox
                                  checked={item.isCompleted}
                                  onCheckedChange={() => onToggleItem(item.id)}
                                  className="h-4 w-4 border-gray-400 rounded-sm data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                                />
                                <div className="flex-1 min-w-0 ml-1 relative flex flex-col">
                                  <div className="mb-1 ml-0.5">
                                    {renderTimeDisplay(item)}
                                  </div>
                                  
                                  <PlannerCheckItem
                                    item={item}
                                    onToggle={onToggleItem}
                                    onDelete={onDeleteItem}
                                    onEdit={onEditItem}
                                    showTimeInItem={false}
                                    renderCheckbox={false}
                                    index={index}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic text-center py-3 bg-white rounded-md border border-gray-200">
                      No tasks in this section
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            {isAddingItem ? (
              <div className="flex flex-col mt-2">
                <div className="flex items-center">
                  <div className="pl-3 pr-1">
                    <div className="h-4 w-4 border border-gray-400 rounded-sm"></div>
                  </div>
                  <div className="flex-1 ml-1 border border-gray-200 p-1 rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-1">
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add new item"
                        className="flex-1 h-7 py-1 text-base text-gray-800 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoFocus
                      />
                    </div>
                    
                    {showTimeInput ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Start:</span>
                          <Input
                            type="time"
                            value={newItemStartTime}
                            onChange={(e) => setNewItemStartTime(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-24 h-7 py-1 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">End:</span>
                          <Input
                            type="time"
                            value={newItemEndTime}
                            onChange={(e) => setNewItemEndTime(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-24 h-7 py-1 text-sm"
                          />
                        </div>
                        <Button
                          onClick={handleAddItem}
                          size="sm"
                          className="text-xs bg-purple-500 hover:bg-purple-600"
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1 ml-1" onClick={handleAddTimeClick}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="flex items-center gap-1 text-muted-foreground hover:text-purple-500 h-6 p-0"
                        >
                          <Clock size={12} />
                          <span>Add time</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-purple-500 text-base mt-3 w-full p-2 rounded-md transition-colors"
              >
                <Plus size={18} />
                <span>Add item</span>
              </button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
