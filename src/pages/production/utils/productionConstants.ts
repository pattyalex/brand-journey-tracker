import { KanbanColumn } from "../types";

// Premium light theme - white columns with mauve accents
export const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string; topBorder: string; cardAccent: string }> = {
  ideate: { bg: "bg-white", border: "border-transparent", badge: "bg-[#B8A0C4]", text: "text-[#5C5058]", buttonBg: "bg-[#F5F0F7]", buttonText: "text-[#7D6B87]", topBorder: "bg-[#D8C8E0]", cardAccent: "border-l-[#D8C8E0]" },
  "shape-ideas": { bg: "bg-white", border: "border-transparent", badge: "bg-[#A890B8]", text: "text-[#5C5058]", buttonBg: "bg-[#F2EBF5]", buttonText: "text-[#725E7E]", topBorder: "bg-[#CCBAD8]", cardAccent: "border-l-[#CCBAD8]" },
  "to-film": { bg: "bg-white", border: "border-transparent", badge: "bg-[#9880A8]", text: "text-[#5C5058]", buttonBg: "bg-[#EDE5F2]", buttonText: "text-[#675275]", topBorder: "bg-[#C0ABCF]", cardAccent: "border-l-[#C0ABCF]" },
  "to-edit": { bg: "bg-white", border: "border-transparent", badge: "bg-[#887098]", text: "text-[#5C5058]", buttonBg: "bg-[#E8DFED]", buttonText: "text-[#5C466C]", topBorder: "bg-[#B49CC6]", cardAccent: "border-l-[#B49CC6]" },
  "to-schedule": { bg: "bg-white", border: "border-transparent", badge: "bg-[#786088]", text: "text-[#5C5058]", buttonBg: "bg-[#E2D8E8]", buttonText: "text-[#513A62]", topBorder: "bg-[#A88DBD]", cardAccent: "border-l-[#A88DBD]" },
  posted: { bg: "bg-white", border: "border-transparent", badge: "bg-[#685078]", text: "text-[#5C5058]", buttonBg: "bg-[#DCD0E3]", buttonText: "text-[#462E58]", topBorder: "bg-[#9C7EB4]", cardAccent: "border-l-[#9C7EB4]" },
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
