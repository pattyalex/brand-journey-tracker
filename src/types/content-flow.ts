
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
  // Add fields to make it compatible with the other ContentItem type
  url?: string;
  format?: string;
  dateCreated?: Date;
  tags?: string[];
  platforms?: string[];
  scheduledDate?: Date;
  status?: string;
  shootDetails?: string;
  caption?: string;
  createdAt?: Date;
  bucketId?: string;
}
