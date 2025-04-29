
import React, { useState } from 'react';
import { TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableColumnHeaderProps {
  title: string;
  onChange: (value: string) => void;
  className?: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

const EditableColumnHeader = ({ 
  title, 
  onChange, 
  className,
  canDelete = false,
  onDelete
}: EditableColumnHeaderProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  const handleBlur = () => {
    setEditing(false);
    onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(false);
      onChange(value);
    }
  };

  // Determine if this is the Notes column to apply special styling
  const isNotesColumn = title === 'Notes';
  
  return (
    <TableHead className={cn("group", className)}>
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-8 py-0 px-2 text-sm"
        />
      ) : (
        <div className={cn(
          "flex items-center",
          "justify-start w-full space-x-2"
        )}>
          <span className="pl-4">{title}</span>
          <div className={cn(
            "flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isNotesColumn ? "ml-2" : "ml-1"
          )}>
            <Pencil
              className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setEditing(true)}
            />
            {canDelete && onDelete && (
              <Trash2
                className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-red-500 ml-1"
                onClick={onDelete}
              />
            )}
          </div>
        </div>
      )}
    </TableHead>
  );
};

export default EditableColumnHeader;
