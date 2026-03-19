import { format, isSameDay } from "date-fns";
import { Trash2, Lightbulb, X, Check, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { getDateString } from "../utils/plannerUtils";
import { getTaskColorByHex, defaultScheduledColor, scheduleColors, isColorDark } from "../utils/colorConstants";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { cn } from "@/lib/utils";
import { TransformedGoogleEvent } from "@/types/google-calendar";

interface DayColumnProps {
  day: Date;
  index: number;
  dayString: string;
  dayData: PlannerDay | undefined;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  weeklyZoomLevel: number;
  isTaskDialogOpen: boolean;
  addDialogOpen: boolean;
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
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  savePlannerData: (data: PlannerDay[]) => void;
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
  showTasks: boolean;
  showContent: boolean;
  productionContent: {
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  };
  loadProductionContent?: () => void;
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  handleDeleteContent: (contentId: string, type: 'scheduled' | 'planned') => void;
  handleToggleComplete: (contentId: string, e: React.MouseEvent) => void;
  setContentTooltip: (tooltip: {
    text: string;
    timeStr: string;
    isPlanned: boolean;
    platforms?: string[];
    formats?: string[];
    x: number;
    y: number;
  } | null) => void;
  googleConnection: { isConnected: boolean; showEvents: boolean };
  googleEvents: TransformedGoogleEvent[];
}

export const DayColumn = ({
  day,
  index,
  dayString,
  dayData,
  plannerData,
  allTasks,
  weeklyZoomLevel,
  isTaskDialogOpen,
  addDialogOpen,
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
  setAllTasks,
  setPlannerData,
  savePlannerData,
  handleEditItem,
  handleToggleWeeklyTask,
  handleDeleteWeeklyTask,
  convert24To12Hour,
  showTasks,
  showContent,
  productionContent,
  loadProductionContent,
  onOpenContentDialog,
  handleDeleteContent,
  handleToggleComplete,
  setContentTooltip,
  googleConnection,
  googleEvents,
}: DayColumnProps) => {
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

                // Handle content drops (move between days AND update time slot)
                if (contentId && contentType) {
                  const savedData = getString(StorageKeys.productionKanban);
                  if (savedData) {
                    try {
                      const columns: KanbanColumn[] = JSON.parse(savedData);

                      // Calculate new time from drop position
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeY = e.clientY - rect.top;
                      const minuteFraction = relativeY / (48 * weeklyZoomLevel);
                      const rawMinute = Math.floor(minuteFraction * 60);
                      const roundedMinute = Math.round(rawMinute / 30) * 30;
                      const newStartTime = `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;

                      if (contentType === 'scheduled') {
                        const toScheduleColumn = columns.find(c => c.id === 'to-schedule');
                        if (toScheduleColumn) {
                          const card = toScheduleColumn.cards.find(c => c.id === contentId);
                          if (card) {
                            // Preserve original duration
                            let durationMinutes = 60;
                            if (card.scheduledStartTime && card.scheduledEndTime) {
                              const [sH, sM] = card.scheduledStartTime.split(':').map(Number);
                              const [eH, eM] = card.scheduledEndTime.split(':').map(Number);
                              durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
                            }
                            const newStartMinutes = hour * 60 + roundedMinute;
                            const newEndMinutes = newStartMinutes + Math.max(durationMinutes, 30);
                            const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;
                            card.scheduledDate = dayString;
                            card.schedulingStatus = 'scheduled';
                            card.scheduledStartTime = newStartTime;
                            card.scheduledEndTime = newEndTime;
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
                            // Preserve original duration
                            let durationMinutes = 60;
                            if (card.plannedStartTime && card.plannedEndTime) {
                              const [sH, sM] = card.plannedStartTime.split(':').map(Number);
                              const [eH, eM] = card.plannedEndTime.split(':').map(Number);
                              durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
                            }
                            const newStartMinutes = hour * 60 + roundedMinute;
                            const newEndMinutes = newStartMinutes + Math.max(durationMinutes, 30);
                            const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;
                            card.plannedDate = dayString;
                            card.plannedStartTime = newStartTime;
                            card.plannedEndTime = newEndTime;
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

            // Check if this content overlaps in time with any task for the same day
            const overlapsWithTask = showTasks && (dayData?.items || []).some(task => {
              if (!task.startTime || !task.endTime) return false;
              const [tStartH, tStartM] = task.startTime.split(':').map(Number);
              const [tEndH, tEndM] = task.endTime.split(':').map(Number);
              const taskStart = tStartH * 60 + tStartM;
              const taskEnd = tEndH * 60 + tEndM;
              return startTotalMinutes < taskEnd && endTotalMinutes > taskStart;
            });

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
                  onOpenContentDialog?.(content, isPlanned ? 'planned' : 'scheduled');
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const derivedFormats = [...(content.formats || [])];
                  if (content.contentType === 'image') {
                    const imageLabel = content.imageMode === 'carousel' ? 'Carousel' : 'Image';
                    if (!derivedFormats.includes(imageLabel)) derivedFormats.unshift(imageLabel);
                  }
                  setContentTooltip({
                    text: content.hook || content.title || '',
                    timeStr: `${convert24To12Hour(startTimeStr)} – ${convert24To12Hour(endTimeStr)}`,
                    isPlanned,
                    platforms: content.platforms || [],
                    formats: derivedFormats,
                    x: rect.left,
                    y: rect.bottom + 8,
                  });
                }}
                onMouseLeave={() => setContentTooltip(null)}
                className="absolute rounded-2xl cursor-pointer hover:brightness-95 group overflow-hidden"
                style={{
                  top: `${topPos}px`,
                  height: `${height}px`,
                  // Full width by default; half the task width on the right when overlapping with a task
                  ...(overlapsWithTask ? { right: '4px', width: '42.5%' } : { left: '4px', width: '85%' }),
                  background: isPlanned
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F2F4 50%, #E0D5DC 100%)'
                    : 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                  borderTop: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                  borderRight: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                  borderBottom: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                  borderLeft: isPlanned ? '5px solid #c4a0b4' : '5px solid #3a1830',
                  boxShadow: isPlanned
                    ? '0 2px 12px rgba(180, 130, 160, 0.45), 0 0 18px rgba(180, 130, 160, 0.2)'
                    : '0 2px 12px rgba(97, 42, 79, 0.55), 0 0 18px rgba(97, 42, 79, 0.3)',
                  zIndex: 120,
                }}
              >
                <div className="p-1 h-full flex flex-col overflow-hidden">
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
                        "text-[10px] font-medium truncate",
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

              // Other tasks are positioned on top
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
            const maxTaskWidth = 85;
            let widthPercent, leftPercent, zIndex;

            if (isBackground) {
              widthPercent = maxTaskWidth;
              leftPercent = 0;
              zIndex = 105;
            } else if (inOverlapGroup) {
              const availableSpace = 70;
              const startPosition = 10;
              widthPercent = availableSpace / totalColumns;
              leftPercent = startPosition + (column * widthPercent);
              zIndex = 115 + column;
            } else {
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
                onDragOver={(e) => {
                  if (e.dataTransfer.types.includes('contentid')) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onDrop={(e) => {
                  const contentId = e.dataTransfer.getData('contentId');
                  const contentType = e.dataTransfer.getData('contentType');
                  if (!contentId || !contentType) return;
                  e.preventDefault();
                  e.stopPropagation();
                  // Compute drop time from position relative to the timeline container
                  const timelineEl = e.currentTarget.closest('[data-timeline]') as HTMLElement;
                  if (!timelineEl) return;
                  const timelineRect = timelineEl.getBoundingClientRect();
                  const relativeY = e.clientY - timelineRect.top;
                  const totalMinutes = relativeY / (0.8 * weeklyZoomLevel);
                  const dropHour = Math.floor(totalMinutes / 60);
                  const dropMinuteRaw = Math.floor(totalMinutes % 60);
                  const dropMinute = Math.round(dropMinuteRaw / 30) * 30;
                  const newStartTime = `${dropHour.toString().padStart(2, '0')}:${dropMinute.toString().padStart(2, '0')}`;
                  const savedData = getString(StorageKeys.productionKanban);
                  if (!savedData) return;
                  try {
                    const columns: KanbanColumn[] = JSON.parse(savedData);
                    if (contentType === 'scheduled') {
                      const col = columns.find(c => c.id === 'to-schedule');
                      const card = col?.cards.find(c => c.id === contentId);
                      if (card) {
                        let dur = 60;
                        if (card.scheduledStartTime && card.scheduledEndTime) {
                          const [sH, sM] = card.scheduledStartTime.split(':').map(Number);
                          const [eH, eM] = card.scheduledEndTime.split(':').map(Number);
                          dur = (eH * 60 + eM) - (sH * 60 + sM);
                        }
                        const endMins = dropHour * 60 + dropMinute + Math.max(dur, 30);
                        card.scheduledDate = dayString;
                        card.schedulingStatus = 'scheduled';
                        card.scheduledStartTime = newStartTime;
                        card.scheduledEndTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;
                        setString(StorageKeys.productionKanban, JSON.stringify(columns));
                        emit(window, EVENTS.productionKanbanUpdated);
                        emit(window, EVENTS.scheduledContentUpdated);
                        loadProductionContent?.();
                        toast.success('Content moved');
                      }
                    } else if (contentType === 'planned') {
                      const col = columns.find(c => c.id === 'ideate');
                      const card = col?.cards.find(c => c.id === contentId);
                      if (card) {
                        let dur = 60;
                        if (card.plannedStartTime && card.plannedEndTime) {
                          const [sH, sM] = card.plannedStartTime.split(':').map(Number);
                          const [eH, eM] = card.plannedEndTime.split(':').map(Number);
                          dur = (eH * 60 + eM) - (sH * 60 + sM);
                        }
                        const endMins = dropHour * 60 + dropMinute + Math.max(dur, 30);
                        card.plannedDate = dayString;
                        card.plannedStartTime = newStartTime;
                        card.plannedEndTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;
                        setString(StorageKeys.productionKanban, JSON.stringify(columns));
                        emit(window, EVENTS.productionKanbanUpdated);
                        emit(window, EVENTS.scheduledContentUpdated);
                        loadProductionContent?.();
                        toast.success('Content moved');
                      }
                    }
                  } catch (err) {
                    console.error('Error moving content onto task:', err);
                  }
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
                    onOpenContentDialog?.(content, isPlanned ? 'planned' : 'scheduled');
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const derivedFormats = [...(content.formats || [])];
                    if (content.contentType === 'image') {
                      const imageLabel = content.imageMode === 'carousel' ? 'Carousel' : 'Image';
                      if (!derivedFormats.includes(imageLabel)) derivedFormats.unshift(imageLabel);
                    }
                    setContentTooltip({
                      text: content.hook || content.title || '',
                      timeStr: isPlanned ? 'Planned · No time set' : 'Scheduled · No time set',
                      isPlanned,
                      platforms: content.platforms || [],
                      formats: derivedFormats,
                      x: rect.left,
                      y: rect.bottom + 8,
                    });
                  }}
                  onMouseLeave={() => setContentTooltip(null)}
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
                  className="group text-xs px-2 py-1.5 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
                  style={{
                    background: isPlanned
                      ? 'linear-gradient(180deg, #FFFFFF 0%, #E8B8D0 50%, #C090A8 100%)'
                      : 'linear-gradient(180deg, #C8A0B8 0%, #8B5070 50%, #4A2040 100%)',
                    borderTop: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                    borderRight: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                    borderBottom: isPlanned ? '1px solid #d4b0c4' : '1px solid #5a2248',
                    borderLeft: isPlanned ? '5px solid #c4a0b4' : '5px solid #3a1830',
                    boxShadow: isPlanned
                      ? '0 2px 10px rgba(180, 130, 160, 0.4), 0 0 14px rgba(180, 130, 160, 0.2)'
                      : '0 2px 10px rgba(97, 42, 79, 0.5), 0 0 14px rgba(97, 42, 79, 0.25)',
                    opacity: isPast ? 0.5 : 1,
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
                      "truncate flex-1 text-[11px]",
                      content.isCompleted && "line-through opacity-60"
                    )} style={{ color: colors.text }}>
                      {content.hook || content.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContent(content.id, isPlanned ? 'planned' : 'scheduled');
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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

        {/* Google Calendar Events - only in Tasks Calendar or Both mode */}
        {googleConnection.showEvents && showTasks && (() => {
          const dayGoogleEvents = googleEvents.filter(e => e.date === dayString && e.startTime && e.endTime && !e.isAllDay);
          if (dayGoogleEvents.length === 0) return null;
          return (
            <div className="absolute top-0 left-0 right-0" style={{ zIndex: 118 }}>
              {dayGoogleEvents.map((gEvent) => {
                const [sH, sM] = gEvent.startTime!.split(':').map(Number);
                const [eH, eM] = gEvent.endTime!.split(':').map(Number);
                const startMin = sH * 60 + sM;
                const durMin = Math.max((eH * 60 + eM) - startMin, 30);
                const topPos = startMin * 0.8 * weeklyZoomLevel;
                const height = Math.max(durMin * 0.8 * weeklyZoomLevel - 1, 20);

                return (
                  <div
                    key={`google-${gEvent.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gEvent.htmlLink) window.open(gEvent.htmlLink, '_blank');
                    }}
                    className="absolute rounded px-1.5 py-1 border-l-[3px] cursor-pointer hover:brightness-95 overflow-hidden group"
                    style={{
                      top: `${topPos}px`,
                      height: `${height}px`,
                      left: '2px',
                      right: '2px',
                      background: 'linear-gradient(180deg, #E8F0FE 0%, #D2E3FC 50%, #AECBFA 100%)',
                      borderLeftColor: '#4285F4',
                      boxShadow: '0 1px 3px rgba(66,133,244,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#4285F4' }} />
                      <span className="text-[10px] font-medium truncate" style={{ color: '#1967D2' }}>
                        {gEvent.title}
                      </span>
                    </div>
                    {height >= 32 && (
                      <div className="text-[9px] opacity-80 pl-3" style={{ color: '#1967D2' }}>
                        {gEvent.startTime} - {gEvent.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

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
};
