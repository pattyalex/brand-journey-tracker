import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { PlannerItem } from "@/types/planner";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TIMEZONES } from "../utils/plannerUtils";
import { PlannerDerived, PlannerHelpers, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";

interface TodayViewProps {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  helpers: PlannerHelpers;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
}

export const TodayView = ({ state, derived, refs, helpers, setters, actions }: TodayViewProps) => {
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
  } = state;

  const { dateString, currentDay, colors, getTimezoneDisplay } = derived;
  const { todayScrollRef, isResizingRef } = refs;
  const { convert24To12Hour } = helpers;
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
<CardContent className="px-0">
  <div ref={todayScrollRef}>
    <div className="flex flex-col overflow-hidden bg-white">
      {/* Fixed header row */}
      <div className="flex border-b border-gray-200">
        {/* Time column header */}
        <div className="flex-shrink-0 border-r border-gray-200 h-[60px] flex items-center justify-center" style={{ width: '60px' }}>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-[11px] text-gray-400 font-medium hover:text-gray-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer" style={{ marginTop: '4px' }}>
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
                {TIMEZONES.map((tz) => (
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
      <ScrollArea className="h-[calc(100vh-260px)]">
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

        {/* Render all tasks with absolute positioning */}
        <div className="absolute top-0 left-2 right-2">
          {(() => {
            const tasksWithTimes = currentDay.items.filter(item => item.startTime && item.endTime);

            // Calculate time ranges and detect overlaps
            const tasksWithLayout = tasksWithTimes.map((task, index) => {
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

            return tasksWithLayout.map(({ task, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
              let durationMinutes = endMinutes - startMinutes;

              // Safety check: if duration is negative or unreasonably long, cap it
              if (durationMinutes < 0 || durationMinutes > 720) { // Max 12 hours
                console.warn('Invalid task duration:', task.text, 'Duration:', durationMinutes, 'Start:', task.startTime, 'End:', task.endTime);
                durationMinutes = 60; // Default to 1 hour
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
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</CardContent>
  );
};
