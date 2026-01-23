import { KanbanColumn } from "../types";

// Premium light theme - white columns with mauve accents
export const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string; topBorder: string; cardAccent: string }> = {
  ideate: { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "shape-ideas": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-film": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-edit": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  "to-schedule": { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
  posted: { bg: "bg-white", border: "border-transparent", badge: "bg-[#F5F2F4]", text: "text-[#8B7082]", buttonBg: "bg-[#F5F2F4]", buttonText: "text-[#8B7082]", topBorder: "bg-[#8B7082]", cardAccent: "border-l-[#DDD6DA]" },
};

// Card styling - premium white cards with mauve accent
export const cardColors: Record<string, { bg: string; border: string; accent: string }> = {
  ideate: { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#D8C8E0]" },
  "shape-ideas": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#CCBAD8]" },
  "to-film": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#C0ABCF]" },
  "to-edit": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#B49CC6]" },
  "to-schedule": { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#A88DBD]" },
  posted: { bg: "bg-white", border: "border-[#F0EBF2]", accent: "border-l-[#9C7EB4]" },
};

export const defaultColumns: KanbanColumn[] = [
  { id: "ideate", title: "Ideate", cards: [] },
  { id: "shape-ideas", title: "Script Ideas", cards: [] },
  { id: "to-film", title: "To Film", cards: [] },
  { id: "to-edit", title: "To Edit", cards: [] },
  { id: "to-schedule", title: "To Schedule", cards: [] },
  { id: "posted", title: "Posted", cards: [] },
];
