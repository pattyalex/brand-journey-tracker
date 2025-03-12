
export interface PlannerDay {
  id: string;
  date: string;
  tasks: PlannerTask[];
}

export interface PlannerTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo-all" | "todo-today" | "scheduled" | "completed";
  dueDate?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  isCompleted?: boolean;
}
