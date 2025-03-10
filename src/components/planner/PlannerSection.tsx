
import { useState } from "react";
import { PlannerItem } from "@/types/planner";
import { Plus, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlannerCheckItem } from "./PlannerCheckItem";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <Card className="h-full border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-2 pr-2">
            {items.map((item) => (
              <PlannerCheckItem
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onDelete={onDeleteItem}
                onEdit={onEditItem}
              />
            ))}
            
            {isAddingItem ? (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5"></div>
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add new item"
                    className="flex-1 h-8 py-1 text-base"
                    autoFocus
                  />
                </div>
                
                {showTimeInput ? (
                  <div className="flex items-center gap-2 ml-7">
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
                    <button
                      onClick={handleAddItem}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTimeInput(true)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary text-sm ml-7"
                  >
                    <Clock size={12} />
                    <span>Add time</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary text-base mt-2 w-full"
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
