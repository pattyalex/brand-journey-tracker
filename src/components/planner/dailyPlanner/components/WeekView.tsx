import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { Trash2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";

interface WeekViewProps {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
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
}

export const WeekView = ({
  selectedDate,
  plannerData,
  allTasks,
  setAllTasks,
  setPlannerData,
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
  handleEditItem,
  handleToggleWeeklyTask,
  handleDeleteWeeklyTask,
  convert24To12Hour,
}: WeekViewProps) => {
  return (
    <>
      <CardContent className="px-0">
        <div className="flex flex-col bg-white">
          {/* Fixed header row */}
          <div className="flex border-b border-gray-200">
            {/* Time column header */}
            <div className="flex-shrink-0 bg-white border-r border-gray-200 h-[60px] flex items-center justify-center" style={{ width: '40px' }}>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-[9px] text-gray-400 font-medium hover:text-gray-600 hover:bg-gray-50 px-1 py-0.5 rounded transition-colors cursor-pointer">
                    {getTimezoneDisplay()}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 bg-white" align="start">
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-700">Select Timezone</div>
                    <button
                      onClick={() => handleTimezoneChange('auto')}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors ${selectedTimezone === 'auto' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                    >
                      Auto (detect)
                    </button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    {timezones.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => handleTimezoneChange(tz.value)}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors ${selectedTimezone === tz.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span>{tz.label}</span>
                            <span className="text-[10px] text-gray-400">{tz.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{tz.offset}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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

          {/* Scrollable timeline area */}
          <div ref={weeklyScrollRef}>
            <ScrollArea className="h-[calc(100vh-320px)]">
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
                          borderTop: '1px solid #f9fafb'
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
                        style={{ borderRight: index < 6 ? '1px solid #f3f4f6' : 'none' }}
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
                                className={`h-full w-full relative ${isTaskDialogOpen ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
                                onMouseDown={(e) => {
                                  // Don't allow drag-to-create when dialog is open
                                  if (isTaskDialogOpen) return;

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
                                  const fromDate = e.dataTransfer.getData('fromDate');
                                  const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

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
                                  }
                                }}
                              />
                            </div>
                          ))}

                          {/* Tasks positioned absolutely by time */}
                          {(() => {
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
                                    onClick={() => {
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
                                      setIsTaskDialogOpen(true);
                                    }}
                                    className="h-full relative rounded cursor-pointer hover:brightness-95 transition-all overflow-hidden"
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
                                      <div className="flex-1 flex flex-col pr-2">
                                        <div className={`text-[11px] font-medium leading-tight ${item.isCompleted ? 'line-through opacity-70' : ''} text-gray-900 break-normal`}>
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
                                        className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}

                          {/* Tasks without time in list format */}
                          <div className="absolute top-0 left-0 right-0 px-1 py-2 space-y-1">
                            {(() => {
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
                                  onClick={() => {
                                    setEditingTask(item);
                                    setDialogTaskTitle(item.text);
                                    setDialogTaskDescription(item.description || "");
                                    setDialogStartTime(item.startTime ? convert24To12Hour(item.startTime) : "");
                                    setDialogEndTime(item.endTime ? convert24To12Hour(item.endTime) : "");
                                    setDialogTaskColor(item.color || "");
                                    setDialogAddToContentCalendar(item.isContentCalendar || false);
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
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </>
  );
};
