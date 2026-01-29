import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { Trash2, Video, Lightbulb, X, Clock, FileText, ArrowRight, ListTodo, Check, GripHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { autoFormatTime } from "../utils/timeUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";
import { parseTimeTo24 } from "../utils/timeUtils";
import { scheduleColors, defaultScheduledColor, getTaskColorByHex, isColorDark } from "../utils/colorConstants";
import { TaskColorPicker } from "./TaskColorPicker";
import { TimePicker } from "./TimePicker";
import { useColorPalette } from "../hooks/useColorPalette";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { defaultColumns } from "@/pages/production/utils/productionConstants";
import { ContentDisplayMode } from "../hooks/usePlannerState";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  getTimezoneDisplay: () => string;
  handleTimezoneChange: (timezone: string) => void;
  selectedTimezone: string;
  timezones: TimezoneOption[];
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  weeklyZoomLevel: number;
  isTaskDialogOpen: boolean;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  isResizingRef: React.MutableRefObject<boolean>;
  editingTask: PlannerItem | null;
  dialogTaskColor: string;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskDialogPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  handleEditItem: (
    id: string,
    text: string,
    startTime?: string,
    endTime?: string,
    color?: string,
    description?: string,
    isCompleted?: boolean,
    date?: string,
    isContentCalendar?: boolean
  ) => void;
  handleToggleWeeklyTask: (id: string, dayString: string) => void;
  handleDeleteWeeklyTask: (id: string, dayString: string) => void;
  convert24To12Hour: (time: string) => string;
  showTasks?: boolean;
  showContent?: boolean;
  contentDisplayMode?: ContentDisplayMode;
  productionContent?: {
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  };
  setProductionContent?: React.Dispatch<React.SetStateAction<{
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  }>>;
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
  loadProductionContent?: () => void;
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  onOpenContentFlow?: (cardId: string) => void;
}

