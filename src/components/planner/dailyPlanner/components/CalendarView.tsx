import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { PlannerView, TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";

interface CalendarViewProps {
  calendarFilterMode: 'all' | 'content';
  setCalendarFilterMode: React.Dispatch<React.SetStateAction<'all' | 'content'>>;
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
  calendarFilterMode,
  setCalendarFilterMode,
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
    <>
      {/* Calendar Filter Toggle and Timezone Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setCalendarFilterMode('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              calendarFilterMode === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setCalendarFilterMode('content')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              calendarFilterMode === 'content'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Content Calendar
          </button>
        </div>
        <div className="flex-1 flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-[10px] text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer">
                <span className="font-medium">{getTimezoneDisplay()}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-white" align="end">
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
      </div>

      {/* Month Calendar Grid */}
      <CardContent className="px-0">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
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

                // Filter tasks based on mode
                let tasksToShow = dayData?.items || [];
                if (calendarFilterMode === 'content') {
                  // Filter to show only tasks marked for content calendar
                  tasksToShow = tasksToShow.filter(task => task.isContentCalendar === true);
                }
                // When calendarFilterMode === 'all', show ALL tasks (including those with isContentCalendar: true)

                return (
                  <div
                    key={dayString}
                    className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-all hover:bg-gray-50 cursor-pointer ${
                      !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                    }`}
                    onClick={() => {
                      setSelectedDate(day);
                      setCurrentView('today');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('bg-blue-50');

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
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday ? 'text-purple-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>

                    {/* Task indicators */}
                    <div className="space-y-1">
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
                          className="text-xs p-1 rounded truncate border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                          style={{ backgroundColor: task.color || '#f3f4f6' }}
                        >
                          <div className="flex items-center gap-1">
                            <div className="flex-1 truncate">{task.text}</div>
                          </div>
                        </div>
                      ))}
                      {tasksToShow.length > 3 && (
                        <div className="text-[10px] text-gray-500">
                          +{tasksToShow.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </CardContent>
    </>
  );
};
