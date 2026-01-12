import { useEffect } from "react";
import { format } from "date-fns";
import { EVENTS, on } from "@/lib/events";
import { StorageKeys, getString, setJSON, setString } from "@/lib/storage";
import { GlobalPlannerData, PlannerDay, PlannerItem } from "@/types/planner";

export const getPlannerInitialSettings = () => {
  const selectedTimezone = getString(StorageKeys.selectedTimezone) || 'auto';
  const saved = getString(StorageKeys.todayZoomLevel);
  const todayZoomLevel = saved ? parseFloat(saved) : 1;

  // Default to 7am (7 hours * 90px per hour * zoom = 630px at 100% zoom)
  const savedZoom = getString(StorageKeys.todayZoomLevel);
  const zoom = savedZoom ? parseFloat(savedZoom) : 1;
  const defaultScroll = 7 * 90 * zoom;

  const savedDate = getString(StorageKeys.plannerLastAccessDate);
  const today = format(new Date(), 'yyyy-MM-dd');

  let todayScrollPosition = defaultScroll;
  // If it's a new day, reset to 7am
  if (savedDate !== today) {
    setString(StorageKeys.plannerLastAccessDate, today);
    todayScrollPosition = defaultScroll;
  } else {
    // Otherwise, try to restore saved position
    const savedPosition = getString(StorageKeys.todayScrollPosition);
    todayScrollPosition = savedPosition ? parseInt(savedPosition, 10) : defaultScroll;
  }

  // Default to 7am (7 hours * 48px per hour for weekly view = 336px)
  const weeklyDefaultScroll = 7 * 48;

  const weeklySavedDate = getString(StorageKeys.plannerLastAccessDate);
  let weeklyScrollPosition = weeklyDefaultScroll;

  // If it's a new day, reset to 7am
  if (weeklySavedDate !== today) {
    weeklyScrollPosition = weeklyDefaultScroll;
  } else {
    // Otherwise, try to restore saved position
    const savedPosition = getString(StorageKeys.weeklyScrollPosition);
    weeklyScrollPosition = savedPosition ? parseInt(savedPosition, 10) : weeklyDefaultScroll;
  }

  return {
    selectedTimezone,
    todayZoomLevel,
    todayScrollPosition,
    weeklyScrollPosition,
  };
};

interface UsePlannerPersistenceArgs {
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  contentCalendarData: any[];
  todayScrollPosition: number;
  weeklyScrollPosition: number;
  globalTasks: string;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setGlobalTasks: React.Dispatch<React.SetStateAction<string>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setContentCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
  setTodayScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyScrollPosition: React.Dispatch<React.SetStateAction<number>>;
}

export const usePlannerPersistence = ({
  plannerData,
  allTasks,
  contentCalendarData,
  todayScrollPosition,
  weeklyScrollPosition,
  globalTasks,
  setPlannerData,
  setGlobalTasks,
  setAllTasks,
  setContentCalendarData,
  setTodayScrollPosition,
  setWeeklyScrollPosition,
}: UsePlannerPersistenceArgs) => {
  useEffect(() => {
    const savedData = getString(StorageKeys.plannerData);
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }

    const savedGlobalData = getString(StorageKeys.globalPlannerData);
    if (savedGlobalData) {
      const globalData: GlobalPlannerData = JSON.parse(savedGlobalData);
      setGlobalTasks(globalData.globalTasks || "");
    }

    // Load All Tasks
    const savedAllTasks = getString(StorageKeys.allTasks);
    console.log('DailyPlanner: Loading allTasks from localStorage', savedAllTasks);
    if (savedAllTasks) {
      const parsed = JSON.parse(savedAllTasks);
      console.log('DailyPlanner: Parsed allTasks', parsed);
      setAllTasks(parsed);
    }

    // Load Content Calendar data
    const savedScheduledContent = getString(StorageKeys.scheduledContent);
    if (savedScheduledContent) {
      try {
        const parsed = JSON.parse(savedScheduledContent);
        setContentCalendarData(parsed);
      } catch (error) {
        console.error('Failed to parse scheduledContent:', error);
      }
    }

  }, [setAllTasks, setContentCalendarData, setGlobalTasks, setPlannerData]);

  useEffect(() => {
    setJSON(StorageKeys.plannerData, plannerData);
  }, [plannerData]);

  useEffect(() => {
    setJSON(StorageKeys.allTasks, allTasks);
  }, [allTasks]);

  useEffect(() => {
    setJSON(StorageKeys.scheduledContent, contentCalendarData);
  }, [contentCalendarData]);

  // Save scroll positions to localStorage
  useEffect(() => {
    setString(StorageKeys.todayScrollPosition, todayScrollPosition.toString());
  }, [todayScrollPosition]);

  useEffect(() => {
    setString(StorageKeys.weeklyScrollPosition, weeklyScrollPosition.toString());
  }, [weeklyScrollPosition]);

  // Listen for changes to allTasks from other pages (e.g., HomePage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'allTasks' && e.newValue) {
        try {
          setAllTasks(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse allTasks:', error);
        }
      }
      if (e.key === 'scheduledContent' && e.newValue) {
        try {
          setContentCalendarData(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse scheduledContent:', error);
        }
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomUpdate = (e: CustomEvent) => {
      console.log(`DailyPlanner: Received ${EVENTS.allTasksUpdated} event`, e.detail);
      setAllTasks(e.detail);
    };

    const handleContentCalendarUpdate = (e: CustomEvent) => {
      console.log(`DailyPlanner: Received ${EVENTS.scheduledContentUpdated} event`, e.detail);
      setContentCalendarData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribeAllTasks = on(window, EVENTS.allTasksUpdated, handleCustomUpdate as EventListener);
    const unsubscribeScheduledContent = on(window, EVENTS.scheduledContentUpdated, handleContentCalendarUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeAllTasks();
      unsubscribeScheduledContent();
    };
  }, [setAllTasks, setContentCalendarData]);

  useEffect(() => {
    const globalData: GlobalPlannerData = { globalTasks };
    setJSON(StorageKeys.globalPlannerData, globalData);
  }, [globalTasks]);

  const savePlannerData = (data: PlannerDay[]) => {
    setJSON(StorageKeys.plannerData, data);
  };

  const saveAllTasks = (tasks: PlannerItem[]) => {
    setJSON(StorageKeys.allTasks, tasks);
  };

  const saveScheduledContent = (data: any[]) => {
    setJSON(StorageKeys.scheduledContent, data);
  };

  const saveTodayScrollPosition = (scrollPosition: number) => {
    setString(StorageKeys.todayScrollPosition, scrollPosition.toString());
  };

  const saveWeeklyScrollPosition = (scrollPosition: number) => {
    setString(StorageKeys.weeklyScrollPosition, scrollPosition.toString());
  };

  const saveSelectedTimezone = (timezone: string) => {
    setString(StorageKeys.selectedTimezone, timezone);
  };

  const saveTodayZoomLevel = (zoomLevel: number) => {
    setString(StorageKeys.todayZoomLevel, zoomLevel.toString());
  };

  return {
    savePlannerData,
    saveAllTasks,
    saveScheduledContent,
    saveTodayScrollPosition,
    saveWeeklyScrollPosition,
    saveSelectedTimezone,
    saveTodayZoomLevel,
  };
};
