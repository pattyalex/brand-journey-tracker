
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";

export interface ContentCardProps {
  content: ContentItem;
  index: number;
  pillar: Pillar;
  pillars: Pillar[];
  onDeleteContent: (contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onScheduleContent?: (contentId: string, scheduledDate: Date) => void;
  onRestoreToIdeas?: (content: ContentItem, originalPillarId?: string) => void;
  originalPillarId?: string;
  isInCalendarView?: boolean;
  isDraggable?: boolean;
}

export interface ContentCardButtonProps {
  content: ContentItem;
  onAction: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  className?: string;
  children: React.ReactNode;
}
