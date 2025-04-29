
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTableCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
}

const EditableTableCell = ({ 
  value, 
  onChange, 
  className,
  type = "text"
}: EditableTableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value); // Reset to original value
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      type={type}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn("m-0 h-8 min-w-[100px]", className)}
    />
  ) : (
    <div 
      onDoubleClick={handleDoubleClick} 
      className={cn("cursor-pointer hover:bg-gray-50 p-1 rounded text-left w-full", className)}
    >
      {value}
    </div>
  );
};

export default EditableTableCell;
