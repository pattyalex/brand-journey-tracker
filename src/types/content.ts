
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  format: string;
  dateCreated: Date;
  tags?: string[];
  platforms?: string[];
  scheduledDate?: Date;
}
