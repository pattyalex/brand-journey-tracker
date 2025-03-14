
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
}
