import { useEffect } from "react";
import { addDays, subDays } from "date-fns";

interface UsePlannerNavigationArgs {
  currentView: string;
  todayZoomLevel: number;
  weeklyZoomLevel: number;
  todayScrollPosition: number;
  weeklyScrollPosition: number;
  todayScrollRef: React.RefObject<HTMLDivElement>;
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedTimezone: React.Dispatch<React.SetStateAction<string>>;
  setTodayZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setTodayScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  saveSelectedTimezone: (timezone: string) => void;
  saveTodayScrollPosition: (scrollPosition: number) => void;
  saveWeeklyScrollPosition: (scrollPosition: number) => void;
  saveTodayZoomLevel: (zoomLevel: number) => void;
  saveWeeklyZoomLevel: (zoomLevel: number) => void;
}

export const usePlannerNavigation = ({
  currentView,
  todayZoomLevel,
  weeklyZoomLevel,
  todayScrollPosition,
  weeklyScrollPosition,
  todayScrollRef,
  weeklyScrollRef,
  setSelectedDate,
  setSelectedTimezone,
  setTodayZoomLevel,
  setWeeklyZoomLevel,
  setTodayScrollPosition,
  setWeeklyScrollPosition,
  saveSelectedTimezone,
  saveTodayScrollPosition,
  saveWeeklyScrollPosition,
  saveTodayZoomLevel,
  saveWeeklyZoomLevel,
}: UsePlannerNavigationArgs) => {

  // Handle pinch-to-zoom for Today and Weekly views - using refs and CSS variables for smooth performance
  useEffect(() => {
    // Use refs to track current zoom to avoid stale closures
    let currentTodayZoom = todayZoomLevel;
    let currentWeeklyZoom = weeklyZoomLevel;
    let saveTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      // Only handle zoom when ctrl key is pressed (pinch gesture)
      if (!e.ctrlKey) return;

      // Handle Today view zoom
      if (currentView === 'today') {
        e.preventDefault();

        const scrollArea = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        const timeColumn = todayScrollRef.current?.querySelector('[data-zoom-container="time"]') as HTMLElement;
        const contentColumn = todayScrollRef.current?.querySelector('[data-zoom-container="content"]') as HTMLElement;

        if (!scrollArea || !timeColumn || !contentColumn) return;

        const scrollRect = scrollArea.getBoundingClientRect();
        const cursorY = e.clientY - scrollRect.top;
        const currentScrollTop = scrollArea.scrollTop;
        const contentYUnderCursor = currentScrollTop + cursorY;

        const HOUR_HEIGHT = 90; // px per hour at 100% zoom
        const oldTotalHeight = 24 * HOUR_HEIGHT * currentTodayZoom;
        const timeRatio = contentYUnderCursor / oldTotalHeight;

        const zoomDelta = e.deltaY > 0 ? -0.025 : 0.025;
        const newZoom = Math.max(0.5, Math.min(1.5, currentTodayZoom + zoomDelta));

        if (Math.abs(newZoom - currentTodayZoom) > 0.001) {
          const newTotalHeight = 24 * HOUR_HEIGHT * newZoom;
          const newContentYUnderCursor = timeRatio * newTotalHeight;
          const newScrollTop = newContentYUnderCursor - cursorY;

          currentTodayZoom = newZoom;

          timeColumn.style.height = `${newTotalHeight}px`;
          contentColumn.style.height = `${newTotalHeight}px`;

          const hourRows = todayScrollRef.current?.querySelectorAll('[data-hour-row]');
          hourRows?.forEach((row, hour) => {
            const el = row as HTMLElement;
            el.style.top = `${hour * HOUR_HEIGHT * newZoom}px`;
            el.style.height = `${HOUR_HEIGHT * newZoom}px`;
          });

          const items = todayScrollRef.current?.querySelectorAll('[data-time-item]');
          items?.forEach((item) => {
            const el = item as HTMLElement;
            const startMinutes = parseFloat(el.dataset.startMinutes || '0');
            const durationMinutes = parseFloat(el.dataset.durationMinutes || '60');
            el.style.top = `${(startMinutes * 1.5 * newZoom) + 0.5}px`;
            el.style.height = `${Math.max(durationMinutes * 1.5 * newZoom, 28) - 1}px`;
          });

          scrollArea.scrollTop = Math.max(0, newScrollTop);

          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            setTodayZoomLevel(newZoom);
            saveTodayZoomLevel(newZoom);
          }, 150);
        }
      }

      // Handle Weekly view zoom
      if (currentView === 'week') {
        e.preventDefault();

        const scrollArea = weeklyScrollRef.current as HTMLElement;
        if (!scrollArea) return;

        const scrollRect = scrollArea.getBoundingClientRect();
        const cursorY = e.clientY - scrollRect.top;
        const currentScrollTop = scrollArea.scrollTop;
        const contentYUnderCursor = currentScrollTop + cursorY;

        const HOUR_HEIGHT = 48; // px per hour at 100% zoom for weekly view
        const oldTotalHeight = 24 * HOUR_HEIGHT * currentWeeklyZoom;
        const timeRatio = contentYUnderCursor / oldTotalHeight;

        const zoomDelta = e.deltaY > 0 ? -0.025 : 0.025;
        const newZoom = Math.max(0.5, Math.min(1.5, currentWeeklyZoom + zoomDelta));

        if (Math.abs(newZoom - currentWeeklyZoom) > 0.001) {
          const newTotalHeight = 24 * HOUR_HEIGHT * newZoom;
          const newContentYUnderCursor = timeRatio * newTotalHeight;
          const newScrollTop = newContentYUnderCursor - cursorY;

          currentWeeklyZoom = newZoom;

          // Update time column
          const timeColumn = weeklyScrollRef.current?.querySelector('[data-zoom-container="weekly-time"]') as HTMLElement;
          if (timeColumn) {
            timeColumn.style.height = `${newTotalHeight}px`;
          }

          // Update all timeline containers in each day column
          const timelines = weeklyScrollRef.current?.querySelectorAll('[data-timeline]');
          timelines?.forEach((timeline) => {
            (timeline as HTMLElement).style.height = `${newTotalHeight}px`;
          });

          // Update hour rows
          const hourRows = weeklyScrollRef.current?.querySelectorAll('[data-hour-row]');
          hourRows?.forEach((row) => {
            const el = row as HTMLElement;
            const hour = parseInt(el.dataset.hourRow || '0', 10);
            el.style.top = `${hour * HOUR_HEIGHT * newZoom}px`;
            el.style.height = `${HOUR_HEIGHT * newZoom}px`;
          });

          // Update grid lines
          const gridLines = weeklyScrollRef.current?.querySelectorAll('[data-grid-line]');
          gridLines?.forEach((line) => {
            const el = line as HTMLElement;
            const hour = parseInt(el.dataset.gridLine || '0', 10);
            el.style.top = `${hour * HOUR_HEIGHT * newZoom}px`;
          });

          // Update time slot containers
          const timeSlots = weeklyScrollRef.current?.querySelectorAll('[data-time-slot]');
          timeSlots?.forEach((slot) => {
            const el = slot as HTMLElement;
            const hour = parseInt(el.dataset.timeSlot || '0', 10);
            el.style.top = `${hour * HOUR_HEIGHT * newZoom}px`;
            el.style.height = `${HOUR_HEIGHT * newZoom}px`;
          });

          // Update task/content items
          const items = weeklyScrollRef.current?.querySelectorAll('[data-time-item]');
          items?.forEach((item) => {
            const el = item as HTMLElement;
            const startMinutes = parseFloat(el.dataset.startMinutes || '0');
            const durationMinutes = parseFloat(el.dataset.durationMinutes || '60');
            el.style.top = `${(startMinutes / 60) * HOUR_HEIGHT * newZoom}px`;
            el.style.height = `${Math.max((durationMinutes / 60) * HOUR_HEIGHT * newZoom, 20)}px`;
          });

          scrollArea.scrollTop = Math.max(0, newScrollTop);

          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            setWeeklyZoomLevel(newZoom);
            saveWeeklyZoomLevel(newZoom);
          }, 150);
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [currentView, todayZoomLevel, weeklyZoomLevel]);

  // Restore scroll position when switching to Today view
  useEffect(() => {
    if (currentView === 'today' && todayScrollRef.current) {
      // Use requestAnimationFrame to set scroll position before next paint
      requestAnimationFrame(() => {
        const viewport = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');

        if (viewport) {
          // Restore scroll position immediately
          viewport.scrollTop = todayScrollPosition;

          // Add scroll listener to save position
          const handleScroll = () => {
            setTodayScrollPosition(viewport.scrollTop);
          };

          viewport.addEventListener('scroll', handleScroll);
        }
      });

      return () => {
        const viewport = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.removeEventListener('scroll', () => {});
        }
      };
    }
  }, [currentView]);

  // Restore scroll position when switching to Weekly view
  useEffect(() => {
    if (currentView === 'week' && weeklyScrollRef.current) {
      // Use requestAnimationFrame to set scroll position before next paint
      requestAnimationFrame(() => {
        const viewport = weeklyScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');

        if (viewport) {
          // Restore scroll position immediately
          viewport.scrollTop = weeklyScrollPosition;

          // Add scroll listener to save position
          const handleScroll = () => {
            setWeeklyScrollPosition(viewport.scrollTop);
          };

          viewport.addEventListener('scroll', handleScroll);
        }
      });

      return () => {
        const viewport = weeklyScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.removeEventListener('scroll', () => {});
        }
      };
    }
  }, [currentView]);

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    saveSelectedTimezone(timezone);
  };

  const handleMoveToToday = () => {
    setSelectedDate(new Date());
  };

  const handleTodayScrollToCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Each hour is 90px, each minute is 1.5px
    const scrollPosition = (currentHour * 90 + currentMinute * 1.5) * todayZoomLevel;
    const scrollArea = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollPosition;
      setTodayScrollPosition(scrollPosition);
      saveTodayScrollPosition(scrollPosition);
    }
  };

  const handleWeeklyScrollToCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Each hour is 48px, each minute is 0.8px
    const scrollPosition = currentHour * 48 + currentMinute * 0.8;
    const scrollArea = weeklyScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollPosition;
      setWeeklyScrollPosition(scrollPosition);
      saveWeeklyScrollPosition(scrollPosition);
    }
  };

  return {
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    handleTimezoneChange,
    handleMoveToToday,
    handleTodayScrollToCurrentTime,
    handleWeeklyScrollToCurrentTime,
  };
};
