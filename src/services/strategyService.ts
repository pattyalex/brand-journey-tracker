import { fetchAll, createOne, updateOne, deleteOne, createMany, fetchOneBy, updateOneBy } from './baseService';

/**
 * Strategy Service
 * Manages user strategy data (brand values, mission, goals, vision board)
 */

// TypeScript Interfaces
export type GoalType = 'monthly' | 'short-term' | 'long-term';
export type GoalStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'in-progress' | 'completed';

export interface Goal {
  id: string;
  goalType: GoalType;
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
  visionBoardData: {
    images: VisionBoardImage[];
    pinterestUrl: string;
    threeYearVision?: string;
  };
  strategyNotes: string;
  strategyNoteLinks: { url: string; title: string }[];
  strategyNoteFiles: { name: string; data: string }[];
  selectedTones: string[];
  audienceAgeRanges: string[];
  audienceStruggles: string;
  audienceDesires: string;
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
  vision_board_data: {
    images: VisionBoardImage[];
    pinterestUrl: string;
    threeYearVision?: string;
  } | null;
  strategy_notes: string | null;
  strategy_note_links: { url: string; title: string }[] | null;
  strategy_note_files: { name: string; data: string }[] | null;
  selected_tones: string[] | null;
  audience_age_ranges: string[] | null;
  audience_struggles: string | null;
  audience_desires: string | null;
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
  visionBoardData: db.vision_board_data || { images: [], pinterestUrl: '' },
  strategyNotes: db.strategy_notes || '',
  strategyNoteLinks: db.strategy_note_links || [],
  strategyNoteFiles: db.strategy_note_files || [],
  selectedTones: db.selected_tones || [],
  audienceAgeRanges: db.audience_age_ranges || [],
  audienceStruggles: db.audience_struggles || '',
  audienceDesires: db.audience_desires || '',
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const dbToGoal = (db: DbUserGoal): Goal => ({
  id: db.id,
  goalType: db.goal_type as GoalType,
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
  const data = await fetchOneBy<DbUserStrategy>('user_strategy', 'user_id', userId);

  if (!data) {
    return createUserStrategy(userId);
  }

  return dbToUserStrategy(data);
};

// Create user strategy
export const createUserStrategy = async (userId: string): Promise<UserStrategy> => {
  const data = await createOne<DbUserStrategy>('user_strategy', {
    user_id: userId,
    brand_values: [],
    mission_statement: '',
    vision_board_data: { images: [], pinterestUrl: '' },
    strategy_notes: '',
    strategy_note_links: [],
    strategy_note_files: [],
    selected_tones: [],
    audience_age_ranges: [],
    audience_struggles: '',
    audience_desires: '',
  });
  return dbToUserStrategy(data);
};

// Update user strategy
export const updateUserStrategy = async (
  userId: string,
  updates: Partial<Omit<UserStrategy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserStrategy> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.brandValues !== undefined) dbUpdates.brand_values = updates.brandValues;
  if (updates.missionStatement !== undefined) dbUpdates.mission_statement = updates.missionStatement;
  if (updates.visionBoardData !== undefined) dbUpdates.vision_board_data = updates.visionBoardData;
  if (updates.strategyNotes !== undefined) dbUpdates.strategy_notes = updates.strategyNotes;
  if (updates.strategyNoteLinks !== undefined) dbUpdates.strategy_note_links = updates.strategyNoteLinks;
  if (updates.strategyNoteFiles !== undefined) dbUpdates.strategy_note_files = updates.strategyNoteFiles;
  if (updates.selectedTones !== undefined) dbUpdates.selected_tones = updates.selectedTones;
  if (updates.audienceAgeRanges !== undefined) dbUpdates.audience_age_ranges = updates.audienceAgeRanges;
  if (updates.audienceStruggles !== undefined) dbUpdates.audience_struggles = updates.audienceStruggles;
  if (updates.audienceDesires !== undefined) dbUpdates.audience_desires = updates.audienceDesires;

  const data = await updateOneBy<DbUserStrategy>('user_strategy', 'user_id', userId, dbUpdates);
  return dbToUserStrategy(data);
};

// =====================================================
// Goals CRUD
// =====================================================

// Get all goals for a user
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  const data = await fetchAll<DbUserGoal>('user_goals', {
    userId,
    orderBy: 'display_order',
    ascending: true,
  });
  return data.map(dbToGoal);
};

// Get goals by type
export const getGoalsByType = async (userId: string, goalType: GoalType): Promise<Goal[]> => {
  const data = await fetchAll<DbUserGoal>('user_goals', {
    userId,
    orderBy: 'display_order',
    ascending: true,
    filters: { goal_type: goalType },
  });
  return data.map(dbToGoal);
};

// Get monthly goals for a specific year/month
export const getMonthlyGoals = async (
  userId: string,
  year: number,
  month: number
): Promise<Goal[]> => {
  const data = await fetchAll<DbUserGoal>('user_goals', {
    userId,
    orderBy: 'display_order',
    ascending: true,
    filters: { goal_type: 'monthly', year, month },
  });
  return data.map(dbToGoal);
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
  const data = await createOne<DbUserGoal>('user_goals', {
    user_id: userId,
    goal_type: goalData.goalType,
    text: goalData.text,
    year: goalData.year || null,
    month: goalData.month || null,
    status: 'not-started',
    display_order: goalData.displayOrder || 0,
  });
  return dbToGoal(data);
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

  const data = await updateOne<DbUserGoal>('user_goals', goalId, dbUpdates);
  return dbToGoal(data);
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  await deleteOne('user_goals', goalId);
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

  const data = await createMany<DbUserGoal>('user_goals', dbGoals);
  return data.map(dbToGoal);
};
