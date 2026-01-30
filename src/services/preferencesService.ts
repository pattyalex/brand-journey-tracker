import { supabase } from '@/lib/supabase';

/**
 * Preferences Service
 * Manages user preferences using Supabase
 */

// TypeScript Interfaces
export interface UserPreferences {
  id: string;
  userId: string;
  selectedTimezone: string;
  todayZoomLevel: number;
  weeklyZoomLevel: number;
  todayScrollPosition: number;
  weeklyScrollPosition: number;
  plannerLastAccessDate?: string;
  plannerColorPalette: string[];
  selectedTaskPalette?: string;
  sidebarState: Record<string, boolean>;
  sidebarMenuItems: string[];
  contentFormats: string[];
  platformUsernames: Record<string, string>;
  customHooks: string[];
  editorChecklistItems: Array<{ id: string; text: string; checked: boolean }>;
  hasCompletedOnboarding: boolean;
  hasSeenGoalsOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

// Database row type
interface DbUserPreferences {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  selected_timezone: string;
  today_zoom_level: number;
  weekly_zoom_level: number;
  today_scroll_position: number;
  weekly_scroll_position: number;
  planner_last_access_date: string | null;
  planner_color_palette: string[];
  selected_task_palette: string | null;
  sidebar_state: Record<string, boolean>;
  sidebar_menu_items: string[];
  content_formats: string[];
  platform_usernames: Record<string, string>;
  custom_hooks: string[];
  editor_checklist_items: Array<{ id: string; text: string; checked: boolean }>;
  has_completed_onboarding: boolean;
  has_seen_goals_onboarding: boolean;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToUserPreferences = (db: DbUserPreferences): UserPreferences => ({
  id: db.id,
  userId: db.user_id,
  selectedTimezone: db.selected_timezone || 'auto',
  todayZoomLevel: db.today_zoom_level || 1.0,
  weeklyZoomLevel: db.weekly_zoom_level || 1.0,
  todayScrollPosition: db.today_scroll_position || 0,
  weeklyScrollPosition: db.weekly_scroll_position || 0,
  plannerLastAccessDate: db.planner_last_access_date || undefined,
  plannerColorPalette: db.planner_color_palette || [],
  selectedTaskPalette: db.selected_task_palette || undefined,
  sidebarState: db.sidebar_state || {},
  sidebarMenuItems: db.sidebar_menu_items || [],
  contentFormats: db.content_formats || [],
  platformUsernames: db.platform_usernames || {},
  customHooks: db.custom_hooks || [],
  editorChecklistItems: db.editor_checklist_items || [],
  hasCompletedOnboarding: db.has_completed_onboarding || false,
  hasSeenGoalsOnboarding: db.has_seen_goals_onboarding || false,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

// =====================================================
// User Preferences CRUD
// =====================================================

// Get or create user preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found, create default
      return createUserPreferences(userId);
    }
    console.error('Error fetching user preferences:', error);
    throw error;
  }

  return dbToUserPreferences(data as DbUserPreferences);
};

// Create user preferences with defaults
export const createUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .insert([{
      user_id: userId,
      selected_timezone: 'auto',
      today_zoom_level: 1.0,
      weekly_zoom_level: 1.0,
      today_scroll_position: 0,
      weekly_scroll_position: 0,
      planner_color_palette: [],
      sidebar_state: {},
      sidebar_menu_items: [],
      content_formats: [],
      platform_usernames: {},
      custom_hooks: [],
      editor_checklist_items: [],
      has_completed_onboarding: false,
      has_seen_goals_onboarding: false,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user preferences:', error);
    throw error;
  }

  return dbToUserPreferences(data as DbUserPreferences);
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  updates: Partial<Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserPreferences> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.selectedTimezone !== undefined) dbUpdates.selected_timezone = updates.selectedTimezone;
  if (updates.todayZoomLevel !== undefined) dbUpdates.today_zoom_level = updates.todayZoomLevel;
  if (updates.weeklyZoomLevel !== undefined) dbUpdates.weekly_zoom_level = updates.weeklyZoomLevel;
  if (updates.todayScrollPosition !== undefined) dbUpdates.today_scroll_position = updates.todayScrollPosition;
  if (updates.weeklyScrollPosition !== undefined) dbUpdates.weekly_scroll_position = updates.weeklyScrollPosition;
  if (updates.plannerLastAccessDate !== undefined) dbUpdates.planner_last_access_date = updates.plannerLastAccessDate;
  if (updates.plannerColorPalette !== undefined) dbUpdates.planner_color_palette = updates.plannerColorPalette;
  if (updates.selectedTaskPalette !== undefined) dbUpdates.selected_task_palette = updates.selectedTaskPalette;
  if (updates.sidebarState !== undefined) dbUpdates.sidebar_state = updates.sidebarState;
  if (updates.sidebarMenuItems !== undefined) dbUpdates.sidebar_menu_items = updates.sidebarMenuItems;
  if (updates.contentFormats !== undefined) dbUpdates.content_formats = updates.contentFormats;
  if (updates.platformUsernames !== undefined) dbUpdates.platform_usernames = updates.platformUsernames;
  if (updates.customHooks !== undefined) dbUpdates.custom_hooks = updates.customHooks;
  if (updates.editorChecklistItems !== undefined) dbUpdates.editor_checklist_items = updates.editorChecklistItems;
  if (updates.hasCompletedOnboarding !== undefined) dbUpdates.has_completed_onboarding = updates.hasCompletedOnboarding;
  if (updates.hasSeenGoalsOnboarding !== undefined) dbUpdates.has_seen_goals_onboarding = updates.hasSeenGoalsOnboarding;

  const { data, error } = await supabase
    .from('user_preferences')
    .update(dbUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }

  return dbToUserPreferences(data as DbUserPreferences);
};

// =====================================================
// Convenience Methods for Common Updates
// =====================================================

// Update timezone
export const updateTimezone = async (userId: string, timezone: string): Promise<void> => {
  await updateUserPreferences(userId, { selectedTimezone: timezone });
};

// Update zoom levels
export const updateZoomLevels = async (
  userId: string,
  todayZoom?: number,
  weeklyZoom?: number
): Promise<void> => {
  const updates: Partial<UserPreferences> = {};
  if (todayZoom !== undefined) updates.todayZoomLevel = todayZoom;
  if (weeklyZoom !== undefined) updates.weeklyZoomLevel = weeklyZoom;
  await updateUserPreferences(userId, updates);
};

// Update scroll positions
export const updateScrollPositions = async (
  userId: string,
  todayScroll?: number,
  weeklyScroll?: number
): Promise<void> => {
  const updates: Partial<UserPreferences> = {};
  if (todayScroll !== undefined) updates.todayScrollPosition = todayScroll;
  if (weeklyScroll !== undefined) updates.weeklyScrollPosition = weeklyScroll;
  await updateUserPreferences(userId, updates);
};

// Update sidebar state
export const updateSidebarState = async (
  userId: string,
  sidebarState: Record<string, boolean>
): Promise<void> => {
  await updateUserPreferences(userId, { sidebarState });
};

// Mark onboarding as completed
export const completeOnboarding = async (userId: string): Promise<void> => {
  await updateUserPreferences(userId, { hasCompletedOnboarding: true });
};

// Mark goals onboarding as seen
export const completeGoalsOnboarding = async (userId: string): Promise<void> => {
  await updateUserPreferences(userId, { hasSeenGoalsOnboarding: true });
};
