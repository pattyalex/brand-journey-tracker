
export interface PlannerItem {
  id: string;
  text: string;
  section: "morning" | "midday" | "afternoon" | "evening";
  isCompleted: boolean;
  date: string; // ISO string format
}

export interface PlannerDay {
  date: string; // ISO string format
  items: PlannerItem[];
  greatDay?: string; // Optional "What would make today great?" section
  grateful?: string; // Optional "Things I'm grateful for today" section
}

export interface VisionBoardData {
  type: "image" | "link" | "pdf";
  content: string; // Either image URL or external link URL or PDF data URL
  title?: string; // Optional title for the vision board
}
