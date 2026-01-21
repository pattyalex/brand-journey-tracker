import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { Trash2, Video, Lightbulb, X, Clock, FileText, Palette, ArrowRight, Check, ListTodo, CalendarCheck, Plus, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { scheduleColors, contentColorGroups } from "../utils/colorConstants";
import { useColorPalette } from "../hooks/useColorPalette";
import { ContentColorPicker } from "./ContentColorPicker";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
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
  isTaskDialogOpen: boolean;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  isResizingRef: React.MutableRefObject<boolean>;
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
  isTaskDialogOpen,
  weeklyDraggingCreate,
  weeklyDragCreateStart,
  weeklyDragCreateEnd,
  setWeeklyDraggingCreate,
  setWeeklyDragCreateStart,
  setWeeklyDragCreateEnd,
  setDraggedWeeklyTaskId,
  isResizingRef,
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
  weeklyAddDialogState,
  setWeeklyAddDialogState,
  loadProductionContent,
  onOpenContentDialog,
}: WeekViewProps) => {
  const navigate = useNavigate();

  // Color palette options
  const colorOptions = [
    { name: 'gray', bg: '#f3f4f6', hex: '#f3f4f6' },
    { name: 'rose', bg: '#fecdd3', hex: '#fecdd3' },
    { name: 'pink', bg: '#fbcfe8', hex: '#fbcfe8' },
    { name: 'purple', bg: '#e9d5ff', hex: '#e9d5ff' },
    { name: 'indigo', bg: '#c7d2fe', hex: '#c7d2fe' },
    { name: 'sky', bg: '#bae6fd', hex: '#bae6fd' },
    { name: 'teal', bg: '#99f6e4', hex: '#99f6e4' },
    { name: 'green', bg: '#bbf7d0', hex: '#bbf7d0' },
    { name: 'lime', bg: '#d9f99d', hex: '#d9f99d' },
    { name: 'yellow', bg: '#fef08a', hex: '#fef08a' },
    { name: 'orange', bg: '#fed7aa', hex: '#fed7aa' },
  ];

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

  // Color palette management (shared hook)
  const contentColorPalette = useColorPalette();
  const contentColor = contentColorPalette.selectedColor;
  const setContentColor = contentColorPalette.setSelectedColor;

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
    // Reset color picker popover states
    contentColorPalette.resetPickerState();
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
    toast.success('Task created for ' + format(new Date(addDialogDate), 'MMM d'));
    closeAddDialog();
    resetFormState();
  };

  // Handle creating planned content from the dialog
  const handleCreateContentFromDialog = () => {
    if (!contentHook.trim()) {
      toast.error('Please enter a hook/title for your content');
      return;
    }

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        const ideateColumn = columns.find(c => c.id === 'ideate');

        if (ideateColumn) {
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
          };
          ideateColumn.cards.push(newCard);
          setString(StorageKeys.productionKanban, JSON.stringify(columns));
          emit(window, EVENTS.productionKanbanUpdated);
          emit(window, EVENTS.scheduledContentUpdated);
          loadProductionContent?.(); // Refresh content immediately
          toast.success('Content idea added for ' + format(new Date(addDialogDate), 'MMM d'));
        }
      } catch (err) {
        console.error('Error adding planned content:', err);
      }
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
                    className={`h-[60px] flex flex-col items-center justify-center ${isToday ? 'bg-purple-50' : 'bg-gray-50'}`}
                    style={{
                      borderRight: index < 6 ? '1px solid #f3f4f6' : 'none',
                      opacity: isPast ? 0.5 : 1
                    }}
                  >
                    <div className="text-xs font-medium text-gray-500 uppercase">
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-2xl font-semibold ${isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fixed Content Row - below headers, above time slots */}
          {(contentDisplayMode === 'content' || contentDisplayMode === 'both') && (
            <div className="flex border-b border-gray-200 bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
              {/* Empty cell for time column */}
              <div className="flex-shrink-0 bg-transparent border-r border-gray-200" style={{ width: '40px' }} />
              {/* Content columns */}
              <div className="flex-1 grid grid-cols-7 gap-0">
                {eachDayOfInterval({
                  start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                  end: endOfWeek(selectedDate, { weekStartsOn: 1 })
                }).map((day, index) => {
                  const dayString = getDateString(day);
                  const isPast = day < new Date() && !isSameDay(day, new Date());

                  // Get content for this specific day
                  const dayScheduledContent = productionContent.scheduled.filter(c =>
                    c.scheduledDate?.split('T')[0] === dayString
                  );
                  const dayPlannedContent = productionContent.planned.filter(c =>
                    c.plannedDate?.split('T')[0] === dayString
                  );
                  const hasContent = dayScheduledContent.length > 0 || dayPlannedContent.length > 0;

                  return (
                    <div
                      key={`content-${dayString}`}
                      className="min-h-[40px] p-1 flex flex-col gap-1"
                      style={{
                        borderRight: index < 6 ? '1px solid #e5e7eb' : 'none',
                        opacity: isPast ? 0.5 : 1
                      }}
                    >
                      {dayScheduledContent.map((content) => {
                        const colorKey = content.scheduledColor || 'indigo';
                        const colors = scheduleColors[colorKey] || scheduleColors.indigo;
                        return (
                          <div
                            key={content.id}
                            onClick={() => onOpenContentDialog?.(content, 'scheduled')}
                            className="group text-[10px] rounded cursor-pointer hover:brightness-95 flex flex-col overflow-hidden"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            <div className="flex items-center gap-1 px-1.5 py-1">
                              <CalendarCheck className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="flex-1 truncate">{content.hook || content.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContent(content.id, 'scheduled');
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-600 transition-all"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            {/* Progress indicator - 5 steps, step 5 is active */}
                            <div className="flex gap-0.5 px-1 pb-1">
                              {[1, 2, 3, 4, 5].map((step) => (
                                <div
                                  key={step}
                                  className={`h-[2px] flex-1 rounded-full ${
                                    step === 5
                                      ? 'bg-current opacity-80'
                                      : 'bg-current opacity-25'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {dayPlannedContent.map((content) => (
                        <div
                          key={content.id}
                          onClick={() => onOpenContentDialog?.(content, 'planned')}
                          className="group text-[10px] rounded border border-dashed border-violet-300 bg-violet-50 text-violet-700 cursor-pointer hover:bg-violet-100 flex flex-col overflow-hidden"
                        >
                          <div className="flex items-center gap-1 px-1.5 py-1">
                            <Lightbulb className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="flex-1 truncate">{content.hook || content.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContent(content.id, 'planned');
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          {/* Progress indicator - 5 steps, step 1 is active for planned */}
                          <div className="flex gap-0.5 px-1 pb-1">
                            {[1, 2, 3, 4, 5].map((step) => (
                              <div
                                key={step}
                                className={`h-[2px] flex-1 rounded-full ${
                                  step === 1
                                    ? 'bg-violet-500 opacity-80'
                                    : 'bg-violet-300 opacity-40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scrollable timeline area */}
          <div ref={weeklyScrollRef} className="flex-1 min-h-0 overflow-auto">
              <div className="flex">
                {/* Time column */}
                <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: '40px' }}>
                  <div className="relative" style={{ height: '1152px' }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 flex items-start justify-end pr-1 pt-0.5"
                        style={{ top: `${hour * 48}px`, height: '48px' }}
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
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${hour * 48}px`,
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
                        <div className="relative" data-timeline style={{ height: '1152px' }}>

                          {/* Time slot grid for drag and drop */}
                          {Array.from({ length: 24 }, (_, hour) => (
                            <div
                              key={`slot-${hour}`}
                              className="absolute left-0 right-0 pointer-events-none"
                              style={{ top: `${hour * 48}px`, height: '48px', zIndex: 100 }}
                            >
                              <div
                                className={`h-full w-full relative ${(isTaskDialogOpen || addDialogOpen) ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
                                onMouseDown={(e) => {
                                  // Don't allow drag-to-create when dialog is open
                                  if (isTaskDialogOpen || addDialogOpen) return;

                                  // Only start drag create if clicking directly on this div (not on a task)
                                  const target = e.target as HTMLElement;
                                  if (target === e.currentTarget) {
                                    e.preventDefault();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const relativeY = e.clientY - rect.top;
                                    const minuteFraction = relativeY / 48; // 48px per hour
                                    const minute = Math.floor(minuteFraction * 60);

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
                                              setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                              emit(window, EVENTS.productionKanbanUpdated);
                                              emit(window, EVENTS.scheduledContentUpdated);
                                              loadProductionContent?.();
                                              toast.success('Content moved to ' + format(new Date(dayString), 'MMM d'));
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
                                              toast.success('Content idea moved to ' + format(new Date(dayString), 'MMM d'));
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
                                  const minuteFraction = relativeY / 48; // 48px per hour
                                  const minute = Math.floor(minuteFraction * 60);
                                  const roundedMinute = Math.floor(minute / 20) * 20; // Round to 20-minute intervals

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

                                // Other tasks are positioned on top in columns
                                const foregroundTasks = overlappingTasks.filter(t => t !== longestTask);
                                const totalColumns = foregroundTasks.length;

                                foregroundTasks.forEach((t) => {
                                  const originalIndex = tasksWithLayout.indexOf(t);
                                  const columnIndex = foregroundTasks
                                    .map(ot => tasksWithLayout.indexOf(ot))
                                    .sort((a, b) => a - b)
                                    .indexOf(originalIndex);

                                  t.column = columnIndex;
                                  t.totalColumns = totalColumns;
                                  t.isBackground = false;
                                  t.inOverlapGroup = true;
                                });
                              }
                            }

                            return tasksWithLayout.map(({ task: item, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
                              const durationMinutes = endMinutes - startMinutes;
                              const topPos = startMinutes * 0.8;
                              const height = Math.max(durationMinutes * 0.8, 24);

                              // Calculate width and position for overlapping tasks
                              let widthPercent, leftPercent, zIndex;

                              if (isBackground) {
                                // Background task: full width, behind others
                                widthPercent = 100;
                                leftPercent = 0;
                                zIndex = 105;
                              } else if (inOverlapGroup) {
                                // Foreground tasks: position on right side
                                // Leave left 50% for background task visibility (wider for weekly view)
                                const availableSpace = 50;
                                const startPosition = 50;
                                widthPercent = availableSpace / totalColumns;
                                leftPercent = startPosition + (column * widthPercent);
                                zIndex = 115 + column;
                              } else {
                                // Standalone task (no overlap): full width
                                widthPercent = 100;
                                leftPercent = 0;
                                zIndex = 110;
                              }

                              return (
                                <div
                                  key={item.id}
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
                                    className="h-full relative rounded cursor-pointer hover:brightness-95 transition-all"
                                    style={{
                                      backgroundColor: item.color || '#e5e7eb',
                                      opacity: isPast ? 0.6 : 0.9,
                                      padding: '4px 4px',
                                      border: 'none'
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
                                          const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

                                          // Get end time in minutes
                                          const [endHour, endMinute] = item.endTime!.split(':').map(Number);
                                          const endTotalMinutes = endHour * 60 + endMinute;

                                          // Ensure start time is before end time (at least 15 min duration)
                                          if (newMinutes < endTotalMinutes - 15) {
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
                                          const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

                                          // Get start time in minutes
                                          const [startHour, startMinute] = item.startTime!.split(':').map(Number);
                                          const startTotalMinutes = startHour * 60 + startMinute;

                                          // Ensure end time is after start time (at least 15 min duration)
                                          if (newMinutes > startTotalMinutes + 15) {
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
                                        <div className={`text-[11px] font-medium leading-tight ${item.isCompleted ? 'line-through opacity-70' : ''} text-gray-900 truncate`}>
                                          {item.text}
                                        </div>
                                        {(item.startTime || item.endTime) && (
                                          <div className="text-[9px] text-gray-700 mt-1 whitespace-nowrap">
                                            {item.startTime && convert24To12Hour(item.startTime)}
                                            {item.startTime && item.endTime && ' - '}
                                            {item.endTime && convert24To12Hour(item.endTime)}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteWeeklyTask(item.id, dayString);
                                        }}
                                        className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
                            className="absolute top-0 left-0 right-0 px-1 py-2 space-y-1 cursor-default z-[101] pointer-events-auto"
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
                                          setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                          emit(window, EVENTS.productionKanbanUpdated);
                                          emit(window, EVENTS.scheduledContentUpdated);
                                          loadProductionContent?.();
                                          toast.success('Content moved to ' + format(new Date(dayString), 'MMM d'));
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
                                          toast.success('Content idea moved to ' + format(new Date(dayString), 'MMM d'));
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
                            {/* Tasks without time */}
                            {showTasks && (() => {
                              const tasksWithoutTimes = (dayData?.items || []).filter(item => !item.startTime || !item.endTime);
                              return tasksWithoutTimes.map((item) => (
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
                                  className="group text-xs px-2 py-1.5 rounded-md hover:shadow-sm transition-all cursor-pointer border-l-2 relative"
                                  style={{
                                    backgroundColor: item.color ? `${item.color}10` : '#f5f5f5',
                                    borderLeftColor: item.color || '#9e9e9e',
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
                                    <span className={`${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'} break-words flex-1 text-[11px]`}>
                                      {item.text}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteWeeklyTask(item.id, dayString);
                                      }}
                                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>

                          {/* Drag-to-create preview */}
                          {weeklyDraggingCreate[dayString] && weeklyDragCreateStart[dayString] && weeklyDragCreateEnd[dayString] && (() => {
                            const start = weeklyDragCreateStart[dayString];
                            const end = weeklyDragCreateEnd[dayString];
                            const startMinutes = start.hour * 60 + start.minute;
                            const endMinutes = end.hour * 60 + end.minute;
                            const topPos = Math.min(startMinutes, endMinutes) * 0.8;
                            const height = Math.abs(endMinutes - startMinutes) * 0.8;
                            const actualStart = startMinutes < endMinutes ? start : end;
                            const actualEnd = startMinutes < endMinutes ? end : start;

                            return (
                              <div
                                className="absolute left-2 right-2 rounded-md pointer-events-none z-50 border-l-4"
                                style={{
                                  top: `${topPos}px`,
                                  height: `${Math.max(height, 45)}px`,
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  borderLeftColor: '#3b82f6'
                                }}
                              >
                                <div className="p-2 text-[10px] font-medium text-blue-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/15"
            onClick={() => {
              closeAddDialog();
              resetFormState();
            }}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 pt-8 max-h-[90vh] overflow-y-auto">
            {/* Tabs - only show in "both" mode */}
            {contentDisplayMode === 'both' && (
              <div className="flex px-6 gap-1 mb-4">
                <button
                  type="button"
                  onClick={() => setAddDialogTab('task')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                    addDialogTab === 'task'
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
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
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-600 hover:bg-gray-100"
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
                  <input
                    type="text"
                    placeholder="Start time"
                    value={taskStartTime}
                    onChange={(e) => setTaskStartTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="text"
                    placeholder="End time"
                    value={taskEndTime}
                    onChange={(e) => setTaskEndTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                {/* Color Palette */}
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setTaskColor(taskColor === color.hex ? '' : color.hex)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          taskColor === color.hex ? "ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color.bg }}
                      >
                        {taskColor === color.hex && (
                          <X className="w-4 h-4 mx-auto text-gray-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

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
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
                  <Input
                    type="text"
                    value={contentStartTime}
                    onChange={(e) => setContentStartTime(e.target.value)}
                    placeholder="Start time"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    maxLength={8}
                  />
                  <span className="text-gray-400">—</span>
                  <Input
                    type="text"
                    value={contentEndTime}
                    onChange={(e) => setContentEndTime(e.target.value)}
                    placeholder="End time"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    maxLength={8}
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

                {/* Content Color Picker */}
                <ContentColorPicker palette={contentColorPalette} />

                {/* Content Hub CTA */}
                <button
                  onClick={() => {
                    if (contentHook.trim()) {
                      const savedData = getString(StorageKeys.productionKanban);
                      if (savedData) {
                        try {
                          const columns: KanbanColumn[] = JSON.parse(savedData);
                          const ideateColumn = columns.find(c => c.id === 'ideate');
                          if (ideateColumn) {
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
                            };
                            ideateColumn.cards.push(newCard);
                            setString(StorageKeys.productionKanban, JSON.stringify(columns));
                            emit(window, EVENTS.productionKanbanUpdated);
                            emit(window, EVENTS.scheduledContentUpdated);
                            loadProductionContent?.();
                          }
                        } catch (err) {
                          console.error('Error adding content:', err);
                        }
                      }
                    }
                    closeAddDialog();
                    resetFormState();
                    navigate('/production');
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 hover:border-violet-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Video className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700">Go to Content Hub to develop your idea further</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                </button>

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
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
