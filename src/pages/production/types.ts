export interface StoryboardScene {
  id: string;
  order: number;
  title: string;
  visualNotes: string;
  color: 'amber' | 'teal' | 'rose' | 'violet' | 'sky' | 'lime' | 'fuchsia' | 'cyan';
  highlightStart: number;
  highlightEnd: number;
  selectedShotTemplateId?: string;
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
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: ProductionCard[];
}
