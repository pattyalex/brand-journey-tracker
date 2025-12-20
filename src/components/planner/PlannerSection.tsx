
import { useState, useRef, useEffect } from "react";
import { PlannerItem } from "@/types/planner";
import { Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  onEditItem: (id: string, newText: string, startTime?: string, endTime?: string, color?: string) => void;
  onAddItem: (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => void;
  onReorderItems?: (items: PlannerItem[]) => void;
  isAllTasksSection?: boolean;
  onDropTaskFromWeekly?: (draggedTaskId: string, targetTaskId: string, fromDate: string) => void;
}

export const PlannerSection = ({
  title,
  items,
  section,
  onToggleItem,
  onDeleteItem,
  onEditItem,
  onAddItem,
  onReorderItems,
  isAllTasksSection = false,
  onDropTaskFromWeekly
}: PlannerSectionProps) => {
  const [newItemText, setNewItemText] = useState("");
  const [newItemStartTime, setNewItemStartTime] = useState("");
  const [newItemEndTime, setNewItemEndTime] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [editingTimeItemId, setEditingTimeItemId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const addItemRef = useRef<HTMLDivElement>(null);

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
      // Keep isAddingItem true to start a new entry automatically
      // setIsAddingItem(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addItemRef.current && !addItemRef.current.contains(event.target as Node)) {
        setIsAddingItem(false);
        setNewItemText("");
        setNewItemStartTime("");
        setNewItemEndTime("");
        setShowTimeInput(false);
      }
    };

    if (isAddingItem) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingItem]);

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

    return null;
  };

  const droppableId = isAllTasksSection ? "allTasks" : section;

  return (
    <Card className={`h-full border-0 shadow-sm bg-white overflow-hidden rounded-lg ${isAllTasksSection ? 'flex flex-col' : ''}`}>
      {title && (
        <CardHeader className="pb-2 bg-gray-50 border-b flex-shrink-0">
          <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${isAllTasksSection ? 'pt-2 px-1 flex-1 overflow-hidden' : 'pt-4 px-1'}`}>
        <ScrollArea className={`${isAllTasksSection ? 'h-full' : isMobile ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-180px)]'}`}>
          <div className="space-y-2 pr-2 pb-1">
            <Droppable droppableId={droppableId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 min-h-[20px]"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'opacity-80 bg-muted' : ''}`}
                        >
                          <div className="flex flex-col w-full group">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0 relative flex flex-col">
                                <div className="mb-1 ml-0.5">
                                  {renderTimeDisplay(item)}
                                </div>

                                <PlannerCheckItem
                                  item={item}
                                  onToggle={onToggleItem}
                                  onDelete={onDeleteItem}
                                  onEdit={onEditItem}
                                  showTimeInItem={false}
                                  renderCheckbox={true}
                                  index={index}
                                  dragHandleProps={provided.dragHandleProps}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {isAddingItem ? (
              <div ref={addItemRef} className="flex flex-col mt-2">
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

                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingItem(true)}
                className={`flex items-center justify-center w-10 h-10 mx-auto text-gray-500 hover:text-gray-700 rounded-full transition-all hover:scale-110 hover:font-bold [&:hover_svg]:stroke-[3] ${items.length > 0 ? 'mt-3' : 'mt-0'}`}
              >
                <Plus size={15} strokeWidth={2} />
              </button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
