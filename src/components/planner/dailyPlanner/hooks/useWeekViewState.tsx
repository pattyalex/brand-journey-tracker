import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { ContentDisplayMode } from "./usePlannerState";
import { useColorPalette } from "./useColorPalette";
import { parseTimeTo24 } from "../utils/timeUtils";
import { getDateString } from "../utils/plannerUtils";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { defaultColumns } from "@/pages/production/utils/productionConstants";
import { StorageKeys, getString, setString, getWeekStartsOn } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

interface UseWeekViewStateParams {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  savePlannerData: (data: PlannerDay[]) => void;
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  weeklyZoomLevel: number;
  contentDisplayMode: ContentDisplayMode;
  productionContent: {
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  };
  setProductionContent?: React.Dispatch<React.SetStateAction<{
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  }>>;
  loadProductionContent?: () => void;
  weeklyAddDialogState?: {
    open: boolean;
    dayString: string;
    startTime: string;
    endTime: string;
  };
  setWeeklyAddDialogState?: React.Dispatch<React.SetStateAction<{
    open: boolean;
    dayString: string;
    startTime: string;
    endTime: string;
  }>>;
}

export const useWeekViewState = ({
  selectedDate,
  plannerData,
  weeklyScrollRef,
  weeklyZoomLevel,
  contentDisplayMode,
  productionContent,
  setProductionContent,
  loadProductionContent,
  weeklyAddDialogState,
  setWeeklyAddDialogState,
  setPlannerData,
  savePlannerData,
}: UseWeekViewStateParams) => {
  const navigate = useNavigate();

  // Google Calendar integration
  const {
    connection: googleConnection,
    events: googleEvents,
    fetchEvents: fetchGoogleEvents,
  } = useGoogleCalendar();

  // Fetch Google Calendar events for the week
  useEffect(() => {
    if (googleConnection.isConnected && googleConnection.showEvents) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() });
      fetchGoogleEvents(format(weekStart, 'yyyy-MM-dd'), format(addDays(weekEnd, 1), 'yyyy-MM-dd'));
    }
  }, [googleConnection.isConnected, googleConnection.showEvents, selectedDate]);

  // State for add dialog - sync with external state if provided
  const [addDialogTab, setAddDialogTab] = useState<'task' | 'content'>('task');

  // Use external state if available, otherwise use local state
  const addDialogOpen = weeklyAddDialogState?.open ?? false;
  const addDialogDate = weeklyAddDialogState?.dayString ?? "";
  const addDialogStartTime = weeklyAddDialogState?.startTime ?? "";
  const addDialogEndTime = weeklyAddDialogState?.endTime ?? "";

  const closeAddDialog = () => {
    if (setWeeklyAddDialogState) {
      setWeeklyAddDialogState({ open: false, dayString: '', startTime: '', endTime: '' });
    }
  };

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");
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

  // Scroll to first task or 6am on mount
  useEffect(() => {
    if (weeklyScrollRef.current) {
      // Get all days of the current week
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

      // Find earliest task time across the week
      let earliestHour = 24; // Start with max so we find the minimum

      weekDays.forEach(day => {
        const dayString = getDateString(day);
        const dayData = plannerData.find(d => d.date === dayString);

        if (dayData?.items) {
          dayData.items.forEach(task => {
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
        }
      });

      // If no tasks found, default to 7am
      if (earliestHour === 24) earliestHour = 7;

      // Scroll to 1 hour before earliest task, but minimum 5am
      const scrollToHour = Math.max(5, earliestHour - 1);
      const scrollPosition = scrollToHour * 48 * weeklyZoomLevel;
      weeklyScrollRef.current.scrollTop = scrollPosition;
    }
  }, [selectedDate]);

  // Sync state when dialog opens
  useEffect(() => {
    if (addDialogOpen) {
      // Reset drag offset when dialog opens
      setDialogDragOffset({ x: 0, y: 0 });
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
      if (!match) return time12; // already 24h format, return as-is
      let hour = parseInt(match[1], 10);
      const minute = match[2];
      const period = match[3].toLowerCase();
      if (hour > 12) hour = hour % 12;
      if (hour < 1) hour = 1;
      if (period === 'pm' && hour !== 12) hour += 12;
      else if (period === 'am' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    };

    const rawStart = taskStartTime || addDialogStartTime || '';
    const rawEnd = taskEndTime || addDialogEndTime || '';

    const newTask: PlannerItem = {
      id: `task-${Date.now()}`,
      text: taskTitle.trim(),
      isCompleted: false,
      section: 'morning',
      date: addDialogDate,
      startTime: rawStart ? convert12To24(rawStart) : undefined,
      endTime: rawEnd ? convert12To24(rawEnd) : undefined,
      description: taskDescription || undefined,
      color: taskColor || undefined,
      isContentCalendar: taskIncludeInContentCalendar,
    };

    // Add to planner data
    const dayIndex = plannerData.findIndex(d => d.date === addDialogDate);
    const updatedPlannerData = [...plannerData];

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newTask]
      };
    } else {
      updatedPlannerData.push({
        date: addDialogDate,
        items: [newTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
    toast.success('Task created for ' + format(new Date(addDialogDate + 'T12:00:00'), 'MMM d'));
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
        plannedDate: addDialogDate,
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
      setProductionContent?.(prev => {
        const updated = {
          ...prev,
          planned: [...prev.planned, newCard]
        };
        console.log('WeekView: Updated productionContent.planned:', updated.planned.length, 'items');
        return updated;
      });

      // Emit events for cross-component sync
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);

      toast.success('Content idea added for ' + format(new Date(addDialogDate + 'T12:00:00'), 'MMM d'));
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
          const toScheduleColumn = columns.find(c => c.id === 'ready-to-post');
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
        loadProductionContent?.();
        if (type === 'scheduled') {
          toast.success(
            <span>
              Content unscheduled — still in{' '}
              <button
                onClick={() => {
                  setString(StorageKeys.highlightedUnscheduledCard, contentId);
                  navigate('/production?scrollTo=ready-to-post');
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

  // Handle marking content as posted — archive and remove from ready-to-post
  const handleToggleComplete = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContentTooltip(null);
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        const toScheduleColumn = columns.find(c => c.id === 'ready-to-post');
        if (toScheduleColumn) {
          const cardIndex = toScheduleColumn.cards.findIndex(c => c.id === contentId);
          if (cardIndex !== -1) {
            const card = toScheduleColumn.cards[cardIndex];

            // If already completed, just uncomplete it
            if (card.isCompleted) {
              card.isCompleted = false;
              setString(StorageKeys.productionKanban, JSON.stringify(columns));
              emit(window, EVENTS.productionKanbanUpdated);
              emit(window, EVENTS.scheduledContentUpdated);
              loadProductionContent?.();
              return;
            }

            // Create archive copy
            const archivedCopy = {
              ...card,
              id: `archived-${card.id}-${Date.now()}`,
              columnId: 'posted',
              isCompleted: true,
              schedulingStatus: undefined,
              archivedAt: new Date().toISOString(),
              postedAt: new Date().toISOString(),
            } as ProductionCard & { archivedAt: string; postedAt: string };

            // Add to archived storage directly
            const archivedData = getString(StorageKeys.archivedContent);
            const archived: ProductionCard[] = archivedData ? JSON.parse(archivedData) : [];
            archived.unshift(archivedCopy);
            setString(StorageKeys.archivedContent, JSON.stringify(archived));

            // Remove card from ready-to-post column
            toScheduleColumn.cards.splice(cardIndex, 1);
            setString(StorageKeys.productionKanban, JSON.stringify(columns));

            // Emit events
            emit(window, EVENTS.productionKanbanUpdated);
            emit(window, EVENTS.scheduledContentUpdated);
            emit(window, EVENTS.contentArchived, { card: archivedCopy });
            loadProductionContent?.();

            toast.success("Posted! 🎉", { description: "Content saved in Archive" });
          }
        }
      } catch (err) {
        console.error('Error toggling completion:', err);
      }
    }
  };

  return {
    navigate,
    googleConnection,
    googleEvents,
    // Dialog state
    addDialogOpen,
    addDialogDate,
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
