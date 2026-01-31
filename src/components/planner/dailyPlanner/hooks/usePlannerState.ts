import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { PlannerView } from "../types";
import { TIMEZONES, getDateString } from "../utils/plannerUtils";
import { StorageKeys, getString } from "@/lib/storage";
import { KanbanColumn, ProductionCard } from "@/pages/production/types";
import { EVENTS, on } from "@/lib/events";

// Initialize planner data from localStorage to prevent flash
const getInitialPlannerData = (): PlannerDay[] => {
  const savedData = getString(StorageKeys.plannerData);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error("Failed to parse planner data:", error);
    }
  }
  return [];
};

// Initialize all tasks from localStorage
const getInitialAllTasks = (): PlannerItem[] => {
  const savedTasks = getString(StorageKeys.allTasks);
  if (savedTasks) {
    try {
      return JSON.parse(savedTasks);
    } catch (error) {
      console.error("Failed to parse all tasks:", error);
    }
  }
  return [];
};

// Initialize content calendar data from localStorage
const getInitialContentCalendarData = (): any[] => {
  const savedContent = getString(StorageKeys.scheduledContent);
  if (savedContent) {
    try {
      return JSON.parse(savedContent);
    } catch (error) {
      console.error("Failed to parse content calendar:", error);
    }
  }
  return [];
};

export type ContentDisplayMode = 'tasks' | 'content' | 'both';

export interface ContentDisplaySettings {
  showTasks: boolean;
  showContent: boolean;
}

export interface PlannerInitialSettings {
  selectedTimezone: string;
  todayZoomLevel: number;
  weeklyZoomLevel: number;
  todayScrollPosition: number;
  weeklyScrollPosition: number;
}

