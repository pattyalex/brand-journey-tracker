import { supabase } from '@/lib/supabase';

const TABLE = 'user_schedule_grid';
const GRID_SLOTS = 12;

export async function fetchScheduleGrid(userId: string): Promise<(string | null)[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('slot_index, post_id')
    .eq('user_id', userId)
    .order('slot_index', { ascending: true });

  if (error) {
    console.error('[scheduleService] fetchScheduleGrid error:', error);
    throw error;
  }

  // Build grid array from sparse rows
  const grid: (string | null)[] = new Array(GRID_SLOTS).fill(null);
  for (const row of data || []) {
    if (row.slot_index >= 0 && row.slot_index < GRID_SLOTS) {
      grid[row.slot_index] = row.post_id;
    }
  }

  return grid;
}

export async function saveScheduleGrid(grid: (string | null)[], userId: string): Promise<void> {
  // Upsert all 12 slots
  const rows = grid.map((postId, index) => ({
    user_id: userId,
    slot_index: index,
    post_id: postId,
  }));

  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'user_id,slot_index' });

  if (error) {
    console.error('[scheduleService] saveScheduleGrid error:', error);
    throw error;
  }
}
