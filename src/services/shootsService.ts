import { supabase } from '@/lib/supabase';
import { Shoot } from '@/types/shoots';

const TABLE = 'shoots';

interface DbShoot {
  id: string;
  user_id: string;
  name: string;
  date: string;
  status: string;
  locations: unknown;
  start_location: string | null;
  end_location: string | null;
  outfits: string[];
  gear: string[];
  notes: string;
  optimized_route_order: string[];
  ai_plan: unknown;
  created_at: string;
  updated_at: string;
}

function dbToShoot(row: DbShoot): Shoot {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    status: row.status as Shoot['status'],
    locations: (row.locations || []) as Shoot['locations'],
    start_location: row.start_location || undefined,
    end_location: row.end_location || undefined,
    outfits: row.outfits || [],
    gear: row.gear || [],
    notes: row.notes || '',
    optimized_route_order: row.optimized_route_order || [],
    ai_plan: (row.ai_plan as Shoot['ai_plan']) || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function shootToDb(shoot: Shoot, userId: string): Record<string, unknown> {
  return {
    id: shoot.id,
    user_id: userId,
    name: shoot.name,
    date: shoot.date,
    status: shoot.status,
    locations: shoot.locations || [],
    start_location: shoot.start_location || null,
    end_location: shoot.end_location || null,
    outfits: shoot.outfits || [],
    gear: shoot.gear || [],
    notes: shoot.notes || '',
    optimized_route_order: shoot.optimized_route_order || [],
    ai_plan: shoot.ai_plan || null,
    created_at: shoot.created_at,
    updated_at: shoot.updated_at,
  };
}

function shootUpdatesToDb(updates: Partial<Shoot>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.locations !== undefined) row.locations = updates.locations;
  if (updates.start_location !== undefined) row.start_location = updates.start_location || null;
  if (updates.end_location !== undefined) row.end_location = updates.end_location || null;
  if (updates.outfits !== undefined) row.outfits = updates.outfits;
  if (updates.gear !== undefined) row.gear = updates.gear;
  if (updates.notes !== undefined) row.notes = updates.notes;
  if (updates.optimized_route_order !== undefined) row.optimized_route_order = updates.optimized_route_order;
  if (updates.ai_plan !== undefined) row.ai_plan = updates.ai_plan;
  return row;
}

export async function fetchShoots(userId: string): Promise<Shoot[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('[shootsService] fetchShoots error:', error);
    throw error;
  }

  return (data as DbShoot[]).map(dbToShoot);
}

export async function createShoot(shoot: Shoot, userId: string): Promise<Shoot> {
  const row = shootToDb(shoot, userId);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('[shootsService] createShoot error:', error);
    throw error;
  }

  return dbToShoot(data as DbShoot);
}

export async function updateShoot(id: string, updates: Partial<Shoot>): Promise<Shoot> {
  const row = shootUpdatesToDb(updates);
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[shootsService] updateShoot error:', error);
    throw error;
  }

  return dbToShoot(data as DbShoot);
}

export async function deleteShoot(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[shootsService] deleteShoot error:', error);
    throw error;
  }
}

export async function upsertShoots(shoots: Shoot[], userId: string): Promise<void> {
  if (shoots.length === 0) return;
  const rows = shoots.map(s => shootToDb(s, userId));
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[shootsService] upsertShoots error:', error);
    throw error;
  }
}
