import { supabase } from '@/lib/supabase';

/**
 * Strategy Service
 * Manages user strategy data (brand values, mission, goals, vision board)
 */

// TypeScript Interfaces
export type GoalType = 'monthly' | 'short-term' | 'long-term';
export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

export interface Goal {
  id: string;
  text: string;
  status: GoalStatus;
  progressNote?: string;
  displayOrder: number;
  // For monthly goals
  year?: number;
  month?: number;
}

export interface VisionBoardImage {
  type: 'image' | 'link' | 'pdf';
  content: string;
  title?: string;
}

export interface UserStrategy {
  id: string;
  userId: string;
  brandValues: string[];
  missionStatement: string;
  contentValues: string;
  visionBoardData: {
    images: VisionBoardImage[];
    pinterestUrl: string;
  };
  strategyNotes: string;
  strategyNoteLinks: { url: string; title: string }[];
  strategyNoteFiles: { name: string; data: string }[];
  createdAt: string;
  updatedAt: string;
}

// Database row types
interface DbUserStrategy {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  brand_values: string[];
  mission_statement: string | null;
  content_values: string | null;
  vision_board_data: {
    images: VisionBoardImage[];
    pinterestUrl: string;
  } | null;
  strategy_notes: string | null;
  strategy_note_links: { url: string; title: string }[] | null;
  strategy_note_files: { name: string; data: string }[] | null;
}

interface DbUserGoal {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  goal_type: string;
  year: number | null;
  month: number | null;
  text: string;
  status: string;
  progress_note: string | null;
  display_order: number;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToUserStrategy = (db: DbUserStrategy): UserStrategy => ({
  id: db.id,
  userId: db.user_id,
  brandValues: db.brand_values || [],
  missionStatement: db.mission_statement || '',
  contentValues: db.content_values || '',
  visionBoardData: db.vision_board_data || { images: [], pinterestUrl: '' },
  strategyNotes: db.strategy_notes || '',
  strategyNoteLinks: db.strategy_note_links || [],
  strategyNoteFiles: db.strategy_note_files || [],
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const dbToGoal = (db: DbUserGoal): Goal => ({
  id: db.id,
  text: db.text,
  status: (db.status || 'not-started') as GoalStatus,
  progressNote: db.progress_note || undefined,
  displayOrder: db.display_order || 0,
  year: db.year || undefined,
  month: db.month || undefined,
});

// =====================================================
// User Strategy CRUD
// =====================================================

// Get or create user strategy
export const getUserStrategy = async (userId: string): Promise<UserStrategy> => {
  const { data, error } = await supabase
    .from('user_strategy')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found, create default
      return createUserStrategy(userId);
    }
    console.error('Error fetching user strategy:', error);
    throw error;
  }

  return dbToUserStrategy(data as DbUserStrategy);
};

// Create user strategy
export const createUserStrategy = async (userId: string): Promise<UserStrategy> => {
  const { data, error } = await supabase
    .from('user_strategy')
    .insert([{
      user_id: userId,
      brand_values: [],
      mission_statement: '',
      content_values: '',
      vision_board_data: { images: [], pinterestUrl: '' },
      strategy_notes: '',
      strategy_note_links: [],
      strategy_note_files: [],
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user strategy:', error);
    throw error;
  }

  return dbToUserStrategy(data as DbUserStrategy);
};

// Update user strategy
export const updateUserStrategy = async (
  userId: string,
  updates: Partial<Omit<UserStrategy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserStrategy> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.brandValues !== undefined) dbUpdates.brand_values = updates.brandValues;
  if (updates.missionStatement !== undefined) dbUpdates.mission_statement = updates.missionStatement;
  if (updates.contentValues !== undefined) dbUpdates.content_values = updates.contentValues;
  if (updates.visionBoardData !== undefined) dbUpdates.vision_board_data = updates.visionBoardData;
  if (updates.strategyNotes !== undefined) dbUpdates.strategy_notes = updates.strategyNotes;
  if (updates.strategyNoteLinks !== undefined) dbUpdates.strategy_note_links = updates.strategyNoteLinks;
  if (updates.strategyNoteFiles !== undefined) dbUpdates.strategy_note_files = updates.strategyNoteFiles;

  const { data, error } = await supabase
    .from('user_strategy')
    .update(dbUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user strategy:', error);
    throw error;
  }

  return dbToUserStrategy(data as DbUserStrategy);
};

// =====================================================
// Goals CRUD
// =====================================================

// Get all goals for a user
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }

  return (data || []).map(g => dbToGoal(g as DbUserGoal));
};

// Get goals by type
export const getGoalsByType = async (userId: string, goalType: GoalType): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_type', goalType)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching goals by type:', error);
    throw error;
  }

  return (data || []).map(g => dbToGoal(g as DbUserGoal));
};

// Get monthly goals for a specific year/month
export const getMonthlyGoals = async (
  userId: string,
  year: number,
  month: number
): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_type', 'monthly')
    .eq('year', year)
    .eq('month', month)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching monthly goals:', error);
    throw error;
  }

  return (data || []).map(g => dbToGoal(g as DbUserGoal));
};

// Create a goal
export const createGoal = async (
  userId: string,
  goalData: {
    goalType: GoalType;
    text: string;
    year?: number;
    month?: number;
    displayOrder?: number;
  }
): Promise<Goal> => {
  const { data, error } = await supabase
    .from('user_goals')
    .insert([{
      user_id: userId,
      goal_type: goalData.goalType,
      text: goalData.text,
      year: goalData.year || null,
      month: goalData.month || null,
      status: 'not-started',
      display_order: goalData.displayOrder || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating goal:', error);
    throw error;
  }

  return dbToGoal(data as DbUserGoal);
};

// Update a goal
export const updateGoal = async (
  goalId: string,
  updates: Partial<Omit<Goal, 'id'>>
): Promise<Goal> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.text !== undefined) dbUpdates.text = updates.text;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.progressNote !== undefined) dbUpdates.progress_note = updates.progressNote;
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;
  if (updates.year !== undefined) dbUpdates.year = updates.year;
  if (updates.month !== undefined) dbUpdates.month = updates.month;

  const { data, error } = await supabase
    .from('user_goals')
    .update(dbUpdates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating goal:', error);
    throw error;
  }

  return dbToGoal(data as DbUserGoal);
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// =====================================================
// Migration Helpers
// =====================================================

// Batch create goals from localStorage migration
export const batchCreateGoals = async (
  userId: string,
  goals: Array<{
    goalType: GoalType;
    text: string;
    status?: GoalStatus;
    progressNote?: string;
    year?: number;
    month?: number;
    displayOrder?: number;
  }>
): Promise<Goal[]> => {
  if (goals.length === 0) return [];

  const dbGoals = goals.map(g => ({
    user_id: userId,
    goal_type: g.goalType,
    text: g.text,
    status: g.status || 'not-started',
    progress_note: g.progressNote || null,
    year: g.year || null,
    month: g.month || null,
    display_order: g.displayOrder || 0,
  }));

  const { data, error } = await supabase
    .from('user_goals')
    .insert(dbGoals)
    .select();

  if (error) {
    console.error('Error batch creating goals:', error);
    throw error;
  }

  return (data || []).map(g => dbToGoal(g as DbUserGoal));
};
