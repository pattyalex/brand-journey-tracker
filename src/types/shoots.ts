export type ShootStatus = 'Planned' | 'In Progress' | 'Complete' | 'Archived';

export const SHOOT_STATUSES: ShootStatus[] = ['Planned', 'In Progress', 'Complete', 'Archived'];

export const SHOOT_STATUS_COLORS: Record<ShootStatus, { dot: string; bg: string; text: string }> = {
  Planned:       { dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF' },
  'In Progress': { dot: '#F59E0B', bg: '#FEF3C7', text: '#78350F' },
  Complete:      { dot: '#059669', bg: '#D1FAE5', text: '#065F46' },
  Archived:      { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' },
};

export interface ShootLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

export interface AIPlanBlock {
  id: string;
  time: string;
  location_id: string;
  location_name: string;
  post_ids: string[];
  reasoning: string;
}

export interface AIPlan {
  blocks: AIPlanBlock[];
  generated_at: string;
  priority_hint?: string;
}

export interface Shoot {
  id: string;
  name: string;
  date: string;
  status: ShootStatus;
  locations: ShootLocation[];
  start_location?: string;
  end_location?: string;
  outfits: string[];
  gear: string[];
  notes: string;
  optimized_route_order: string[];
  ai_plan: AIPlan | null;
  created_at: string;
  updated_at: string;
}
