export interface Task {
  id: string;
  title: string;
  date: string;
  time: string | null;
  end_time: string | null;
  duration: string | null;
  tag: string | null;
  completed: boolean;
  parent_task_id: string | null;
  order_index: number;
  notes: string | null;
  dismissed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyNote {
  id: string;
  date: string;
  content: string | null;
  updated_at: string;
}

export const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  heymeg: { bg: '#FBEAF0', text: '#72243E', dot: '#C04D6E' },
  personal: { bg: '#E8F0FE', text: '#1A56DB', dot: '#3B82F6' },
  fitness: { bg: '#E6F4EA', text: '#137333', dot: '#34A853' },
  deals: { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
};

const EXTRA_COLORS = [
  { bg: '#F3E8FF', text: '#6B21A8', dot: '#9333EA' },
  { bg: '#E0F2FE', text: '#0E7490', dot: '#06B6D4' },
  { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' },
];

export function getTagColor(tag: string): { bg: string; text: string; dot: string } {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return EXTRA_COLORS[Math.abs(hash) % EXTRA_COLORS.length];
}
