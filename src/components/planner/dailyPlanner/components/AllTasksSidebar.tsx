import { PlannerItem } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ChevronRight as ChevronRightCollapse } from "lucide-react";

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
  handleDropTaskFromCalendarToAllTasks
}: AllTasksSidebarProps) => {
  return (
    <div
      className={`${isAllTasksCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 ${isAllTasksCollapsed ? 'p-2' : 'p-5'} transition-all duration-300 shadow-sm`}
      onDragEnter={(e) => {
        console.log('👉 DRAG ENTER ALL TASKS');
        e.preventDefault();
        setIsDraggingOverAllTasks(true);
      }}
      onDragOver={(e) => {
        console.log('⬆️ DRAG OVER ALL TASKS');
        e.preventDefault();
        // Don't stopPropagation - let it bubble to children
      }}
      onDragLeave={(e) => {
        // Only hide if we're leaving the container, not entering a child
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOverAllTasks(false);
        }
      }}
      onDrop={(e) => {
        // Don't handle the drop here - let it bubble to PlannerSection
        // Just clean up the drag state
        console.log('🎯 Parent container onDrop triggered');
        setIsDraggingOverAllTasks(false);
      }}
    >
      {isAllTasksCollapsed ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
        >
          <ChevronRightCollapse className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      ) : (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-purple-600">
              All Tasks
            </h2>
            <button
              onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
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
      )}
    </div>
  );
};