export const WeekView = ({
  selectedDate,
  plannerData,
  allTasks,
  setAllTasks,
  setPlannerData,
  savePlannerData,
  saveAllTasks,
  getTimezoneDisplay,
  handleTimezoneChange,
  selectedTimezone,
  timezones,
  weeklyScrollRef,
  weeklyZoomLevel,
  isTaskDialogOpen,
  weeklyDraggingCreate,
  weeklyDragCreateStart,
  weeklyDragCreateEnd,
  setWeeklyDraggingCreate,
  setWeeklyDragCreateStart,
  setWeeklyDragCreateEnd,
  setDraggedWeeklyTaskId,
  isResizingRef,
  editingTask,
  dialogTaskColor,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setIsTaskDialogOpen,
  setTaskDialogPosition,
  handleEditItem,
  handleToggleWeeklyTask,
  handleDeleteWeeklyTask,
  convert24To12Hour,
  showTasks = true,
  showContent = false,
  contentDisplayMode = 'tasks',
  productionContent = { scheduled: [], planned: [] },
  setProductionContent,
  weeklyAddDialogState,
  setWeeklyAddDialogState,
  loadProductionContent,
  onOpenContentDialog,
  onOpenContentFlow,
}: WeekViewProps) => {
  const navigate = useNavigate();


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

    const newTask: PlannerItem = {
      id: `task-${Date.now()}`,
      text: taskTitle.trim(),
      completed: false,
      section: 'morning',
      date: addDialogDate,
      startTime: taskStartTime || addDialogStartTime || undefined,
      endTime: taskEndTime || addDialogEndTime || undefined,
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
        ideateColumn = { id: 'ideate', title: 'Ideate', cards: [] };
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
        loadProductionContent?.();
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
            loadProductionContent?.();
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

  return (
    <>
      <CardContent className="px-0 h-full flex flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white">
          {/* Fixed header row */}
          <div className="flex border-b border-gray-200">
            {/* Time column header */}
            <div className="flex-shrink-0 bg-white border-r border-gray-200 h-[60px]" style={{ width: '40px' }}>
            </div>
            {/* Day headers */}
            <div className="flex-1 grid grid-cols-7 gap-0">
              {eachDayOfInterval({
                start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                end: endOfWeek(selectedDate, { weekStartsOn: 1 })
              }).map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const isPast = day < new Date() && !isToday;
                return (
                  <div
                    key={getDateString(day)}
                    className={cn(
                      "h-[60px] flex flex-col items-center justify-center transition-colors hover:bg-gray-100",
                      isToday
                        ? contentDisplayMode === 'tasks' ? 'bg-[#7A909F]/5' : 'bg-[#8B7082]/5'
                        : 'bg-gray-50'
                    )}
                    style={{
                      borderRight: index < 6 ? '1px solid #f3f4f6' : 'none',
                      opacity: isPast ? 0.5 : 1
                    }}
                  >
                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {format(day, "EEE")}
                    </div>
                    <div className={cn(
                      "text-lg font-semibold",
                      isToday
                        ? "bg-[#8B7082] text-white w-8 h-8 rounded-full flex items-center justify-center"
                        : "text-gray-900"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable timeline area */}
          <div ref={weeklyScrollRef} className="flex-1 min-h-0 overflow-auto">
              <div className="flex">
                {/* Time column */}
                <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: '40px' }}>
                  <div
                    data-zoom-container="weekly-time"
                    className="relative"
                    style={{ height: `${24 * 48 * weeklyZoomLevel}px` }}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        data-hour-row={hour}
                        className="absolute left-0 right-0 flex items-start justify-end pr-1 pt-0.5"
                        style={{ top: `${hour * 48 * weeklyZoomLevel}px`, height: `${48 * weeklyZoomLevel}px` }}
                      >
                        <span className="text-[10px] text-gray-400 leading-none">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day columns */}
                <div className="flex-1 grid grid-cols-7 gap-0 relative">
                  {/* Horizontal grid lines spanning all days */}
                  <div className="absolute inset-0 pointer-events-none" style={{ height: `${24 * 48 * weeklyZoomLevel}px` }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        data-grid-line={hour}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${hour * 48 * weeklyZoomLevel}px`,
                          borderTop: '1px solid #eceef0'
                        }}
                      />
                    ))}
                  </div>

                  {eachDayOfInterval({
                    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                    end: endOfWeek(selectedDate, { weekStartsOn: 1 })
                  }).map((day, index) => {
                    const dayString = getDateString(day);
                    const dayData = plannerData.find(d => d.date === dayString);
                    const isToday = isSameDay(day, new Date());
                    const isPast = day < new Date() && !isToday;

                    const dayColor = isToday ? 'bg-white' : 'bg-white';

                    return (
                      <div
                        key={dayString}
                        data-day-column={dayString}
                        className={`${dayColor} transition-colors`}
                        style={{ borderRight: index < 6 ? '1px solid #eceef0' : 'none' }}
                      >
                        {/* Timeline container */}
                        <div className="relative" data-timeline style={{ height: `${24 * 48 * weeklyZoomLevel}px` }}>

                          {/* Time slot grid for drag and drop */}
                          {Array.from({ length: 24 }, (_, hour) => (
                            <div
                              key={`slot-${hour}`}
                              data-time-slot={hour}
                              className="absolute left-0 right-0 pointer-events-none"
                              style={{ top: `${hour * 48 * weeklyZoomLevel}px`, height: `${48 * weeklyZoomLevel}px`, zIndex: 100 }}
                            >
                              <div
                                className={`h-full w-full relative transition-colors ${(isTaskDialogOpen || addDialogOpen) ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'} ${Object.values(weeklyDraggingCreate).some(v => v) ? '' : 'hover:bg-gray-100'}`}
                                onMouseDown={(e) => {
                                  // Don't allow drag-to-create when dialog is open
                                  if (isTaskDialogOpen || addDialogOpen) return;

                                  // Only start drag create if clicking directly on this div (not on a task)
                                  const target = e.target as HTMLElement;
                                  if (target === e.currentTarget) {
                                    e.preventDefault();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const relativeY = e.clientY - rect.top;
                                    const minuteFraction = relativeY / (48 * weeklyZoomLevel); // 48px per hour * zoom
                                    // Round to nearest 30 minutes (0 or 30)
                                    const rawMinute = Math.floor(minuteFraction * 60);
                                    const minute = Math.round(rawMinute / 30) * 30;

                                    setWeeklyDraggingCreate(prev => ({ ...prev, [dayString]: true }));
                                    setWeeklyDragCreateStart(prev => ({
                                      ...prev,
                                      [dayString]: { hour, minute }
                                    }));
                                    setWeeklyDragCreateEnd(prev => ({
                                      ...prev,
                                      [dayString]: { hour, minute }
                                    }));
                                  }
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.currentTarget.classList.add('bg-blue-100');
                                }}
                                onDragLeave={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.classList.remove('bg-blue-100');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.currentTarget.classList.remove('bg-blue-100');

                                  const taskId = e.dataTransfer.getData('taskId');
                                  const contentId = e.dataTransfer.getData('contentId');
                                  const contentType = e.dataTransfer.getData('contentType');
                                  const fromDate = e.dataTransfer.getData('fromDate');
                                  const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

                                  // Handle content drops (move between days)
                                  if (contentId && contentType) {
                                    const savedData = getString(StorageKeys.productionKanban);
                                    if (savedData) {
                                      try {
                                        const columns: KanbanColumn[] = JSON.parse(savedData);

                                        if (contentType === 'scheduled') {
                                          const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
                                          if (toScheduleColumn) {
                                            const card = toScheduleColumn.cards.find(c => c.id === contentId);
                                            if (card) {
                                              card.scheduledDate = dayString;
                                              card.schedulingStatus = 'scheduled';
                                              setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                              emit(window, EVENTS.productionKanbanUpdated);
                                              emit(window, EVENTS.scheduledContentUpdated);
                                              loadProductionContent?.();
                                              toast.success('Content moved to ' + format(new Date(dayString + 'T12:00:00'), 'MMM d'));
                                            }
                                          }
                                        } else if (contentType === 'planned') {
                                          const ideateColumn = columns.find(c => c.id === 'ideate');
                                          if (ideateColumn) {
                                            const card = ideateColumn.cards.find(c => c.id === contentId);
                                            if (card) {
                                              card.plannedDate = dayString;
                                              setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                              emit(window, EVENTS.productionKanbanUpdated);
                                              emit(window, EVENTS.scheduledContentUpdated);
                                              loadProductionContent?.();
                                              toast.success('Content idea moved to ' + format(new Date(dayString + 'T12:00:00'), 'MMM d'));
                                            }
                                          }
                                        }
                                      } catch (err) {
                                        console.error('Error moving content:', err);
                                      }
                                    }
                                    return;
                                  }

                                  if (!taskId) return;

                                  // Calculate minute based on position within the hour
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const relativeY = e.clientY - rect.top;
                                  const minuteFraction = relativeY / (48 * weeklyZoomLevel); // 48px per hour * zoom
                                  const minute = Math.floor(minuteFraction * 60);
                                  const roundedMinute = Math.round(minute / 30) * 30; // Round to 30-minute intervals

                                  const hourStr = hour.toString().padStart(2, '0');
                                  const minuteStr = roundedMinute.toString().padStart(2, '0');
                                  const startTime = `${hourStr}:${minuteStr}`;

                                  // Calculate duration to preserve when moving
                                  let durationMinutes = 20; // Default 20-minute duration
                                  let endTime = '';

                                  if (fromAllTasks === 'true') {
                                    // Task from All Tasks - place directly without dialog
                                    const taskToMove = allTasks.find(t => t.id === taskId);
                                    if (!taskToMove) return;

                                    // Check if task already has times (duration to preserve)
                                    if (taskToMove.startTime && taskToMove.endTime) {
                                      const [oldStartHour, oldStartMinute] = taskToMove.startTime.split(':').map(Number);
                                      const [oldEndHour, oldEndMinute] = taskToMove.endTime.split(':').map(Number);
                                      durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);
                                    }

                                    // Calculate new end time with preserved duration
                                    const newStartMinutes = hour * 60 + roundedMinute;
                                    const newEndMinutes = newStartMinutes + durationMinutes;
                                    const newEndHour = Math.floor(newEndMinutes / 60);
                                    const newEndMinute = newEndMinutes % 60;
                                    endTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                                    // Remove from All Tasks
                                    const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                                    setAllTasks(filteredAllTasks);

                                    // Add to this day with calculated time
                                    const updatedPlannerData = [...plannerData];
                                    const toDayIndex = updatedPlannerData.findIndex(d => d.date === dayString);

                                    const newTask: PlannerItem = {
                                      id: taskToMove.id,
                                      date: dayString,
                                      text: taskToMove.text,
                                      section: 'morning',
                                      isCompleted: taskToMove.isCompleted || false,
                                      order: 0,
                                      startTime: startTime,
                                      endTime: endTime,
                                      color: taskToMove.color,
                                      description: taskToMove.description,
                                      isContentCalendar: taskToMove.isContentCalendar
                                    };

                                    if (toDayIndex >= 0) {
                                      updatedPlannerData[toDayIndex] = {
                                        ...updatedPlannerData[toDayIndex],
                                        items: [...updatedPlannerData[toDayIndex].items, newTask]
                                      };
                                    } else {
                                      updatedPlannerData.push({
                                        date: dayString,
                                        items: [newTask],
                                        tasks: "",
                                        greatDay: "",
                                        grateful: ""
                                      });
                                    }

                                    setPlannerData(updatedPlannerData);
                                    savePlannerData(updatedPlannerData);
                                  } else if (fromDate && fromDate === dayString) {
                                    // Task moving within the same day to a different time
                                    const dayIndex = plannerData.findIndex(d => d.date === fromDate);
                                    if (dayIndex < 0) return;

                                    const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
                                    if (!taskToMove) return;

                                    // Preserve duration if task has times
                                    if (taskToMove.startTime && taskToMove.endTime) {
                                      const [oldStartHour, oldStartMinute] = taskToMove.startTime.split(':').map(Number);
                                      const [oldEndHour, oldEndMinute] = taskToMove.endTime.split(':').map(Number);
                                      durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);
                                    }

                                    // Calculate new end time with preserved duration
                                    const newStartMinutes = hour * 60 + roundedMinute;
                                    const newEndMinutes = newStartMinutes + durationMinutes;
                                    const newEndHour = Math.floor(newEndMinutes / 60);
                                    const newEndMinute = newEndMinutes % 60;
                                    endTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                                    // Update the task with new time
                                    const updatedPlannerData = [...plannerData];
                                    updatedPlannerData[dayIndex] = {
                                      ...updatedPlannerData[dayIndex],
                                      items: updatedPlannerData[dayIndex].items.map(item =>
                                        item.id === taskId
                                          ? { ...item, startTime: startTime, endTime: endTime }
                                          : item
                                      )
                                    };

                                    setPlannerData(updatedPlannerData);
                                    savePlannerData(updatedPlannerData);
                                  } else if (fromDate && fromDate !== dayString) {
                                    // Task moving between days - update time
                                    const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
                                    if (fromDayIndex < 0) return;

                                    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
                                    if (!taskToMove) return;

                                    // Preserve duration if task has times
                                    if (taskToMove.startTime && taskToMove.endTime) {
                                      const [oldStartHour, oldStartMinute] = taskToMove.startTime.split(':').map(Number);
                                      const [oldEndHour, oldEndMinute] = taskToMove.endTime.split(':').map(Number);
                                      durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);
                                    }

                                    // Calculate new end time with preserved duration
                                    const newStartMinutes = hour * 60 + roundedMinute;
                                    const newEndMinutes = newStartMinutes + durationMinutes;
                                    const newEndHour = Math.floor(newEndMinutes / 60);
                                    const newEndMinute = newEndMinutes % 60;
                                    endTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                                    // Remove from source day
                                    const updatedPlannerData = [...plannerData];
                                    updatedPlannerData[fromDayIndex] = {
                                      ...updatedPlannerData[fromDayIndex],
                                      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
                                    };

                                    // Add to destination day with new time
                                    const toDayIndex = updatedPlannerData.findIndex(d => d.date === dayString);
                                    const movedTask = { ...taskToMove, date: dayString, startTime: startTime, endTime: endTime };

                                    if (toDayIndex >= 0) {
                                      updatedPlannerData[toDayIndex] = {
                                        ...updatedPlannerData[toDayIndex],
                                        items: [...updatedPlannerData[toDayIndex].items, movedTask]
                                      };
                                    } else {
                                      updatedPlannerData.push({
                                        date: dayString,
                                        items: [movedTask],
                                        tasks: "",
                                        greatDay: "",
                                        grateful: ""
                                      });
                                    }

                                    setPlannerData(updatedPlannerData);
                                    savePlannerData(updatedPlannerData);
                                  }
                                }}
                              />
                            </div>
                          ))}

                          {/* Content positioned absolutely by time */}
                          {showContent && (() => {
                            // Get content for this day
                            const scheduledContent = productionContent.scheduled.filter(c =>
                              c.scheduledDate?.split('T')[0] === dayString
                            );
                            const plannedContent = productionContent.planned.filter(c =>
                              c.plannedDate?.split('T')[0] === dayString
                            );
                            const allContent = [...scheduledContent, ...plannedContent];

                            // Check if any tasks for this day have dark colors
                            const dayTasks = dayData?.items || [];
                            const hasDarkTasks = dayTasks.some(task => isColorDark(task.color));
                            // Include content with either planned or scheduled time fields
                            const timedContent = allContent.filter(c =>
                              (c.plannedStartTime && c.plannedEndTime) ||
                              (c.scheduledStartTime && c.scheduledEndTime)
                            );

                            return timedContent.map((content) => {
                              // Use scheduled times if available, otherwise use planned times
                              const startTimeStr = content.scheduledStartTime || content.plannedStartTime!;
                              const endTimeStr = content.scheduledEndTime || content.plannedEndTime!;

                              const [startHour, startMinute] = startTimeStr.split(':').map(Number);
                              const [endHour, endMinute] = endTimeStr.split(':').map(Number);
                              const startTotalMinutes = startHour * 60 + startMinute;
                              const endTotalMinutes = endHour * 60 + endMinute;
                              const durationMinutes = Math.max(endTotalMinutes - startTotalMinutes, 30);

                              const topPos = startTotalMinutes * 0.8 * weeklyZoomLevel;
                              const height = Math.max(durationMinutes * 0.8 * weeklyZoomLevel - 1, 20);

                              const isPlanned = !content.scheduledDate;
                              const colors = isPlanned
                                ? { bg: '#F5F2F4', text: '#8B7082' }
                                : defaultScheduledColor;

                              return (
                                <div
                                  key={content.id}
                                  data-time-item
                                  data-start-minutes={startTotalMinutes}
                                  data-duration-minutes={durationMinutes}
                                  draggable={true}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    e.dataTransfer.setData('contentId', content.id);
                                    e.dataTransfer.setData('contentType', isPlanned ? 'planned' : 'scheduled');
                                    e.dataTransfer.setData('fromDate', dayString);
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.currentTarget.style.opacity = '0.5';
                                  }}
                                  onDragEnd={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                  onClick={() => {
                                    if (isPlanned) {
                                      onOpenContentDialog?.(content, 'planned');
                                    } else {
                                      // Open content flow dialog directly for scheduled content
                                      onOpenContentFlow?.(content.id);
                                    }
                                  }}
                                  className={cn(
                                    "absolute rounded-2xl cursor-pointer hover:brightness-95 overflow-hidden group border-l-4",
                                    "shadow-[0_2px_8px_rgba(139,112,130,0.25)] hover:shadow-[0_4px_12px_rgba(139,112,130,0.35)]"
                                  )}
                                  style={{
                                    top: `${topPos}px`,
                                    height: `${height}px`,
                                    // In "Both" mode: content on right side (45% width). In "Content only" mode: full width
                                    ...(showTasks ? { right: '4px', width: '45%' } : { left: '4px', width: '85%' }),
                                    background: isPlanned
                                      ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F2F4 50%, #E0D5DC 100%)'
                                      : 'linear-gradient(180deg, #A08898 0%, #8B7082 50%, #5A4052 100%)',
                                    borderLeftColor: isPlanned ? '#B8A0AD' : '#4a2a3f',
                                    zIndex: 120,
                                  }}
                                >
                                  <div className="p-1 h-full flex flex-col">
                                    <div className="flex items-start gap-1">
                                      {isPlanned ? (
                                        <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: colors.text }} />
                                      ) : (
                                        <button
                                          onClick={(e) => handleToggleComplete(content.id, e)}
                                          className={cn(
                                            "w-3 h-3 rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                                            content.isCompleted ? "bg-white border-white" : "hover:bg-current/20"
                                          )}
                                          style={{ borderColor: content.isCompleted ? 'white' : colors.text }}
                                        >
                                          {content.isCompleted && <Check className="w-2 h-2 text-[#612A4F]" />}
                                        </button>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className={cn(
                                          "text-[10px] font-medium line-clamp-2",
                                          content.isCompleted && "line-through opacity-60"
                                        )} style={{ color: colors.text }}>
                                          {content.hook || content.title}
                                        </div>
                                        <div className="text-[8px] opacity-70 leading-tight" style={{ color: colors.text }}>
                                          {convert24To12Hour(startTimeStr)} - {convert24To12Hour(endTimeStr)}
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteContent(content.id, isPlanned ? 'planned' : 'scheduled');
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}

                          {/* Tasks positioned absolutely by time */}
                          {showTasks && (() => {
                            const tasksWithTimes = (dayData?.items || []).filter(item => item.startTime && item.endTime);

                            // Calculate time ranges and detect overlaps
                            const tasksWithLayout = tasksWithTimes.map((task) => {
                              const [startHour, startMinute] = task.startTime!.split(':').map(Number);
                              const [endHour, endMinute] = task.endTime!.split(':').map(Number);
                              const startTotalMinutes = startHour * 60 + startMinute;
                              const endTotalMinutes = endHour * 60 + endMinute;
                              const durationMinutes = endTotalMinutes - startTotalMinutes;

                              return {
                                task,
                                startMinutes: startTotalMinutes,
                                endMinutes: endTotalMinutes,
                                durationMinutes,
                                column: 0,
                                totalColumns: 1,
                                isBackground: false,
                                inOverlapGroup: false
                              };
                            });

                            // Detect overlaps and assign columns
                            const processedTasks = new Set<typeof tasksWithLayout[0]>();

                            for (let i = 0; i < tasksWithLayout.length; i++) {
                              const currentTask = tasksWithLayout[i];

                              // Skip if already processed as part of another group
                              if (processedTasks.has(currentTask)) continue;

                              const overlappingTasks = [currentTask];

                              // Find all tasks that overlap with this one
                              for (let j = i + 1; j < tasksWithLayout.length; j++) {
                                const otherTask = tasksWithLayout[j];

                                // Check if this task overlaps with ANY task in the current group
                                const overlapsWithGroup = overlappingTasks.some(groupTask =>
                                  (groupTask.startMinutes < otherTask.endMinutes &&
                                   groupTask.endMinutes > otherTask.startMinutes)
                                );

                                if (overlapsWithGroup && !overlappingTasks.includes(otherTask)) {
                                  overlappingTasks.push(otherTask);
                                }
                              }

                              // Mark all tasks in this group as processed
                              overlappingTasks.forEach(t => processedTasks.add(t));

                              // Assign columns to overlapping tasks
                              if (overlappingTasks.length > 1) {
                                // Find the longest task - it should be the background
                                const longestTask = overlappingTasks.reduce((longest, current) =>
                                  current.durationMinutes > longest.durationMinutes ? current : longest
                                );

                                // Mark longest task as background (full width, behind others)
                                longestTask.isBackground = true;
                                longestTask.column = 0;
                                longestTask.totalColumns = 1;
                                longestTask.inOverlapGroup = true;

                                // Other tasks are positioned on top - but only in columns if they directly overlap
                                const foregroundTasks = overlappingTasks.filter(t => t !== longestTask);

                                // Group foreground tasks that directly overlap with each other
                                const directOverlapGroups: typeof foregroundTasks[] = [];
                                const assignedToGroup = new Set<typeof foregroundTasks[0]>();

                                for (const task of foregroundTasks) {
                                  if (assignedToGroup.has(task)) continue;

                                  const group = [task];
                                  assignedToGroup.add(task);

                                  // Find other foreground tasks that directly overlap with this one
                                  for (const otherTask of foregroundTasks) {
                                    if (assignedToGroup.has(otherTask)) continue;

                                    // Check if otherTask overlaps with any task in current group
                                    const overlapsWithGroup = group.some(groupTask =>
                                      groupTask.startMinutes < otherTask.endMinutes &&
                                      groupTask.endMinutes > otherTask.startMinutes
                                    );

                                    if (overlapsWithGroup) {
                                      group.push(otherTask);
                                      assignedToGroup.add(otherTask);
                                    }
                                  }

                                  directOverlapGroups.push(group);
                                }

                                // Assign columns within each direct overlap group
                                for (const group of directOverlapGroups) {
                                  const totalColumns = group.length;
                                  group.forEach((t, idx) => {
                                    t.column = idx;
                                    t.totalColumns = totalColumns;
                                    t.isBackground = false;
                                    t.inOverlapGroup = true;
                                  });
                                }
                              }
                            }

                            return tasksWithLayout.map(({ task: item, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
                              const durationMinutes = endMinutes - startMinutes;
                              const topPos = startMinutes * 0.8 * weeklyZoomLevel;
                              const height = Math.max(durationMinutes * 0.8 * weeklyZoomLevel - 1, 20);

                              // Get task color info - use preview color if this task is being edited
                              const isBeingEdited = editingTask?.id === item.id;
                              const colorToUse = isBeingEdited && dialogTaskColor ? dialogTaskColor : item.color;
                              const taskColorInfo = getTaskColorByHex(colorToUse);

                              // Calculate width and position for overlapping tasks
                              // When showing both content and tasks, tasks take left 50%, content takes right 45%
                              const maxTaskWidth = showContent ? 50 : 85;
                              let widthPercent, leftPercent, zIndex;

                              if (isBackground) {
                                // Background task
                                widthPercent = maxTaskWidth;
                                leftPercent = 0;
                                zIndex = 105;
                              } else if (inOverlapGroup) {
                                // Foreground tasks: position starting from left for better visibility
                                const availableSpace = showContent ? 40 : 70;
                                const startPosition = showContent ? 5 : 10;
                                widthPercent = availableSpace / totalColumns;
                                leftPercent = startPosition + (column * widthPercent);
                                zIndex = 115 + column;
                              } else {
                                // Standalone task (no overlap)
                                widthPercent = maxTaskWidth;
                                leftPercent = 0;
                                zIndex = 110;
                              }

                              return (
                                <div
                                  key={item.id}
                                  data-time-item
                                  data-start-minutes={startMinutes}
                                  data-duration-minutes={durationMinutes}
                                  className="absolute group px-1"
                                  style={{
                                    top: `${topPos}px`,
                                    height: `${height}px`,
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    zIndex
                                  }}
                                >
                                  <div
                                    draggable={true}
                                    onDragStart={(e) => {
                                      // Prevent drag if clicking on resize handle
                                      const target = e.target as HTMLElement;
                                      if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
                                        e.preventDefault();
                                        return;
                                      }
                                      console.log('🚀 DRAG START - Weekly Task:', item.id, item.text, 'from:', dayString);
                                      setDraggedWeeklyTaskId(item.id);
                                      e.dataTransfer.setData('text/plain', item.id);
                                      e.dataTransfer.setData('taskId', item.id);
                                      e.dataTransfer.setData('fromDate', dayString);
                                      e.dataTransfer.setData('fromAllTasks', 'false');
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                      e.currentTarget.style.opacity = isPast ? '0.5' : '1';
                                      setDraggedWeeklyTaskId(null);
                                    }}
                                    onClick={(e) => {
                                      if (isResizingRef.current) {
                                        return;
                                      }
                                      setEditingTask(item);
                                      setDialogTaskTitle(item.text);
                                      setDialogTaskDescription(item.description || "");
                                      setDialogStartTime(item.startTime ? convert24To12Hour(item.startTime) : "");
                                      setDialogEndTime(item.endTime ? convert24To12Hour(item.endTime) : "");
                                      setDialogTaskColor(item.color || "");
                                      setDialogAddToContentCalendar(item.isContentCalendar || false);
                                      setTaskDialogPosition({ x: e.clientX, y: e.clientY });
                                      setIsTaskDialogOpen(true);
                                    }}
                                    className="h-full relative rounded cursor-pointer hover:brightness-95 transition-all border-l-4"
                                    style={{
                                      backgroundColor: taskColorInfo.fill,
                                      borderLeftColor: taskColorInfo.border,
                                      opacity: isPast ? 0.6 : 0.9,
                                      padding: '4px 4px',
                                    }}
                                  >
                                    {/* Resize handles */}
                                    <div
                                      className="resize-handle absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-blue-400/30"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        isResizingRef.current = true;
                                        const startY = e.clientY;
                                        const originalStartTime = item.startTime!;

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                          const deltaY = moveEvent.clientY - startY;
                                          const deltaMinutes = Math.round(deltaY / 0.8);
                                          const [hour, minute] = originalStartTime.split(':').map(Number);
                                          const originalMinutes = hour * 60 + minute;
                                          // Snap to 10-minute intervals
                                          const rawNewMinutes = originalMinutes + deltaMinutes;
                                          const newMinutes = Math.max(0, Math.min(1439, Math.round(rawNewMinutes / 10) * 10));

                                          // Get end time in minutes
                                          const [endHour, endMinute] = item.endTime!.split(':').map(Number);
                                          const endTotalMinutes = endHour * 60 + endMinute;

                                          // Ensure start time is before end time (at least 10 min duration)
                                          if (newMinutes < endTotalMinutes - 10) {
                                            const newHour = Math.floor(newMinutes / 60);
                                            const newMinute = newMinutes % 60;
                                            const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

                                            handleEditItem(item.id, item.text, newStartTime, item.endTime, item.color, item.description, item.isCompleted, dayString, item.isContentCalendar);
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
                                      }}
                                    />

                                    <div
                                      className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-blue-400/30"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        isResizingRef.current = true;
                                        const startY = e.clientY;
                                        const originalEndTime = item.endTime!;

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                          const deltaY = moveEvent.clientY - startY;
                                          const deltaMinutes = Math.round(deltaY / 0.8);
                                          const [hour, minute] = originalEndTime.split(':').map(Number);
                                          const originalMinutes = hour * 60 + minute;
                                          // Snap to 10-minute intervals
                                          const rawNewMinutes = originalMinutes + deltaMinutes;
                                          const newMinutes = Math.max(0, Math.min(1439, Math.round(rawNewMinutes / 10) * 10));

                                          // Get start time in minutes
                                          const [startHour, startMinute] = item.startTime!.split(':').map(Number);
                                          const startTotalMinutes = startHour * 60 + startMinute;

                                          // Ensure end time is after start time (at least 10 min duration)
                                          if (newMinutes > startTotalMinutes + 10) {
                                            const newHour = Math.floor(newMinutes / 60);
                                            const newMinute = newMinutes % 60;
                                            const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

                                            handleEditItem(item.id, item.text, item.startTime, newEndTime, item.color, item.description, item.isCompleted, dayString, item.isContentCalendar);
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
                                      }}
                                    />

                                    {/* Task content */}
                                    <div className="h-full relative z-30 flex items-start gap-0.5">
                                      <Checkbox
                                        checked={item.isCompleted}
                                        onCheckedChange={() => {
                                          handleToggleWeeklyTask(item.id, dayString);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-0.5 h-2.5 w-2.5 flex-shrink-0"
                                      />
                                      <div className="flex-1 min-w-0 flex flex-col">
                                        <div
                                          className={`text-[11px] font-medium leading-tight line-clamp-2 ${item.isCompleted ? 'line-through opacity-50' : ''}`}
                                          style={{ color: taskColorInfo.text }}
                                        >
                                          {item.text}
                                        </div>
                                        {(item.startTime || item.endTime) && (
                                          <div className="text-[9px] mt-1 opacity-70 leading-tight" style={{ color: taskColorInfo.text }}>
                                            {item.startTime && <span>{convert24To12Hour(item.startTime)}</span>}
                                            {item.startTime && item.endTime && <span className="mx-0.5">-</span>}
                                            {item.endTime && <span>{convert24To12Hour(item.endTime)}</span>}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleDeleteWeeklyTask(item.id, dayString);
                                        }}
                                        className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative z-[200] pointer-events-auto"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}

                          {/* Content items and Tasks without time in list format */}
                          <div
                            className="absolute top-0 left-0 right-0 px-1 py-2 flex flex-col gap-px cursor-default z-[101] pointer-events-auto"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.classList.add('bg-violet-50/50');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('bg-violet-50/50');
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.classList.remove('bg-violet-50/50');

                              const contentId = e.dataTransfer.getData('contentId');
                              const contentType = e.dataTransfer.getData('contentType');
                              const fromDate = e.dataTransfer.getData('fromDate');

                              // Handle content drops (move between days)
                              if (contentId && contentType && fromDate !== dayString) {
                                const savedData = getString(StorageKeys.productionKanban);
                                if (savedData) {
                                  try {
                                    const columns: KanbanColumn[] = JSON.parse(savedData);

                                    if (contentType === 'scheduled') {
                                      const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
                                      if (toScheduleColumn) {
                                        const card = toScheduleColumn.cards.find(c => c.id === contentId);
                                        if (card) {
                                          card.scheduledDate = dayString;
                                          card.schedulingStatus = 'scheduled';
                                          setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                          emit(window, EVENTS.productionKanbanUpdated);
                                          emit(window, EVENTS.scheduledContentUpdated);
                                          loadProductionContent?.();
                                          toast.success('Content moved to ' + format(new Date(dayString + 'T12:00:00'), 'MMM d'));
                                        }
                                      }
                                    } else if (contentType === 'planned') {
                                      const ideateColumn = columns.find(c => c.id === 'ideate');
                                      if (ideateColumn) {
                                        const card = ideateColumn.cards.find(c => c.id === contentId);
                                        if (card) {
                                          card.plannedDate = dayString;
                                          setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                          emit(window, EVENTS.productionKanbanUpdated);
                                          emit(window, EVENTS.scheduledContentUpdated);
                                          loadProductionContent?.();
                                          toast.success('Content idea moved to ' + format(new Date(dayString + 'T12:00:00'), 'MMM d'));
                                        }
                                      }
                                    }
                                  } catch (err) {
                                    console.error('Error moving content:', err);
                                  }
                                }
                              }
                            }}
                          >
                            {/* Untimed content (scheduled and planned) */}
                            {showContent && (() => {
                              const scheduledContent = productionContent.scheduled.filter(c =>
                                c.scheduledDate?.split('T')[0] === dayString
                              );
                              const plannedContent = productionContent.planned.filter(c =>
                                c.plannedDate?.split('T')[0] === dayString
                              );
                              const allContent = [...scheduledContent, ...plannedContent];
                              const untimedContent = allContent.filter(c =>
                                (!c.plannedStartTime || !c.plannedEndTime) &&
                                (!c.scheduledStartTime || !c.scheduledEndTime)
                              );

                              // Check if any tasks for this day have dark colors
                              const dayTasks = dayData?.items || [];
                              const hasDarkTasks = dayTasks.some(task => isColorDark(task.color));

                              return untimedContent.map((content) => {
                                const isPlanned = !content.scheduledDate;
                                const colors = isPlanned
                                  ? { bg: '#F5F2F4', text: '#8B7082' }
                                  : defaultScheduledColor;

                                return (
                                  <div
                                    key={content.id}
                                    draggable={true}
                                    onClick={() => {
                                      if (isPlanned) {
                                        onOpenContentDialog?.(content, 'planned');
                                      } else {
                                        // Open content flow dialog directly for scheduled content
                                        onOpenContentFlow?.(content.id);
                                      }
                                    }}
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      e.dataTransfer.setData('contentId', content.id);
                                      e.dataTransfer.setData('contentType', isPlanned ? 'planned' : 'scheduled');
                                      e.dataTransfer.setData('fromDate', dayString);
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                    }}
                                    className={cn(
                                      "group text-xs px-2 py-1.5 rounded-2xl transition-all cursor-pointer relative border-l-4",
                                      "shadow-[0_2px_8px_rgba(139,112,130,0.25)] hover:shadow-[0_4px_12px_rgba(139,112,130,0.35)]"
                                    )}
                                    style={{
                                      background: isPlanned
                                        ? 'linear-gradient(180deg, #FFFFFF 0%, #E8B8D0 50%, #C090A8 100%)'
                                        : 'linear-gradient(180deg, #C8A0B8 0%, #8B5070 50%, #4A2040 100%)',
                                      borderLeftColor: isPlanned ? '#B8A0AD' : '#4a2a3f',
                                      opacity: isPast ? 0.5 : 1
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {isPlanned ? (
                                        <Lightbulb className="w-3 h-3 flex-shrink-0" style={{ color: colors.text }} />
                                      ) : (
                                        <button
                                          onClick={(e) => handleToggleComplete(content.id, e)}
                                          className={cn(
                                            "w-3 h-3 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors",
                                            content.isCompleted ? "bg-white border-white" : "hover:bg-current/20"
                                          )}
                                          style={{ borderColor: content.isCompleted ? 'white' : colors.text }}
                                        >
                                          {content.isCompleted && <Check className="w-2 h-2 text-[#612A4F]" />}
                                        </button>
                                      )}
                                      <span className={cn(
                                        "break-words flex-1 text-[11px]",
                                        content.isCompleted && "line-through opacity-60"
                                      )} style={{ color: colors.text }}>
                                        {content.hook || content.title}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteContent(content.id, isPlanned ? 'planned' : 'scheduled');
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}

                            {/* Tasks without time */}
                            {showTasks && (() => {
                              const tasksWithoutTimes = (dayData?.items || []).filter(item => !item.startTime || !item.endTime);
                              return tasksWithoutTimes.map((item) => {
                                // Use preview color if this task is being edited
                                const isBeingEdited = editingTask?.id === item.id;
                                const colorToUse = isBeingEdited && dialogTaskColor ? dialogTaskColor : item.color;
                                const taskColorInfo = getTaskColorByHex(colorToUse);
                                return (
                                  <div
                                    key={item.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      console.log('🚀 DRAG START - Weekly Task:', item.id, item.text, 'from:', dayString);
                                      e.dataTransfer.setData('text/plain', item.id);
                                      e.dataTransfer.setData('taskId', item.id);
                                      e.dataTransfer.setData('fromDate', dayString);
                                      e.dataTransfer.setData('fromAllTasks', 'false');
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                      e.currentTarget.style.opacity = isPast ? '0.5' : '1';
                                    }}
                                    onClick={(e) => {
                                      setEditingTask(item);
                                      setDialogTaskTitle(item.text);
                                      setDialogTaskDescription(item.description || "");
                                      setDialogStartTime(item.startTime ? convert24To12Hour(item.startTime) : "");
                                      setDialogEndTime(item.endTime ? convert24To12Hour(item.endTime) : "");
                                      setDialogTaskColor(item.color || "");
                                      setDialogAddToContentCalendar(item.isContentCalendar || false);
                                      setTaskDialogPosition({ x: e.clientX, y: e.clientY });
                                      setIsTaskDialogOpen(true);
                                    }}
                                    className="group text-xs px-2 py-1.5 rounded-md hover:shadow-sm transition-all cursor-pointer border-l-4 relative"
                                    style={{
                                      backgroundColor: taskColorInfo.fill,
                                      borderLeftColor: taskColorInfo.border,
                                      opacity: isPast ? 0.5 : 1
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={item.isCompleted}
                                        onCheckedChange={() => handleToggleWeeklyTask(item.id, dayString)}
                                        className="h-3 w-3 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span
                                        className={`${item.isCompleted ? 'line-through opacity-50' : ''} break-words flex-1 text-[11px]`}
                                        style={{ color: taskColorInfo.text }}
                                      >
                                        {item.text}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleDeleteWeeklyTask(item.id, dayString);
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity relative z-[200] pointer-events-auto"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>

                          {/* Drag-to-create preview - only show when start and end differ (actual drag happened) */}
                          {weeklyDraggingCreate[dayString] && weeklyDragCreateStart[dayString] && weeklyDragCreateEnd[dayString] && (() => {
                            const start = weeklyDragCreateStart[dayString];
                            const end = weeklyDragCreateEnd[dayString];

                            // Don't show preview if no actual drag movement (start equals end)
                            if (start.hour === end.hour && start.minute === end.minute) {
                              return null;
                            }
                            const startMinutes = start.hour * 60 + start.minute;
                            const endMinutes = end.hour * 60 + end.minute;
                            const topPos = Math.min(startMinutes, endMinutes) * 0.8 * weeklyZoomLevel;
                            const height = Math.abs(endMinutes - startMinutes) * 0.8 * weeklyZoomLevel;
                            const actualStart = startMinutes < endMinutes ? start : end;
                            const actualEnd = startMinutes < endMinutes ? end : start;

                            // Mauve colors for drag preview
                            const bgColor = 'rgba(139, 112, 130, 0.08)';
                            const borderColor = '#B8A0B0';
                            const textColor = '#9A8090';

                            return (
                              <div
                                className="absolute left-2 right-2 rounded-lg pointer-events-none z-50 border-l-[3px] backdrop-blur-sm"
                                style={{
                                  top: `${topPos}px`,
                                  height: `${Math.max(height, 45 * weeklyZoomLevel)}px`,
                                  backgroundColor: bgColor,
                                  borderLeftColor: borderColor,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}
                              >
                                <div className="p-2 text-[10px] font-medium" style={{ color: textColor }}>
                                  {actualStart.hour === 0 ? '12' : actualStart.hour > 12 ? actualStart.hour - 12 : actualStart.hour}:{actualStart.minute.toString().padStart(2, '0')} {actualStart.hour >= 12 ? 'PM' : 'AM'}
                                  {' - '}
                                  {actualEnd.hour === 0 ? '12' : actualEnd.hour > 12 ? actualEnd.hour - 12 : actualEnd.hour}:{actualEnd.minute.toString().padStart(2, '0')} {actualEnd.hour >= 12 ? 'PM' : 'AM'}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      </CardContent>

      {/* Add Task/Content Dialog */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/15"
            onClick={() => {
              closeAddDialog();
              resetFormState();
            }}
          />

          {/* Dialog */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            style={{ transform: `translate(${dialogDragOffset.x}px, ${dialogDragOffset.y}px)` }}
          >
            {/* Drag handle */}
            <div
              onMouseDown={handleDialogDragStart}
              className="flex justify-center py-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <GripHorizontal className="w-5 h-5 text-gray-300" />
            </div>
            {/* Tabs - only show in "both" mode */}
            {contentDisplayMode === 'both' && (
              <div className="flex px-6 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAddDialogTab('task')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                    addDialogTab === 'task'
                      ? "bg-[#8B7082] text-white shadow-sm"
                      : "bg-[#F5F0F3] text-gray-700 hover:bg-[#EDE5EA]"
                  )}
                >
                  <ListTodo className="w-4 h-4" />
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setAddDialogTab('content')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                    addDialogTab === 'content'
                      ? "bg-[#8B7082] text-white shadow-sm"
                      : "bg-[#F5F0F3] text-gray-700 hover:bg-[#EDE5EA]"
                  )}
                >
                  <Lightbulb className="w-4 h-4" />
                  Add Content
                </button>
              </div>
            )}

            {/* Task Form */}
            {addDialogTab === 'task' && (
              <div className="px-6 pb-6 space-y-4 relative">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add task"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    autoFocus
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <TimePicker
                    value={taskStartTime}
                    onChange={setTaskStartTime}
                    placeholder="Start time"
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <TimePicker
                    value={taskEndTime}
                    onChange={setTaskEndTime}
                    placeholder="End time"
                    className="flex-1"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <textarea
                    placeholder="Add description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Color Picker */}
                <TaskColorPicker
                  selectedColor={taskColor}
                  onColorSelect={setTaskColor}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      closeAddDialog();
                      resetFormState();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTaskFromDialog}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#612a4f] rounded-lg hover:bg-[#4a1f3c] transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Content Form */}
            {addDialogTab === 'content' && (
              <div className="px-6 pb-4 space-y-4">
                {/* Hook/Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add hook"
                    value={contentHook}
                    onChange={(e) => setContentHook(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <TimePicker
                    value={contentStartTime}
                    onChange={setContentStartTime}
                    placeholder="Start time"
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <TimePicker
                    value={contentEndTime}
                    onChange={setContentEndTime}
                    placeholder="End time"
                    className="flex-1"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <textarea
                    placeholder="Add description"
                    value={contentNotes}
                    onChange={(e) => setContentNotes(e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>


                {/* Add to Content Hub checkbox */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    addToContentHub
                      ? "bg-gradient-to-r from-[#F5F0F3] to-[#EDE5EA] border-[#8B7082]/30 shadow-[0_2px_8px_rgba(139,112,130,0.15)]"
                      : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Checkbox
                    id="addToContentHubWeek"
                    checked={addToContentHub}
                    onCheckedChange={(checked) => setAddToContentHub(checked as boolean)}
                    className={cn(
                      "h-5 w-5 border-2 cursor-pointer transition-all",
                      addToContentHub
                        ? "data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
                        : "border-gray-300"
                    )}
                  />
                  <div className="flex-1">
                    <label htmlFor="addToContentHubWeek" className={cn(
                      "text-sm font-medium cursor-pointer transition-colors",
                      addToContentHub ? "text-[#4a2a3f]" : "text-gray-600"
                    )}>
                      Add to{' '}
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/production');
                        }}
                        className="text-[#612a4f] hover:text-[#8B7082] underline underline-offset-2 decoration-[#8B7082]/50 cursor-pointer font-semibold"
                      >
                        Content Hub
                      </span>
                      {' '}for production
                    </label>
                    <p className={cn(
                      "text-xs mt-0.5 transition-colors",
                      addToContentHub ? "text-[#8B7082]" : "text-gray-400"
                    )}>
                      Uncheck for quick content like Stories
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Actions - Outside content form */}
            {addDialogTab === 'content' && (
              <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    closeAddDialog();
                    resetFormState();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateContentFromDialog}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#612a4f] rounded-lg hover:bg-[#4d2240] transition-colors"
                >
                  Create
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
