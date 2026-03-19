import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { PlannerItem } from "@/types/planner";
import { PlannerDerived, PlannerHelpers, PlannerRefs, PlannerSetters, PlannerState } from "./usePlannerState";
import { usePlannerActions } from "./usePlannerActions";
import { useColorPalette } from "./useColorPalette";
import { parseTimeTo24 } from "../utils/timeUtils";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { defaultColumns } from "@/pages/production/utils/productionConstants";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";

interface UseTodayViewStateParams {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  helpers: PlannerHelpers;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
  todayAddDialogState?: {
    open: boolean;
    startTime: string;
    endTime: string;
  };
  setTodayAddDialogState?: React.Dispatch<React.SetStateAction<{
    open: boolean;
    startTime: string;
    endTime: string;
  }>>;
}

export const useTodayViewState = ({
  state,
  derived,
  refs,
  helpers,
  setters,
  actions,
  todayAddDialogState,
  setTodayAddDialogState,
}: UseTodayViewStateParams) => {
  const navigate = useNavigate();

  const {
    selectedDate,
    todayZoomLevel,
    allTasks,
    tasks,
    greatDay,
    grateful,
    plannerData,
    contentDisplayMode,
  } = state;

  const { dateString, currentDay } = derived;
  const { todayScrollRef } = refs;
  const { convert24To12Hour, loadProductionContent } = helpers;
  const {
    handleEditItem,
    savePlannerData,
  } = actions;
  const {
    setPlannerData,
    setAllTasks,
    setProductionContent,
  } = setters;

  // Dialog state from external prop or local
  const addDialogOpen = todayAddDialogState?.open ?? false;
  const addDialogStartTime = todayAddDialogState?.startTime ?? "";
  const addDialogEndTime = todayAddDialogState?.endTime ?? "";

  // Local dialog state
  const [addDialogTab, setAddDialogTab] = useState<'task' | 'content'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStartTime, setTaskStartTime] = useState(addDialogStartTime);
  const [taskEndTime, setTaskEndTime] = useState(addDialogEndTime);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskColor, setTaskColor] = useState("");
  const [taskIncludeInContentCalendar, setTaskIncludeInContentCalendar] = useState(false);

  // Content form state
  const [contentHook, setContentHook] = useState("");
  const [contentNotes, setContentNotes] = useState("");
  const [contentStartTime, setContentStartTime] = useState(addDialogStartTime);
  const [contentEndTime, setContentEndTime] = useState(addDialogEndTime);
  const [addToContentHub, setAddToContentHub] = useState(true);

  // Color palette management (shared hook)
  const contentColorPalette = useColorPalette();
  const contentColor = contentColorPalette.selectedColor;
  const setContentColor = contentColorPalette.setSelectedColor;

  // Content hover tooltip state
  const [contentTooltip, setContentTooltip] = useState<{
    text: string;
    timeStr: string;
    isPlanned: boolean;
    platforms?: string[];
    formats?: string[];
    x: number;
    y: number;
  } | null>(null);

  // Dialog drag state
  const [dialogDragOffset, setDialogDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dialogDragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  // Handle dialog drag
  const handleDialogDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dialogDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: dialogDragOffset.x,
      offsetY: dialogDragOffset.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (dialogDragStartRef.current) {
        const deltaX = moveEvent.clientX - dialogDragStartRef.current.x;
        const deltaY = moveEvent.clientY - dialogDragStartRef.current.y;
        setDialogDragOffset({
          x: dialogDragStartRef.current.offsetX + deltaX,
          y: dialogDragStartRef.current.offsetY + deltaY,
        });
      }
    };

    const handleMouseUp = () => {
      dialogDragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Scroll to first task or 6am on mount
  useEffect(() => {
    // Small delay to ensure ScrollArea viewport is rendered
    const timer = setTimeout(() => {
      const viewport = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        // Find earliest task time for today
        let earliestHour = 24; // Start with max so we find the minimum

        const todayItems = currentDay?.items || [];
        todayItems.forEach(task => {
          if (task.startTime) {
            // Handle both 24-hour (08:00) and 12-hour (8:00 am) formats
            let hour = parseInt(task.startTime.split(':')[0], 10);
            const isPM = task.startTime.toLowerCase().includes('pm');
            const isAM = task.startTime.toLowerCase().includes('am');

            if (isPM && hour !== 12) hour += 12;
            if (isAM && hour === 12) hour = 0;

            if (!isNaN(hour) && hour < earliestHour) {
              earliestHour = hour;
            }
          }
        });

        // If no tasks found, default to 6am
        if (earliestHour === 24) earliestHour = 7;

        // Scroll to 1 hour before earliest task, but minimum 5am
        const scrollToHour = Math.max(5, earliestHour - 1);
        const scrollPosition = scrollToHour * 90 * todayZoomLevel;
        viewport.scrollTop = scrollPosition;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [dateString]);

  // Sync times and tab when dialog opens
  useEffect(() => {
    if (addDialogOpen) {
      // Reset drag offset when dialog opens
      setDialogDragOffset({ x: 0, y: 0 });
      // Set times from dialog state
      setTaskStartTime(addDialogStartTime);
      setTaskEndTime(addDialogEndTime);
      setContentStartTime(addDialogStartTime);
      setContentEndTime(addDialogEndTime);
      // Set default tab based on display mode
      if (contentDisplayMode === 'content') {
        setAddDialogTab('content');
      } else if (contentDisplayMode === 'tasks') {
        setAddDialogTab('task');
      }
      // For 'both' mode, keep the current tab
    }
  }, [addDialogOpen, addDialogStartTime, addDialogEndTime, contentDisplayMode]);

  // Reset form state
  const resetFormState = () => {
    setTaskTitle("");
    setTaskStartTime("");
    setTaskEndTime("");
    setTaskDescription("");
    setTaskColor("");
    setTaskIncludeInContentCalendar(false);
    setContentHook("");
    setContentNotes("");
    setContentColor("");
    setContentStartTime("");
    setContentEndTime("");
    setAddToContentHub(true);
    // Reset color picker popover states
    contentColorPalette.resetPickerState();
  };

  // Close dialog
  const closeAddDialog = () => {
    if (setTodayAddDialogState) {
      setTodayAddDialogState({ open: false, startTime: '', endTime: '' });
    }
  };

  // Sync state when dialog opens
  useEffect(() => {
    if (addDialogOpen) {
      // Set times for both tasks and content
      setTaskStartTime(addDialogStartTime);
      setTaskEndTime(addDialogEndTime);
      setContentStartTime(addDialogStartTime);
      setContentEndTime(addDialogEndTime);
      // Set correct tab based on mode
      if (contentDisplayMode === 'content') {
        setAddDialogTab('content');
      } else {
        setAddDialogTab('task');
      }
    }
  }, [addDialogOpen, addDialogStartTime, addDialogEndTime, contentDisplayMode]);

  // Handle creating a task from the dialog
  const handleCreateTaskFromDialog = () => {
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    // Convert 12-hour to 24-hour format for storage
    const convert12To24 = (time12: string): string => {
      const match = time12.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      if (!match) return '';
      let hour = parseInt(match[1], 10);
      const minute = match[2];
      const period = match[3].toLowerCase();
      if (hour > 12) hour = hour % 12;
      if (hour < 1) hour = 1;
      if (period === 'pm' && hour !== 12) hour += 12;
      else if (period === 'am' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    };

    const newTask: PlannerItem = {
      id: `task-${Date.now()}`,
      text: taskTitle.trim(),
      completed: false,
      section: 'morning',
      date: dateString,
      startTime: taskStartTime ? convert12To24(taskStartTime) : undefined,
      endTime: taskEndTime ? convert12To24(taskEndTime) : undefined,
      description: taskDescription || undefined,
      color: taskColor || undefined,
      isContentCalendar: taskIncludeInContentCalendar,
    };

    // Add to planner data
    const dayIndex = plannerData.findIndex(d => d.date === dateString);
    const updatedPlannerData = [...plannerData];

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newTask]
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [newTask],
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
    toast.success('Task created for ' + format(selectedDate, 'MMM d'));
    closeAddDialog();
    resetFormState();
  };

  // Handle creating planned content from the dialog
  const handleCreateContentFromDialog = () => {
    if (!contentHook.trim()) {
      toast.error('Please enter a hook/title for your content');
      return;
    }

    if (!contentStartTime.trim() || !contentEndTime.trim()) {
      toast.error('Please select a time slot for your content');
      return;
    }

    try {
      const savedData = getString(StorageKeys.productionKanban);
      const columns: KanbanColumn[] = savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(defaultColumns));
      let ideateColumn = columns.find(c => c.id === 'ideate');

      // Create ideate column if it doesn't exist
      if (!ideateColumn) {
        ideateColumn = { id: 'ideate', title: 'Bank of Ideas', cards: [] };
        columns.unshift(ideateColumn);
      }

      const newCard: ProductionCard = {
        id: `card-${Date.now()}`,
        title: contentHook.trim(),
        hook: contentHook.trim(),
        description: contentNotes || undefined,
        columnId: 'ideate',
        plannedDate: dateString,
        plannedColor: contentColor as any,
        plannedStartTime: parseTimeTo24(contentStartTime) || undefined,
        plannedEndTime: parseTimeTo24(contentEndTime) || undefined,
        isNew: true,
        addedFrom: 'calendar',
        calendarOnly: !addToContentHub,
      };
      ideateColumn.cards.push(newCard);
      setString(StorageKeys.productionKanban, JSON.stringify(columns));

      // DIRECTLY update productionContent state for immediate UI feedback
      setProductionContent(prev => {
        const updated = {
          ...prev,
          planned: [...prev.planned, newCard]
        };
        console.log('TodayView: Updated productionContent.planned:', updated.planned.length, 'items');
        console.log('TodayView: New card:', newCard);
        return updated;
      });

      // Emit events for cross-component sync (other views like CalendarView, WeekView)
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);

      toast.success('Content idea added for ' + format(selectedDate, 'MMM d'));
    } catch (err) {
      console.error('Error adding planned content:', err);
    }

    closeAddDialog();
    resetFormState();
  };

  // Handle deleting content from calendar
  const handleDeleteContent = (contentId: string, type: 'scheduled' | 'planned') => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        if (type === 'scheduled') {
          const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
          if (toScheduleColumn) {
            const card = toScheduleColumn.cards.find(c => c.id === contentId);
            if (card) {
              card.scheduledDate = undefined;
              card.schedulingStatus = undefined;
            }
          }
        } else {
          const ideateColumn = columns.find(c => c.id === 'ideate');
          if (ideateColumn) {
            const card = ideateColumn.cards.find(c => c.id === contentId);
            if (card) {
              card.plannedDate = undefined;
            }
          }
        }

        setString(StorageKeys.productionKanban, JSON.stringify(columns));
        emit(window, EVENTS.productionKanbanUpdated);
        emit(window, EVENTS.scheduledContentUpdated);
        loadProductionContent();
        if (type === 'scheduled') {
          toast.success(
            <span>
              Content unscheduled — still in{' '}
              <button
                onClick={() => {
                  setString(StorageKeys.highlightedUnscheduledCard, contentId);
                  navigate('/production?scrollTo=to-schedule');
                }}
                className="underline font-medium text-indigo-600 hover:text-indigo-800"
              >
                Content Hub
              </button>
            </span>
          );
        } else {
          toast.success('Idea removed from calendar');
        }
      } catch (err) {
        console.error('Error removing content:', err);
      }
    }
  };

  // Handle toggling completion for scheduled content
  const handleToggleComplete = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
        if (toScheduleColumn) {
          const card = toScheduleColumn.cards.find(c => c.id === contentId);
          if (card) {
            const newCompletedState = !card.isCompleted;
            card.isCompleted = newCompletedState;
            setString(StorageKeys.productionKanban, JSON.stringify(columns));
            emit(window, EVENTS.productionKanbanUpdated);
            emit(window, EVENTS.scheduledContentUpdated);
            loadProductionContent();
            if (newCompletedState) {
              // Create archive copy
              const archivedCopy: ProductionCard = {
                ...card,
                id: `archived-${card.id}-${Date.now()}`,
                columnId: 'posted',
                schedulingStatus: undefined,
                archivedAt: new Date().toISOString(),
                postedAt: new Date().toISOString(),
              } as ProductionCard & { archivedAt: string; postedAt: string };
              emit(window, EVENTS.contentArchived, { card: archivedCopy });
              toast.success("Posted! 🎉");
            }
          }
        }
      } catch (err) {
        console.error('Error toggling completion:', err);
      }
    }
  };

  return {
    navigate,
    // Dialog state
    addDialogOpen,
    addDialogStartTime,
    addDialogEndTime,
    addDialogTab,
    setAddDialogTab,
    // Task form state
    taskTitle,
    setTaskTitle,
    taskStartTime,
    setTaskStartTime,
    taskEndTime,
    setTaskEndTime,
    taskDescription,
    setTaskDescription,
    taskColor,
    setTaskColor,
    taskIncludeInContentCalendar,
    setTaskIncludeInContentCalendar,
    // Content form state
    contentHook,
    setContentHook,
    contentNotes,
    setContentNotes,
    contentStartTime,
    setContentStartTime,
    contentEndTime,
    setContentEndTime,
    addToContentHub,
    setAddToContentHub,
    contentColorPalette,
    contentColor,
    setContentColor,
    // Content tooltip
    contentTooltip,
    setContentTooltip,
    // Dialog drag
    dialogDragOffset,
    handleDialogDragStart,
    // Actions
    resetFormState,
    closeAddDialog,
    handleCreateTaskFromDialog,
    handleCreateContentFromDialog,
    handleDeleteContent,
    handleToggleComplete,
  };
};
