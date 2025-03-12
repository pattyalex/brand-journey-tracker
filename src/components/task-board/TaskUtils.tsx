
import { Flag } from "lucide-react";
import { Task } from "@/types/task-board";

export const getStatusDisplayName = (status: Task["status"]): string => {
  switch (status) {
    case "todo-all": return "To Do Later";
    case "todo-today": return "To Do Today";
    case "scheduled": return "Scheduled";
    case "completed": return "Completed";
    default: return status;
  }
};

export const getPriorityColor = (priority: Task["priority"]): string => {
  switch (priority) {
    case "high": return "text-red-500";
    case "medium": return "text-amber-500";
    case "low": return "text-green-500";
    default: return "";
  }
};

export const getPriorityIcon = (priority: Task["priority"]) => {
  switch (priority) {
    case "high": 
      return <Flag className="h-3 w-3 text-red-500 fill-red-500" />;
    case "medium": 
      return <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />;
    case "low": 
      return <Flag className="h-3 w-3 text-green-500 fill-green-500" />;
    default: 
      return null;
  }
};
