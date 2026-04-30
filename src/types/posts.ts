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
  createdAt: string;
}

export const POST_STATUSES: PostStatus[] = ['Idea', 'Scripted', 'Ready to shoot', 'Shot', 'Edited', 'Scheduled', 'Posted'];

export const DEFAULT_PILLARS: string[] = ['Fashion', 'POV', 'Day in my life', 'The build'];

export const STATUS_COLORS: Record<PostStatus, { dot: string; bg: string; text: string }> = {
  Idea:             { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' },
  Scripted:         { dot: '#EC4899', bg: '#FCE7F3', text: '#9D174D' },
  'Ready to shoot': { dot: '#F59E0B', bg: '#FEF3C7', text: '#78350F' },
  Shot:             { dot: '#FF6B00', bg: '#FFF2E0', text: '#B94500' },
  Edited:           { dot: '#2563EB', bg: '#DBEAFE', text: '#1E40AF' },
  Scheduled:        { dot: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' },
  Posted:           { dot: '#059669', bg: '#D1FAE5', text: '#065F46' },
};

export interface PillarStyle { bg: string; text: string; border: string }

const PILLAR_PRESET_STYLES: Record<string, PillarStyle> = {
  Fashion:          { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  POV:              { bg: '#EFF6FF', text: '#1E3A5F', border: '#BFDBFE' },
  'Day in my life': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'The build':      { bg: '#F5F5F4', text: '#57534E', border: '#D6D3D1' },
};

// Extra palette for user-created pillars — cycles through these
const PILLAR_EXTRA_PALETTE: PillarStyle[] = [
  { bg: '#FDF4FF', text: '#86198F', border: '#F0ABFC' }, // fuchsia
  { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' }, // orange
  { bg: '#F0FDFA', text: '#115E59', border: '#99F6E4' }, // teal
  { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' }, // yellow
  { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' }, // violet
  { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' }, // emerald
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
