import { KanbanColumn, StageCompletions } from "../types";

// Column accent colors - each column gets a unique color
export const columnAccentColors: Record<string, { accent: string; accentLight: string; accentBg: string }> = {
  ideate: { accent: "#8B7082", accentLight: "rgba(139, 112, 130, 0.1)", accentBg: "rgba(139, 112, 130, 0.08)" }, // Mauve
  "shape-ideas": { accent: "#6B8E9B", accentLight: "rgba(107, 142, 155, 0.1)", accentBg: "rgba(107, 142, 155, 0.08)" }, // Blue-ish
  "to-film": { accent: "#D4A855", accentLight: "rgba(212, 168, 85, 0.1)", accentBg: "rgba(212, 168, 85, 0.08)" }, // Yellow-ish
  "to-edit": { accent: "#D4839B", accentLight: "rgba(212, 131, 155, 0.1)", accentBg: "rgba(212, 131, 155, 0.08)" }, // Pinkish
  "ready-to-post": { accent: "#E07A5F", accentLight: "rgba(224, 122, 95, 0.1)", accentBg: "rgba(224, 122, 95, 0.08)" }, // Warm coral
  "to-schedule": { accent: "#7B9E6B", accentLight: "rgba(123, 158, 107, 0.1)", accentBg: "rgba(123, 158, 107, 0.08)" }, // Green-ish
  "scheduled": { accent: "#10B981", accentLight: "rgba(16, 185, 129, 0.1)", accentBg: "rgba(16, 185, 129, 0.08)" }, // Emerald green
  posted: { accent: "#8B7082", accentLight: "rgba(139, 112, 130, 0.1)", accentBg: "rgba(139, 112, 130, 0.08)" }, // Neutral mauve
};

// Premium light theme - white columns with mauve accents
export const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string; topBorder: string; cardAccent: string }> = {
  ideate: { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "shape-ideas": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-film": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-edit": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "ready-to-post": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-schedule": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "scheduled": { bg: "bg-white", border: "border-transparent", badge: "bg-[#ECFDF5]", text: "text-[#059669]", buttonBg: "bg-[#ECFDF5]", buttonText: "text-[#059669]", topBorder: "bg-[#10B981]", cardAccent: "border-l-[#A7F3D0]" },
  posted: { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#612A4F]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#612A4F]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
};

// Card styling - premium white cards with mauve accent
export const cardColors: Record<string, { bg: string; border: string; accent: string }> = {
  ideate: { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#D8C8E0]" },
  "shape-ideas": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#CCBAD8]" },
  "to-film": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#C0ABCF]" },
  "to-edit": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#B49CC6]" },
  "ready-to-post": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#AC91BE]" },
  "to-schedule": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#A88DBD]" },
  "scheduled": { bg: "bg-white", border: "border-[#D1FAE5]", accent: "border-l-[#6EE7B7]" },
  posted: { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#9C7EB4]" },
};

// Column icons mapping (for headers)
export const columnIcons: Record<string, string> = {
  ideate: "Lightbulb",
  "shape-ideas": "PenLine",
  "to-film": "Clapperboard",
  "to-edit": "Scissors",
  "ready-to-post": "Send",
  "to-schedule": "CalendarDays",
  "scheduled": "CalendarCheck",
  posted: "Archive",
};

// Empty state icons (can differ from header icons)
export const emptyStateIcons: Record<string, string> = {
  ideate: "Lightbulb",
  "shape-ideas": "PenLine",
  "to-film": "LayoutGrid",
  "to-edit": "Scissors",
  "ready-to-post": "Send",
  "to-schedule": "CalendarDays",
  "scheduled": "CalendarCheck",
  posted: "Archive",
};

// Stage completion tracking
export const DEFAULT_STAGE_COMPLETIONS: StageCompletions = {
  ideate: false,
  scriptAndConcept: false,
  toFilm: false,
  toEdit: false,
  readyToPost: false,
  toSchedule: false,
};

export const STAGE_ORDER: (keyof StageCompletions)[] = [
  'ideate', 'scriptAndConcept', 'toFilm', 'toEdit', 'readyToPost', 'toSchedule',
];

export const STAGE_LABELS: Record<keyof StageCompletions, string> = {
  ideate: 'Bank of Ideas',
  scriptAndConcept: 'Script & Concept',
  toFilm: 'To Shoot',
  toEdit: 'To Edit',
  readyToPost: 'Ready to Post',
  toSchedule: 'To Schedule',
};

export const COLUMN_TO_STAGE: Record<string, keyof StageCompletions> = {
  'ideate': 'ideate',
  'shape-ideas': 'scriptAndConcept',
  'to-film': 'toFilm',
  'to-edit': 'toEdit',
  'ready-to-post': 'readyToPost',
  'to-schedule': 'toSchedule',
};

export const COLUMN_ORDER = ['ideate', 'shape-ideas', 'to-film', 'to-edit', 'ready-to-post', 'to-schedule'];

// Maps video step numbers (1-6) to stage completion keys
export const VIDEO_STEP_TO_STAGE: Record<number, keyof StageCompletions> = {
  1: 'ideate',
  2: 'scriptAndConcept',
  3: 'toFilm',
  4: 'toEdit',
  5: 'readyToPost',
  6: 'toSchedule',
};

// Maps image step numbers (1-5) to stage completion keys
export const IMAGE_STEP_TO_STAGE: Record<number, keyof StageCompletions> = {
  1: 'ideate',
  2: 'scriptAndConcept',
  3: 'toEdit',
  4: 'readyToPost',
  5: 'toSchedule',
};

export const defaultColumns: KanbanColumn[] = [
  { id: "ideate", title: "Bank of Ideas", cards: [] },
  { id: "shape-ideas", title: "Script & Concept", cards: [] },
  { id: "to-film", title: "To Shoot", cards: [] },
  { id: "to-edit", title: "To Edit", cards: [] },
  { id: "ready-to-post", title: "Ready to Post", cards: [] },
  { id: "to-schedule", title: "To Schedule", cards: [] },
  { id: "scheduled", title: "Scheduled", cards: [] },
];
