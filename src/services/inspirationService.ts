import { supabase } from '@/lib/supabase';
import { InspirationItem } from '@/components/posts/InspirationPanel';

const TABLE = 'user_inspiration';

interface DbInspiration {
  id: string;
  user_id: string;
  url: string;
  title: string;
  type: string;
  platform: string;
  file_name: string | null;
  notes: string | null;
  saved_at: string;
}

function dbToItem(row: DbInspiration): InspirationItem {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    type: row.type as InspirationItem['type'],
    platform: row.platform as InspirationItem['platform'],
    fileName: row.file_name || undefined,
    notes: row.notes || undefined,
    savedAt: row.saved_at,
  };
}

function itemToDb(item: InspirationItem, userId: string): Record<string, unknown> {
  return {
    id: item.id,
    user_id: userId,
    url: item.url,
    title: item.title,
    type: item.type,
    platform: item.platform,
    file_name: item.fileName || null,
    notes: item.notes || null,
    saved_at: item.savedAt,
  };
}

export async function fetchInspiration(userId: string): Promise<InspirationItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('[inspirationService] fetchInspiration error:', error);
    throw error;
  }

  return (data as DbInspiration[]).map(dbToItem);
}

export async function createInspiration(item: InspirationItem, userId: string): Promise<InspirationItem> {
  const row = itemToDb(item, userId);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('[inspirationService] createInspiration error:', error);
    throw error;
  }

  return dbToItem(data as DbInspiration);
}

export async function updateInspiration(id: string, updates: Partial<InspirationItem>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.notes !== undefined) row.notes = updates.notes || null;
  if (updates.url !== undefined) row.url = updates.url;
  if (updates.title !== undefined) row.title = updates.title;

  const { error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', id);

  if (error) {
    console.error('[inspirationService] updateInspiration error:', error);
    throw error;
  }
}

export async function deleteInspiration(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[inspirationService] deleteInspiration error:', error);
    throw error;
  }
}

export async function upsertInspiration(items: InspirationItem[], userId: string): Promise<void> {
  if (items.length === 0) return;
  const rows = items.map(i => itemToDb(i, userId));
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[inspirationService] upsertInspiration error:', error);
    throw error;
  }
}
