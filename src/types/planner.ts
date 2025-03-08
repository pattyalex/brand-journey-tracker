
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
  notes?: string; // Optional notes for the day
  greatDay?: string; // Optional "What would make today great?" section
}
