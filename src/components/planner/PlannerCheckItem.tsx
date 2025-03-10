
import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlannerItem } from "@/types/planner";
import { Pencil, Trash2, Check, Clock, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, startTime?: string, endTime?: string) => void;
}

export const PlannerCheckItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onEdit 
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSimpleEdit, setIsSimpleEdit] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editStartTime, setEditStartTime] = useState(item.startTime || "");
  const [editEndTime, setEditEndTime] = useState(item.endTime || "");
  const isMobile = useIsMobile();
  const scrollableRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(item.id, editText, editStartTime, editEndTime);
      setIsEditing(false);
      setIsSimpleEdit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setIsSimpleEdit(false);
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

  return (
    <div className="relative overflow-hidden bg-white rounded-md border border-gray-200 shadow-sm">
      {isEditing && !isSimpleEdit ? (
        <div className="flex flex-1 items-center gap-1 p-2">
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
        <div className="flex flex-1 items-center p-2">
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
      ) : (
        <div 
          ref={scrollableRef}
          className="flex items-center w-full overflow-x-auto touch-scroll hide-scrollbar" 
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Left side actions (swipe right to reveal) */}
          <div className="flex-shrink-0 bg-gray-100 p-2 flex items-center justify-center min-w-[48px]">
            <button 
              onClick={() => onDelete(item.id)} 
              className="p-1 rounded-sm text-red-500 hover:bg-red-100"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          {/* Main content */}
          <div className="flex items-center gap-2 p-2 min-w-full flex-shrink-0">
            <div className="flex items-center min-w-[110px] mr-2 text-sm text-muted-foreground">
              {(item.startTime || item.endTime) && (
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {item.startTime && <span>{item.startTime}</span>}
                  {item.startTime && item.endTime && (
                    <ArrowRight size={10} className="mx-1" />
                  )}
                  {item.endTime && <span>{item.endTime}</span>}
                </div>
              )}
            </div>
            
            <Checkbox 
              checked={item.isCompleted} 
              onCheckedChange={() => onToggle(item.id)}
              className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            
            <div 
              className={`flex-1 text-base ${item.isCompleted ? 'line-through text-muted-foreground' : 'text-gray-800'} cursor-pointer`}
              onDoubleClick={handleDoubleClick}
            >
              <span>{item.text}</span>
            </div>
          </div>
          
          {/* Right side actions (swipe left to reveal) */}
          <div className="flex-shrink-0 bg-gray-100 p-2 flex items-center justify-center min-w-[48px]">
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditText(item.text);
                setEditStartTime(item.startTime || "");
                setEditEndTime(item.endTime || "");
              }}
              className="p-1 rounded-sm hover:bg-muted"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
