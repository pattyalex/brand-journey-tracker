
import React from 'react';
import { Circle, CheckCircle, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ReminderItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderItem = ({ id, title, completed, onToggle, onDelete }: ReminderItemProps) => {
  return (
    <div className="group flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded-md">
      <button
        onClick={() => onToggle(id)}
        className="text-gray-400 hover:text-gray-600"
      >
        {completed ? (
          <CheckCircle className="h-5 w-5 text-[#8B6B4E]" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <span className={cn("flex-1", completed && "line-through text-gray-400")}>
        {title}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ReminderItem;
