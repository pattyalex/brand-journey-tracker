
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface EditableColumnHeaderProps {
  title: string;
  onChange: (value: string) => void;
  className?: string;
}

const EditableColumnHeader = ({ 
  title, 
  onChange, 
  className 
}: EditableColumnHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== title) {
      onChange(editValue);
    } else {
      setEditValue(title); // Reset to original value if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (editValue.trim() && editValue !== title) {
        onChange(editValue);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(title); // Reset to original value
    }
  };

  return (
    <TableHead className={cn("group", className)}>
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="m-0 h-8 min-w-[100px]"
        />
      ) : (
        <div 
          onClick={handleClick} 
          className="flex items-center cursor-pointer"
        >
          <span>{title}</span>
          <Pencil className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-70" />
        </div>
      )}
    </TableHead>
  );
};

export default EditableColumnHeader;
