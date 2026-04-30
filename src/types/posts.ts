export type PostStatus = 'Idea' | 'Scripted' | 'Ready to shoot' | 'Shot' | 'Edited' | 'Scheduled' | 'Posted';

export const DEFAULT_FORMATS: string[] = ['Carousel', 'Reel', 'Photo', 'Story'];

export interface Post {
  id: string;
  title: string;
  pillar: string;
  format: string;
  status: PostStatus;
  scheduledDate?: string; // ISO date string
  caption?: string;
  hashtags?: string[];
  attachedFiles?: string[];
  notes?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
  };
  order: number;
  shoot_id?: string | null;
  sentToShoots?: boolean;
  createdAt: string;
}

export const POST_STATUSES: PostStatus[] = ['Idea', 'Scripted', 'Ready to shoot', 'Shot', 'Edited', 'Scheduled', 'Posted'];

export const DEFAULT_PILLARS: string[] = ['Fashion', 'POV', 'Day in my life', 'The build'];

export const STATUS_COLORS: Record<PostStatus, { dot: string; bg: string; text: string }> = {
  Idea:             { dot: '#FACC15', bg: '#FEF9C3', text: '#854D0E' },
  Scripted:         { dot: '#EC4899', bg: '#FCE7F3', text: '#9D174D' },
  'Ready to shoot': { dot: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' },
  Shot:             { dot: '#FF6B00', bg: '#FFF2E0', text: '#B94500' },
  Edited:           { dot: '#2563EB', bg: '#DBEAFE', text: '#1E40AF' },
  Scheduled:        { dot: '#F59E0B', bg: '#FEF3C7', text: '#78350F' },
  Posted:           { dot: '#059669', bg: '#D1FAE5', text: '#065F46' },
};

export interface PillarStyle { bg: string; text: string; border: string }

const PILLAR_PRESET_STYLES: Record<string, PillarStyle> = {
  Fashion:          { bg: '#FEF2F2', text: '#991B1B', border: '#F87171' }, // red
  POV:              { bg: '#EFF6FF', text: '#1E40AF', border: '#60A5FA' }, // blue
  'Day in my life': { bg: '#F0FDF4', text: '#166534', border: '#4ADE80' }, // green
  'The build':      { bg: '#FEFCE8', text: '#854D0E', border: '#FACC15' }, // yellow
};

// Extra palette for user-created pillars — cycles through these
const PILLAR_EXTRA_PALETTE: PillarStyle[] = [
  { bg: '#F5F3FF', text: '#5B21B6', border: '#A78BFA' }, // purple
  { bg: '#FFF7ED', text: '#9A3412', border: '#FB923C' }, // orange
  { bg: '#FDF4FF', text: '#86198F', border: '#E879F9' }, // fuchsia
  { bg: '#F0FDFA', text: '#115E59', border: '#2DD4BF' }, // teal
  { bg: '#FFF1F2', text: '#9F1239', border: '#FDA4AF' }, // rose
  { bg: '#F0F9FF', text: '#075985', border: '#7DD3FC' }, // sky
];

let extraIndex = 0;
const dynamicMap = new Map<string, PillarStyle>();

export function getPillarStyle(pillar: string): PillarStyle {
  if (PILLAR_PRESET_STYLES[pillar]) return PILLAR_PRESET_STYLES[pillar];
  if (dynamicMap.has(pillar)) return dynamicMap.get(pillar)!;
  const style = PILLAR_EXTRA_PALETTE[extraIndex % PILLAR_EXTRA_PALETTE.length];
  extraIndex++;
  dynamicMap.set(pillar, style);
  return style;
}
