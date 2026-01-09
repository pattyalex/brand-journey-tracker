
import { useState, useRef, useEffect } from "react";
import { PlannerItem } from "@/types/planner";
import { Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlannerCheckItem } from "./PlannerCheckItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onDropTaskFromCalendar?: (taskId: string, fromDate: string, targetIndex: number) => void;
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
  onDropTaskFromWeekly,
  onDropTaskFromCalendar
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    // For All Tasks section: handle both external drags (from calendar) and internal reordering
    if (isAllTasksSection) {
      // If draggedIndex is set, it means we're dragging from within All Tasks (internal reordering)
      if (draggedIndex !== null) {
        // Internal reordering within All Tasks - just show where it will drop
        if (draggedIndex !== index) {
          setDropIndicatorIndex(index);
        }
        return;
      } else {
        // External drag from calendar to All Tasks (draggedIndex is null)
        setDropIndicatorIndex(index);
        return;
      }
    }

    // Original logic for other sections
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = Array.from(items);
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    if (onReorderItems) {
      onReorderItems(newItems);
    }
    setDraggedIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

    // For All Tasks section
    if (isAllTasksSection) {
      // Internal reordering within All Tasks
      if (draggedIndex !== null && draggedIndex !== index) {
        const newItems = Array.from(items);
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        if (onReorderItems) {
          onReorderItems(newItems);
        }
      }
      // External drop from calendar to All Tasks
      else if (fromDate && fromAllTasks === 'false' && taskId && onDropTaskFromCalendar) {
        onDropTaskFromCalendar(taskId, fromDate, index);
      }
    }

    setDropIndicatorIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setIsDraggingExternal(false);
    setDropIndicatorIndex(null);
    setDragOverIndex(null);
  };

  // Clear draggedIndex when items change or component unmounts
  useEffect(() => {
    return () => {
      setDraggedIndex(null);
    };
  }, [items]);

  // Clear draggedIndex on mouse up as fallback (in case drag doesn't complete)
  useEffect(() => {
    const handleMouseUp = () => {
      if (draggedIndex !== null) {
        setDraggedIndex(null);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedIndex]);

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
    <Card
      className={`h-full border-0 shadow-none bg-transparent overflow-hidden ${isAllTasksSection ? 'flex flex-col' : ''}`}
    >
      {title && (
        <CardHeader className="pb-3 pt-0 px-0 flex-shrink-0">
          <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={`${isAllTasksSection ? 'pt-0 px-0 flex-1 overflow-hidden' : 'pt-4 px-0'}`}
      >
        <ScrollArea
          className={`${isAllTasksSection ? 'h-full' : isMobile ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-180px)]'}`}
        >
          <div
            className="space-y-2.5 pr-1 pb-1"
            onDragLeave={(e) => {
              // Clear drop indicator when leaving the list
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDropIndicatorIndex(null);
              }
            }}
            onDrop={() => {
              // Clear drop indicator after drop
              setDropIndicatorIndex(null);
            }}
          >
            <div
              className="space-y-2.5 min-h-[20px]"
            >
              {items.map((item, index) => (
                <div key={item.id}>
                  {/* Drop indicator line */}
                  {dropIndicatorIndex === index && (
                    <div className="h-0.5 bg-blue-500 rounded-full my-1 shadow-sm"></div>
                  )}

                  <div
                    onDragStart={(e) => {
                      // Set the dragged index when drag starts from All Tasks
                      if (isAllTasksSection) {
                        setDraggedIndex(index);
                      }
                    }}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`${draggedIndex === index ? 'opacity-50' : ''}`}
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
                            onDragStartCapture={isAllTasksSection ? () => setDraggedIndex(index) : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Drop indicator at the end */}
              {dropIndicatorIndex === items.length && (
                <div className="h-0.5 bg-blue-500 rounded-full my-1 shadow-sm"></div>
              )}

              {/* Drop zone at the end of the list */}
              <div
                className="min-h-[10px]"
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isAllTasksSection) {
                    setDropIndicatorIndex(items.length);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const taskId = e.dataTransfer.getData('taskId');
                  const fromDate = e.dataTransfer.getData('fromDate');
                  const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

                  if (isAllTasksSection) {
                    // Internal reordering - move to end
                    if (draggedIndex !== null) {
                      const newItems = Array.from(items);
                      const [draggedItem] = newItems.splice(draggedIndex, 1);
                      newItems.push(draggedItem);
                      if (onReorderItems) {
                        onReorderItems(newItems);
                      }
                    }
                    // External drop from calendar - add to end
                    else if (fromDate && fromAllTasks === 'false' && taskId && onDropTaskFromCalendar) {
                      onDropTaskFromCalendar(taskId, fromDate, items.length);
                    }
                  }
                  setDropIndicatorIndex(null);
                }}
              />
            </div>

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
                className={`flex items-center justify-center w-full py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm ${items.length > 0 ? 'mt-2' : 'mt-0'}`}
              >
                <Plus size={16} strokeWidth={2} className="mr-1" />
                <span>Add task</span>
              </button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
