import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Trash2, Video, Lightbulb, X, Clock, FileText, Palette, ArrowRight, Check, ListTodo, CalendarCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { PlannerItem } from "@/types/planner";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TIMEZONES, getDateString } from "../utils/plannerUtils";
import { PlannerDerived, PlannerHelpers, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { cn } from "@/lib/utils";

// Color mappings for content items
const scheduleColors: Record<string, { bg: string; text: string }> = {
  indigo: { bg: '#e0e7ff', text: '#4338ca' },
  rose: { bg: '#ffe4e6', text: '#be123c' },
  amber: { bg: '#fef3c7', text: '#b45309' },
  emerald: { bg: '#d1fae5', text: '#047857' },
  sky: { bg: '#e0f2fe', text: '#0369a1' },
  violet: { bg: '#ede9fe', text: '#6d28d9' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  cyan: { bg: '#cffafe', text: '#0e7490' },
  sage: { bg: '#DCE5D4', text: '#5F6B52' },
};

interface TodayViewProps {
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
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
}

export const TodayView = ({ state, derived, refs, helpers, setters, actions, todayAddDialogState, setTodayAddDialogState, onOpenContentDialog }: TodayViewProps) => {
  const navigate = useNavigate();

  const {
    selectedDate,
    selectedTimezone,
    todayZoomLevel,
    isDraggingCreate,
    dragCreateStart,
    dragCreateEnd,
    allTasks,
    tasks,
    greatDay,
    grateful,
    plannerData,
    showTasks,
    showContent,
    contentDisplayMode,
    productionContent,
  } = state;

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
  const [contentColor, setContentColor] = useState("violet");

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
    setContentColor("violet");
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
      // Set times
      if (addDialogStartTime) {
        setTaskStartTime(addDialogStartTime);
        setTaskEndTime(addDialogEndTime);
      }
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

    setters.setPlannerData(updatedPlannerData);
    actions.savePlannerData(updatedPlannerData);
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
            plannedDate: dateString,
            plannedColor: contentColor as any,
            isNew: true,
          };
          ideateColumn.cards.push(newCard);
          setString(StorageKeys.productionKanban, JSON.stringify(columns));
          emit(window, EVENTS.productionKanbanUpdated);
          emit(window, EVENTS.scheduledContentUpdated);
          loadProductionContent(); // Refresh content immediately
          toast.success('Content idea added for ' + format(selectedDate, 'MMM d'));
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

  // Get today's content
  const todayString = getDateString(selectedDate);
  const scheduledContent = productionContent?.scheduled?.filter(c =>
    c.scheduledDate?.split('T')[0] === todayString
  ) || [];
  const plannedContent = productionContent?.planned?.filter(c =>
    c.plannedDate?.split('T')[0] === todayString
  ) || [];
  const hasContent = (scheduledContent.length > 0 || plannedContent.length > 0) && showContent;

  const { dateString, currentDay, colors, getTimezoneDisplay } = derived;
  const { todayScrollRef, isResizingRef } = refs;
  const { convert24To12Hour, loadProductionContent } = helpers;
  const {
    handleOpenTaskDialog,
    handleTimezoneChange,
    handleToggleItem,
    handleDeleteItem,
    handleEditItem,
    savePlannerData,
    saveAllTasks,
  } = actions;
  const {
    setPlannerData,
    setAllTasks,
    setIsDraggingCreate,
    setDragCreateStart,
    setDragCreateEnd,
  } = setters;

  return (
    <>
<CardContent className="px-0 h-full flex flex-col">
  {/* Content Banner for Today */}
  {hasContent && (
    <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
      <div className="flex items-center gap-2 mb-2">
        <Video className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-gray-800">Today's Content</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {scheduledContent.map((content) => {
          const colorKey = content.scheduledColor || 'indigo';
          const colors = scheduleColors[colorKey] || scheduleColors.indigo;
          return (
            <div
              key={content.id}
              onClick={() => onOpenContentDialog?.(content, 'scheduled')}
              className="group text-xs rounded-lg cursor-pointer hover:brightness-95 flex flex-col overflow-hidden"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <CalendarCheck className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{content.hook || content.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteContent(content.id, 'scheduled');
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 text-gray-400 hover:text-amber-600 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Progress indicator - 5 steps, step 5 is active */}
              <div className="flex gap-0.5 px-2 pb-1.5">
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
        {plannedContent.map((content) => (
          <div
            key={content.id}
            onClick={() => onOpenContentDialog?.(content, 'planned')}
            className="group text-xs rounded-lg bg-violet-50 border border-dashed border-violet-300 text-violet-700 cursor-pointer hover:bg-violet-100 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Lightbulb className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{content.hook || content.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContent(content.id, 'planned');
                }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Progress indicator - 5 steps, step 1 is active for planned */}
            <div className="flex gap-0.5 px-2 pb-1.5">
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
    </div>
  )}

  {/* Untimed Tasks Section - tasks without start/end times */}
  {showTasks && (() => {
    const untimedTasks = currentDay.items.filter(item => !item.startTime || !item.endTime);
    if (untimedTasks.length === 0) return null;

    return (
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-gray-800">All Day</span>
          <span className="text-xs text-gray-400">({untimedTasks.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {untimedTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.setData('fromDate', task.date || dateString);
                e.dataTransfer.setData('fromAllTasks', 'false');
                e.dataTransfer.effectAllowed = 'move';
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onClick={() => handleOpenTaskDialog(9, task)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:shadow-sm transition-all"
              style={{ backgroundColor: task.color || '#f3f4f6' }}
            >
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={() => handleToggleItem(task.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5"
              />
              <span className={`text-xs font-medium ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  })()}

  <div ref={todayScrollRef} className="flex-1 flex flex-col min-h-0">
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* Fixed header row */}
      <div className="flex border-b border-gray-200">
        {/* Time column header */}
        <div className="flex-shrink-0 border-r border-gray-200 h-[60px]" style={{ width: '60px' }}>
        </div>
        {/* Date header */}
        <div className="flex-1 h-[60px] flex items-center justify-between px-4">
          <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
            <span className="text-sm text-gray-400 uppercase font-medium tracking-wide">
              {format(selectedDate, 'EEE')}
            </span>
            <span className="text-2xl font-semibold text-gray-700 leading-none">
              {format(selectedDate, 'd')}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 font-medium">
            {Math.round(todayZoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1">
        <div className="flex">
          {/* Time column */}
          <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: '60px' }}>
            <div className="relative" style={{ height: `${24 * 90 * todayZoomLevel}px` }}>
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start justify-end pr-2 pt-0.5"
                  style={{ top: `${hour * 90 * todayZoomLevel}px`, height: `${90 * todayZoomLevel}px` }}
                >
                  <span className="text-[11px] text-gray-400 leading-none">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 relative">
            <div className="relative" style={{ height: `${24 * 90 * todayZoomLevel}px` }}>
            {/* Hour labels and grid lines */}
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i;

              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0"
                  style={{ top: `${hour * 90 * todayZoomLevel}px`, height: `${90 * todayZoomLevel}px` }}
                >
                  {/* Hour row container */}
                  <div className="flex h-full border-t border-gray-200 bg-white">
                    {/* 20-minute slots (3 slots per hour) */}
                    <div className="flex-1 flex flex-col">
                  {[0, 20, 40].map((minute, idx) => {
                    return (
                      <div
                        key={`${hour}-${minute}`}
                        className="flex-1 cursor-crosshair relative group/slot"
                        onMouseDown={(e) => {
                          // Only start drag create if clicking directly on the slot (not on a task)
                          if (e.target === e.currentTarget || (e.currentTarget.contains(e.target as Node) && (e.target as HTMLElement).classList.contains('pointer-events-none'))) {
                            e.preventDefault();
                            setIsDraggingCreate(true);
                            setDragCreateStart({ hour, minute });
                            setDragCreateEnd({ hour, minute });
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-blue-100');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-blue-100');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('bg-blue-100');

                          const taskId = e.dataTransfer.getData('taskId');
                          const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

                          console.log('=== DROP EVENT ===');
                          console.log('TaskId:', taskId);
                          console.log('FromAllTasks:', fromAllTasks);
                          console.log('Hour:', hour, 'Minute:', minute);
                          console.log('All Tasks:', allTasks);

                          if (!taskId) {
                            console.log('❌ No taskId found, aborting');
                            return;
                          }

                          // Calculate new time based on drop position
                          const hourStr = hour.toString().padStart(2, '0');
                          const minuteStr = minute.toString().padStart(2, '0');

                          if (fromAllTasks === 'true') {
                            console.log('✅ Handling drop from All Tasks');

                            // Task is from All Tasks
                            const taskFromAllTasks = allTasks.find(t => t.id === taskId);
                            console.log('Found task:', taskFromAllTasks);

                            if (!taskFromAllTasks) {
                              console.log('❌ Task not found in allTasks');
                              return;
                            }

                            // Calculate duration - preserve if task already has times, otherwise 20 minutes
                            let durationMinutes = 20;
                            if (taskFromAllTasks.startTime && taskFromAllTasks.endTime) {
                              const [oldStartHour, oldStartMinute] = taskFromAllTasks.startTime.split(':').map(Number);
                              const [oldEndHour, oldEndMinute] = taskFromAllTasks.endTime.split(':').map(Number);
                              durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);
                            }

                            const newStartMinutes = hour * 60 + minute;
                            let newEndMinutes = newStartMinutes + durationMinutes;

                            // Cap at end of day (23:59)
                            if (newEndMinutes > 1439) {
                              newEndMinutes = 1439;
                            }

                            const newEndHour = Math.floor(newEndMinutes / 60);
                            const newEndMinute = newEndMinutes % 60;

                            const newStartTime = `${hourStr}:${minuteStr}`;
                            const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                            console.log('New times:', newStartTime, '-', newEndTime);

                            // Add to calendar with time
                            const newTask: PlannerItem = {
                              ...taskFromAllTasks,
                              date: dateString,
                              startTime: newStartTime,
                              endTime: newEndTime,
                              section: "morning"
                            };

                            console.log('New task object:', newTask);

                            const dayIndex = plannerData.findIndex(day => day.date === dateString);
                            console.log('Day index:', dayIndex);

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

                            console.log('Updating planner data...');
                            setPlannerData(updatedPlannerData);
                            savePlannerData(updatedPlannerData);

                            console.log('Removing from All Tasks...');
                            // Remove from All Tasks AFTER adding to calendar
                            const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                            setAllTasks(filteredAllTasks);
                            saveAllTasks(filteredAllTasks);
                            console.log('New All Tasks count:', filteredAllTasks.length);

                            console.log('✅ Drop complete!');
                          } else {
                            // Task is already in calendar, just moving it
                            const dayIndex = plannerData.findIndex(day => day.date === dateString);
                            if (dayIndex < 0) return;

                            const taskToMove = currentDay.items.find(item => item.id === taskId);
                            if (!taskToMove) return;

                            // Calculate duration to maintain it
                            const [oldStartHour, oldStartMinute] = taskToMove.startTime!.split(':').map(Number);
                            const [oldEndHour, oldEndMinute] = taskToMove.endTime!.split(':').map(Number);
                            const durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);

                            // Calculate new end time
                            const newStartMinutes = hour * 60 + minute;
                            let newEndMinutes = newStartMinutes + durationMinutes;

                            // Cap at end of day (23:59)
                            if (newEndMinutes > 1439) {
                              newEndMinutes = 1439;
                            }

                            const newEndHour = Math.floor(newEndMinutes / 60);
                            const newEndMinute = newEndMinutes % 60;

                            const newStartTime = `${hourStr}:${minuteStr}`;
                            const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                            // Update the task with new times
                            handleEditItem(taskId, taskToMove.text, newStartTime, newEndTime, taskToMove.color, taskToMove.description, taskToMove.isCompleted);
                          }
                        }}
                      >
                        {/* Remove Plus icon - drag to create instead */}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Time labels are handled by hour labels only */}

        {/* Render all tasks with absolute positioning - only when showTasks is true */}
        {showTasks && (
        <div className="absolute top-0 left-2 right-2">
          {(() => {
            const tasksWithTimes = currentDay.items.filter(item => item.startTime && item.endTime);

            // Calculate time ranges and detect overlaps
            const tasksWithLayout = tasksWithTimes.map((task, index) => {
              const [startHour, startMinute] = task.startTime!.split(':').map(Number);
              const [endHour, endMinute] = task.endTime!.split(':').map(Number);
              const startTotalMinutes = startHour * 60 + startMinute;
              let endTotalMinutes = endHour * 60 + endMinute;

              // Handle overnight tasks (e.g., 10 PM - 2 AM)
              // If end time is before start time, it means the task spans midnight
              // For display purposes, extend it to midnight (end of current day)
              let durationMinutes = endTotalMinutes - startTotalMinutes;
              if (durationMinutes < 0) {
                // Task goes overnight - display until midnight
                endTotalMinutes = 1440; // 24:00 = midnight
                durationMinutes = endTotalMinutes - startTotalMinutes;
              }

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

            return tasksWithLayout.map(({ task, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
              let durationMinutes = endMinutes - startMinutes;

              // Safety check: if duration is negative or spans multiple days, warn and cap
              if (durationMinutes < 0) {
                console.warn('Invalid task duration (negative):', task.text, 'Duration:', durationMinutes, 'Start:', task.startTime, 'End:', task.endTime);
                durationMinutes = 60; // Default to 1 hour
              } else if (durationMinutes > 1439) {
                console.warn('Invalid task duration (>24h):', task.text, 'Duration:', durationMinutes, 'Start:', task.startTime, 'End:', task.endTime);
                durationMinutes = 1439; // Cap at 23:59 (full day minus 1 minute)
              }

              const top = startMinutes * 1.5 * todayZoomLevel;
              const height = Math.max(durationMinutes * 1.5 * todayZoomLevel, 28);
              const [startHour, startMinute] = task.startTime!.split(':').map(Number);

              // Calculate width and position for overlapping tasks
              let widthPercent, leftPercent, zIndex;

              if (isBackground) {
                // Background task: full width, behind others
                widthPercent = 100;
                leftPercent = 0;
                zIndex = 5; // Lower z-index to stay behind
              } else if (inOverlapGroup) {
                // Foreground tasks in an overlapping group: position on right side
                // Leave left 40% for background task visibility
                const availableSpace = 60;
                const startPosition = 40;
                widthPercent = availableSpace / totalColumns;
                leftPercent = startPosition + (column * widthPercent);
                zIndex = 15 + column; // Higher z-index to appear on top
              } else {
                // Standalone task (no overlap): full width
                widthPercent = 100;
                leftPercent = 0;
                zIndex = 10;
              }

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    console.log('🚀 DRAG START FROM TODAY:', { id: task.id, date: task.date, text: task.text });
                    e.dataTransfer.setData('taskId', task.id);
                    e.dataTransfer.setData('fromDate', task.date || dateString);
                    e.dataTransfer.setData('fromAllTasks', 'false');
                    e.dataTransfer.effectAllowed = 'move';
                    console.log('✅ Drag data set - taskId:', task.id, 'fromDate:', task.date || dateString);
                    e.currentTarget.style.opacity = '0.5';
                  }}
                  onDragEnd={(e) => {
                    console.log('🏁 DRAG END FROM TODAY');
                    e.currentTarget.style.opacity = '1';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Don't open dialog if we just finished resizing
                    if (isResizingRef.current) {
                      return;
                    }
                    handleOpenTaskDialog(startHour, task);
                  }}
                  className="group absolute rounded px-2 py-1 border-l-4 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 4px)`,
                    backgroundColor: task.color || '#f9fafb',
                    borderLeftColor: task.color || '#d1d5db',
                    zIndex: zIndex,
                  }}
                >
                  {/* Top resize handle */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      isResizingRef.current = true;

                      const startY = e.clientY;
                      const originalStartMinutes = startMinutes;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaY = moveEvent.clientY - startY;
                        const deltaMinutes = Math.round(deltaY / (1.5 * todayZoomLevel)); // 1.5px per minute * zoom
                        let newStartMinutes = originalStartMinutes + deltaMinutes;

                        // Cap at 0-1439 (00:00 - 23:59)
                        newStartMinutes = Math.max(0, Math.min(1439, newStartMinutes));

                        // Ensure start time is before end time (at least 15 min duration)
                        if (newStartMinutes < endMinutes - 15) {
                          const newStartHour = Math.floor(newStartMinutes / 60);
                          const newStartMinute = newStartMinutes % 60;
                          const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;

                          handleEditItem(task.id, task.text, newStartTime, task.endTime, task.color, task.description, task.isCompleted, task.date);
                        }
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        // Reset after a short delay to allow click event to be checked
                        setTimeout(() => {
                          isResizingRef.current = false;
                        }, 100);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />

                  {/* Bottom resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      isResizingRef.current = true;

                      const startY = e.clientY;
                      const originalEndMinutes = endMinutes;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaY = moveEvent.clientY - startY;
                        const deltaMinutes = Math.round(deltaY / (1.5 * todayZoomLevel)); // 1.5px per minute * zoom
                        let newEndMinutes = originalEndMinutes + deltaMinutes;

                        // Cap at 0-1439 (00:00 - 23:59)
                        newEndMinutes = Math.max(0, Math.min(1439, newEndMinutes));

                        // Ensure end time is after start time (at least 15 min duration)
                        if (newEndMinutes > startMinutes + 15) {
                          const newEndHour = Math.floor(newEndMinutes / 60);
                          const newEndMinute = newEndMinutes % 60;
                          const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                          handleEditItem(task.id, task.text, task.startTime, newEndTime, task.color, task.description, task.isCompleted, task.date);
                        }
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        // Reset after a short delay to allow click event to be checked
                        setTimeout(() => {
                          isResizingRef.current = false;
                        }, 100);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />

                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={(checked) => {
                        handleToggleItem(task.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {height >= 45 ? (
                        // Show time below title when there's enough space
                        <>
                          <div className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </div>
                          {(task.startTime || task.endTime) && (
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {task.startTime && convert24To12Hour(task.startTime)}
                              {task.startTime && task.endTime && ' - '}
                              {task.endTime && convert24To12Hour(task.endTime)}
                            </div>
                          )}
                        </>
                      ) : (
                        // Show time inline with title when space is limited
                        <div className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.text}
                          {(task.startTime || task.endTime) && (
                            <span className="text-[10px] text-gray-500 ml-1.5 font-normal">
                              {task.startTime && convert24To12Hour(task.startTime)}
                              {task.startTime && task.endTime && ' - '}
                              {task.endTime && convert24To12Hour(task.endTime)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0 mt-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            });
          })()}

          {/* Drag-to-create preview */}
          {isDraggingCreate && dragCreateStart && dragCreateEnd && (() => {
            const startMinutes = dragCreateStart.hour * 60 + dragCreateStart.minute;
            const endMinutes = dragCreateEnd.hour * 60 + dragCreateEnd.minute;

            const actualStart = Math.min(startMinutes, endMinutes);
            const actualEnd = Math.max(startMinutes, endMinutes + 20);

            const top = (actualStart / 60) * 90 * todayZoomLevel; // 90px per hour * zoom
            const height = Math.max(30, ((actualEnd - actualStart) / 60) * 90 * todayZoomLevel);

            // Format times for display in 12-hour format
            const startHour = Math.floor(actualStart / 60);
            const startMin = actualStart % 60;
            const endHour = Math.floor(actualEnd / 60);
            const endMin = actualEnd % 60;

            const formatTime12Hour = (hour: number, minute: number) => {
              const period = hour >= 12 ? 'pm' : 'am';
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              const displayMin = minute.toString().padStart(2, '0');
              return `${displayHour}:${displayMin}${period}`;
            };

            const startTimeStr = formatTime12Hour(startHour, startMin);
            const endTimeStr = formatTime12Hour(endHour, endMin);

            return (
              <div
                className="absolute rounded px-2 py-1 border-l-4 border-blue-400"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: '0',
                  right: '0',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  zIndex: 100,
                  pointerEvents: 'none'
                }}
              >
                <div className="text-xs text-blue-700 font-semibold">
                  {startTimeStr}
                </div>
                {height > 40 && (
                  <div className="text-xs text-blue-700 font-semibold absolute bottom-1 left-2">
                    {endTimeStr}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</CardContent>

      {/* Add Task/Content Dialog */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              closeAddDialog();
              resetFormState();
            }}
          />

          {/* Dialog Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dialog */}
            <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              {/* Close button */}
              <div className="flex justify-end px-6 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    closeAddDialog();
                    resetFormState();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

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
                {/* Header - only show when not in "both" mode */}
                {contentDisplayMode === 'tasks' && (
                  <div className="flex items-center gap-3 mb-2">
                    <ListTodo className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium text-gray-700">Add Task</span>
                  </div>
                )}
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none focus:border-indigo-500 placeholder:text-gray-400"
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

                {/* Include in content calendar */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={taskIncludeInContentCalendar}
                    onCheckedChange={(checked) => setTaskIncludeInContentCalendar(checked === true)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm text-gray-700">Include in content calendar</span>
                </label>

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
              <div className="px-6 pb-6 space-y-4 relative">
                {/* Header - only show when not in "both" mode */}
                {contentDisplayMode === 'content' && (
                  <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="w-5 h-5 text-gray-500" />
                    <span className="text-base font-medium text-gray-700">Add Content</span>
                  </div>
                )}
                {/* Hook/Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add hook"
                    value={contentHook}
                    onChange={(e) => setContentHook(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none focus:border-violet-500 placeholder:text-gray-400"
                  />
                </div>

                {/* Notes */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <textarea
                    placeholder="Add notes..."
                    value={contentNotes}
                    onChange={(e) => setContentNotes(e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {['violet', 'indigo', 'rose', 'amber', 'emerald', 'sky', 'orange', 'cyan'].map((color) => {
                      const colorMap: Record<string, string> = {
                        violet: '#ede9fe',
                        indigo: '#e0e7ff',
                        rose: '#ffe4e6',
                        amber: '#fef3c7',
                        emerald: '#d1fae5',
                        sky: '#e0f2fe',
                        orange: '#ffedd5',
                        cyan: '#cffafe',
                      };
                      return (
                        <button
                          key={color}
                          onClick={() => setContentColor(color)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all",
                            contentColor === color ? "ring-2 ring-offset-2 ring-violet-400" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: colorMap[color] }}
                        >
                          {contentColor === color && (
                            <Check className="w-4 h-4 mx-auto text-violet-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Hub CTA */}
                <button
                  onClick={() => {
                    // Create the content in Script Ideas column first
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
                              plannedDate: dateString,
                              plannedColor: contentColor as any,
                              isNew: true,
                            };
                            ideateColumn.cards.push(newCard);
                            setString(StorageKeys.productionKanban, JSON.stringify(columns));
                            emit(window, EVENTS.productionKanbanUpdated);
                            emit(window, EVENTS.scheduledContentUpdated);
                            loadProductionContent(); // Refresh content immediately
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

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
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
                    onClick={handleCreateContentFromDialog}
                    className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
