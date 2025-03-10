
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlannerItem } from "@/types/planner";
import { Pencil, Trash2, Check, Clock, ArrowRight } from "lucide-react";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, newStartTime?: string, newEndTime?: string) => void;
}

export const PlannerCheckItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onEdit 
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editStartTime, setEditStartTime] = useState(item.startTime || "");
  const [editEndTime, setEditEndTime] = useState(item.endTime || "");

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(item.id, editText, editStartTime, editEndTime);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(item.text);
      setEditStartTime(item.startTime || "");
      setEditEndTime(item.endTime || "");
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      {/* Time display on the left */}
      {!isEditing && (item.startTime || item.endTime) && (
        <div className="text-xs text-muted-foreground whitespace-nowrap min-w-24 flex items-center">
          {item.startTime && (
            <span className="inline-flex items-center">
              <Clock size={10} className="mr-1" />
              {item.startTime}
            </span>
          )}
          {item.startTime && item.endTime && (
            <ArrowRight size={10} className="mx-1" />
          )}
          {item.endTime && (
            <span>{item.endTime}</span>
          )}
        </div>
      )}
      
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
          <div className="flex items-center gap-1">
            <Input
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 py-1 w-24 text-sm"
              placeholder="Start"
            />
            <ArrowRight size={12} />
            <Input
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 py-1 w-24 text-sm"
              placeholder="End"
            />
            <button 
              onClick={handleSaveEdit} 
              className="text-green-600 p-1 rounded-sm hover:bg-green-100"
            >
              <Check size={15} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex-1 text-base ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            <span>{item.text}</span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditText(item.text);
                setEditStartTime(item.startTime || "");
                setEditEndTime(item.endTime || "");
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
