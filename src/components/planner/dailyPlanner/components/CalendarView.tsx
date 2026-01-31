import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { PlannerView, TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";
import { parseTimeTo24 } from "../utils/timeUtils";
import { defaultScheduledColor, getTaskColorByHex, isColorDark } from "../utils/colorConstants";
import { useColorPalette } from "../hooks/useColorPalette";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { defaultColumns } from "@/pages/production/utils/productionConstants";
import { Video, Lightbulb, X, Clock, FileText, ArrowRight, Trash2, Check, GripHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { autoFormatTime } from "../utils/timeUtils";
import { TimePicker } from "./TimePicker";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { ContentDisplayMode } from "../hooks/usePlannerState";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  getTimezoneDisplay: () => string;
  handleTimezoneChange: (timezone: string) => void;
  selectedTimezone: string;
  timezones: TimezoneOption[];
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  setCurrentView: React.Dispatch<React.SetStateAction<PlannerView>>;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setPendingTaskFromAllTasks: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
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
  loadProductionContent?: () => void;
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  onOpenContentFlow?: (cardId: string) => void;
  savePlannerData?: (data: PlannerDay[]) => void;
}

export const CalendarView = ({
  getTimezoneDisplay,
  handleTimezoneChange,
  selectedTimezone,
  timezones,
  selectedDate,
  setSelectedDate,
  setCurrentView,
  plannerData,
  allTasks,
  setAllTasks,
  setPlannerData,
  setPendingTaskFromAllTasks,
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
  showTasks = true,
  showContent = false,
  contentDisplayMode = 'tasks',
  productionContent = { scheduled: [], planned: [] },
  setProductionContent,
  loadProductionContent,
  onOpenContentDialog,
  onOpenContentFlow,
  savePlannerData,
}: CalendarViewProps) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Minimum date: January 2026
  const minDate = new Date(2026, 0, 1);

  // Generate continuous days for multiple months (6 months worth)
  const generateContinuousDays = () => {
    const startMonth = selectedDate < minDate ? minDate : addMonths(selectedDate, -1);
    const endMonth = addMonths(startMonth, 6);

    // Effective start is at least minDate
    const effectiveStartMonth = startMonth < minDate ? minDate : startMonth;
    const startDate = startOfMonth(effectiveStartMonth);
    const endDate = endOfWeek(endOfMonth(endMonth), { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const allDays = generateContinuousDays();

  // Calculate how many empty cells needed before the first day (for grid alignment)
  // Monday = 0, Sunday = 6 (using weekStartsOn: 1)
  const firstDayOfWeek = allDays.length > 0 ? (allDays[0].getDay() + 6) % 7 : 0; // Convert to Mon=0 format

  // Handle scroll to update selected month based on visible days
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const targetY = containerRect.top + 100; // Check near the top of visible area

    // Find which day cell is at the target position
    const dayCells = container.querySelectorAll('[data-day]');
    let visibleMonth: Date | null = null;

    dayCells.forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom > targetY) {
        const dayStr = cell.getAttribute('data-day');
        if (dayStr) {
          visibleMonth = new Date(dayStr);
        }
      }
    });

    if (visibleMonth && visibleMonth >= minDate) {
      const newMonthStr = format(visibleMonth, 'yyyy-MM');
      const currentMonthStr = format(selectedDate, 'yyyy-MM');
      if (newMonthStr !== currentMonthStr) {
        setSelectedDate(startOfMonth(visibleMonth));
      }
    }
  };

  // State for add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogDate, setAddDialogDate] = useState<string>("");
  const [addDialogTab, setAddDialogTab] = useState<'task' | 'content'>('task');

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
  const [contentStartTime, setContentStartTime] = useState("");
  const [contentEndTime, setContentEndTime] = useState("");
  const [addToContentHub, setAddToContentHub] = useState(true);

  // Color palette management (shared hook)
  const contentColorPalette = useColorPalette();
  const contentColor = contentColorPalette.selectedColor;
  const setContentColor = contentColorPalette.setSelectedColor;

  // View content dialog state
  const [viewContentDialog, setViewContentDialog] = useState<ProductionCard | null>(null);

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

  // Reset drag offset when dialog opens
  const openAddDialog = () => {
    setDialogDragOffset({ x: 0, y: 0 });
    setAddDialogOpen(true);
  };

  // Handle day click based on display mode
  const handleDayClick = (day: Date, dayString: string, e: React.MouseEvent) => {
    // Update selected date so other views show the same date
    setSelectedDate(day);

    if (contentDisplayMode === 'tasks') {
      // Tasks mode: open TaskDialog
      setEditingTask({ id: '', text: '', date: dayString } as PlannerItem);
      setDialogTaskTitle('');
      setDialogTaskDescription('');
      setDialogStartTime('');
      setDialogEndTime('');
      setDialogTaskColor('');
      setDialogAddToContentCalendar(false);
      setTaskDialogPosition({ x: e.clientX, y: e.clientY });
      setIsTaskDialogOpen(true);
    } else if (contentDisplayMode === 'content') {
      // Content mode: open dialog with content tab
      setAddDialogDate(dayString);
      setAddDialogTab('content');
      resetFormState();
      openAddDialog();
    } else if (contentDisplayMode === 'both') {
      // Both mode: open TaskDialog (for tasks)
      setEditingTask({ id: '', text: '', date: dayString } as PlannerItem);
      setDialogTaskTitle('');
      setDialogTaskDescription('');
      setDialogStartTime('');
      setDialogEndTime('');
      setDialogTaskColor('');
      setDialogAddToContentCalendar(false);
      setTaskDialogPosition({ x: e.clientX, y: e.clientY });
      setIsTaskDialogOpen(true);
    }
  };

  // Handle creating a task
  const handleCreateTask = () => {
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
      startTime: taskStartTime || undefined,
      endTime: taskEndTime || undefined,
      description: taskDescription || undefined,
      color: taskColor || undefined,
      isContentCalendar: taskIncludeInContentCalendar,
    };

    // Add to planner data
    const dayIndex = plannerData.findIndex(d => d.date === addDialogDate);
    if (dayIndex >= 0) {
      const updatedData = [...plannerData];
      updatedData[dayIndex] = {
        ...updatedData[dayIndex],
        items: [...updatedData[dayIndex].items, newTask]
      };
      setPlannerData(updatedData);
    } else {
      setPlannerData([...plannerData, {
        date: addDialogDate,
        items: [newTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      }]);
    }

    toast.success('Task created for ' + format(new Date(addDialogDate + 'T12:00:00'), 'MMM d'));
    setAddDialogOpen(false);
    resetFormState();
  };

  // Handle creating planned content
  const handleCreateContent = () => {
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
        console.log('CalendarView: Updated productionContent.planned:', updated.planned.length, 'items');
        return updated;
      });

      // Emit events for cross-component sync
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);

      toast.success('Content idea added for ' + format(new Date(addDialogDate + 'T12:00:00'), 'MMM d'));
    } catch (err) {
      console.error('Error adding planned content:', err);
    }

    setAddDialogOpen(false);
    resetFormState();
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(d => d.date === dayString);
    if (dayIndex >= 0) {
      const updatedData = [...plannerData];
      updatedData[dayIndex] = {
        ...updatedData[dayIndex],
        items: updatedData[dayIndex].items.filter(item => item.id !== taskId)
      };
      setPlannerData(updatedData);
      savePlannerData?.(updatedData);
      toast.success('Task deleted');
    }
  };

  // Handle toggling task completion
  const handleToggleTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(d => d.date === dayString);
    if (dayIndex >= 0) {
      const updatedData = [...plannerData];
      updatedData[dayIndex] = {
        ...updatedData[dayIndex],
        items: updatedData[dayIndex].items.map(item =>
          item.id === taskId ? { ...item, isCompleted: !item.isCompleted } : item
        )
      };
      setPlannerData(updatedData);
      savePlannerData?.(updatedData);
    }
  };

  // Handle deleting content from calendar
  const handleDeleteContent = (contentId: string, type: 'scheduled' | 'planned') => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        if (type === 'scheduled') {
          // Remove scheduled date from to-schedule column
          const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
          if (toScheduleColumn) {
            const card = toScheduleColumn.cards.find(c => c.id === contentId);
            if (card) {
              card.scheduledDate = undefined;
              card.schedulingStatus = undefined;
            }
          }
        } else {
          // Remove planned date from ideate column
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

  // Handle drop for both tasks and content
  const handleDrop = (e: React.DragEvent, toDate: string, dayCellElement: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    dayCellElement.classList.remove('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');

    const taskId = e.dataTransfer.getData('taskId');
    const contentId = e.dataTransfer.getData('contentId');
    const contentType = e.dataTransfer.getData('contentType');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📦 DROP HANDLER - contentId:', contentId, 'taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

    // Handle content item drop
    if (contentId && fromDate !== toDate) {
      console.log('🎬 Processing content drop...');
      const savedData = getString(StorageKeys.productionKanban);
      if (savedData) {
        try {
          const columns: KanbanColumn[] = JSON.parse(savedData);
          let updated = false;

          columns.forEach(column => {
            const card = column.cards.find(c => c.id === contentId);
            if (card) {
              if (contentType === 'scheduled') {
                card.scheduledDate = toDate;
                card.schedulingStatus = 'scheduled';
              } else if (contentType === 'planned') {
                card.plannedDate = toDate;
              }
              updated = true;
            }
          });

          if (updated) {
            setString(StorageKeys.productionKanban, JSON.stringify(columns));
            emit(window, EVENTS.productionKanbanUpdated);
            emit(window, EVENTS.scheduledContentUpdated);
            toast.success('Content moved to ' + format(new Date(toDate + 'T12:00:00'), 'MMM d'));
          }
        } catch (err) {
          console.error('Error updating content date:', err);
        }
      }
      return;
    }

    // Handle task from All Tasks (no fromDate)
    if (taskId && !fromDate) {
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      setPendingTaskFromAllTasks(taskToMove);
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);

      setEditingTask({ ...taskToMove, date: toDate } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    } else if (taskId && fromDate && fromDate !== toDate) {
      // Handle regular task move between days
      const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      const toDayIndex = updatedPlannerData.findIndex(d => d.date === toDate);
      const movedTask = { ...taskToMove, date: toDate };

      if (toDayIndex >= 0) {
        updatedPlannerData[toDayIndex] = {
          ...updatedPlannerData[toDayIndex],
          items: [...updatedPlannerData[toDayIndex].items, movedTask]
        };
      } else {
        updatedPlannerData.push({
          date: toDate,
          items: [movedTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      toast.success('Task moved successfully');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Month Calendar Grid */}
      <CardContent className="pl-0 pr-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Day Headers - Sticky */}
        <div className="grid grid-cols-7 mb-2 flex-shrink-0 sticky top-0 bg-white z-10">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 py-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days - Continuous Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto min-h-0 pt-6"
          onScroll={handleScroll}
        >
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty placeholder cells for grid alignment */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-[120px]" />
            ))}
            {allDays.map((day, index) => {
              const dayString = getDateString(day);
              const dayData = plannerData.find(d => d.date === dayString);
              const isToday = isSameDay(day, new Date());
              const isFirstOfMonth = day.getDate() === 1;
              const isPast = isBefore(startOfDay(day), startOfDay(new Date())) && !isToday;

              // Get tasks for this day
              const tasks = dayData?.items || [];

              // Get content for this day
              const scheduledContent = productionContent.scheduled.filter(c =>
                c.scheduledDate?.split('T')[0] === dayString
              );
              const plannedContent = productionContent.planned.filter(c =>
                c.plannedDate?.split('T')[0] === dayString
              );

              // Determine what to show based on display settings
              const tasksToShow = showTasks ? tasks : [];
              const contentToShow = showContent ? [...scheduledContent, ...plannedContent] : [];
              const totalItems = tasksToShow.length + contentToShow.length;

              // Check if any tasks have dark colors (for content card outline contrast)
              const hasDarkTasks = tasksToShow.some(task => isColorDark(task.color));
              // Outline colors for content cards based on task background
              const contentOutlineClass = hasDarkTasks
                ? "ring-1 ring-white/70" // Light outline for dark task backgrounds
                : "ring-1 ring-[#8B7082]/40"; // Dark outline for light task backgrounds

              return (
                <div
                  key={dayString}
                  className={cn("relative", isFirstOfMonth && "mt-6")}
                >
                  {/* Month label for first day of month */}
                  {isFirstOfMonth && (
                    <span
                      className="absolute -top-5 left-0 text-xs font-semibold text-[#612a4f]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {format(day, 'MMMM')}
                    </span>
                  )}
                  <div
                    data-day={dayString}
                    className={cn(
                      "h-[120px] rounded-lg border p-1.5 transition-all cursor-pointer flex flex-col overflow-hidden",
                      isPast
                        ? 'bg-[#fafafa] border-gray-200 text-gray-500 hover:bg-gray-100'
                        : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={(e) => handleDayClick(day, dayString, e)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                    }}
                    onDrop={(e) => handleDrop(e, dayString, e.currentTarget)}
                  >

                  {isToday ? (
                    <span className="w-7 h-7 rounded-full bg-[#8B7082] text-white flex items-center justify-center text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {format(day, 'd')}
                    </span>
                  ) : (
                    <span className="text-sm font-medium flex-shrink-0" style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isPast ? '#9ca3af' : '#111827',
                      fontWeight: 500
                    }}>
                      {format(day, 'd')}
                    </span>
                  )}

                  {/* Task and Content indicators - scrollable */}
                  <div
                    className="flex-1 min-h-0 flex flex-col gap-px overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Find parent day cell and highlight it
                      const dayCell = e.currentTarget.closest('[data-day]') as HTMLElement;
                      console.log('🎯 DRAG OVER container, dayCell:', dayCell?.getAttribute('data-day'));
                      if (dayCell) {
                        dayCell.classList.add('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                      }
                    }}
                    onDragLeave={(e) => {
                      // Only remove highlight if leaving the container entirely
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        const dayCell = e.currentTarget.closest('[data-day]') as HTMLElement;
                        if (dayCell) {
                          dayCell.classList.remove('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                        }
                      }
                    }}
                    onDrop={(e) => {
                      const dayCell = e.currentTarget.closest('[data-day]') as HTMLElement;
                      if (dayCell) {
                        handleDrop(e, dayString, dayCell);
                      }
                    }}
                  >
                    {/* Scheduled Content */}
                    {showContent && scheduledContent.map((content) => {
                      // Use default mauve color for all scheduled content
                      const colors = defaultScheduledColor;
                      return (
                        <div
                          key={content.id}
                          draggable={true}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open content flow dialog directly
                            onOpenContentFlow?.(content.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => {
                            console.log('🎬 DRAG START - Scheduled Content:', content.id, content.hook || content.title, 'from:', dayString);
                            e.stopPropagation();
                            e.dataTransfer.setData('text/plain', content.id);
                            e.dataTransfer.setData('contentId', content.id);
                            e.dataTransfer.setData('contentType', 'scheduled');
                            e.dataTransfer.setData('fromDate', dayString);
                            e.dataTransfer.effectAllowed = 'move';
                            const target = e.currentTarget;
                            setTimeout(() => {
                              if (target) target.style.opacity = '0.5';
                            }, 0);
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          className={cn(
                            "group text-[11px] rounded-2xl transition-colors hover:brightness-95 cursor-pointer flex flex-col overflow-hidden flex-shrink-0 border-l-4",
                            "shadow-[0_1px_4px_rgba(139,112,130,0.3)] hover:shadow-[0_2px_6px_rgba(139,112,130,0.4)]"
                          )}
                          style={{
                            background: 'linear-gradient(180deg, #A08898 0%, #8B7082 50%, #5A4052 100%)',
                            color: colors.text,
                            borderLeftColor: '#4a2a3f'
                          }}
                        >
                          <div className="flex items-center gap-1 px-2 py-1.5">
                            <button
                              onClick={(e) => handleToggleComplete(content.id, e)}
                              className={cn(
                                "w-3 h-3 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors",
                                content.isCompleted ? "bg-white border-white" : "border-current hover:bg-current/20"
                              )}
                            >
                              {content.isCompleted && <Check className="w-2 h-2 text-[#612A4F]" />}
                            </button>
                            <span className={cn(
                              "flex-1 truncate leading-tight",
                              content.isCompleted && "line-through opacity-60"
                            )}>{content.hook || content.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContent(content.id, 'scheduled');
                              }}
                              className="opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0 text-gray-400 hover:text-amber-600 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Planned Content */}
                    {showContent && plannedContent.map((content) => (
                      <div
                        key={content.id}
                        draggable={true}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenContentDialog?.(content, 'planned');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => {
                          console.log('💡 DRAG START - Planned Content:', content.id, content.hook || content.title, 'from:', dayString);
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', content.id);
                          e.dataTransfer.setData('contentId', content.id);
                          e.dataTransfer.setData('contentType', 'planned');
                          e.dataTransfer.setData('fromDate', dayString);
                          e.dataTransfer.effectAllowed = 'move';
                          const target = e.currentTarget;
                          setTimeout(() => {
                            if (target) target.style.opacity = '0.5';
                          }, 0);
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        className={cn(
                          "group text-[11px] rounded-2xl text-[#8B7082] cursor-pointer hover:brightness-95 flex flex-col overflow-hidden flex-shrink-0 border-l-4",
                          "shadow-[0_1px_4px_rgba(139,112,130,0.3)] hover:shadow-[0_2px_6px_rgba(139,112,130,0.4)]"
                        )}
                        style={{
                          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F2F4 50%, #E0D5DC 100%)',
                          borderLeftColor: '#B8A0AD'
                        }}
                      >
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <Lightbulb className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1 truncate leading-tight">{content.hook || content.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContent(content.id, 'planned');
                            }}
                            className="opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Tasks */}
                    {tasksToShow.map((task) => {
                      // Use preview color if this task is being edited
                      const isBeingEdited = editingTask?.id === task.id;
                      const colorToUse = isBeingEdited && dialogTaskColor ? dialogTaskColor : task.color;
                      const taskColorInfo = getTaskColorByHex(colorToUse);
                      return (
                        <div
                          key={task.id}
                          draggable={true}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => {
                            console.log('🚀 DRAG START - Calendar Task:', task.id, task.text, 'from:', dayString);
                            e.stopPropagation();
                            e.dataTransfer.setData('text/plain', task.id);
                            e.dataTransfer.setData('taskId', task.id);
                            e.dataTransfer.setData('fromDate', dayString);
                            e.dataTransfer.setData('fromAllTasks', 'false');
                            e.dataTransfer.effectAllowed = 'move';
                            const target = e.currentTarget;
                            setTimeout(() => {
                              if (target) target.style.opacity = '0.5';
                            }, 0);
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          className="group text-[11px] px-2 py-1 rounded-md cursor-grab active:cursor-grabbing transition-colors hover:shadow-sm flex-shrink-0 border-l-4"
                          style={{
                            backgroundColor: taskColorInfo.fill,
                            borderLeftColor: taskColorInfo.border,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Checkbox
                              checked={task.isCompleted}
                              onCheckedChange={() => handleToggleTask(task.id, dayString)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3 w-3 flex-shrink-0"
                            />
                            <div
                              className={`flex-1 truncate leading-tight ${task.isCompleted ? 'line-through opacity-50' : ''}`}
                              style={{ color: taskColorInfo.text }}
                            >
                              {task.text}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id, dayString);
                              }}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Add Content Dialog - only for content mode */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setAddDialogOpen(false);
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
            {/* Content Form */}
            <div className="px-6 pb-4 space-y-4">
                {/* Hook/Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add hook"
                    value={contentHook}
                    onChange={(e) => setContentHook(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                    autoFocus
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
                    id="addToContentHubCalendar"
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
                    <label htmlFor="addToContentHubCalendar" className={cn(
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

            {/* Actions - Outside content form */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => {
                  setAddDialogOpen(false);
                  resetFormState();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateContent}
                className="px-6 py-2 text-sm font-medium text-white bg-[#612a4f] rounded-lg hover:bg-[#4d2240] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content Dialog */}
      {viewContentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setViewContentDialog(null)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  viewContentDialog.scheduledDate ? "bg-indigo-100" : "bg-violet-100"
                )}>
                  {viewContentDialog.scheduledDate ? (
                    <Video className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-violet-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {viewContentDialog.scheduledDate ? 'Scheduled' : 'Planned'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {viewContentDialog.scheduledDate
                      ? format(new Date(viewContentDialog.scheduledDate), 'EEEE, MMM d')
                      : viewContentDialog.plannedDate
                        ? format(new Date(viewContentDialog.plannedDate), 'EEEE, MMM d')
                        : 'No date'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewContentDialog(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Hook/Title */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {viewContentDialog.hook || viewContentDialog.title}
                </h3>
              </div>

              {/* Description/Notes */}
              {viewContentDialog.description && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {viewContentDialog.description}
                </div>
              )}

              {/* Platforms */}
              {viewContentDialog.platforms && viewContentDialog.platforms.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Platforms</div>
                  <div className="flex flex-wrap gap-2">
                    {viewContentDialog.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Script preview */}
              {viewContentDialog.script && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Script Preview</div>
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-clamp-3">
                    {viewContentDialog.script}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex justify-between items-center">
              <button
                onClick={() => {
                  // Move card to ideate column (Script Ideas) if not already there
                  const savedData = getString(StorageKeys.productionKanban);
                  if (savedData && viewContentDialog) {
                    try {
                      const columns: KanbanColumn[] = JSON.parse(savedData);
                      let cardFound = false;
                      let sourceColumnIndex = -1;
                      let cardIndex = -1;

                      // Find the card in any column
                      columns.forEach((col, colIdx) => {
                        const idx = col.cards.findIndex(c => c.id === viewContentDialog.id);
                        if (idx !== -1) {
                          cardFound = true;
                          sourceColumnIndex = colIdx;
                          cardIndex = idx;
                        }
                      });

                      // If card is not in ideate column, move it there
                      if (cardFound && columns[sourceColumnIndex].id !== 'ideate') {
                        const card = columns[sourceColumnIndex].cards[cardIndex];
                        // Remove from source column
                        columns[sourceColumnIndex].cards.splice(cardIndex, 1);
                        // Add to ideate column
                        const ideateColumn = columns.find(c => c.id === 'ideate');
                        if (ideateColumn) {
                          card.columnId = 'ideate';
                          ideateColumn.cards.push(card);
                          setString(StorageKeys.productionKanban, JSON.stringify(columns));
                          emit(window, EVENTS.productionKanbanUpdated);
                          toast.success('Content moved to Script Ideas');
                        }
                      }
                    } catch (err) {
                      console.error('Error moving card:', err);
                    }
                  }
                  setViewContentDialog(null);
                  navigate('/production');
                }}
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Open in Content Hub
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewContentDialog(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
