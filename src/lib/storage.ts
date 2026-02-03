export const StorageKeys = {
  hasCompletedOnboarding: "hasCompletedOnboarding",
  hasSeenGoalsOnboarding: "hasSeenGoalsOnboarding",
  user: "user",
  selectedTimezone: "selectedTimezone",
  todayZoomLevel: "todayZoomLevel",
  weeklyZoomLevel: "weeklyZoomLevel",
  plannerLastAccessDate: "plannerLastAccessDate",
  todayScrollPosition: "todayScrollPosition",
  weeklyScrollPosition: "weeklyScrollPosition",
  plannerData: "plannerData",
  globalPlannerData: "globalPlannerData",
  allTasks: "allTasks",
  scheduledContent: "scheduledContent",
  readyToScheduleContent: "readyToScheduleContent",
  monthlyGoalsData: "monthlyGoalsData",
  restoredToIdeasContent: "restoredToIdeasContent",
  contentRestorationLog: "contentRestorationLog",
  openaiApiKey: "openai_api_key",
  openaiApiKeyMasked: "openai_api_key_masked",
  openaiKeySet: "openai_key_set",
  anthropicApiKey: "anthropic_api_key",
  anthropicApiKeyMasked: "anthropic_api_key_masked",
  anthropicKeySet: "anthropic_key_set",
  preferredAIProvider: "preferred_ai_provider",
  journalEntries: "journalEntries",
  lastAccessDate: "lastAccessDate",
  growthGoals: "growthGoals",
  shortTermGoals: "shortTermGoals",
  longTermGoals: "longTermGoals",
  sidebarMenuItems: "sidebarMenuItems",
  sidebarState: "sidebarState",
  collabBrands: "collabBrands",
  collabColumns: "collabColumns",
  contentPillars: "contentPillars",
  contentFormats: "contentFormats",
  pillars: "pillars",
  customHooks: "customHooks",
  platformUsernames: "platformUsernames",
  firecrawlApiKey: "firecrawl_api_key",
  visionBoardData: "visionBoardData",
  visionBoardItems: "visionBoardItems",
  quickNotes: "quickNotes",
  researchItems: "researchItems",
  bankOfIdeas: "bankOfIdeas",
  productionKanban: "productionKanban",
  contentValues: "contentValues",
  brandValues: "brandValues",
  missionStatement: "missionStatement",
  pinnedContentIdeas: "pinnedContentIdeas",
  contentIdeas: "contentIdeas",
  highlightedUnscheduledCard: "highlightedUnscheduledCard",
  archivedContent: "archivedContent",
  selectedTaskPalette: "selectedTaskPalette",
  firstDayOfWeek: "firstDayOfWeek"
} as const;

export const contentFormatsByPillar = (pillarId: string) => `content-formats-${pillarId}`;
export const sidebarExpanded = (title: string) => `sidebar-expanded-${title}`;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getString = (key: string, defaultValue: string | null = null) => {
  if (!isBrowser()) {
    return defaultValue;
  }
  const value = window.localStorage.getItem(key);
  return value ?? defaultValue;
};

export const setString = (key: string, value: string) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(key, value);
};

export const getBoolean = (key: string, defaultValue: boolean) => {
  const value = getString(key);
  if (value === null) {
    return defaultValue;
  }
  return value === "true";
};

export const setBoolean = (key: string, value: boolean) => {
  setString(key, value ? "true" : "false");
};

export const getJSON = <T>(key: string, defaultValue: T): T => {
  const value = getString(key);
  if (value === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
};

export const setJSON = <T>(key: string, value: T) => {
  setString(key, JSON.stringify(value));
};

export const remove = (key: string) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(key);
};

// Helper to get weekStartsOn value for date-fns (0 = Sunday, 1 = Monday)
export const getWeekStartsOn = (): 0 | 1 => {
  const setting = getString(StorageKeys.firstDayOfWeek, 'sunday');
  return setting === 'monday' ? 1 : 0;
};

// Helper to get day names array based on first day of week setting
export const getDayNames = (format: 'short' | 'full' | 'upper' = 'short'): string[] => {
  const setting = getString(StorageKeys.firstDayOfWeek, 'sunday');
  const mondayFirst = {
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    upper: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  };
  const sundayFirst = {
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    upper: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  };
  return setting === 'monday' ? mondayFirst[format] : sundayFirst[format];
};
