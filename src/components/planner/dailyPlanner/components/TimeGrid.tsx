import { PlannerItem } from "@/types/planner";
import { PlannerDay } from "@/types/planner";
import { KanbanColumn, ProductionCard } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { format } from "date-fns";

interface TimeGridProps {
  todayZoomLevel: number;
  dateString: string;
  currentDay: PlannerDay;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  tasks: string;
  greatDay: string;
  grateful: string;
  addDialogOpen: boolean;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setIsDraggingCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setDragCreateStart: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setDragCreateEnd: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
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
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  onOpenTimePickerDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  resolvedTimezone: string;
  onScheduleHint?: () => void;
}

export const TimeGrid = ({
  todayZoomLevel,
  dateString,
  currentDay,
  plannerData,
  allTasks,
  tasks,
  greatDay,
  grateful,
  addDialogOpen,
  setPlannerData,
  setAllTasks,
  setIsDraggingCreate,
  setDragCreateStart,
  setDragCreateEnd,
  handleEditItem,
  savePlannerData,
  saveAllTasks,
  onOpenTimePickerDialog,
  resolvedTimezone,
  onScheduleHint,
}: TimeGridProps) => {
  return (
    <>
      {/* Hour labels and grid lines */}
      {Array.from({ length: 24 }, (_, i) => {
        const hour = i;

        return (
          <div
            key={hour}
            data-hour-row={hour}
            className="absolute left-0 right-0"
            style={{ top: `${hour * 90 * todayZoomLevel}px`, height: `${90 * todayZoomLevel}px` }}
          >
            {/* Hour row container */}
            <div className="flex h-full border-t border-gray-300 bg-white">
              {/* 10-minute slots (6 slots per hour) */}
              <div className="flex-1 flex flex-col">
                {[0, 10, 20, 30, 40, 50].map((minute, idx) => {
                  return (
                    <div
                      key={`${hour}-${minute}`}
                      className={`flex-1 relative group/slot hover:bg-gray-100 transition-colors ${addDialogOpen ? 'pointer-events-none' : 'cursor-crosshair'}`}
                      onMouseDown={(e) => {
                        // Don't allow drag-to-create when dialog is open
                        if (addDialogOpen) return;
                        // Content-only mode: show schedule hint
                        if (onScheduleHint) {
                          onScheduleHint();
                          return;
                        }
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
                        const contentId = e.dataTransfer.getData('contentId');
                        const contentType = e.dataTransfer.getData('contentType');

                        // Handle content drop from Ready to Post sidebar
                        if (contentId && (contentType === 'ready-to-post' || contentType === 'scheduled')) {
                          const savedData = getString(StorageKeys.productionKanban);
                          if (savedData) {
                            try {
                              const columns: KanbanColumn[] = JSON.parse(savedData);
                              let scheduledCard: ProductionCard | null = null;
                              columns.forEach(column => {
                                const card = column.cards.find(c => c.id === contentId);
                                if (card) {
                                  card.scheduledDate = dateString;
                                  card.schedulingStatus = 'scheduled';
                                  const hourStr = hour.toString().padStart(2, '0');
                                  const minuteStr = minute.toString().padStart(2, '0');
                                  card.scheduledStartTime = `${hourStr}:${minuteStr}`;
                                  // Default 1 hour duration
                                  const endHour = Math.min(hour + 1, 23);
                                  card.scheduledEndTime = `${endHour.toString().padStart(2, '0')}:${minuteStr}`;
                                  card.scheduledTimezone = resolvedTimezone;
                                  scheduledCard = { ...card };
                                }
                              });
                              if (scheduledCard) {
                                setString(StorageKeys.productionKanban, JSON.stringify(columns));
                                emit(window, EVENTS.productionKanbanUpdated);
                                emit(window, EVENTS.scheduledContentUpdated);
                                onOpenTimePickerDialog?.(scheduledCard, 'scheduled');
                              }
                            } catch (err) {
                              console.error('Error scheduling content:', err);
                            }
                          }
                          return;
                        }

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
                            section: "morning",
                            timezone: resolvedTimezone,
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
    </>
  );
};
