import { supabase } from '@/lib/supabase';
import { fetchAll, createOne, updateOne, deleteOne, createMany } from './baseService';

/**
 * Planner Service
 * Manages planner days and items using Supabase
 */

// TypeScript Interfaces
export type PlannerSection = 'morning' | 'midday' | 'afternoon' | 'evening';

export interface PlannerItem {
  id: string;
  text: string;
  section: PlannerSection;
  isCompleted: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  color?: string;
  displayOrder: number;
  isContentCalendar?: boolean;
  isPlaceholder?: boolean;
  isGlobalTask?: boolean;
  timezone?: string;
}

export interface PlannerDay {
  id: string;
  userId: string;
  date: string;
  greatDay?: string;
  grateful?: string;
  tasks?: string;
  items: PlannerItem[];
  createdAt: string;
  updatedAt: string;
}

// Database row types
interface DbPlannerDay {
  id: string;
  user_id: string;
  date: string;
  created_at: string;
  updated_at: string;
  great_day: string | null;
  grateful: string | null;
  tasks: string | null;
}

interface DbPlannerItem {
  id: string;
  user_id: string;
  planner_day_id: string | null;
  created_at: string;
  updated_at: string;
  text: string;
  section: string | null;
  is_completed: boolean;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  location: string | null;
  color: string | null;
  display_order: number;
  is_content_calendar: boolean;
  is_placeholder: boolean;
  is_global_task: boolean;
  timezone: string | null;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToPlannerItem = (db: DbPlannerItem): PlannerItem => ({
  id: db.id,
  text: db.text,
  section: (db.section || 'morning') as PlannerSection,
  isCompleted: db.is_completed || false,
  date: db.date || '',
  startTime: db.start_time || undefined,
  endTime: db.end_time || undefined,
  description: db.description || undefined,
  location: db.location || undefined,
  color: db.color || undefined,
  displayOrder: db.display_order || 0,
  isContentCalendar: db.is_content_calendar || false,
  isPlaceholder: db.is_placeholder || false,
  isGlobalTask: db.is_global_task || false,
  timezone: db.timezone || undefined,
});

const plannerItemToDb = (
  userId: string,
  item: Omit<PlannerItem, 'id'>,
  plannerDayId?: string
) => ({
  user_id: userId,
  planner_day_id: plannerDayId || null,
  text: item.text,
  section: item.section || null,
  is_completed: item.isCompleted || false,
  date: item.date || null,
  start_time: item.startTime || null,
  end_time: item.endTime || null,
  description: item.description || null,
  location: item.location || null,
  color: item.color || null,
  display_order: item.displayOrder || 0,
  is_content_calendar: item.isContentCalendar || false,
  is_placeholder: item.isPlaceholder || false,
  is_global_task: item.isGlobalTask || false,
  timezone: item.timezone || null,
});

// =====================================================
// Planner Days CRUD
// =====================================================

// Get or create a planner day - uses get-or-create + join with items, keep partially raw
export const getPlannerDay = async (
  userId: string,
  date: string
): Promise<PlannerDay> => {
  // First try to get existing day using two-column lookup (non-standard)
  const { data: existingDay, error: fetchError } = await supabase
    .from('planner_days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching planner day:', fetchError);
    throw fetchError;
  }

  let plannerDay: DbPlannerDay;

  if (!existingDay) {
    // Create new day
    plannerDay = await createOne<DbPlannerDay>('planner_days', { user_id: userId, date });
  } else {
    plannerDay = existingDay as DbPlannerDay;
  }

  // Fetch items for this day
  const items = await fetchAll<DbPlannerItem>('planner_items', {
    orderBy: 'display_order',
    ascending: true,
    filters: { planner_day_id: plannerDay.id },
  });

  return {
    id: plannerDay.id,
    userId: plannerDay.user_id,
    date: plannerDay.date,
    greatDay: plannerDay.great_day || undefined,
    grateful: plannerDay.grateful || undefined,
    tasks: plannerDay.tasks || undefined,
    items: items.map(i => dbToPlannerItem(i)),
    createdAt: plannerDay.created_at,
    updatedAt: plannerDay.updated_at,
  };
};

