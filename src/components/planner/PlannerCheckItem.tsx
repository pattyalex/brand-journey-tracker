
import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlannerItem } from "@/types/planner";
import { Trash2, Check, ArrowRight, Clock, GripVertical, Palette, X as XIcon, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PlannerCheckItemProps {
  item: PlannerItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string) => void;
  showTimeInItem?: boolean;
  renderCheckbox?: boolean;
  index?: number;
  onDragStartCapture?: () => void;
}

export const PlannerCheckItem = ({
  item,
  onToggle,
  onDelete,
  onEdit,
  showTimeInItem = false,
  renderCheckbox = false,
  index,
  onDragStartCapture
}: PlannerCheckItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSimpleEdit, setIsSimpleEdit] = useState(false);
  const [isTimeEdit, setIsTimeEdit] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editStartTime, setEditStartTime] = useState(item.startTime || "");
  const [editEndTime, setEditEndTime] = useState(item.endTime || "");
  const [selectedColor, setSelectedColor] = useState(item.color || "");
  const [editDescription, setEditDescription] = useState(item.description || "");
  const [editTitle, setEditTitle] = useState(item.text);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const scrollableRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const textSpanRef = useRef<HTMLSpanElement>(null);

  const colors = [
    // Row 1: Browns to yellow
    "#d4a373", // warm brown
    "#deb887", // burlywood
    "#f0dc82", // khaki
    "#fef3c7", // yellow-100
    // Row 2: Greens to turquoise
    "#e8f5e9", // very light mint
    "#a5d6a7", // medium mint green
    "#80cbc4", // teal (washed out)
    "#d4f1f4", // pale turquoise
    // Row 3: Blues to purple
    "#e3f2fd", // light sky blue
    "#a5b8d0", // light navy blue
    "#ce93d8", // orchid
    "#f3e5f5", // pale purple
    // Row 4: Grays and pinks
    "#eeeeee", // light gray
    "#ede8e3", // grayish beige
    "#f8bbd0", // light pink
    "#f5e1e5", // blush pink
  ];


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

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isEditing) {
      const span = e.currentTarget;
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      let cursorPosition = 0;

      if (range) {
        cursorPosition = range.startOffset;
      }

      setIsSimpleEdit(true);
      setEditText(item.text);

      // Set cursor position after the input is rendered
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleRemoveColor = () => {
    setSelectedColor("");
  };

  const handleSaveEditDialog = () => {
    onEdit(item.id, editTitle, item.startTime, item.endTime, selectedColor, editDescription);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="relative overflow-visible transition-all w-full">
      {isEditing && !isSimpleEdit && !isTimeEdit ? (
        <div className="flex flex-1 items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
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
        <div
          className="flex items-center w-full py-2.5 px-3 border border-gray-200 rounded-lg"
          style={{ backgroundColor: item.color || 'white' }}
        >
          {renderCheckbox && (
            <Checkbox
              checked={item.isCompleted}
              onCheckedChange={() => onToggle(item.id)}
              className="h-3.5 w-3.5 mr-2 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
            />
          )}
          <Input
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="flex-1 text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto text-gray-800"
          />
        </div>
      ) : isTimeEdit ? (
        <div className="flex flex-1 items-center p-1 bg-white border border-gray-200 rounded-lg">
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
          className="group flex items-center w-full py-2.5 px-3 border border-gray-200 rounded-lg relative overflow-visible hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
          style={{ backgroundColor: item.color || 'white' }}
          draggable={true}
          onDragStart={(e) => {
            console.log('🚀 DRAG START:', { id: item.id, date: item.date, text: item.text });

            // Call the drag start callback if provided (for All Tasks section)
            if (onDragStartCapture) {
              onDragStartCapture();
            }

            // Set data for native HTML5 drag
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.setData('taskId', item.id);
            e.dataTransfer.setData('fromDate', item.date || '');
            e.dataTransfer.setData('fromAllTasks', item.date ? 'false' : 'true');
            e.dataTransfer.setData('taskIndex', String(index || 0));
            e.dataTransfer.setData('allowReorder', 'true');
            e.dataTransfer.effectAllowed = 'move';

            console.log('✅ Drag data set - taskId:', item.id, 'fromDate:', item.date || '', 'index:', index);

            // Create a custom drag image with fixed dimensions
            const dragImage = document.createElement('div');
            dragImage.style.position = 'fixed';
            dragImage.style.top = '-9999px';
            dragImage.style.left = '-9999px';
            dragImage.style.width = '280px';
            dragImage.style.padding = '10px 16px';
            dragImage.style.backgroundColor = item.color || '#f3f4f6';
            dragImage.style.border = '1px solid #d1d5db';
            dragImage.style.borderRadius = '12px';
            dragImage.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            dragImage.style.fontSize = '14px';
            dragImage.style.fontWeight = '500';
            dragImage.style.color = '#1f2937';
            dragImage.style.whiteSpace = 'normal';
            dragImage.style.wordWrap = 'break-word';
            dragImage.style.lineHeight = '1.4';
            dragImage.style.pointerEvents = 'none';
            dragImage.style.zIndex = '9999';
            dragImage.textContent = item.text;
            document.body.appendChild(dragImage);

            // Force a layout recalculation
            dragImage.offsetHeight;

            // Set the custom drag image
            e.dataTransfer.setDragImage(dragImage, 20, 20);

            // Clean up after drag starts
            requestAnimationFrame(() => {
              document.body.removeChild(dragImage);
            });

            // Make it semi-transparent while dragging
            e.currentTarget.style.opacity = '0.5';
          }}
          onDragEnd={(e) => {
            console.log('🏁 DRAG END');
            e.currentTarget.style.opacity = '1';
          }}
        >
          {renderCheckbox && (
            <Checkbox
              checked={item.isCompleted}
              onCheckedChange={() => onToggle(item.id)}
              className="h-3.5 w-3.5 mr-2 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
            />
          )}

          <div
            className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'} cursor-pointer overflow-visible flex items-center pr-5 leading-snug`}
          >
            <span
              ref={textSpanRef}
              className="break-words whitespace-normal font-normal cursor-pointer"
              onClick={handleClick}
            >
              {item.text}
            </span>
          </div>

          {/* Action buttons - vertically stacked on right */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDelete(item.id)}
              className="p-0.5 rounded-sm text-gray-400 hover:text-red-600 hover:bg-white transition-colors z-20"
              title="Delete"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
