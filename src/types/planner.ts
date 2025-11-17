
export interface PlannerItem {
  id: string;
  text: string;
  section: "morning" | "midday" | "afternoon" | "evening";
  isCompleted: boolean;
  date: string; // ISO string format YYYY-MM-DD
  startTime?: string; // Optional start time in format HH:MM (24-hour format)
  endTime?: string; // Optional end time in format HH:MM (24-hour format)
  description?: string; // Optional description for additional details
  location?: string; // Optional location of the task
  color?: string; // Optional background color for the task
  order?: number; // Optional order for manual sorting (lower numbers appear first)
}

export interface PlannerDay {
  date: string; // ISO string format YYYY-MM-DD
  items: PlannerItem[];
  greatDay?: string; // Optional "What would make today great?" section
  grateful?: string; // Optional "Things I'm grateful for today" section
  tasks?: string; // Optional general tasks section
}

export interface VisionBoardData {
  type: "image" | "link" | "pdf";
  content: string; // Either image URL or external link URL or PDF data URL
  title?: string; // Optional title for the vision board
}

// New interface for global planner data
export interface GlobalPlannerData {
  globalTasks: string; // Global tasks that remain the same across all days
}
