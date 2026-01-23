export interface StoryboardScene {
  id: string;
  order: number;
  title: string;
  visualNotes: string;
  color: 'amber' | 'teal' | 'rose' | 'violet' | 'sky' | 'lime' | 'fuchsia' | 'cyan';
  highlightStart: number;
  highlightEnd: number;
  selectedShotTemplateId?: string;
  scriptExcerpt?: string; // For manually entered script when no highlight exists
}

export type EditingStatus = "to-start-editing" | "needs-more-editing" | "ready-to-schedule";

export type SchedulingStatus = "to-schedule" | "scheduled";

export interface EditingChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  isExample?: boolean;
}

export interface EditingChecklist {
  items: EditingChecklistItem[];
  notes: string;
  externalLinks: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  status: EditingStatus | null;
}

export type CardAddedFrom = 'calendar' | 'quick-idea' | 'ai-generated' | 'bank-of-ideas' | 'repurposed' | 'idea-expander';

export interface ProductionCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  isCompleted?: boolean;
  isNew?: boolean;
  addedFrom?: CardAddedFrom;
  platforms?: string[];
  formats?: string[];
  script?: string;
  hook?: string;
  locationChecked?: boolean;
  locationText?: string;
  outfitChecked?: boolean;
  outfitText?: string;
  propsChecked?: boolean;
  propsText?: string;
  filmingNotes?: string;
  status?: "to-start" | "needs-work" | "ready" | null;
  isPinned?: boolean;
  storyboard?: StoryboardScene[];
  editingChecklist?: EditingChecklist;
  customVideoFormats?: string[];
  customPhotoFormats?: string[];
  schedulingStatus?: SchedulingStatus | null;
  scheduledDate?: string; // ISO date string
  scheduledStartTime?: string; // Start time for scheduled content (e.g., "09:00" in 24-hour format)
  scheduledEndTime?: string; // End time for scheduled content (e.g., "10:00" in 24-hour format)
  scheduledColor?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage';
  fromCalendar?: boolean; // True if this idea originated from the Content Calendar
  plannedDate?: string; // The date this idea is tentatively planned for (used in Ideate column)
  plannedColor?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage'; // Color for planned items on calendar
  plannedStartTime?: string; // Start time for planned content (e.g., "9:00 am")
  plannedEndTime?: string; // End time for planned content (e.g., "10:00 am")
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: ProductionCard[];
}