// Get planner days in a date range - uses .gte/.lte, keep raw Supabase
export const getPlannerDaysInRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<PlannerDay[]> => {
  const { data: days, error: daysError } = await supabase
    .from('planner_days')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (daysError) {
    console.error('Error fetching planner days:', daysError);
    throw daysError;
  }

  if (!days || days.length === 0) {
    return [];
  }

  // Fetch all items for these days - uses .in(), keep raw Supabase
  const dayIds = days.map(d => d.id);
  const { data: items, error: itemsError } = await supabase
    .from('planner_items')
    .select('*')
    .in('planner_day_id', dayIds)
    .order('display_order', { ascending: true });

  if (itemsError) {
    console.error('Error fetching planner items:', itemsError);
    throw itemsError;
  }

  // Group items by day
  const itemsByDay: Record<string, PlannerItem[]> = {};
  (items || []).forEach(item => {
    if (item.planner_day_id) {
      if (!itemsByDay[item.planner_day_id]) {
        itemsByDay[item.planner_day_id] = [];
      }
      itemsByDay[item.planner_day_id].push(dbToPlannerItem(item as DbPlannerItem));
    }
  });

  return days.map(day => ({
    id: day.id,
    userId: day.user_id,
    date: day.date,
    greatDay: day.great_day || undefined,
    grateful: day.grateful || undefined,
    tasks: day.tasks || undefined,
    items: itemsByDay[day.id] || [],
    createdAt: day.created_at,
    updatedAt: day.updated_at,
  }));
};

// Update planner day metadata (greatDay, grateful, tasks)
export const updatePlannerDay = async (
  dayId: string,
  updates: {
    greatDay?: string;
    grateful?: string;
    tasks?: string;
  }
): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.greatDay !== undefined) dbUpdates.great_day = updates.greatDay;
  if (updates.grateful !== undefined) dbUpdates.grateful = updates.grateful;
  if (updates.tasks !== undefined) dbUpdates.tasks = updates.tasks;

  // Uses .update() without .select().single() - does not return data
  const { error } = await supabase
    .from('planner_days')
    .update(dbUpdates)
    .eq('id', dayId);

  if (error) {
    console.error('Error updating planner day:', error);
    throw error;
  }
};

// =====================================================
// Planner Items CRUD
// =====================================================

// Create a planner item
export const createPlannerItem = async (
  userId: string,
  item: Omit<PlannerItem, 'id'>,
  plannerDayId?: string
): Promise<PlannerItem> => {
  const dbItem = plannerItemToDb(userId, item, plannerDayId);
  const data = await createOne<DbPlannerItem>('planner_items', dbItem);
  return dbToPlannerItem(data);
};

// Get all planner items for a user (for global tasks)
export const getGlobalTasks = async (userId: string): Promise<PlannerItem[]> => {
  const data = await fetchAll<DbPlannerItem>('planner_items', {
    userId,
    orderBy: 'display_order',
    ascending: true,
    filters: { is_global_task: true },
  });
  return data.map(dbToPlannerItem);
};

// Get items by date (for calendar view)
export const getItemsByDate = async (
  userId: string,
  date: string
): Promise<PlannerItem[]> => {
  const data = await fetchAll<DbPlannerItem>('planner_items', {
    userId,
    orderBy: 'display_order',
    ascending: true,
    filters: { date },
  });
  return data.map(dbToPlannerItem);
};

// Update a planner item
export const updatePlannerItem = async (
  itemId: string,
  updates: Partial<Omit<PlannerItem, 'id'>>
): Promise<PlannerItem> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.text !== undefined) dbUpdates.text = updates.text;
  if (updates.section !== undefined) dbUpdates.section = updates.section;
  if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;
  if (updates.isContentCalendar !== undefined) dbUpdates.is_content_calendar = updates.isContentCalendar;
  if (updates.isPlaceholder !== undefined) dbUpdates.is_placeholder = updates.isPlaceholder;
  if (updates.isGlobalTask !== undefined) dbUpdates.is_global_task = updates.isGlobalTask;
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;

  const data = await updateOne<DbPlannerItem>('planner_items', itemId, dbUpdates);
  return dbToPlannerItem(data);
};

