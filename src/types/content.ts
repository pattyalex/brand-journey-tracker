
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
  status?: string;
  shootDetails?: string;
  caption?: string;
  createdAt?: Date;
  bucketId?: string;
  originalPillarId?: string; // Added to track which pillar the content came from
  isRestored?: boolean; // Added to flag restored items
}
