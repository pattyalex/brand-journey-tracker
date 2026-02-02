import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { EVENTS, on, emit } from "@/lib/events";
import { StorageKeys, getString, setJSON, setString } from "@/lib/storage";
import { GlobalPlannerData, PlannerDay, PlannerItem } from "@/types/planner";

export const getPlannerInitialSettings = () => {
  const selectedTimezone = getString(StorageKeys.selectedTimezone) || 'auto';
  const savedTodayZoom = getString(StorageKeys.todayZoomLevel);
  const todayZoomLevel = savedTodayZoom ? parseFloat(savedTodayZoom) : 1;

  const savedWeeklyZoom = getString(StorageKeys.weeklyZoomLevel);
  const weeklyZoomLevel = savedWeeklyZoom ? parseFloat(savedWeeklyZoom) : 1;

  // Default to 7am (7 hours * 90px per hour * zoom = 630px at 100% zoom)
  const defaultScroll = 7 * 90 * todayZoomLevel;
  // Minimum scroll threshold (5am) - below this, use default 7am
  const minScrollThreshold = 5 * 90 * todayZoomLevel;

  const savedDate = getString(StorageKeys.plannerLastAccessDate);
  const today = format(new Date(), 'yyyy-MM-dd');

  let todayScrollPosition = defaultScroll;
  // If it's a new day, reset to 7am
  if (savedDate !== today) {
    setString(StorageKeys.plannerLastAccessDate, today);
    todayScrollPosition = defaultScroll;
  } else {
    // Otherwise, try to restore saved position (but only if it's past 5am)
    const savedPosition = getString(StorageKeys.todayScrollPosition);
    const parsedPosition = savedPosition ? parseInt(savedPosition, 10) : defaultScroll;
    // If saved position shows times before 5am, use default 7am instead
    todayScrollPosition = parsedPosition >= minScrollThreshold ? parsedPosition : defaultScroll;
  }

  // Default to 7am (7 hours * 48px per hour for weekly view * zoom)
  const weeklyDefaultScroll = 7 * 48 * weeklyZoomLevel;
  // Minimum scroll threshold (5am) for weekly view
  const weeklyMinScrollThreshold = 5 * 48 * weeklyZoomLevel;

  const weeklySavedDate = getString(StorageKeys.plannerLastAccessDate);
  let weeklyScrollPosition = weeklyDefaultScroll;

  // If it's a new day, reset to 7am
  if (weeklySavedDate !== today) {
    weeklyScrollPosition = weeklyDefaultScroll;
  } else {
    // Otherwise, try to restore saved position (but only if it's past 5am)
    const savedPosition = getString(StorageKeys.weeklyScrollPosition);
    const parsedPosition = savedPosition ? parseInt(savedPosition, 10) : weeklyDefaultScroll;
    // If saved position shows times before 5am, use default 7am instead
    weeklyScrollPosition = parsedPosition >= weeklyMinScrollThreshold ? parsedPosition : weeklyDefaultScroll;
  }

  return {
    selectedTimezone,
    todayZoomLevel,
    weeklyZoomLevel,
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
  // Track if this is initial mount to prevent saving empty initial state
  const isInitialMount = useRef(true);

  // Note: plannerData, allTasks, and contentCalendarData are now initialized
  // directly from localStorage in usePlannerState.ts to prevent re-render flash.
  // This useEffect only handles:
  // 1. Loading globalTasks (not initialized elsewhere)
  // 2. Running sanitization on plannerData if needed

  useEffect(() => {
    // Load globalTasks (this is the only data not initialized in usePlannerState)
    const savedGlobalData = getString(StorageKeys.globalPlannerData);
    if (savedGlobalData) {
      const globalData: GlobalPlannerData = JSON.parse(savedGlobalData);
      setGlobalTasks(globalData.globalTasks || "");
    }

    // Run sanitization on plannerData (fix invalid times)
    // We only update state if sanitization was actually needed
    const savedData = getString(StorageKeys.plannerData);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        let needsSave = false;

        parsed.forEach((day: PlannerDay) => {
          day.items.forEach((item: PlannerItem) => {
            if (item.startTime) {
              const [hour, minute] = item.startTime.split(':').map(Number);
              if (hour > 23) {
                item.startTime = `23:59`;
                needsSave = true;
                console.warn('Fixed invalid startTime for task:', item.text, 'was:', `${hour}:${minute}`);
              }
            }
            if (item.endTime) {
              const [hour, minute] = item.endTime.split(':').map(Number);
              if (hour > 23) {
                item.endTime = `23:59`;
                needsSave = true;
                console.warn('Fixed invalid endTime for task:', item.text, 'was:', `${hour}:${minute}`);
              }
            }

            // Fix too-short durations
            if (item.startTime && item.endTime) {
              const [startH, startM] = item.startTime.split(':').map(Number);
              const [endH, endM] = item.endTime.split(':').map(Number);
              const startMins = startH * 60 + startM;
              const endMins = endH * 60 + endM;

              if (endMins > startMins && (endMins - startMins) < 5) {
                const newEndMins = Math.min(startMins + 60, 1439);
                const newEndH = Math.floor(newEndMins / 60);
                const newEndM = newEndMins % 60;
                item.endTime = `${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`;
                needsSave = true;
                console.warn('Fixed too-short duration for task:', item.text, 'was:', `${endH}:${endM}`);
              }
            }
          });
        });

        // Only update state if sanitization changed something
        if (needsSave) {
          console.log('Saving sanitized planner data...');
          setJSON(StorageKeys.plannerData, parsed);
          setPlannerData(parsed);
        }
      } catch (error) {
        console.error('Failed to parse planner data for sanitization:', error);
      }
    }
  }, [setGlobalTasks, setPlannerData]);

  // DO NOT auto-save plannerData here - it causes race conditions!
  // All saves must go through the explicit save functions below

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
      if (e.key === 'plannerData' && e.newValue) {
        try {
          setPlannerData(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse plannerData:', error);
        }
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomUpdate = (e: CustomEvent) => {
      setAllTasks(e.detail);
    };

    const handleContentCalendarUpdate = (e: CustomEvent) => {
      setContentCalendarData(e.detail);
    };

    const handlePlannerDataUpdate = (e: CustomEvent) => {
      setPlannerData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribeAllTasks = on(window, EVENTS.allTasksUpdated, handleCustomUpdate);
    const unsubscribeScheduledContent = on(window, EVENTS.scheduledContentUpdated, handleContentCalendarUpdate);
    const unsubscribePlannerData = on(window, EVENTS.plannerDataUpdated, handlePlannerDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeAllTasks();
      unsubscribeScheduledContent();
      unsubscribePlannerData();
    };
  }, []); // Empty deps - setState functions are stable

  useEffect(() => {
    const globalData: GlobalPlannerData = { globalTasks };
    setJSON(StorageKeys.globalPlannerData, globalData);
  }, [globalTasks]);

  const savePlannerData = (data: PlannerDay[]) => {
    setJSON(StorageKeys.plannerData, data);
    // Emit event for same-tab sync (e.g., Dashboard)
    emit(window, EVENTS.plannerDataUpdated, data);
  };

  const saveAllTasks = (tasks: PlannerItem[]) => {
    setJSON(StorageKeys.allTasks, tasks);
    emit(window, EVENTS.allTasksUpdated, tasks);
  };

  const saveScheduledContent = (data: any[]) => {
    setJSON(StorageKeys.scheduledContent, data);
    emit(window, EVENTS.scheduledContentUpdated, data);
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

  const saveWeeklyZoomLevel = (zoomLevel: number) => {
    setString(StorageKeys.weeklyZoomLevel, zoomLevel.toString());
  };

  // Force refresh plannerData from localStorage
  const refreshPlannerData = () => {
    const savedData = getString(StorageKeys.plannerData);
    if (savedData) {
      try {
        const data: PlannerDay[] = JSON.parse(savedData);
        setPlannerData(data);
      } catch (error) {
        console.error('Failed to parse plannerData:', error);
      }
    }
  };

  return {
    savePlannerData,
    saveAllTasks,
    saveScheduledContent,
    saveTodayScrollPosition,
    saveWeeklyScrollPosition,
    saveSelectedTimezone,
    saveTodayZoomLevel,
    saveWeeklyZoomLevel,
    refreshPlannerData,
  };
};
