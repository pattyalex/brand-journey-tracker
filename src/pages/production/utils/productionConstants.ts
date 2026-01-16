import { KanbanColumn } from "../types";

export const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string }> = {
  ideate: { bg: "bg-purple-100/60", border: "border-transparent", badge: "bg-purple-500", text: "text-purple-700", buttonBg: "bg-purple-100", buttonText: "text-purple-800" },
  "shape-ideas": { bg: "bg-blue-100/60", border: "border-transparent", badge: "bg-blue-500", text: "text-blue-700", buttonBg: "bg-blue-100", buttonText: "text-blue-800" },
  "to-film": { bg: "bg-amber-100/60", border: "border-transparent", badge: "bg-amber-500", text: "text-amber-700", buttonBg: "bg-amber-100", buttonText: "text-amber-800" },
  "to-edit": { bg: "bg-rose-100/60", border: "border-transparent", badge: "bg-rose-500", text: "text-rose-700", buttonBg: "bg-rose-100", buttonText: "text-rose-800" },
  "to-schedule": { bg: "bg-indigo-100/60", border: "border-transparent", badge: "bg-indigo-500", text: "text-indigo-700", buttonBg: "bg-indigo-100", buttonText: "text-indigo-800" },
  posted: { bg: "bg-emerald-100/60", border: "border-transparent", badge: "bg-emerald-500", text: "text-emerald-700", buttonBg: "bg-emerald-100", buttonText: "text-emerald-800" },
};

// Card background colors (very light gray, almost white)
export const cardColors: Record<string, { bg: string; border: string }> = {
  ideate: { bg: "bg-white/90", border: "border-gray-200" },
  "shape-ideas": { bg: "bg-white/90", border: "border-gray-200" },
  "to-film": { bg: "bg-white/90", border: "border-gray-200" },
  "to-edit": { bg: "bg-white/90", border: "border-gray-200" },
  "to-schedule": { bg: "bg-white/90", border: "border-gray-200" },
  posted: { bg: "bg-white/90", border: "border-gray-200" },
};

export const defaultColumns: KanbanColumn[] = [
  { id: "ideate", title: "Ideate", cards: [] },
  { id: "shape-ideas", title: "Shape Ideas", cards: [] },
  { id: "to-film", title: "To Film", cards: [] },
  { id: "to-edit", title: "To Edit", cards: [] },
  { id: "to-schedule", title: "To Schedule", cards: [] },
  { id: "posted", title: "Posted 🎉", cards: [] },
];
