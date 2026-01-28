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

  // Default to 7am (7 hours * 48px per hour for weekly view * zoom)
  const weeklyDefaultScroll = 7 * 48 * weeklyZoomLevel;

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

  useEffect(() => {
    const savedData = getString(StorageKeys.plannerData);
    if (savedData) {
      const parsed = JSON.parse(savedData);

      // Sanitize invalid times (fix hours > 23)
      let needsSave = false;
      parsed.forEach((day: PlannerDay) => {
        day.items.forEach((item: PlannerItem) => {
          let startChanged = false;
          let endChanged = false;

          if (item.startTime) {
            const [hour, minute] = item.startTime.split(':').map(Number);
            if (hour > 23) {
              // Cap at 23:59 instead of wrapping
              item.startTime = `23:59`;
              needsSave = true;
              startChanged = true;
              console.warn('Fixed invalid startTime for task:', item.text, 'was:', `${hour}:${minute}`);
            }
          }
          if (item.endTime) {
            const [hour, minute] = item.endTime.split(':').map(Number);
            if (hour > 23) {
              // Cap at 23:59 instead of wrapping
              item.endTime = `23:59`;
              needsSave = true;
              endChanged = true;
              console.warn('Fixed invalid endTime for task:', item.text, 'was:', `${hour}:${minute}`);
            }
          }

          // Check for negative duration after fix
          // Allow tasks to span midnight (e.g., 11 PM - 2 AM is valid)
          // Only fix if the duration would be impossibly short (< 5 minutes) within same day
          if (item.startTime && item.endTime) {
            const [startH, startM] = item.startTime.split(':').map(Number);
            const [endH, endM] = item.endTime.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;

            // Only fix if end time is within 5 minutes of start time (likely an error)
            // Allow tasks that span midnight (end < start is OK for overnight tasks)
            if (endMins > startMins && (endMins - startMins) < 5) {
              // Set end time to start time + 1 hour (or 23:59 if that exceeds day)
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

      setPlannerData(parsed);

      // Save sanitized data back to storage
      if (needsSave) {
        console.log('Saving sanitized planner data...');
        setJSON(StorageKeys.plannerData, parsed);
      }
    }

    const savedGlobalData = getString(StorageKeys.globalPlannerData);
    if (savedGlobalData) {
      const globalData: GlobalPlannerData = JSON.parse(savedGlobalData);
      setGlobalTasks(globalData.globalTasks || "");
    }

    // Load All Tasks
    const savedAllTasks = getString(StorageKeys.allTasks);
    if (savedAllTasks) {
      const parsed = JSON.parse(savedAllTasks);
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
