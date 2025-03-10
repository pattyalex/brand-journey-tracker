
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlannerItem } from "@/types/planner";
import { Pencil, Trash2, Check } from "lucide-react";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export const PlannerCheckItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onEdit 
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(item.id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(item.text);
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
          <button 
            onClick={handleSaveEdit} 
            className="text-green-600 p-1 rounded-sm hover:bg-green-100"
          >
            <Check size={15} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-base ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {item.text}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditText(item.text);
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
