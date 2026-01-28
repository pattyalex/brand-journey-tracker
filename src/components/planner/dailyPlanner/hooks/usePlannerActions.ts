import { useEffect } from "react";
import { addDays, format, subDays } from "date-fns";
import { EVENTS, emit } from "@/lib/events";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { updateItemOrders } from "../utils/plannerUtils";
import { useTaskDialogInputs } from "./useTaskDialogInputs";
import { useCopyDialogActions } from "./useCopyDialogActions";

interface UsePlannerActionsArgs {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  contentCalendarData: any[];
  currentDay: PlannerDay;
  dateString: string;
  tasks: string;
  greatDay: string;
  grateful: string;
  currentView: string;
  contentDisplayMode?: 'tasks' | 'content' | 'both';
  todayZoomLevel: number;
  weeklyZoomLevel: number;
  todayScrollPosition: number;
  weeklyScrollPosition: number;
  isDraggingCreate: boolean;
  dragCreateStart: { hour: number; minute: number } | null;
  dragCreateEnd: { hour: number; minute: number } | null;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  weeklyNewTaskInputs: Record<string, string>;
  weeklyEditTitle: string;
  weeklyEditColor: string;
  weeklyEditDescription: string;
  dialogTaskTitle: string;
  dialogTaskDescription: string;
  dialogStartTime: string;
  dialogEndTime: string;
  dialogTaskColor: string;
  dialogAddToContentCalendar: boolean;
  editingTask: PlannerItem | null;
  copyToDate: Date | undefined;
  deleteAfterCopy: boolean;
  pendingTaskFromAllTasks: PlannerItem | null;
  isTaskDialogOpen: boolean;
  todayScrollRef: React.RefObject<HTMLDivElement>;
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  titleInputRef: React.RefObject<HTMLInputElement>;
  startTimeInputRef: React.RefObject<HTMLInputElement>;
  endTimeInputRef: React.RefObject<HTMLInputElement>;
  descriptionInputRef: React.RefObject<HTMLTextAreaElement>;
  isResizingRef: React.MutableRefObject<boolean>;
  convert24To12Hour: (time: string) => string;
  convert12To24Hour: (time: string) => string;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setCopyToDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setIsCopyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteAfterCopy: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: React.Dispatch<React.SetStateAction<any>>;
  setSelectedTimezone: React.Dispatch<React.SetStateAction<string>>;
  setTodayZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setTodayScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setIsDraggingCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setDragCreateStart: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setDragCreateEnd: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setGlobalTasks: React.Dispatch<React.SetStateAction<string>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setContentCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskDialogPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingTaskFromAllTasks: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setTasks: React.Dispatch<React.SetStateAction<string>>;
  setGreatDay: React.Dispatch<React.SetStateAction<string>>;
  setGrateful: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyNewTaskInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setWeeklyAddingTask: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyEditingTask: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditText: React.Dispatch<React.SetStateAction<string>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragOverWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyDropIndicatorPosition: React.Dispatch<React.SetStateAction<'before' | 'after' | null>>;
  setWeeklyEditDialogOpen: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditDescription: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditColor: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditTitle: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditingTitle: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDraggingOverAllTasks: React.Dispatch<React.SetStateAction<boolean>>;
  setDraggingTaskText: React.Dispatch<React.SetStateAction<string>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  saveScheduledContent: (data: any[]) => void;
  saveTodayScrollPosition: (scrollPosition: number) => void;
  saveWeeklyScrollPosition: (scrollPosition: number) => void;
  saveSelectedTimezone: (timezone: string) => void;
  saveTodayZoomLevel: (zoomLevel: number) => void;
  saveWeeklyZoomLevel: (zoomLevel: number) => void;
  onWeeklyAddDialogOpen?: (dayString: string, startTime: string, endTime: string) => void;
  onTodayAddDialogOpen?: (startTime: string, endTime: string) => void;
}

