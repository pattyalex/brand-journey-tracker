
export type ContentFormat = 'image' | 'video' | 'document' | 'text';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  format: ContentFormat;
  url: string; // URL to content or data URI
  dateCreated: Date;
  tags: string[];
  platforms?: string[]; // Platforms for posting content
  size?: number; // Size in bytes (optional)
  thumbnailUrl?: string; // Thumbnail URL (optional)
}
