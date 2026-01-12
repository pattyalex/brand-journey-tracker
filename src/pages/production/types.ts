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
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: ProductionCard[];
}
