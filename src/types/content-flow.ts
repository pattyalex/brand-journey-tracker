
export interface Platform {
  id: string;
  name: string;
  icon: string;
}

export interface ContentItem {
  id: string;
  platformId: string;
  day: string;
  title: string;
  description?: string;
  time?: string;
  notes?: string;
  position?: number; // Vertical position in pixels
  timeSlot?: string; // Added timeSlot for horizontal alignment
}
