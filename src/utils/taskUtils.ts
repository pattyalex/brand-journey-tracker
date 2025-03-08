
import { Task } from "@/types/task";
import { Flag } from "lucide-react";
import React from "react";

export const getStatusDisplayName = (status: Task["status"]) => {
  switch (status) {
    case "todo-all": return "All";
    case "todo-today": return "Today";
    case "scheduled": return "Scheduled";
    case "completed": return "Completed";
    default: return status;
  }
};

export const getPriorityColor = (priority: Task["priority"]) => {
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

export const getExampleTasks = (): Task[] => [
  { 
    id: "1", 
    title: "Create content calendar", 
    description: "Plan out content for the next month", 
    status: "todo-all", 
    priority: "high",
    createdAt: new Date().toISOString()
  },
  { 
    id: "2", 
    title: "Write blog post", 
    description: "Complete draft for review", 
    status: "todo-today", 
    priority: "medium",
    createdAt: new Date().toISOString()
  },
  { 
    id: "3", 
    title: "Record Instagram Reel", 
    description: "Film short tutorial clip", 
    status: "todo-all", 
    priority: "low",
    createdAt: new Date().toISOString()
  },
  { 
    id: "4", 
    title: "Edit YouTube video", 
    description: "Final edits and add transitions", 
    status: "scheduled", 
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: "medium",
    createdAt: new Date().toISOString()
  },
  { 
    id: "5", 
    title: "Schedule social posts", 
    description: "Queue up content for next week", 
    status: "completed", 
    priority: "medium",
    createdAt: new Date().toISOString()
  },
];
