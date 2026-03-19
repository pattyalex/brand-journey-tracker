import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PlannerItem } from "@/types/planner";
import { getTaskColorByHex } from "../utils/colorConstants";

interface TaskLayoutInfo {
  task: PlannerItem;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  column: number;
  totalColumns: number;
  isBackground: boolean;
  inOverlapGroup: boolean;
}

interface TimeSlotTaskProps {
  layoutInfo: TaskLayoutInfo;
  todayZoomLevel: number;
  dateString: string;
  showContent: boolean;
  editingTask: PlannerItem | null;
  dialogTaskColor: string;
  isResizingRef: React.MutableRefObject<boolean>;
  convert24To12Hour: (time: string) => string;
  handleOpenTaskDialog: (hour: number, task?: PlannerItem) => void;
  handleToggleItem: (id: string) => void;
  handleDeleteItem: (id: string) => void;
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
}

export const TimeSlotTask = ({
  layoutInfo,
  todayZoomLevel,
  dateString,
  showContent,
  editingTask,
  dialogTaskColor,
  isResizingRef,
  convert24To12Hour,
  handleOpenTaskDialog,
  handleToggleItem,
  handleDeleteItem,
  handleEditItem,
}: TimeSlotTaskProps) => {
  const { task, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup } = layoutInfo;

  let durationMinutes = endMinutes - startMinutes;

  // Safety check: if duration is negative or spans multiple days, warn and cap
  if (durationMinutes < 0) {
    console.warn('Invalid task duration (negative):', task.text, 'Duration:', durationMinutes, 'Start:', task.startTime, 'End:', task.endTime);
    durationMinutes = 60; // Default to 1 hour
  } else if (durationMinutes > 1439) {
    console.warn('Invalid task duration (>24h):', task.text, 'Duration:', durationMinutes, 'Start:', task.startTime, 'End:', task.endTime);
    durationMinutes = 1439; // Cap at 23:59 (full day minus 1 minute)
  }

  const top = (startMinutes * 1.5 * todayZoomLevel) + 0.5;
  const height = Math.max(durationMinutes * 1.5 * todayZoomLevel, 28) - 1;
  const [startHour, startMinute] = task.startTime!.split(':').map(Number);

  // Get task color info - use preview color if this task is being edited
  const isBeingEdited = editingTask?.id === task.id;
  const colorToUse = isBeingEdited && dialogTaskColor ? dialogTaskColor : task.color;
  const taskColorInfo = getTaskColorByHex(colorToUse);

  // Calculate width and position for overlapping tasks
  // When showing both content and tasks, tasks take left 50%, content takes right 45%
  const maxTaskWidth = showContent ? 50 : 88;
  let widthPercent, leftPercent, zIndex;

  if (isBackground) {
    // Background task
    widthPercent = maxTaskWidth;
    leftPercent = 0;
    zIndex = 5; // Lower z-index to stay behind
  } else if (inOverlapGroup) {
    // Foreground tasks in an overlapping group: position starting from left for better visibility
    const availableSpace = showContent ? 40 : 75;
    const startPosition = showContent ? 5 : 10;
    widthPercent = availableSpace / totalColumns;
    leftPercent = startPosition + (column * widthPercent);
    zIndex = 15 + column; // Higher z-index to appear on top
  } else {
    // Standalone task (no overlap)
    widthPercent = maxTaskWidth;
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
      data-time-item
      data-start-minutes={startMinutes}
      data-duration-minutes={durationMinutes}
      className="group absolute rounded px-2 py-1 border-l-4 hover:shadow-sm cursor-pointer overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPercent}%`,
        width: `calc(${widthPercent}% - 4px)`,
        backgroundColor: taskColorInfo.fill,
        borderLeftColor: taskColorInfo.border,
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
            const rawDeltaMinutes = deltaY / (1.5 * todayZoomLevel); // 1.5px per minute * zoom
            // Snap to 10-minute increments
            const deltaMinutes = Math.round(rawDeltaMinutes / 10) * 10;
            let newStartMinutes = originalStartMinutes + deltaMinutes;

            // Snap to 10-minute intervals
            newStartMinutes = Math.round(newStartMinutes / 10) * 10;

            // Cap at 0-1430 (00:00 - 23:50)
            newStartMinutes = Math.max(0, Math.min(1430, newStartMinutes));

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
            const rawDeltaMinutes = deltaY / (1.5 * todayZoomLevel); // 1.5px per minute * zoom
            // Snap to 10-minute increments
            const deltaMinutes = Math.round(rawDeltaMinutes / 10) * 10;
            let newEndMinutes = originalEndMinutes + deltaMinutes;

            // Snap to 10-minute intervals
            newEndMinutes = Math.round(newEndMinutes / 10) * 10;

            // Cap at 10-1440 (00:10 - 24:00)
            newEndMinutes = Math.max(10, Math.min(1440, newEndMinutes));

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
              <div
                className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through opacity-50' : ''}`}
                style={{ color: taskColorInfo.text }}
              >
                {task.text}
              </div>
              {(task.startTime || task.endTime) && (
                <div className="text-[10px] mt-0.5 opacity-70" style={{ color: taskColorInfo.text }}>
                  {task.startTime && convert24To12Hour(task.startTime)}
                  {task.startTime && task.endTime && ' - '}
                  {task.endTime && convert24To12Hour(task.endTime)}
                </div>
              )}
            </>
          ) : (
            // Show time inline with title when space is limited
            <div
              className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through opacity-50' : ''}`}
              style={{ color: taskColorInfo.text }}
            >
              {task.text}
              {(task.startTime || task.endTime) && (
                <span className="text-[10px] ml-1.5 font-normal opacity-70" style={{ color: taskColorInfo.text }}>
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
};

// Utility function to calculate task layout (overlap detection)
export const calculateTaskLayout = (items: PlannerItem[]) => {
  const tasksWithTimes = items.filter(item => item.startTime && item.endTime);

  // Calculate time ranges and detect overlaps
  const tasksWithLayout: TaskLayoutInfo[] = tasksWithTimes.map((task) => {
    const [startHour, startMinute] = task.startTime!.split(':').map(Number);
    const [endHour, endMinute] = task.endTime!.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    // Handle overnight tasks (e.g., 10 PM - 2 AM)
    let durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 0) {
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

  return tasksWithLayout;
};
