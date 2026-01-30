import { supabase } from '@/lib/supabase';

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
});

// =====================================================
// Planner Days CRUD
// =====================================================

// Get or create a planner day
export const getPlannerDay = async (
  userId: string,
  date: string
): Promise<PlannerDay> => {
  // First try to get existing day
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
    const { data: newDay, error: createError } = await supabase
      .from('planner_days')
      .insert([{ user_id: userId, date }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating planner day:', createError);
      throw createError;
    }
    plannerDay = newDay as DbPlannerDay;
  } else {
    plannerDay = existingDay as DbPlannerDay;
  }

  // Fetch items for this day
  const { data: items, error: itemsError } = await supabase
    .from('planner_items')
    .select('*')
    .eq('planner_day_id', plannerDay.id)
    .order('display_order', { ascending: true });

  if (itemsError) {
    console.error('Error fetching planner items:', itemsError);
    throw itemsError;
  }

  return {
    id: plannerDay.id,
    userId: plannerDay.user_id,
    date: plannerDay.date,
    greatDay: plannerDay.great_day || undefined,
    grateful: plannerDay.grateful || undefined,
    tasks: plannerDay.tasks || undefined,
    items: (items || []).map(i => dbToPlannerItem(i as DbPlannerItem)),
    createdAt: plannerDay.created_at,
    updatedAt: plannerDay.updated_at,
  };
};

// Get planner days in a date range
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

  // Fetch all items for these days
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

  const { data, error } = await supabase
    .from('planner_items')
    .insert([dbItem])
    .select()
    .single();

  if (error) {
    console.error('Error creating planner item:', error);
    throw error;
  }

  return dbToPlannerItem(data as DbPlannerItem);
};

// Get all planner items for a user (for global tasks)
export const getGlobalTasks = async (userId: string): Promise<PlannerItem[]> => {
  const { data, error } = await supabase
    .from('planner_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_global_task', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching global tasks:', error);
    throw error;
  }

  return (data || []).map(i => dbToPlannerItem(i as DbPlannerItem));
};

// Get items by date (for calendar view)
export const getItemsByDate = async (
  userId: string,
  date: string
): Promise<PlannerItem[]> => {
  const { data, error } = await supabase
    .from('planner_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching items by date:', error);
    throw error;
  }

  return (data || []).map(i => dbToPlannerItem(i as DbPlannerItem));
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

  const { data, error } = await supabase
    .from('planner_items')
    .update(dbUpdates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating planner item:', error);
    throw error;
  }

  return dbToPlannerItem(data as DbPlannerItem);
};

// Delete a planner item
export const deletePlannerItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('planner_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting planner item:', error);
    throw error;
  }
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

  const { data, error } = await supabase
    .from('planner_items')
    .insert(dbItems)
    .select();

  if (error) {
    console.error('Error batch creating planner items:', error);
    throw error;
  }

  return (data || []).map(i => dbToPlannerItem(i as DbPlannerItem));
};
