import { supabase } from '@/lib/supabase';

/**
 * Work Habits Service
 * Manages habit tracking using Supabase
 */

export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  completed_dates: string[];
  goal_target: number | null;
  goal_period: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  goal?: {
    target: number;
    period: 'week' | 'month';
  };
}

const dbToHabit = (db: DbHabit): Habit => ({
  id: db.id,
  name: db.name,
  completedDates: db.completed_dates || [],
  goal: db.goal_target && db.goal_period
    ? { target: db.goal_target, period: db.goal_period as 'week' | 'month' }
    : undefined,
});

// Get all habits for a user
export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('work_habits')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }

  return (data || []).map(dbToHabit);
};

// Create a habit
export const createHabit = async (
  userId: string,
  habit: { name: string; goal?: { target: number; period: 'week' | 'month' }; displayOrder?: number }
): Promise<Habit> => {
  const { data, error } = await supabase
    .from('work_habits')
    .insert([{
      user_id: userId,
      name: habit.name,
      completed_dates: [],
      goal_target: habit.goal?.target || null,
      goal_period: habit.goal?.period || null,
      display_order: habit.displayOrder || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating habit:', error);
    throw error;
  }

  return dbToHabit(data);
};

// Update a habit
export const updateHabit = async (
  habitId: string,
  updates: Partial<{ name: string; completedDates: string[]; goalTarget: number | null; goalPeriod: string | null }>
): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
  if (updates.goalTarget !== undefined) dbUpdates.goal_target = updates.goalTarget;
  if (updates.goalPeriod !== undefined) dbUpdates.goal_period = updates.goalPeriod;

  const { error } = await supabase
    .from('work_habits')
    .update(dbUpdates)
    .eq('id', habitId);

  if (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

// Delete a habit
export const deleteHabit = async (habitId: string): Promise<void> => {
  const { error } = await supabase
    .from('work_habits')
    .delete()
    .eq('id', habitId);

  if (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};
