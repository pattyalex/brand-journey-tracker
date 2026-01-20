import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface AllTasksSidebarProps {
  isAllTasksCollapsed: boolean;
  setIsAllTasksCollapsed: (value: boolean) => void;
  setIsDraggingOverAllTasks: (value: boolean) => void;
  allTasks: PlannerItem[];
  handleToggleAllTask: (id: string) => void;
  handleDeleteAllTask: (id: string) => void;
  handleEditAllTask: (
    id: string,
    newText: string,
    startTime?: string,
    endTime?: string,
    color?: string,
    description?: string
  ) => void;
  handleAddAllTask: (text: string, section: PlannerItem["section"]) => void;
  handleReorderAllTasks: (reorderedTasks: PlannerItem[]) => void;
  handleDropTaskFromWeeklyToAllTasks: (draggedTaskId: string, targetTaskId: string, fromDate: string) => void;
  handleDropTaskFromCalendarToAllTasks: (taskId: string, fromDate: string, targetIndex: number) => void;
}

export const AllTasksSidebar = ({
  isAllTasksCollapsed,
  setIsAllTasksCollapsed,
  setIsDraggingOverAllTasks,
  allTasks,
  handleToggleAllTask,
  handleDeleteAllTask,
  handleEditAllTask,
  handleAddAllTask,
  handleReorderAllTasks,
  handleDropTaskFromWeeklyToAllTasks,
  handleDropTaskFromCalendarToAllTasks,
}: AllTasksSidebarProps) => {
  return (
    <div
      className={cn(
        "h-full flex-shrink-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-r border-gray-200 transition-all duration-300 relative",
        isAllTasksCollapsed ? 'w-12' : 'w-[320px] min-w-[300px]'
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDraggingOverAllTasks(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOverAllTasks(false);
        }
      }}
      onDrop={(e) => {
        setIsDraggingOverAllTasks(false);
      }}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className={cn(
          "w-4 h-4 text-gray-600 transition-transform duration-300",
          isAllTasksCollapsed && "rotate-180"
        )} />
      </button>

      {/* Content */}
      <div className={cn(
        "h-full flex flex-col transition-all duration-300",
        isAllTasksCollapsed ? "px-2 py-4 opacity-0 overflow-hidden" : "px-4 py-4 opacity-100"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">All Tasks</h2>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto">
          <PlannerSection
            title=""
            items={allTasks}
            section="morning"
            onToggleItem={handleToggleAllTask}
            onDeleteItem={handleDeleteAllTask}
            onEditItem={handleEditAllTask}
            onAddItem={handleAddAllTask}
            onReorderItems={handleReorderAllTasks}
            isAllTasksSection={true}
            onDropTaskFromWeekly={handleDropTaskFromWeeklyToAllTasks}
            onDropTaskFromCalendar={handleDropTaskFromCalendarToAllTasks}
          />
        </div>
      </div>
    </div>
  );
};
