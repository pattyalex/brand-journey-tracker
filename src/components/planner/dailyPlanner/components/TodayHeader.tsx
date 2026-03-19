import { format } from "date-fns";
import { Trash2, ListTodo, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PlannerItem, PlannerDay } from "@/types/planner";
import { getTaskColorByHex } from "../utils/colorConstants";
import { TransformedGoogleEvent } from "@/types/google-calendar";

interface TodayHeaderProps {
  selectedDate: Date;
  dateString: string;
  currentDay: PlannerDay;
  showTasks: boolean;
  editingTask: PlannerItem | null;
  dialogTaskColor: string;
  googleEventsForToday: TransformedGoogleEvent[];
  handleOpenTaskDialog: (hour: number, task?: PlannerItem) => void;
  handleToggleItem: (id: string) => void;
  handleDeleteItem: (id: string) => void;
}

export const TodayHeader = ({
  selectedDate,
  dateString,
  currentDay,
  showTasks,
  editingTask,
  dialogTaskColor,
  googleEventsForToday,
  handleOpenTaskDialog,
  handleToggleItem,
  handleDeleteItem,
}: TodayHeaderProps) => {
  return (
    <>
      {/* All-Day Google Calendar Events */}
      {googleEventsForToday.filter(e => e.isAllDay).length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-blue-100">
          <div className="flex flex-wrap gap-2">
            {googleEventsForToday.filter(e => e.isAllDay).map((gEvent) => (
              <div
                key={`google-allday-${gEvent.id}`}
                onClick={() => gEvent.htmlLink && window.open(gEvent.htmlLink, '_blank')}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer hover:brightness-95 transition-all border-l-4"
                style={{
                  background: 'linear-gradient(180deg, #E8F0FE 0%, #D2E3FC 100%)',
                  borderLeftColor: '#4285F4',
                }}
              >
                <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#4285F4' }} />
                <span className="text-xs font-medium" style={{ color: '#1967D2' }}>
                  {gEvent.title}
                </span>
                <span className="text-[10px] opacity-60" style={{ color: '#1967D2' }}>All day</span>
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
              {untimedTasks.map((task) => {
                // Use preview color if this task is being edited
                const isBeingEdited = editingTask?.id === task.id;
                const colorToUse = isBeingEdited && dialogTaskColor ? dialogTaskColor : task.color;
                const taskColorInfo = getTaskColorByHex(colorToUse);
                return (
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
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:shadow-sm transition-all border-l-4"
                    style={{
                      backgroundColor: taskColorInfo.fill,
                      borderLeftColor: taskColorInfo.border,
                    }}
                  >
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => handleToggleItem(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5"
                    />
                    <span
                      className={`text-xs font-medium ${task.isCompleted ? 'line-through opacity-50' : ''}`}
                      style={{ color: taskColorInfo.text }}
                    >
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
                );
              })}
            </div>
          </div>
        );
      })()}
    </>
  );
};
