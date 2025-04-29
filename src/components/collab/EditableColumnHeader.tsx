
import React, { useState } from 'react';
import { TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableColumnHeaderProps {
  title: string;
  onChange: (value: string) => void;
  className?: string; // Added className prop
}

const EditableColumnHeader = ({ title, onChange, className }: EditableColumnHeaderProps) => {
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
        <div className="flex items-center space-x-2">
          <span>{title}</span>
          <Pencil
            className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
            onClick={() => setEditing(true)}
          />
        </div>
      )}
    </TableHead>
  );
};

export default EditableColumnHeader;
