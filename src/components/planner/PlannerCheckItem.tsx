
import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlannerItem } from "@/types/planner";
import { Trash2, Check, ArrowRight, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, startTime?: string, endTime?: string) => void;
  showTimeInItem?: boolean;
}

export const PlannerCheckItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onEdit,
  showTimeInItem = false
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSimpleEdit, setIsSimpleEdit] = useState(false);
  const [isTimeEdit, setIsTimeEdit] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editStartTime, setEditStartTime] = useState(item.startTime || "");
  const [editEndTime, setEditEndTime] = useState(item.endTime || "");
  const isMobile = useIsMobile();
  const scrollableRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = () => {
    if (isTimeEdit || editText.trim()) {
      onEdit(item.id, isTimeEdit ? item.text : editText, editStartTime, editEndTime);
      setIsEditing(false);
      setIsSimpleEdit(false);
      setIsTimeEdit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setIsSimpleEdit(false);
      setIsTimeEdit(false);
      setEditText(item.text);
      setEditStartTime(item.startTime || "");
      setEditEndTime(item.endTime || "");
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsSimpleEdit(true);
      setEditText(item.text);
    }
  };

  const handleTimeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsTimeEdit(true);
      setEditStartTime(item.startTime || "");
      setEditEndTime(item.endTime || "");
    }
  };

  const handleAddTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTimeEdit(true);
    setEditStartTime(item.startTime || "");
    setEditEndTime(item.endTime || "");
  };

  return (
    <div className="relative overflow-visible rounded-lg transition-all w-full">
      {isEditing && !isSimpleEdit && !isTimeEdit ? (
        <div className="flex flex-1 items-center gap-1 p-2 bg-white border border-gray-200 rounded-lg">
          <Input
            type="time"
            value={editStartTime}
            onChange={(e) => setEditStartTime(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 py-1 w-24 text-sm"
          />
          <ArrowRight size={12} className="mx-1 text-muted-foreground" />
          <Input
            type="time"
            value={editEndTime}
            onChange={(e) => setEditEndTime(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 py-1 w-24 text-sm"
          />
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 py-1 flex-1 text-base ml-2"
          />
          <button 
            onClick={handleSaveEdit} 
            className="text-green-600 p-1 rounded-sm hover:bg-green-100"
          >
            <Check size={15} />
          </button>
        </div>
      ) : isSimpleEdit ? (
        <div className="flex flex-1 items-center p-2 bg-white border border-gray-200 rounded-lg">
          <Checkbox 
            checked={item.isCompleted} 
            onCheckedChange={() => onToggle(item.id)}
            className="h-5 w-5 mr-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 py-1 flex-1 text-base"
          />
          <button 
            onClick={handleSaveEdit} 
            className="text-green-600 p-1 rounded-sm hover:bg-green-100 ml-1"
          >
            <Check size={15} />
          </button>
        </div>
      ) : isTimeEdit ? (
        <div className="flex flex-1 items-center p-2 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-1 flex-1">
            <Input
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 py-1 w-24 text-sm"
            />
            <ArrowRight size={12} className="mx-1 text-muted-foreground" />
            <Input
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 py-1 w-24 text-sm"
            />
          </div>
          <button 
            onClick={handleSaveEdit} 
            className="text-green-600 p-1 rounded-sm hover:bg-green-100 ml-1"
          >
            <Check size={15} />
          </button>
        </div>
      ) : (
        <div 
          ref={scrollableRef}
          className="group flex items-center w-full p-2 pr-8 bg-white border border-gray-200 rounded-lg relative overflow-visible" 
        >
          <Checkbox 
            checked={item.isCompleted} 
            onCheckedChange={() => onToggle(item.id)}
            className="h-5 w-5 mr-1.5 flex-shrink-0 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          
          <div 
            className={`flex-1 pr-6 text-base ${item.isCompleted ? 'line-through text-gray-600' : 'text-gray-800'} cursor-pointer overflow-visible`}
            onDoubleClick={handleDoubleClick}
          >
            <span className="break-words whitespace-normal">{item.text}</span>
            
            {!item.startTime && !item.endTime && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleAddTime}
                className="inline-flex items-center ml-2 text-xs text-muted-foreground hover:text-primary h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Clock size={10} className="mr-1" />
                <span>Add time</span>
              </Button>
            )}
          </div>
          
          <button 
            onClick={() => onDelete(item.id)} 
            className="p-1 rounded-sm text-gray-600 hover:text-gray-900 absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity flex-shrink-0"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
