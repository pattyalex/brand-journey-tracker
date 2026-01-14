import { KanbanColumn } from "../types";

export const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string }> = {
  ideate: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-500", text: "text-purple-700", buttonBg: "bg-purple-100", buttonText: "text-purple-800" },
  "shape-ideas": { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-500", text: "text-blue-700", buttonBg: "bg-blue-100", buttonText: "text-blue-800" },
  "to-film": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", text: "text-amber-700", buttonBg: "bg-amber-100", buttonText: "text-amber-800" },
  "to-edit": { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-500", text: "text-rose-700", buttonBg: "bg-rose-100", buttonText: "text-rose-800" },
  "to-schedule": { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-500", text: "text-indigo-700", buttonBg: "bg-indigo-100", buttonText: "text-indigo-800" },
  posted: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", text: "text-emerald-700", buttonBg: "bg-emerald-100", buttonText: "text-emerald-800" },
};

// Card background colors (darker shades for content cards with stronger borders)
export const cardColors: Record<string, { bg: string; border: string }> = {
  ideate: { bg: "bg-purple-100", border: "border-purple-400/50" },
  "shape-ideas": { bg: "bg-blue-100", border: "border-blue-400/50" },
  "to-film": { bg: "bg-amber-100", border: "border-amber-400/50" },
  "to-edit": { bg: "bg-rose-100", border: "border-rose-400/50" },
  "to-schedule": { bg: "bg-indigo-100", border: "border-indigo-400/50" },
  posted: { bg: "bg-emerald-100", border: "border-emerald-400/50" },
};

export const defaultColumns: KanbanColumn[] = [
  { id: "ideate", title: "Ideate", cards: [] },
  { id: "shape-ideas", title: "Shape Ideas", cards: [] },
  { id: "to-film", title: "To Film", cards: [] },
  { id: "to-edit", title: "To Edit", cards: [] },
  { id: "to-schedule", title: "To Schedule", cards: [] },
  { id: "posted", title: "Posted 🎉", cards: [] },
];