// Delete a planner item
export const deletePlannerItem = async (itemId: string): Promise<void> => {
  await deleteOne('planner_items', itemId);
};

// =====================================================
// Migration Helpers
// =====================================================

// Batch create planner items
export const batchCreatePlannerItems = async (
  userId: string,
  items: Array<Omit<PlannerItem, 'id'>>,
  plannerDayId?: string
): Promise<PlannerItem[]> => {
  if (items.length === 0) return [];
  const dbItems = items.map(item => plannerItemToDb(userId, item, plannerDayId));
  const data = await createMany<DbPlannerItem>('planner_items', dbItems);
  return data.map(dbToPlannerItem);
};

// =====================================================
// Full Sync Helpers (localStorage <-> Supabase)
// =====================================================

// Local PlannerDay type (matches src/types/planner.ts, no userId/id/timestamps)
interface LocalPlannerDay {
  date: string;
  items: Array<{
    id: string;
    text: string;
    section: 'morning' | 'midday' | 'afternoon' | 'evening';
    isCompleted: boolean;
    date: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    color?: string;
    order?: number;
    isContentCalendar?: boolean;
    isPlaceholder?: boolean;
    timezone?: string;
  }>;
  greatDay?: string;
  grateful?: string;
  tasks?: string;
}

interface LocalPlannerItem {
  id: string;
  text: string;
  section: 'morning' | 'midday' | 'afternoon' | 'evening';
  isCompleted: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  color?: string;
  order?: number;
  isContentCalendar?: boolean;
  isPlaceholder?: boolean;
  timezone?: string;
}

/**
 * Sync a single planner day (with its items) to Supabase.
 * Upserts the day row, deletes existing items, re-inserts current items.
 */
