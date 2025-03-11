
import { useState } from "react";
import { PlannerItem } from "@/types/planner";
import { Plus, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  onEditItem: (id: string, newText: string, startTime?: string, endTime?: string) => void;
  onAddItem: (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => void;
}

export const PlannerSection = ({
  title,
  items,
  section,
  onToggleItem,
  onDeleteItem,
  onEditItem,
  onAddItem
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

  const renderTimeDisplay = (item: PlannerItem) => {
    if (editingTimeItemId === item.id) {
      return (
        <div className="w-[70px] flex-shrink-0">
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
          className="w-[70px] flex-shrink-0 text-xs text-gray-600 flex flex-col justify-center cursor-pointer"
          onDoubleClick={() => handleTimeDoubleClick(item)}
          title="Double-click to edit time"
        >
          {item.startTime && <div className="font-medium">{item.startTime}</div>}
          {item.endTime && <div className="font-medium">{item.endTime}</div>}
        </div>
      );
    }
    
    return (
      <div 
        className="w-[70px] flex-shrink-0 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors group"
        onClick={() => handleTimeDoubleClick(item)}
        title="Click to add time"
      >
        <span className="opacity-0 group-hover:opacity-70">+ Add time</span>
      </div>
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
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="flex items-start w-full">
                  <div className="w-[60px] flex-shrink-0 flex items-center pr-0">
                    {editingTimeItemId === item.id ? (
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
                    ) : (
                      <div 
                        className="text-xs text-gray-600 flex flex-col justify-center cursor-pointer"
                        onDoubleClick={() => handleTimeDoubleClick(item)}
                        title="Double-click to edit time"
                      >
                        {item.startTime && <div className="font-medium">{item.startTime}</div>}
                        {item.endTime && <div className="font-medium">{item.endTime}</div>}
                        {!item.startTime && !item.endTime && (
                          <div 
                            className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors group"
                            onClick={() => handleTimeDoubleClick(item)}
                            title="Click to add time"
                          >
                            <span className="opacity-0 group-hover:opacity-70">+ Add time</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mr-1">
                    <Checkbox 
                      checked={item.isCompleted} 
                      onCheckedChange={() => onToggleItem(item.id)}
                      className="h-4 w-4 flex-shrink-0 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 ml-0">
                    <PlannerCheckItem
                      item={item}
                      onToggle={onToggleItem}
                      onDelete={onDeleteItem}
                      onEdit={onEditItem}
                      showTimeInItem={false}
                      renderCheckbox={false}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic text-center py-3 bg-white rounded-md border border-gray-200">
                No tasks in this section
              </div>
            )}
            
            {isAddingItem ? (
              <div className="flex mt-2">
                <div className="w-[60px] flex-shrink-0 pr-0">
                  {showTimeInput && (
                    <>
                      <div className="font-medium text-xs">{newItemStartTime || "--:--"}</div>
                      {newItemEndTime && (
                        <div className="font-medium text-xs">{newItemEndTime}</div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-1 ml-0 border border-gray-200 p-1 rounded-lg bg-white shadow-sm">
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
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1" onClick={handleAddTimeClick}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary h-6 p-0"
                      >
                        <Clock size={12} />
                        <span>Add time</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-base mt-3 w-full p-2 rounded-md transition-colors"
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
}
