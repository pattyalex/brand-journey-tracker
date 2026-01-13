
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTableCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
  placeholder?: string;
}

const EditableTableCell = ({
  value,
  onChange,
  className,
  type = "text",
  placeholder = "Click to add"
}: EditableTableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
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
      placeholder={placeholder}
      className={cn("m-0 h-8 min-w-[100px] border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0", className)}
    />
  ) : (
    <div
      onClick={handleClick}
      className={cn("cursor-pointer hover:bg-gray-50 p-1 rounded text-left w-full !text-left", value ? "" : "text-gray-400", className)}
      style={{textAlign: 'left'}}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableTableCell;
