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

export interface ProductionCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  isCompleted?: boolean;
  isNew?: boolean;
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
  scheduledColor?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage';
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: ProductionCard[];
}
