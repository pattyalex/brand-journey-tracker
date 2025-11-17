
import { useState, useRef } from "react";
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
  dragHandleProps?: any;
}

export const PlannerCheckItem = ({
  item,
  onToggle,
  onDelete,
  onEdit,
  showTimeInItem = false,
  renderCheckbox = false,
  index,
  dragHandleProps
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
        <div className="flex flex-1 items-center p-1 bg-white border border-gray-200 rounded-lg">
          {renderCheckbox && (
            <Checkbox
              checked={item.isCompleted}
              onCheckedChange={() => onToggle(item.id)}
              className="h-4 w-4 mr-1 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm flex-shrink-0"
            />
          )}
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
          className="group flex items-start w-full py-2 px-2 border border-gray-200 rounded-lg relative overflow-visible"
          style={{ backgroundColor: item.color || 'white' }}
          draggable={!dragHandleProps}
          onDragStart={(e) => {
            if (!dragHandleProps) {
              e.dataTransfer.setData('taskId', item.id);
              e.dataTransfer.setData('fromDate', item.date || '');
              e.dataTransfer.effectAllowed = 'move';
            }
          }}
        >
          <div
            {...dragHandleProps}
            className="mr-1 mt-0.5 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={16} />
          </div>
          {renderCheckbox && (
            <Checkbox
              checked={item.isCompleted}
              onCheckedChange={() => onToggle(item.id)}
              className="h-4 w-4 mr-2 mt-1 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
            />
          )}

          <div
            className={`flex-1 text-base ${item.isCompleted ? 'line-through text-gray-600' : 'text-gray-800'} cursor-pointer overflow-visible flex items-start pr-5`}
            onDoubleClick={handleDoubleClick}
          >
            <span className="break-words whitespace-normal">{item.text}</span>
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTitle(item.text);
                    setEditDescription(item.description || "");
                    setSelectedColor(item.color || "");
                    setIsEditingTitle(false);
                    setIsEditDialogOpen(true);
                  }}
                  className="p-0.5 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-white transition-colors z-20"
                  title="Edit task details"
                >
                  <Edit size={10} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-base">Edit Task Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-3">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Title</label>
                    {isEditingTitle ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditingTitle(false);
                          }
                        }}
                        autoFocus
                        className="text-sm"
                      />
                    ) : (
                      <div
                        className="p-2 rounded border border-gray-200 text-sm cursor-pointer hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: selectedColor || 'white' }}
                        onDoubleClick={() => setIsEditingTitle(true)}
                        title="Double-click to edit"
                      >
                        {editTitle}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Description</label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Color</label>
                    <div className="grid grid-cols-8 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-8 h-8 rounded border transition-colors ${
                            selectedColor === color ? 'border-gray-800 border-2' : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleRemoveColor}
                      className="w-full py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 mt-1"
                    >
                      <XIcon size={10} />
                      Remove color
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEditDialog}>
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};