export const usePlannerActions = ({
  selectedDate,
  plannerData,
  allTasks,
  contentCalendarData,
  currentDay,
  dateString,
  tasks,
  greatDay,
  grateful,
  currentView,
  todayZoomLevel,
  weeklyZoomLevel,
  todayScrollPosition,
  weeklyScrollPosition,
  isDraggingCreate,
  dragCreateStart,
  dragCreateEnd,
  weeklyDraggingCreate,
  weeklyDragCreateStart,
  weeklyDragCreateEnd,
  weeklyNewTaskInputs,
  weeklyEditTitle,
  weeklyEditColor,
  weeklyEditDescription,
  dialogTaskTitle,
  dialogTaskDescription,
  dialogStartTime,
  dialogEndTime,
  dialogTaskColor,
  dialogAddToContentCalendar,
  editingTask,
  copyToDate,
  deleteAfterCopy,
  pendingTaskFromAllTasks,
  isTaskDialogOpen,
  todayScrollRef,
  weeklyScrollRef,
  titleInputRef,
  startTimeInputRef,
  endTimeInputRef,
  descriptionInputRef,
  isResizingRef,
  convert24To12Hour,
  convert12To24Hour,
  setSelectedDate,
  setPlannerData,
  setCopyToDate,
  setIsCopyDialogOpen,
  setDeleteAfterCopy,
  setCurrentView,
  setSelectedTimezone,
  setTodayZoomLevel,
  setWeeklyZoomLevel,
  setTodayScrollPosition,
  setWeeklyScrollPosition,
  setIsDraggingCreate,
  setDragCreateStart,
  setDragCreateEnd,
  setWeeklyDraggingCreate,
  setWeeklyDragCreateStart,
  setWeeklyDragCreateEnd,
  setGlobalTasks,
  setAllTasks,
  setContentCalendarData,
  setIsTaskDialogOpen,
  setTaskDialogPosition,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setPendingTaskFromAllTasks,
  setTasks,
  setGreatDay,
  setGrateful,
  setWeeklyNewTaskInputs,
  setWeeklyAddingTask,
  setWeeklyEditingTask,
  setWeeklyEditText,
  setDraggedWeeklyTaskId,
  setDragOverWeeklyTaskId,
  setWeeklyDropIndicatorPosition,
  setWeeklyEditDialogOpen,
  setWeeklyEditDescription,
  setWeeklyEditColor,
  setWeeklyEditTitle,
  setWeeklyEditingTitle,
  setIsDraggingOverAllTasks,
  setDraggingTaskText,
  savePlannerData,
  saveAllTasks,
  saveScheduledContent,
  saveTodayScrollPosition,
  saveWeeklyScrollPosition,
  saveSelectedTimezone,
  saveTodayZoomLevel,
  saveWeeklyZoomLevel,
  contentDisplayMode = 'tasks',
  onWeeklyAddDialogOpen,
  onTodayAddDialogOpen,
}: UsePlannerActionsArgs) => {
  // Use composed hooks for smaller, focused functionality
  const taskDialogInputs = useTaskDialogInputs({
    dialogStartTime,
    dialogEndTime,
    setDialogTaskColor,
    setDialogStartTime,
    setDialogEndTime,
    startTimeInputRef,
    endTimeInputRef,
    descriptionInputRef,
  });

  const copyDialogActions = useCopyDialogActions({
    setIsCopyDialogOpen,
    setCopyToDate,
    setDeleteAfterCopy,
  });

  const handleOpenTaskDialog = (hour: number, itemToEdit?: PlannerItem, startTime?: string, endTime?: string) => {
    if (itemToEdit) {
      setEditingTask(itemToEdit);
      setDialogTaskTitle(itemToEdit.text);
      setDialogTaskDescription(itemToEdit.description || "");
      setDialogStartTime(itemToEdit.startTime ? convert24To12Hour(itemToEdit.startTime) : "");
      setDialogEndTime(itemToEdit.endTime ? convert24To12Hour(itemToEdit.endTime) : "");
      setDialogTaskColor(itemToEdit.color || "");
      setDialogAddToContentCalendar(itemToEdit.isContentCalendar || false);
    } else {
      setEditingTask(null);
      setDialogTaskTitle("");
      setDialogTaskDescription("");

      // If start/end time provided, use those (e.g. from drag)
      if (startTime && endTime) {
        setDialogStartTime(convert24To12Hour(startTime));
        setDialogEndTime(convert24To12Hour(endTime));
      } else {
        // Default behavior: 1 hour duration starting at clicked hour
        const startTimeDefault = `${hour.toString().padStart(2, '0')}:00`;
        const endTimeDefault = `${(hour + 1).toString().padStart(2, '0')}:00`;
        setDialogStartTime(convert24To12Hour(startTimeDefault));
        setDialogEndTime(convert24To12Hour(endTimeDefault));
      }

      setDialogTaskColor("");
      setDialogAddToContentCalendar(false);
    }

    setIsTaskDialogOpen(true);

    // Focus title input after dialog opens
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  // Handle global mouse events for drag-to-create
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingCreate && dragCreateStart) {
        // Calculate which time slot we're over based on mouse position
        const scrollArea = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const calendarElement = todayScrollRef.current?.querySelector('.relative');
        if (calendarElement && scrollArea) {
          const rect = calendarElement.getBoundingClientRect();
          const scrollTop = scrollArea.scrollTop || 0;
          const relativeY = e.clientY - rect.top + scrollTop;

          // Each hour is 90px * zoom, each 10-minute slot is 15px * zoom
          const totalMinutes = Math.floor((relativeY / (90 * todayZoomLevel)) * 60);
          const hour = Math.floor(totalMinutes / 60);
          const minute = Math.floor((totalMinutes % 60) / 10) * 10; // Round to nearest 10-min slot

          if (hour >= 0 && hour < 24) {
            setDragCreateEnd({ hour, minute });
          }
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDraggingCreate) {
        // User released mouse - finalize the drag or cancel
        if (dragCreateStart && dragCreateEnd) {
          // Calculate times and open dialog
          const startMinutes = dragCreateStart.hour * 60 + dragCreateStart.minute;
          const endMinutes = dragCreateEnd.hour * 60 + dragCreateEnd.minute;

          const actualStart = Math.min(startMinutes, endMinutes);
          const actualEnd = Math.max(startMinutes, endMinutes + 10);

          const startHour = Math.floor(actualStart / 60);
          const startMin = actualStart % 60;
          const endHour = Math.floor(actualEnd / 60);
          const endMin = actualEnd % 60;

          const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

          // Reset drag state first
          setIsDraggingCreate(false);
          setDragCreateStart(null);
          setDragCreateEnd(null);

          // Convert to 12-hour format for dialog display
          const startTime12 = convert24To12Hour(startTimeStr);
          const endTime12 = convert24To12Hour(endTimeStr);

          // Check if we should open the add choice dialog (for 'both' or 'content' mode)
          if ((contentDisplayMode === 'both' || contentDisplayMode === 'content') && onTodayAddDialogOpen) {
            onTodayAddDialogOpen(startTime12, endTime12);
          } else {
            // Set popover position based on mouse coordinates
            setTaskDialogPosition({ x: e.clientX, y: e.clientY });
            // Open task dialog (default 'tasks' mode)
            handleOpenTaskDialog(startHour, undefined, startTimeStr, endTimeStr);
          }
        } else {
          // Cancel the drag
          setIsDraggingCreate(false);
          setDragCreateStart(null);
          setDragCreateEnd(null);
        }
      }
    };

    if (isDraggingCreate) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingCreate, dragCreateStart, dragCreateEnd, todayZoomLevel]);

  // Handle global mouse events for weekly drag-to-create
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Don't handle mouse move if dialog is open
      if (isTaskDialogOpen) return;

      // Find which day column is being dragged in
      const dayColumns = document.querySelectorAll('[data-day-column]');
      let targetDay: string | null = null;
      let targetColumn: Element | null = null;

      dayColumns.forEach(col => {
        const rect = col.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          targetDay = col.getAttribute('data-day-column');
          targetColumn = col;
        }
      });

      if (targetDay && targetColumn && weeklyDraggingCreate[targetDay]) {
        const timelineElement = targetColumn.querySelector('[data-timeline]');
        if (timelineElement) {
          const rect = timelineElement.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const totalMinutes = Math.floor(relativeY / 0.8);
          const hour = Math.floor(totalMinutes / 60);
          const minute = totalMinutes % 60;

          if (hour >= 0 && hour < 24) {
            setWeeklyDragCreateEnd(prev => ({
              ...prev,
              [targetDay!]: { hour, minute }
            }));
          }
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Check if any day is being dragged
      Object.keys(weeklyDraggingCreate).forEach(dayString => {
        if (weeklyDraggingCreate[dayString]) {
          const start = weeklyDragCreateStart[dayString];
          const end = weeklyDragCreateEnd[dayString];

          if (start && end) {
            // Calculate times
            const startMinutes = start.hour * 60 + start.minute;
            const endMinutes = end.hour * 60 + end.minute;
            const actualStart = Math.min(startMinutes, endMinutes);
            const actualEnd = Math.max(startMinutes, endMinutes);

            // Ensure minimum duration of 30 minutes
            const duration = actualEnd - actualStart;
            const finalEnd = duration < 30 ? actualStart + 30 : actualEnd;

            const startHour = Math.floor(actualStart / 60);
            const startMin = actualStart % 60;
            const endHour = Math.floor(finalEnd / 60);
            const endMin = finalEnd % 60;

            const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
            const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

            // Convert to 12-hour format for dialog display
            const startTime12 = convert24To12Hour(startTimeStr);
            const endTime12 = convert24To12Hour(endTimeStr);

            // Reset drag state
            setWeeklyDraggingCreate(prev => ({ ...prev, [dayString]: false }));
            setWeeklyDragCreateStart(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
            setWeeklyDragCreateEnd(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });

            // Check if we should open the add choice dialog (for 'both' or 'content' mode)
            if ((contentDisplayMode === 'both' || contentDisplayMode === 'content') && onWeeklyAddDialogOpen) {
              onWeeklyAddDialogOpen(dayString, startTime12, endTime12);
            } else {
              // Open task dialog with pre-filled times (default 'tasks' mode)
              setEditingTask({
                id: '',
                date: dayString,
                text: '',
                section: 'morning',
                isCompleted: false,
                order: 0
              } as PlannerItem);
              setDialogTaskTitle('');
              setDialogTaskDescription('');
              setDialogStartTime(startTime12);
              setDialogEndTime(endTime12);
              setDialogTaskColor('');
              setDialogAddToContentCalendar(false);
              // Set popover position based on mouse coordinates
              setTaskDialogPosition({ x: e.clientX, y: e.clientY });
              setIsTaskDialogOpen(true);
            }
          } else {
            // Cancel the drag
            setWeeklyDraggingCreate(prev => ({ ...prev, [dayString]: false }));
            setWeeklyDragCreateStart(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
            setWeeklyDragCreateEnd(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
          }
        }
      });
    };

    const isDragging = Object.values(weeklyDraggingCreate).some(val => val);
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [weeklyDraggingCreate, weeklyDragCreateStart, weeklyDragCreateEnd, isTaskDialogOpen]);

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

  const getTasksWithTimes = (dayString: string) => {
    return (plannerData.find(d => d.date === dayString)?.items || [])
      .filter(item => item.startTime && item.endTime);
  };

  const handleAddItem = (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text,
      section,
      isCompleted: false,
      date: dateString,
      startTime,
      endTime
    };

    const dayIndex = plannerData.findIndex(day => day.date === dateString);

    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newItem]
      };
      setPlannerData(updatedPlannerData);
    } else {
      setPlannerData([...plannerData, {
        date: dateString,
        items: [newItem],
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      }]);
    }
  };

  const handleAddWeeklyTask = (dayString: string, text: string) => {
    if (!text.trim()) return;

    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text: text.trim(),
      section: "morning",
      isCompleted: false,
      date: dayString,
    };

    const dayIndex = plannerData.findIndex(day => day.date === dayString);

    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newItem]
      };
      setPlannerData(updatedPlannerData);
    } else {
      setPlannerData([...plannerData, {
        date: dayString,
        items: [newItem],
        tasks: "",
        greatDay: "",
        grateful: ""
      }]);
    }

    // Clear input
    setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: "" }));
    setWeeklyAddingTask(prev => ({ ...prev, [dayString]: false }));
  };

  const handleEditWeeklyTask = (taskId: string, dayString: string, newText: string) => {
    if (!newText.trim()) return;

    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText.trim(),
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditingTask(null);
    setWeeklyEditText("");
  };

  const handleDeleteWeeklyTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleSaveWeeklyTaskDetails = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: weeklyEditTitle,
        color: weeklyEditColor,
        description: weeklyEditDescription
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleToggleWeeklyTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        isCompleted: !updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleReorderWeeklyTasks = (dayString: string, draggedTaskId: string, targetTaskId: string, position: 'before' | 'after') => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const items = [...updatedPlannerData[dayIndex].items];

    const draggedIndex = items.findIndex(item => item.id === draggedTaskId);
    const targetIndex = items.findIndex(item => item.id === targetTaskId);

    if (draggedIndex < 0 || targetIndex < 0) return;

    // Remove the dragged item
    const [draggedItem] = items.splice(draggedIndex, 1);

    // Calculate new position based on whether we're dropping before or after
    let newIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      // If dragging down, adjust for the removed item
      newIndex = position === 'before' ? targetIndex - 1 : targetIndex;
    } else {
      // If dragging up
      newIndex = position === 'before' ? targetIndex : targetIndex + 1;
    }

    // Insert at new position
    items.splice(newIndex, 0, draggedItem);

    // Update orders
    const itemsWithOrder = updateItemOrders(items);

    updatedPlannerData[dayIndex].items = itemsWithOrder;
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleToggleItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        isCompleted: !updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleDeleteItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== id)
    };
    setPlannerData(updatedPlannerData);
  };

  const handleEditItem = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string, isCompleted?: boolean, taskDate?: string, isContentCalendar?: boolean) => {
    // Use provided taskDate or fall back to current dateString
    const searchDate = taskDate || dateString;
    const dayIndex = plannerData.findIndex(day => day.date === searchDate);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText,
        startTime,
        endTime,
        color: color !== undefined ? color : updatedPlannerData[dayIndex].items[itemIndex].color,
        description: description !== undefined ? description : updatedPlannerData[dayIndex].items[itemIndex].description,
        isCompleted: isCompleted !== undefined ? isCompleted : updatedPlannerData[dayIndex].items[itemIndex].isCompleted,
        isContentCalendar: isContentCalendar !== undefined ? isContentCalendar : updatedPlannerData[dayIndex].items[itemIndex].isContentCalendar
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

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

  const handleAddTask = (section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const text = section === 'morning' ? tasks : section === 'midday' ? greatDay : grateful;
    handleAddItem(text, section, startTime, endTime);

    if (section === 'morning') {
      setTasks('');
    } else if (section === 'midday') {
      setGreatDay('');
    } else if (section === 'afternoon') {
      setGrateful('');
    }
  };

  const handleUpdateSectionText = (section: PlannerItem["section"], text: string) => {
    if (section === 'morning') {
      setTasks(text);
    } else if (section === 'midday') {
      setGreatDay(text);
    } else if (section === 'afternoon') {
      setGrateful(text);
    }
  };

  const handleSaveSectionText = (section: PlannerItem["section"], text: string) => {
    // Update current day data with new text for the section
    const updatedPlannerData = [...plannerData];
    const dayIndex = updatedPlannerData.findIndex(day => day.date === dateString);

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        tasks: section === 'morning' ? text : updatedPlannerData[dayIndex].tasks,
        greatDay: section === 'midday' ? text : updatedPlannerData[dayIndex].greatDay,
        grateful: section === 'afternoon' ? text : updatedPlannerData[dayIndex].grateful
      };
      setPlannerData(updatedPlannerData);
    } else {
      const newDay: PlannerDay = {
        date: dateString,
        items: [],
        tasks: section === 'morning' ? text : "",
        greatDay: section === 'midday' ? text : "",
        grateful: section === 'afternoon' ? text : ""
      };
      setPlannerData([...plannerData, newDay]);
    }
  };

  const handleAddTaskAtTime = (hour: number) => {
    handleOpenTaskDialog(hour);
  };

  const handleSaveTaskDialog = () => {
    // Convert dialog times from 12-hour to 24-hour format
    const startTime24 = dialogStartTime ? convert12To24Hour(dialogStartTime) : undefined;
    const endTime24 = dialogEndTime ? convert12To24Hour(dialogEndTime) : undefined;

    // Check if this is a task being added from AllTasks sidebar
    const isFromAllTasks = pendingTaskFromAllTasks !== null;

    if (editingTask && editingTask.id && !isFromAllTasks) {
      // Editing existing task (only when NOT from AllTasks)
      handleEditItem(
        editingTask.id,
        dialogTaskTitle,
        startTime24,
        endTime24,
        dialogTaskColor,
        dialogTaskDescription,
        editingTask.isCompleted,
        editingTask.date,
        dialogAddToContentCalendar
      );
    } else {
      // Adding new task (or adding task from AllTasks)
      const newItem: PlannerItem = {
        id: isFromAllTasks ? editingTask?.id || Date.now().toString() : Date.now().toString(),
        text: dialogTaskTitle,
        section: "morning",
        isCompleted: false,
        date: editingTask?.date || dateString,
        startTime: startTime24,
        endTime: endTime24,
        color: dialogTaskColor,
        description: dialogTaskDescription,
        isContentCalendar: dialogAddToContentCalendar
      };

      const dayIndex = plannerData.findIndex(day => day.date === newItem.date);

      if (dayIndex >= 0) {
        const updatedPlannerData = [...plannerData];
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newItem]
        };
        setPlannerData(updatedPlannerData);
        savePlannerData(updatedPlannerData);
      } else {
        const updatedPlannerData = [...plannerData, {
          date: newItem.date,
          items: [newItem],
          tasks: "",
          greatDay: "",
          grateful: ""
        }];
        setPlannerData(updatedPlannerData);
        savePlannerData(updatedPlannerData);
      }

      // Clear the pending task from AllTasks since it's now added
      if (isFromAllTasks) {
        setPendingTaskFromAllTasks(null);
      }
    }

    // Close dialog
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setDialogTaskTitle("");
    setDialogTaskDescription("");
    setDialogStartTime("");
    setDialogEndTime("");
    setDialogTaskColor("");
    setDialogAddToContentCalendar(false);
  };

  const handleCancelTaskDialog = () => {
    setIsTaskDialogOpen(false);

    // If there was a pending task from All Tasks, restore it
    if (pendingTaskFromAllTasks) {
      setAllTasks(prev => [...prev, pendingTaskFromAllTasks]);
      saveAllTasks([...allTasks, pendingTaskFromAllTasks]);
      setPendingTaskFromAllTasks(null);
    }

    // Clear dialog states
    setEditingTask(null);
    setDialogTaskTitle("");
    setDialogTaskDescription("");
    setDialogStartTime("");
    setDialogEndTime("");
    setDialogTaskColor("");
    setDialogAddToContentCalendar(false);
  };

  const handleCopyTasks = () => {
    if (!copyToDate) return;

    const sourceDayIndex = plannerData.findIndex(day => day.date === dateString);
    if (sourceDayIndex < 0) return;

    const copyToDateString = format(copyToDate, 'yyyy-MM-dd');
    const targetDayIndex = plannerData.findIndex(day => day.date === copyToDateString);

    const updatedPlannerData = [...plannerData];
    const sourceDay = plannerData[sourceDayIndex];

    if (targetDayIndex >= 0) {
      // Update existing day
      updatedPlannerData[targetDayIndex] = {
        ...updatedPlannerData[targetDayIndex],
        items: [...sourceDay.items],
        tasks: sourceDay.tasks || "",
        greatDay: sourceDay.greatDay || "",
        grateful: sourceDay.grateful || "",
      };
    } else {
      // Create new day
      updatedPlannerData.push({
        date: copyToDateString,
        items: [...sourceDay.items],
        tasks: sourceDay.tasks || "",
        greatDay: sourceDay.greatDay || "",
        grateful: sourceDay.grateful || "",
      });
    }

    if (deleteAfterCopy) {
      // Remove tasks from original day
      const currentDayIndex = updatedPlannerData.findIndex(day => day.date === dateString);
      if (currentDayIndex >= 0) {
        updatedPlannerData.splice(currentDayIndex, 1);
      }
    }

    setPlannerData(updatedPlannerData);
    setIsCopyDialogOpen(false);
    setCopyToDate(undefined);
    setDeleteAfterCopy(false);

    savePlannerData(updatedPlannerData);
  };

  const handleToggleAllTask = (id: string) => {
    setAllTasks(allTasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const handleDeleteAllTask = (id: string) => {
    setAllTasks(allTasks.filter(task => task.id !== id));
  };

  const handleEditAllTask = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string) => {
    setAllTasks(allTasks.map(task =>
      task.id === id ? {
        ...task,
        text: newText,
        startTime,
        endTime,
        color: color !== undefined ? color : task.color,
        description: description !== undefined ? description : task.description
      } : task
    ));
  };

  const handleReorderAllTasks = (reorderedTasks: PlannerItem[]) => {
    // Update order fields to persist the new order
    const tasksWithOrder = updateItemOrders(reorderedTasks);
    setAllTasks(tasksWithOrder);
    saveAllTasks(tasksWithOrder);
  };

  const handleAddAllTask = (text: string, section: PlannerItem["section"]) => {
    const newTask: PlannerItem = {
      id: Date.now().toString(),
      text,
      section: "morning",
      isCompleted: false,
      // No date field for All Tasks items
    };
    setAllTasks([...allTasks, newTask]);
  };

  // Weekly Objectives handlers

  const handleDropTaskFromWeeklyToAllTasks = (draggedTaskId: string, targetTaskId: string, fromDate: string) => {
    // Find the task in the source day
    const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === draggedTaskId);
    if (!taskToMove) return;

    // Remove from source day
    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== draggedTaskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);

    // Add to All Tasks at specific position
    const newAllTaskItem: PlannerItem = {
      ...taskToMove,
      date: undefined, // Completely remove date to prevent any past-date styling
      section: "morning",
      color: "", // Clear color when moving to All Tasks
    };

    const targetIndex = allTasks.findIndex(t => t.id === targetTaskId);
    const newAllTasks = [...allTasks];
    newAllTasks.splice(targetIndex, 0, newAllTaskItem);
    setAllTasks(newAllTasks);
    saveAllTasks(newAllTasks);
  };

  const handleDropTaskFromCalendarToAllTasks = (taskId: string, fromDate: string, targetIndex: number) => {
    console.log('🎯 Dropping task at index:', targetIndex);

    // Find the task in the source day
    const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    // Remove from source day
    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);

    // Add to All Tasks at specific position
    const newAllTaskItem: PlannerItem = {
      ...taskToMove,
      date: undefined, // Completely remove date to prevent any past-date styling
      section: "morning",
      startTime: undefined,
      endTime: undefined,
      color: "", // Clear color when moving to All Tasks
    };

    const newAllTasks = [...allTasks];
    newAllTasks.splice(targetIndex, 0, newAllTaskItem);
    setAllTasks(newAllTasks);
    saveAllTasks(newAllTasks);

    console.log('✅ Task inserted at position', targetIndex);
  };

  const handleSaveWeeklyObjective = (text: string) => {
    setGlobalTasks(text);
  };

  const handleWeeklyTaskAdd = (dayString: string) => {
    const input = weeklyNewTaskInputs[dayString] || "";
    if (!input.trim()) return;

    handleAddWeeklyTask(dayString, input);
  };

  const handleWeeklyTaskEdit = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const task = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!task) return;

    setWeeklyEditingTask(taskId);
    setWeeklyEditText(task.text);
  };

  const handleWeeklyTaskEditConfirm = (taskId: string, dayString: string) => {
    handleEditWeeklyTask(taskId, dayString, weeklyEditText);
  };

  const handleWeeklyTaskEditCancel = () => {
    setWeeklyEditingTask(null);
    setWeeklyEditText("");
  };

  const handleWeeklyTaskDragStart = (taskId: string, dayString: string, e: React.DragEvent) => {
    setDraggedWeeklyTaskId(taskId);
    setDraggingTaskText(taskId);

    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('fromDate', dayString);
    e.dataTransfer.setData('fromAllTasks', 'false');
    e.dataTransfer.effectAllowed = 'move';

    e.currentTarget.style.opacity = '0.5';
  };

  const handleWeeklyTaskDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedWeeklyTaskId(null);
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
    setDraggingTaskText("");
  };

  const handleWeeklyTaskDragOver = (taskId: string, e: React.DragEvent) => {
    e.preventDefault();

    // If we're dragging over the same task, do nothing
    if (taskId === draggedWeeklyTaskId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const midpoint = rect.top + rect.height / 2;

    setDragOverWeeklyTaskId(taskId);
    setWeeklyDropIndicatorPosition(mouseY < midpoint ? 'before' : 'after');
  };

  const handleWeeklyTaskDragLeave = () => {
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
  };

  const handleWeeklyTaskDrop = (dayString: string, targetTaskId: string, e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedWeeklyTaskId || !weeklyDropIndicatorPosition) return;

    // Reorder within the same day
    handleReorderWeeklyTasks(dayString, draggedWeeklyTaskId, targetTaskId, weeklyDropIndicatorPosition);

    setDraggedWeeklyTaskId(null);
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
  };

  const handleWeeklyEditTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const task = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!task) return;

    setWeeklyEditDialogOpen(taskId);
    setWeeklyEditTitle(task.text);
    setWeeklyEditDescription(task.description || "");
    setWeeklyEditColor(task.color || "");
  };

  const handleWeeklyEditSave = (taskId: string, dayString: string) => {
    handleSaveWeeklyTaskDetails(taskId, dayString);
  };

  const handleWeeklyEditCancel = () => {
    setWeeklyEditDialogOpen(null);
  };

  const handleWeeklyEditTitleChange = (value: string) => {
    setWeeklyEditTitle(value);
  };

  const handleWeeklyEditDescriptionChange = (value: string) => {
    setWeeklyEditDescription(value);
  };

  const handleWeeklyEditColorChange = (value: string) => {
    setWeeklyEditColor(value);
  };

  const handleWeeklyEditStart = () => {
    setWeeklyEditingTitle(true);
  };

  const handleWeeklyEditEnd = () => {
    setWeeklyEditingTitle(false);
  };

  const handleTaskDragStart = (task: PlannerItem, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromDate', task.date || dateString);
    e.dataTransfer.setData('fromAllTasks', task.date ? 'false' : 'true');
    e.dataTransfer.effectAllowed = 'move';

    setDraggingTaskText(task.text);

    // Add drag class
    e.currentTarget.classList.add('opacity-50');

    console.log('✅ Drag data set - taskId:', task.id, 'fromDate:', task.date || dateString);
  };

  const handleTaskDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggingTaskText("");
  };

  const handleAllTasksDragEnter = () => {
    setIsDraggingOverAllTasks(true);
  };

  const handleAllTasksDragLeave = () => {
    setIsDraggingOverAllTasks(false);
  };

  const handleAllTasksDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      const dayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (dayIndex < 0) return;

      const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      setAllTasks(prev => [...prev, newAllTaskItem]);
      saveAllTasks([...allTasks, newAllTaskItem]);
    }

    setIsDraggingOverAllTasks(false);
  };

  const handleAllTasksDropInSection = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      handleDropTaskFromCalendarToAllTasks(taskId, fromDate, targetIndex);
    }
  };

  const handleAllTasksDropOnSection = (e: React.DragEvent) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      const dayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (dayIndex < 0) return;

      const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      setAllTasks(prev => [...prev, newAllTaskItem]);
      saveAllTasks([...allTasks, newAllTaskItem]);
    }
  };

  const handleCalendarTaskDropToDay = (taskId: string, fromDate: string, targetDate: string) => {
    if (!taskId || !fromDate) return;

    const fromDayIndex = plannerData.findIndex(day => day.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
    };

    const toDayIndex = updatedPlannerData.findIndex(day => day.date === targetDate);
    const movedTask = { ...taskToMove, date: targetDate };

    if (toDayIndex >= 0) {
      updatedPlannerData[toDayIndex] = {
        ...updatedPlannerData[toDayIndex],
        items: [...updatedPlannerData[toDayIndex].items, movedTask]
      };
    } else {
      updatedPlannerData.push({
        date: targetDate,
        items: [movedTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleAllTasksDropOnDay = (taskId: string, targetDate: string) => {
    const taskToMove = allTasks.find(task => task.id === taskId);
    if (!taskToMove) return;

    // Remove from All Tasks
    const updatedAllTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedAllTasks);
    saveAllTasks(updatedAllTasks);

    // Add to target day
    const updatedPlannerData = [...plannerData];
    const dayIndex = updatedPlannerData.findIndex(day => day.date === targetDate);

    const newTask: PlannerItem = {
      ...taskToMove,
      date: targetDate,
      section: "morning",
    };

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newTask]
      };
    } else {
      updatedPlannerData.push({
        date: targetDate,
        items: [newTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleTodayCalendarDrop = (taskId: string, fromDate: string, targetDate: string) => {
    handleCalendarTaskDropToDay(taskId, fromDate, targetDate);
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

  const handleMoveToToday = () => {
    setSelectedDate(new Date());
  };

  const handleWeeklyTaskClick = (task: PlannerItem) => {
    setEditingTask(task);
    setDialogTaskTitle(task.text);
    setDialogTaskDescription(task.description || "");
    setDialogStartTime(task.startTime ? convert24To12Hour(task.startTime) : "");
    setDialogEndTime(task.endTime ? convert24To12Hour(task.endTime) : "");
    setDialogTaskColor(task.color || "");
    setDialogAddToContentCalendar(task.isContentCalendar || false);
    setIsTaskDialogOpen(true);
  };

  const handleWeeklyAddTaskClick = (dayString: string) => {
    setWeeklyAddingTask(prev => ({ ...prev, [dayString]: true }));
  };

  const handleWeeklyTaskInputChange = (dayString: string, value: string) => {
    setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: value }));
  };

  const handleWeeklyTaskInputBlur = (dayString: string) => {
    if (!weeklyNewTaskInputs[dayString]?.trim()) {
      setWeeklyAddingTask(prev => ({ ...prev, [dayString]: false }));
    }
  };

  const handleCalendarTaskClick = (task: PlannerItem) => {
    setEditingTask(task);
    setDialogTaskTitle(task.text);
    setDialogTaskDescription(task.description || "");
    setDialogStartTime(task.startTime ? convert24To12Hour(task.startTime) : "");
    setDialogEndTime(task.endTime ? convert24To12Hour(task.endTime) : "");
    setDialogTaskColor(task.color || "");
    setDialogAddToContentCalendar(task.isContentCalendar || false);
    setIsTaskDialogOpen(true);
  };

  const handleTaskDropToToday = (taskId: string, fromDate: string, e: React.DragEvent) => {
    e.preventDefault();

    // If dropping on same day, ignore
    if (fromDate === dateString) return;

    const dayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (dayIndex < 0) return;

    const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
    };

    const toDayIndex = updatedPlannerData.findIndex(d => d.date === dateString);
    const movedTask = { ...taskToMove, date: dateString };

    if (toDayIndex >= 0) {
      updatedPlannerData[toDayIndex] = {
        ...updatedPlannerData[toDayIndex],
        items: [...updatedPlannerData[toDayIndex].items, movedTask]
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [movedTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleAllTasksDragStart = (task: PlannerItem, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromDate', '');
    e.dataTransfer.setData('fromAllTasks', 'true');
    e.dataTransfer.effectAllowed = 'move';

    setDraggingTaskText(task.text);

    // Add drag class
    e.currentTarget.classList.add('opacity-50');
  };

  const handleAllTasksDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggingTaskText("");
  };

  const handleWeeklyEditTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setWeeklyEditingTitle(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, section: PlannerItem["section"]) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask(section);
    }
  };

  const handleSectionChange = (section: PlannerItem["section"], value: string) => {
    handleUpdateSectionText(section, value);
  };

  const handleSectionBlur = (section: PlannerItem["section"], value: string) => {
    handleSaveSectionText(section, value);
  };

  const handleContentCalendarTaskClick = (item: any) => {
    setDialogTaskTitle(item.title);
    setDialogTaskDescription(item.description || "");
    setDialogStartTime(item.startTime || "");
    setDialogEndTime(item.endTime || "");
    setDialogTaskColor(item.color || "");
    setDialogAddToContentCalendar(true);
    setEditingTask(item);
    setIsTaskDialogOpen(true);
  };

  const handleRemoveContentCalendarItem = (id: string) => {
    const updatedContentData = contentCalendarData.filter(item => item.id !== id);
    setContentCalendarData(updatedContentData);
    saveScheduledContent(updatedContentData);
    emit(window, EVENTS.scheduledContentUpdated, updatedContentData);
  };

  const handleMoveContentCalendarItem = (itemId: string, toDate: string) => {
    const updatedContentData = contentCalendarData.map(item => {
      if (item.id === itemId) {
        return { ...item, date: toDate };
      }
      return item;
    });

    setContentCalendarData(updatedContentData);
    saveScheduledContent(updatedContentData);
    emit(window, EVENTS.scheduledContentUpdated, updatedContentData);
  };

  const handleContentCalendarDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const toDate = targetDate;

    console.log('📅 Content Calendar Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

    if (taskId && fromDate && fromDate !== toDate) {
      const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      // Add to destination day
      const toDayIndex = updatedPlannerData.findIndex(d => d.date === toDate);
      const movedTask = { ...taskToMove, date: toDate };

      if (toDayIndex >= 0) {
        updatedPlannerData[toDayIndex] = {
          ...updatedPlannerData[toDayIndex],
          items: [...updatedPlannerData[toDayIndex].items, movedTask]
        };
      } else {
        // Create new day entry if it doesn't exist
        updatedPlannerData.push({
          date: toDate,
          items: [movedTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleAllTasksDragOverContentCalendar = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDropContentCalendar = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Content Calendar Drop - taskId:', taskId, 'fromDate:', fromDate);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: dateString } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDragOverCalendar = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDropCalendar = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', targetDate);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: targetDate } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDropCalendarDay = (e: React.DragEvent, dayString: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', dayString);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: dayString } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDropCalendarTask = (e: React.DragEvent, taskId: string, fromDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate);

    if (taskId && fromDate) {
      const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      const newAllTasks = [...allTasks, newAllTaskItem];
      setAllTasks(newAllTasks);
      saveAllTasks(newAllTasks);

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleCopyDay = () => {
    setIsCopyDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelTaskDialog();
    }
  };

  const handleTaskSectionDrop = (taskId: string, targetSection: PlannerItem["section"], fromDate?: string) => {
    if (fromDate) {
      // Task is coming from another day
      const fromDayIndex = plannerData.findIndex(day => day.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      // Add to target section in current day
      const targetDayIndex = updatedPlannerData.findIndex(day => day.date === dateString);
      const movedTask = { ...taskToMove, date: dateString, section: targetSection };

      if (targetDayIndex >= 0) {
        updatedPlannerData[targetDayIndex] = {
          ...updatedPlannerData[targetDayIndex],
          items: [...updatedPlannerData[targetDayIndex].items, movedTask]
        };
      } else {
        updatedPlannerData.push({
          date: dateString,
          items: [movedTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    } else {
      // Task is coming from All Tasks
      const taskToMove = allTasks.find(task => task.id === taskId);
      if (!taskToMove) return;

      // Remove from All Tasks
      const updatedAllTasks = allTasks.filter(task => task.id !== taskId);
      setAllTasks(updatedAllTasks);
      saveAllTasks(updatedAllTasks);

      // Add to target section in current day
      const updatedPlannerData = [...plannerData];
      const dayIndex = updatedPlannerData.findIndex(day => day.date === dateString);

      const newTask: PlannerItem = {
        ...taskToMove,
        date: dateString,
        section: targetSection,
      };

      if (dayIndex >= 0) {
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newTask]
        };
      } else {
        updatedPlannerData.push({
          date: dateString,
          items: [newTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleSaveWeeklyTaskTitle = (taskId: string, dayString: string, title: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: title,
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleSaveWeeklyTaskDescription = (taskId: string, dayString: string, description: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        description
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleSaveWeeklyTaskColor = (taskId: string, dayString: string, color: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        color
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleWeeklyTaskClickOutside = () => {
    setWeeklyEditDialogOpen(null);
  };

  const handleAddWeeklyTaskAtTime = (dayString: string, hour: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setEditingTask({
      id: '',
      date: dayString,
      text: '',
      section: 'morning',
      isCompleted: false,
      order: 0
    } as PlannerItem);

    setDialogTaskTitle('');
    setDialogTaskDescription('');
    setDialogStartTime(convert24To12Hour(startTime));
    setDialogEndTime(convert24To12Hour(endTime));
    setDialogTaskColor('');
    setDialogAddToContentCalendar(false);
    setIsTaskDialogOpen(true);
  };

  const handleWeeklyTaskTimeChange = (taskId: string, dayString: string, startTime?: string, endTime?: string) => {
    handleEditItem(taskId, weeklyEditTitle, startTime, endTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
  };

  const handleUpdateTaskCompletion = (taskId: string, dayString: string) => {
    handleToggleWeeklyTask(taskId, dayString);
  };

  const handleTaskResizeStart = (taskId: string, dayString: string, startTime: string, endTime: string, e: React.MouseEvent, isStart: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;

    const startY = e.clientY;
    const originalTime = isStart ? startTime : endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = Math.round(deltaY / 0.8);
      const [hour, minute] = originalTime.split(':').map(Number);
      const originalMinutes = hour * 60 + minute;
      const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

      if (isStart) {
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const endTotalMinutes = endHour * 60 + endMinute;

        if (newMinutes < endTotalMinutes - 15) {
          const newHour = Math.floor(newMinutes / 60);
          const newMinute = newMinutes % 60;
          const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

          handleEditItem(taskId, weeklyEditTitle, newStartTime, endTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
        }
      } else {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;

        if (newMinutes > startTotalMinutes + 15) {
          const newHour = Math.floor(newMinutes / 60);
          const newMinute = newMinutes % 60;
          const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

          handleEditItem(taskId, weeklyEditTitle, startTime, newEndTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => {
        isResizingRef.current = false;
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    handleOpenTaskDialog,
    getTasksWithTimes,
    handleAddItem,
    handleAddWeeklyTask,
    handleEditWeeklyTask,
    handleDeleteWeeklyTask,
    handleSaveWeeklyTaskDetails,
    handleToggleWeeklyTask,
    handleReorderWeeklyTasks,
    handleToggleItem,
    handleDeleteItem,
    handleEditItem,
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    handleTimezoneChange,
    handleAddTask,
    handleUpdateSectionText,
    handleSaveSectionText,
    handleAddTaskAtTime,
    handleSaveTaskDialog,
    handleCancelTaskDialog,
    handleCopyTasks,
    handleToggleAllTask,
    handleDeleteAllTask,
    handleEditAllTask,
    handleReorderAllTasks,
    handleAddAllTask,
    handleDropTaskFromWeeklyToAllTasks,
    handleDropTaskFromCalendarToAllTasks,
    handleSaveWeeklyObjective,
    handleWeeklyTaskAdd,
    handleWeeklyTaskEdit,
    handleWeeklyTaskEditConfirm,
    handleWeeklyTaskEditCancel,
    handleWeeklyTaskDragStart,
    handleWeeklyTaskDragEnd,
    handleWeeklyTaskDragOver,
    handleWeeklyTaskDragLeave,
    handleWeeklyTaskDrop,
    handleWeeklyEditTask,
    handleWeeklyEditSave,
    handleWeeklyEditCancel,
    handleWeeklyEditTitleChange,
    handleWeeklyEditDescriptionChange,
    handleWeeklyEditColorChange,
    handleWeeklyEditStart,
    handleWeeklyEditEnd,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleAllTasksDragEnter,
    handleAllTasksDragLeave,
    handleAllTasksDragOver,
    handleAllTasksDrop,
    handleAllTasksDropInSection,
    handleAllTasksDropOnSection,
    handleCalendarTaskDropToDay,
    handleAllTasksDropOnDay,
    handleTodayCalendarDrop,
    // Copy dialog handlers (from useCopyDialogActions hook)
    ...copyDialogActions,
    handleTodayScrollToCurrentTime,
    handleWeeklyScrollToCurrentTime,
    handleMoveToToday,
    handleWeeklyTaskClick,
    handleWeeklyAddTaskClick,
    handleWeeklyTaskInputChange,
    handleWeeklyTaskInputBlur,
    handleCalendarTaskClick,
    handleTaskDropToToday,
    handleAllTasksDragStart,
    handleAllTasksDragEnd,
    // Task dialog input handlers (from useTaskDialogInputs hook)
    ...taskDialogInputs,
    handleWeeklyEditTitleKeyDown,
    handleInputKeyDown,
    handleSectionChange,
    handleSectionBlur,
    handleAllTasksDragOverCalendar,
    handleContentCalendarTaskClick,
    handleRemoveContentCalendarItem,
    handleMoveContentCalendarItem,
    handleContentCalendarDrop,
    handleAllTasksDragOverContentCalendar,
    handleAllTasksDropContentCalendar,
    handleAllTasksDropCalendar,
    handleAllTasksDropCalendarDay,
    handleAllTasksDropCalendarTask,
    handleCopyDay,
    handleDialogOpenChange,
    handleTaskSectionDrop,
    handleSaveWeeklyTaskTitle,
    handleSaveWeeklyTaskDescription,
    handleSaveWeeklyTaskColor,
    handleWeeklyTaskClickOutside,
    handleAddWeeklyTaskAtTime,
    handleWeeklyTaskTimeChange,
    handleUpdateTaskCompletion,
    handleTaskResizeStart,
    savePlannerData,
    saveAllTasks,
    saveScheduledContent,
  };
};
