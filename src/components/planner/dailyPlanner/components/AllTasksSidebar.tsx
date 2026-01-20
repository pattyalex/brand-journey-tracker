import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ListTodo, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard } from "@/pages/production/types";
import { ContentDisplayMode } from "../hooks/usePlannerState";

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
  contentDisplayMode: ContentDisplayMode;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
  selectedDate: Date;
  productionContent: {
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  };
  loadProductionContent?: () => void;
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
  contentDisplayMode,
  setContentDisplayMode,
  selectedDate,
  productionContent,
  loadProductionContent,
}: AllTasksSidebarProps) => {
  // Derived values
  const showTasks = contentDisplayMode === 'tasks' || contentDisplayMode === 'both';
  const showContent = contentDisplayMode === 'content' || contentDisplayMode === 'both';

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
        {/* Display Mode Toggle */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium text-center mb-2">
            Show on calendar
          </p>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setContentDisplayMode('tasks')}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                contentDisplayMode === 'tasks'
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ListTodo className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={() => setContentDisplayMode('content')}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                contentDisplayMode === 'content'
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Video className="w-4 h-4" />
              Content
            </button>
            <button
              onClick={() => setContentDisplayMode('both')}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                contentDisplayMode === 'both'
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Both
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Tasks Section */}
          {showTasks && (
            <div>
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
          )}
        </div>
      </div>
    </div>
  );
};