export const syncPlannerDay = async (
  userId: string,
  day: LocalPlannerDay
): Promise<void> => {
  try {
    // 1. Upsert the planner_day row
    const { data: dayRow, error: dayError } = await supabase
      .from('planner_days')
      .upsert(
        {
          user_id: userId,
          date: day.date,
          great_day: day.greatDay || null,
          grateful: day.grateful || null,
          tasks: day.tasks || null,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (dayError) {
      console.error('Error upserting planner day:', dayError);
      return;
    }

    // 2. Delete all existing items for this day
    const { error: deleteError } = await supabase
      .from('planner_items')
      .delete()
      .eq('planner_day_id', dayRow.id);

    if (deleteError) {
      console.error('Error deleting planner items:', deleteError);
      return;
    }

    // 3. Insert current items
    if (day.items.length > 0) {
      const dbItems = day.items.map((item, index) => ({
        user_id: userId,
        planner_day_id: dayRow.id,
        text: item.text,
        section: item.section || null,
        is_completed: item.isCompleted || false,
        date: item.date || day.date,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        description: item.description || null,
        location: item.location || null,
        color: item.color || null,
        display_order: item.order ?? index,
        is_content_calendar: item.isContentCalendar || false,
        is_placeholder: item.isPlaceholder || false,
        is_global_task: false,
        timezone: item.timezone || null,
      }));

      const { error: insertError } = await supabase
        .from('planner_items')
        .insert(dbItems);

      if (insertError) {
        console.error('Error inserting planner items:', insertError);
      }
    }
  } catch (err) {
    console.error('syncPlannerDay failed:', err);
  }
};

/**
 * Sync all planner days to Supabase. Compares with previous state
 * and only syncs days that changed.
 */
export const syncPlannerDataToSupabase = async (
  userId: string,
  currentData: LocalPlannerDay[],
  previousData: LocalPlannerDay[] | null
): Promise<void> => {
  if (!previousData) {
    // First sync — sync all days that have items or metadata
    const daysToSync = currentData.filter(
      d => d.items.length > 0 || d.greatDay || d.grateful || d.tasks
    );
    await Promise.all(daysToSync.map(day => syncPlannerDay(userId, day)));
    return;
  }

  // Build a map of previous days for comparison
  const prevMap = new Map(previousData.map(d => [d.date, d]));

  // Find days that changed
  for (const day of currentData) {
    const prev = prevMap.get(day.date);
    if (!prev || JSON.stringify(day) !== JSON.stringify(prev)) {
      await syncPlannerDay(userId, day);
    }
  }

  // Find days that were removed (existed in prev but not in current)
  const currentDates = new Set(currentData.map(d => d.date));
  for (const prev of previousData) {
    if (!currentDates.has(prev.date)) {
      // Delete the day and its items from Supabase
      const { data: dayRow } = await supabase
        .from('planner_days')
        .select('id')
        .eq('user_id', userId)
        .eq('date', prev.date)
        .single();

      if (dayRow) {
        await supabase.from('planner_items').delete().eq('planner_day_id', dayRow.id);
        await supabase.from('planner_days').delete().eq('id', dayRow.id);
      }
    }
  }
};

/**
 * Sync allTasks (global sidebar tasks) to Supabase.
 * These are planner_items with is_global_task = true and no planner_day_id.
 */
export const syncAllTasksToSupabase = async (
  userId: string,
  tasks: LocalPlannerItem[]
): Promise<void> => {
  try {
    // 1. Delete all existing global tasks for this user
    const { error: deleteError } = await supabase
      .from('planner_items')
      .delete()
      .eq('user_id', userId)
      .eq('is_global_task', true);

    if (deleteError) {
      console.error('Error deleting global tasks:', deleteError);
      return;
    }

    // 2. Insert current tasks
    if (tasks.length > 0) {
      const dbItems = tasks.map((item, index) => ({
        user_id: userId,
        planner_day_id: null,
        text: item.text,
        section: item.section || null,
        is_completed: item.isCompleted || false,
        date: item.date || null,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        description: item.description || null,
        location: item.location || null,
        color: item.color || null,
        display_order: item.order ?? index,
        is_content_calendar: item.isContentCalendar || false,
        is_placeholder: item.isPlaceholder || false,
        is_global_task: true,
        timezone: item.timezone || null,
      }));

      const { error: insertError } = await supabase
        .from('planner_items')
        .insert(dbItems);

      if (insertError) {
        console.error('Error inserting global tasks:', insertError);
      }
    }
  } catch (err) {
    console.error('syncAllTasksToSupabase failed:', err);
  }
};

/**
 * Load all planner data from Supabase and return in localStorage format.
 */
export const loadPlannerDataFromSupabase = async (
  userId: string
): Promise<{ days: LocalPlannerDay[]; allTasks: LocalPlannerItem[] }> => {
  // Fetch all days
  const { data: days, error: daysError } = await supabase
    .from('planner_days')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (daysError) {
    console.error('Error fetching planner days:', daysError);
    throw daysError;
  }

  // Fetch all items for this user
  const { data: items, error: itemsError } = await supabase
    .from('planner_items')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (itemsError) {
    console.error('Error fetching planner items:', itemsError);
    throw itemsError;
  }

  // Separate global tasks from day-specific items
  const globalTasks: LocalPlannerItem[] = [];
  const itemsByDayId: Record<string, LocalPlannerItem[]> = {};

  for (const item of (items || [])) {
    const localItem: LocalPlannerItem = {
      id: item.id,
      text: item.text,
      section: (item.section || 'morning') as LocalPlannerItem['section'],
      isCompleted: item.is_completed || false,
      date: item.date || '',
      startTime: item.start_time || undefined,
      endTime: item.end_time || undefined,
      description: item.description || undefined,
      location: item.location || undefined,
      color: item.color || undefined,
      order: item.display_order || 0,
      isContentCalendar: item.is_content_calendar || false,
      isPlaceholder: item.is_placeholder || false,
      timezone: item.timezone || undefined,
    };

    if (item.is_global_task) {
      globalTasks.push(localItem);
    } else if (item.planner_day_id) {
      if (!itemsByDayId[item.planner_day_id]) {
        itemsByDayId[item.planner_day_id] = [];
      }
      itemsByDayId[item.planner_day_id].push(localItem);
    }
  }

  // Build local planner days
  const localDays: LocalPlannerDay[] = (days || []).map(day => ({
    date: day.date,
    greatDay: day.great_day || undefined,
    grateful: day.grateful || undefined,
    tasks: day.tasks || undefined,
    items: itemsByDayId[day.id] || [],
  }));

  return { days: localDays, allTasks: globalTasks };
};