export const usePlannerState = ({
  selectedTimezone: initialSelectedTimezone,
  todayZoomLevel: initialTodayZoomLevel,
  weeklyZoomLevel: initialWeeklyZoomLevel,
  todayScrollPosition: initialTodayScrollPosition,
  weeklyScrollPosition: initialWeeklyScrollPosition,
}: PlannerInitialSettings) => {
  const [searchParams] = useSearchParams();

  // Get initial view from URL parameter, default to 'today'
  const getInitialView = (): PlannerView => {
    const viewParam = searchParams.get('view');
    const validViews: PlannerView[] = ['today', 'day', 'week', 'calendar', 'month'];
    if (viewParam && validViews.includes(viewParam as PlannerView)) {
      return viewParam as PlannerView;
    }
    return 'today';
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>(getInitialPlannerData);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
  const [currentView, setCurrentView] = useState<PlannerView>(getInitialView());
  const [selectedTimezone, setSelectedTimezone] = useState<string>(initialSelectedTimezone);
  const [calendarFilterMode, setCalendarFilterMode] = useState<'all' | 'content'>('all');

  // Content display mode: 'tasks', 'content', or 'both'
  const [contentDisplayMode, setContentDisplayMode] = useState<ContentDisplayMode>('tasks');

  // Derived values for convenience
  const showTasks = contentDisplayMode === 'tasks' || contentDisplayMode === 'both';
  const showContent = contentDisplayMode === 'content' || contentDisplayMode === 'both';

  // Production content (scheduled and planned items from Content Hub)
  const [productionContent, setProductionContent] = useState<{
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  }>({ scheduled: [], planned: [] });

  // Zoom levels for Today and Weekly views (0.5 = 50%, 1 = 100%, 1.5 = 150%)
  const [todayZoomLevel, setTodayZoomLevel] = useState<number>(initialTodayZoomLevel);
  const [weeklyZoomLevel, setWeeklyZoomLevel] = useState<number>(initialWeeklyZoomLevel);
  const [todayScrollPosition, setTodayScrollPosition] = useState(initialTodayScrollPosition);
  const [weeklyScrollPosition, setWeeklyScrollPosition] = useState(initialWeeklyScrollPosition);

  const todayScrollRef = useRef<HTMLDivElement>(null);
  const weeklyScrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const isResizingRef = useRef(false);

  // State for drag-to-create task (Today view)
  const [isDraggingCreate, setIsDraggingCreate] = useState(false);
  const [dragCreateStart, setDragCreateStart] = useState<{ hour: number; minute: number } | null>(null);
  const [dragCreateEnd, setDragCreateEnd] = useState<{ hour: number; minute: number } | null>(null);

  // Per-day drag-to-create state (Weekly view)
  const [weeklyDraggingCreate, setWeeklyDraggingCreate] = useState<{[dayString: string]: boolean}>({});
  const [weeklyDragCreateStart, setWeeklyDragCreateStart] = useState<{[dayString: string]: {hour: number, minute: number}}>({});
  const [weeklyDragCreateEnd, setWeeklyDragCreateEnd] = useState<{[dayString: string]: {hour: number, minute: number}}>({});

  const [globalTasks, setGlobalTasks] = useState<string>("");
  const [allTasks, setAllTasks] = useState<PlannerItem[]>(getInitialAllTasks);
  const [isAllTasksCollapsed, setIsAllTasksCollapsed] = useState(false);
  const [showContentCalendar, setShowContentCalendar] = useState(false);
  const [contentCalendarData, setContentCalendarData] = useState<any[]>(getInitialContentCalendarData);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskDialogPosition, setTaskDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingTask, setEditingTask] = useState<PlannerItem | null>(null);
  const [dialogTaskTitle, setDialogTaskTitle] = useState("");
  const [dialogTaskDescription, setDialogTaskDescription] = useState("");
  const [dialogStartTime, setDialogStartTime] = useState("");
  const [dialogEndTime, setDialogEndTime] = useState("");
  const [dialogTaskColor, setDialogTaskColor] = useState("");
  const [dialogAddToContentCalendar, setDialogAddToContentCalendar] = useState(false);
  const [pendingTaskFromAllTasks, setPendingTaskFromAllTasks] = useState<PlannerItem | null>(null);

  const [tasks, setTasks] = useState<string>("");
  const [greatDay, setGreatDay] = useState<string>("");
  const [grateful, setGrateful] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Weekly view states
  const [weeklyNewTaskInputs, setWeeklyNewTaskInputs] = useState<{[key: string]: string}>({});
  const [weeklyAddingTask, setWeeklyAddingTask] = useState<{[key: string]: boolean}>({});
  const [weeklyEditingTask, setWeeklyEditingTask] = useState<string | null>(null);
  const [weeklyEditText, setWeeklyEditText] = useState<string>("");
  const [draggedWeeklyTaskId, setDraggedWeeklyTaskId] = useState<string | null>(null);
  const [dragOverWeeklyTaskId, setDragOverWeeklyTaskId] = useState<string | null>(null);
  const [weeklyDropIndicatorPosition, setWeeklyDropIndicatorPosition] = useState<'before' | 'after' | null>(null);
  const [weeklyEditDialogOpen, setWeeklyEditDialogOpen] = useState<string | null>(null);
  const [weeklyEditDescription, setWeeklyEditDescription] = useState<string>("");
  const [weeklyEditColor, setWeeklyEditColor] = useState<string>("");
  const [weeklyEditTitle, setWeeklyEditTitle] = useState<string>("");
  const [weeklyEditingTitle, setWeeklyEditingTitle] = useState<boolean>(false);

  // Update view and content mode when URL parameters change
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const modeParam = searchParams.get('mode');

    const validViews: PlannerView[] = ['today', 'day', 'week', 'calendar', 'month'];
    if (viewParam && validViews.includes(viewParam as PlannerView)) {
      setCurrentView(viewParam as PlannerView);
    }

    // Set content display mode from URL param
    if (modeParam === 'content' || modeParam === 'tasks' || modeParam === 'both') {
      setContentDisplayMode(modeParam as ContentDisplayMode);
    }
  }, [searchParams]);

  // Load production content function (moved outside useEffect for reuse)
  const loadProductionContent = useCallback(() => {
    const savedData = getString(StorageKeys.productionKanban);
    console.log('usePlannerState: loadProductionContent called, savedData exists:', !!savedData);
    if (!savedData) {
      setProductionContent({ scheduled: [], planned: [] });
      return;
    }

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);

      // Get scheduled content from to-schedule column
      const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
      const scheduledCards = toScheduleColumn?.cards.filter(
        c => c.schedulingStatus === 'scheduled' && c.scheduledDate
      ) || [];

      // Get planned content from ideate column
      const ideateColumn = columns.find(col => col.id === 'ideate');
      const plannedCards = ideateColumn?.cards.filter(c => c.plannedDate) || [];

      console.log('usePlannerState: loadProductionContent found', plannedCards.length, 'planned cards');
      plannedCards.forEach((c, i) => console.log(`  Card ${i}:`, c.id, c.plannedDate, c.plannedStartTime, c.plannedEndTime));

      setProductionContent({
        scheduled: scheduledCards,
        planned: plannedCards
      });
    } catch (e) {
      console.error("Error loading production content:", e);
      setProductionContent({ scheduled: [], planned: [] });
    }
  }, []);

  // Load production content on mount and listen for updates
  useEffect(() => {
    loadProductionContent();

    // Listen for content calendar updates
    const unsubscribe = on(window, EVENTS.scheduledContentUpdated, loadProductionContent);
    const unsubscribe2 = on(window, EVENTS.productionKanbanUpdated, loadProductionContent);
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [loadProductionContent]);

  // Refresh production content when view or date changes to ensure sync across views
  useEffect(() => {
    loadProductionContent();
  }, [currentView, selectedDate, loadProductionContent]);

  const [isDraggingOverAllTasks, setIsDraggingOverAllTasks] = useState(false);
  const [draggingTaskText, setDraggingTaskText] = useState<string>("");

  const dateString = useMemo(() => getDateString(selectedDate), [selectedDate]);

  const colors = [
    "#d4a373", "#deb887", "#f0dc82", "#fef3c7",
    "#e8f5e9", "#a5d6a7", "#80cbc4", "#d4f1f4",
    "#e3f2fd", "#a5b8d0", "#ce93d8", "#f3e5f5",
    "#eeeeee", "#ede8e3", "#f8bbd0", "#f5e1e5"
  ];

  const colorOptions = [
    { name: 'Light Gray', value: '#f3f4f6' },
    { name: 'Rose', value: '#fecdd3' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Sky', value: '#bae6fd' },
    { name: 'Teal', value: '#99f6e4' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Lime', value: '#d9f99d' },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Orange', value: '#fed7aa' }
  ];

  // Get timezone display
  const getTimezoneDisplay = useCallback(() => {
    if (selectedTimezone === 'auto') {
      return new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'PST';
    }
    const tz = TIMEZONES.find(t => t.value === selectedTimezone);
    return tz?.label || 'PST';
  }, [selectedTimezone]);

  useEffect(() => {
    const currentDay = plannerData.find(day => day.date === dateString);
    if (currentDay) {
      if (currentDay.tasks) {
        setTasks(currentDay.tasks);
      } else {
        setTasks("");
      }

      if (currentDay.greatDay) {
        setGreatDay(currentDay.greatDay);
      } else {
        setGreatDay("");
      }

      if (currentDay.grateful) {
        setGrateful(currentDay.grateful);
      } else {
        setGrateful("");
      }
    } else {
      setTasks("");
      setGreatDay("");
      setGrateful("");
    }
  }, [dateString, plannerData]);

  const currentDay = useMemo(() => (
    plannerData.find(day => day.date === dateString) || {
      date: dateString,
      items: [],
      tasks: "",
      greatDay: "",
      grateful: ""
    }
  ), [dateString, plannerData]);

  const getSectionItems = useCallback((section: PlannerItem["section"]) => {
    const filtered = currentDay.items.filter(item => item.section === section);
    // Sort by order if available, otherwise maintain array order
    return filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
  }, [currentDay.items]);

  const hasItems = currentDay.items.length > 0;
  const daysWithItems = useMemo(() => (
    plannerData
      .filter(day => day.items && day.items.length > 0)
      .map(day => new Date(day.date))
  ), [plannerData]);

  // Convert 24-hour format (HH:MM) to 12-hour format (h:mm am/pm)
  const convert24To12Hour = useCallback((time24: string): string => {
    if (!time24 || !time24.includes(':')) return '';
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMin = minute.toString().padStart(2, '0');

    return `${displayHour}:${displayMin} ${period}`;
  }, []);

  // Convert 12-hour format (h:mm am/pm) to 24-hour format (HH:MM)
  const convert12To24Hour = useCallback((time12: string): string => {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return '';

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3].toLowerCase();

    // Validate hour is in 12-hour format (1-12)
    // If user enters 13-23, wrap to 1-11 (they probably meant 1:30 not 13:30 with AM/PM)
    if (hour > 12) {
      hour = hour % 12;
      if (hour === 0) hour = 12;
    }

    // Ensure hour is at least 1
    if (hour < 1) hour = 1;

    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }, []);

  return {
    state: {
      selectedDate,
      plannerData,
      copyToDate,
      isCopyDialogOpen,
      deleteAfterCopy,
      currentView,
      selectedTimezone,
      calendarFilterMode,
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
      globalTasks,
      allTasks,
      isAllTasksCollapsed,
      showContentCalendar,
      contentCalendarData,
      isTaskDialogOpen,
      taskDialogPosition,
      editingTask,
      dialogTaskTitle,
      dialogTaskDescription,
      dialogStartTime,
      dialogEndTime,
      dialogTaskColor,
      dialogAddToContentCalendar,
      pendingTaskFromAllTasks,
      tasks,
      greatDay,
      grateful,
      calendarOpen,
      weeklyNewTaskInputs,
      weeklyAddingTask,
      weeklyEditingTask,
      weeklyEditText,
      draggedWeeklyTaskId,
      dragOverWeeklyTaskId,
      weeklyDropIndicatorPosition,
      weeklyEditDialogOpen,
      weeklyEditDescription,
      weeklyEditColor,
      weeklyEditTitle,
      weeklyEditingTitle,
      isDraggingOverAllTasks,
      draggingTaskText,
      showTasks,
      showContent,
      contentDisplayMode,
      productionContent,
    },
    setters: {
      setSelectedDate,
      setPlannerData,
      setCopyToDate,
      setIsCopyDialogOpen,
      setDeleteAfterCopy,
      setCurrentView,
      setSelectedTimezone,
      setCalendarFilterMode,
      setContentDisplayMode,
      setProductionContent,
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
      setIsAllTasksCollapsed,
      setShowContentCalendar,
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
      setCalendarOpen,
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
    },
    refs: {
      todayScrollRef,
      weeklyScrollRef,
      titleInputRef,
      startTimeInputRef,
      endTimeInputRef,
      descriptionInputRef,
      isResizingRef,
    },
    derived: {
      dateString,
      currentDay,
      getSectionItems,
      hasItems,
      daysWithItems,
      colors,
      colorOptions,
      getTimezoneDisplay,
    },
    helpers: {
      convert24To12Hour,
      convert12To24Hour,
      loadProductionContent,
    },
  };
};

export type PlannerState = ReturnType<typeof usePlannerState>["state"];
export type PlannerSetters = ReturnType<typeof usePlannerState>["setters"];
export type PlannerRefs = ReturnType<typeof usePlannerState>["refs"];
export type PlannerDerived = ReturnType<typeof usePlannerState>["derived"];
export type PlannerHelpers = ReturnType<typeof usePlannerState>["helpers"];
