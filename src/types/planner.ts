
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
  category?: string; // Optional category for color-coding
  categoryColor?: string; // Optional color for the category
  isMultiDay?: boolean; // Whether this is a multi-day event
  endDate?: string; // End date for multi-day events in ISO format YYYY-MM-DD
  isTimeBlock?: boolean; // Whether this is a time block rather than a task
  recurrenceRule?: {
    pattern: "none" | "daily" | "weekly" | "monthly";
    endDate?: string; // End date for recurrence
    occurrences?: number; // Number of occurrences
  };
  isRecurringInstance?: boolean; // Whether this is a generated instance of a recurring event
  parentId?: string; // ID of the parent recurring event
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

export type CalendarView = "daily" | "weekly" | "agenda";

export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
}

export interface CalendarIntegration {
  type: "google" | "outlook" | "apple" | "ical";
  connected: boolean;
  lastSynced?: string; // ISO date string
}

// Filter options for tasks
export interface TaskFilter {
  category?: string;
  completed?: boolean;
  section?: "morning" | "midday" | "afternoon" | "evening";
  search?: string;
  startDate?: string;
  endDate?: string;
}
