import { useEffect } from "react";
import { PlannerItem } from "@/types/planner";

interface UsePlannerDragCreateArgs {
  isDraggingCreate: boolean;
  dragCreateStart: { hour: number; minute: number } | null;
  dragCreateEnd: { hour: number; minute: number } | null;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  todayZoomLevel: number;
  isTaskDialogOpen: boolean;
  contentDisplayMode?: 'tasks' | 'content' | 'both';
  todayScrollRef: React.RefObject<HTMLDivElement>;
  convert24To12Hour: (time: string) => string;
  setIsDraggingCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setDragCreateStart: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setDragCreateEnd: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setTaskDialogPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenTaskDialog: (hour: number, itemToEdit?: PlannerItem, startTime?: string, endTime?: string) => void;
  onWeeklyAddDialogOpen?: (dayString: string, startTime: string, endTime: string) => void;
  onTodayAddDialogOpen?: (startTime: string, endTime: string) => void;
}

export const usePlannerDragCreate = ({
  isDraggingCreate,
  dragCreateStart,
  dragCreateEnd,
  weeklyDraggingCreate,
  weeklyDragCreateStart,
  weeklyDragCreateEnd,
  todayZoomLevel,
  isTaskDialogOpen,
  contentDisplayMode = 'tasks',
  todayScrollRef,
  convert24To12Hour,
  setIsDraggingCreate,
  setDragCreateStart,
  setDragCreateEnd,
  setWeeklyDraggingCreate,
  setWeeklyDragCreateStart,
  setWeeklyDragCreateEnd,
  setTaskDialogPosition,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setIsTaskDialogOpen,
  handleOpenTaskDialog,
  onWeeklyAddDialogOpen,
  onTodayAddDialogOpen,
}: UsePlannerDragCreateArgs) => {

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
          // Round to 30-minute intervals
          const rawMinute = totalMinutes % 60;
          const minute = Math.round(rawMinute / 30) * 30;

          if (hour >= 0 && hour < 24) {
            setWeeklyDragCreateEnd(prev => ({
              ...prev,
              [targetDay!]: { hour: minute === 60 ? hour + 1 : hour, minute: minute === 60 ? 0 : minute }
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
            // Calculate times - round to 30-minute intervals
            const startMinutes = start.hour * 60 + start.minute;
            const endMinutes = end.hour * 60 + end.minute;
            const actualStart = Math.round(Math.min(startMinutes, endMinutes) / 30) * 30;
            const actualEnd = Math.round(Math.max(startMinutes, endMinutes) / 30) * 30;

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
};
