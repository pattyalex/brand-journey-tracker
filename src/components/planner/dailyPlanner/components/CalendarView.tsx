import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { PlannerView, TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";

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
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setIsTaskDialogOpen,
}: CalendarViewProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Month Calendar Grid */}
      <CardContent className="pl-0 pr-4 flex-1 flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2 flex-shrink-0">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5 flex-1" style={{ gridAutoRows: '1fr' }}>
          {(() => {
            const monthStart = startOfMonth(selectedDate);
            const monthEnd = endOfMonth(selectedDate);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
            const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: startDate, end: endDate });

            return days.map((day) => {
              const dayString = getDateString(day);
              const dayData = plannerData.find(d => d.date === dayString);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

              // Show all tasks
              const tasksToShow = dayData?.items || [];

              return (
                <div
                  key={dayString}
                  className={`min-h-[120px] rounded-lg border p-1.5 transition-all cursor-pointer relative ${
                    isCurrentMonth
                      ? 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedDate(day);
                    setCurrentView('today');
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('bg-indigo-100', 'border-indigo-400', 'border-2', 'scale-105');

                    const taskId = e.dataTransfer.getData('taskId');
                    const fromDate = e.dataTransfer.getData('fromDate');
                    const toDate = dayString;

                    console.log('📅 CALENDAR VIEW DROP - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

                    if (taskId && !fromDate) {
                      // Task is coming from All Tasks (no date)
                      const taskToMove = allTasks.find(t => t.id === taskId);
                      if (!taskToMove) return;

                      // Store the original task in case user cancels
                      setPendingTaskFromAllTasks(taskToMove);

                      // Remove from All Tasks
                      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                      setAllTasks(filteredAllTasks);

                      // Open dialog to edit task details before adding to day
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

                      // Remove from source day
                      const updatedPlannerData = [...plannerData];
                      updatedPlannerData[fromDayIndex] = {
                        ...updatedPlannerData[fromDayIndex],
                        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
                      };

                      // Add to destination day
                      const toDayIndex = updatedPlannerData.findIndex(d => d.date === toDate);
                      const movedTask = { ...taskToMove, date: toDate };

                      if (toDayIndex >= 0) {
                        updatedPlannerData[toDayIndex] = {
                          ...updatedPlannerData[toDayIndex],
                          items: [...updatedPlannerData[toDayIndex].items, movedTask]
                        };
                      } else {
                        // Create new day entry if it doesn't exist
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
                  }}
                >
                  <span className={`absolute top-1.5 left-2 text-sm font-medium ${
                    isToday ? 'text-indigo-600 font-bold' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>

                  {/* Task indicators */}
                  <div className="absolute top-7 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto">
                    {tasksToShow.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => {
                          console.log('🚀 DRAG START - Calendar Task:', task.id, task.text, 'from:', dayString);
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.setData('taskId', task.id);
                          e.dataTransfer.setData('fromDate', dayString);
                          e.dataTransfer.setData('fromAllTasks', 'false');
                          e.dataTransfer.effectAllowed = 'move';
                          setTimeout(() => {
                            e.currentTarget.style.opacity = '0.5';
                          }, 0);
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        className="text-[11px] px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing transition-colors hover:shadow-sm"
                        style={{ backgroundColor: task.color || '#e0e7ff' }}
                      >
                        <div className="flex items-center gap-1">
                          <div className="flex-1 truncate leading-tight">{task.text}</div>
                        </div>
                      </div>
                    ))}
                    {tasksToShow.length > 3 && (
                      <div className="text-[10px] text-gray-500 px-2">
                        +{tasksToShow.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </CardContent>
    </div>
  );
};
