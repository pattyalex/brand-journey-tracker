
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  format: string;
  dateCreated: Date;
  scheduledDate?: Date;
  tags: string[];
  platforms?: string[];
  customProperties?: { name: string; color: string }[];
}
