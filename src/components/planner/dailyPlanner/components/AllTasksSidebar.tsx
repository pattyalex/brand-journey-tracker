import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
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
  /** When true, renders just the content without outer wrapper (for combined sidebar) */
  embedded?: boolean;
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
  embedded = false,
}: AllTasksSidebarProps) => {
  // Embedded mode - render just the content for combined sidebar
  if (embedded) {
    return (
      <div
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
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-5 h-5 text-black" />
          <h2 className="text-lg font-semibold text-gray-800">All Tasks</h2>
        </div>

        {/* Tasks List - use max height to prevent expansion */}
        <div className="max-h-[300px] overflow-y-auto">
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
    );
  }

  return (
    <div
      className={cn(
        "h-full flex-shrink-0 bg-[#F7F8FC] transition-all duration-300 relative",
        isAllTasksCollapsed ? 'w-12' : 'w-80'
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
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {isAllTasksCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content wrapper with overflow-hidden to prevent text reflow during transition */}
      <div className="h-full overflow-hidden">
        <div className={cn(
          "p-5 h-full flex flex-col w-80 transition-opacity duration-300",
          isAllTasksCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <ListTodo className="w-5 h-5 text-black" />
            <h2 className="text-base font-semibold text-gray-900">All Tasks</h2>
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
    </div>
  );
};
