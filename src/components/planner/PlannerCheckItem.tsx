
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlannerItem } from "@/types/planner";
import { Pencil, Trash2, Check, Clock } from "lucide-react";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, newTime?: string) => void;
}

export const PlannerCheckItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onEdit 
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editTime, setEditTime] = useState(item.time || "");

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(item.id, editText, editTime);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(item.text);
      setEditTime(item.time || "");
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <Checkbox 
        checked={item.isCompleted} 
        onCheckedChange={() => onToggle(item.id)}
        className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 py-1 flex-1 text-base"
          />
          <Input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 py-1 w-24 text-sm"
          />
          <button 
            onClick={handleSaveEdit} 
            className="text-green-600 p-1 rounded-sm hover:bg-green-100"
          >
            <Check size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className={`flex-1 text-base ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            <span>{item.text}</span>
            {item.time && (
              <span className="ml-2 text-sm text-muted-foreground inline-flex items-center">
                <Clock size={12} className="mr-1" />
                {item.time}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditText(item.text);
                setEditTime(item.time || "");
              }}
              className="p-1 rounded-sm hover:bg-muted"
            >
              <Pencil size={15} />
            </button>
            <button 
              onClick={() => onDelete(item.id)} 
              className="p-1 rounded-sm text-gray-500 hover:bg-muted"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
