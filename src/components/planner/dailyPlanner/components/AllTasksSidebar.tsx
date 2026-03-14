import { useState } from "react";
import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ChevronRight, ListTodo, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const PLACEHOLDER_TASKS = [
  { id: 'p-0', text: 'Film this week\'s YouTube video' },
  { id: 'p-1', text: 'Reply to brand partnership emails' },
  { id: 'p-2', text: 'Schedule Instagram posts for next week' },
];

const DISMISSED_KEY = 'dismissedAllTasksPlaceholders';

const getDismissed = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}'); }
  catch { return {}; }
};

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
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === 'collapsed';

  const [dismissed, setDismissed] = useState<Record<string, boolean>>(getDismissed);

  const dismissTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const visiblePlaceholders = PLACEHOLDER_TASKS.filter(t => !dismissed[t.id]);

  const placeholderList = (
    <div className="mb-2">
      {visiblePlaceholders.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-2 px-2 py-2.5 rounded-lg opacity-30 hover:opacity-60 transition-opacity"
        >
          {/* Fake checkbox */}
          <div className="w-4 h-4 rounded border flex-shrink-0" style={{ borderColor: 'rgba(97,42,79,0.3)' }} />
          <span className="flex-1 text-sm font-medium text-gray-700 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {task.text}
          </span>
          <button
            onClick={(e) => dismissTask(task.id, e)}
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all opacity-50 hover:opacity-100 flex-shrink-0"
            title="Remove"
          >
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );

  const emptyWithPlaceholders = allTasks.length === 0;

  // Embedded mode - render just the content for combined sidebar
  if (embedded) {
    return (
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDraggingOverAllTasks(true); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDraggingOverAllTasks(false);
          }
        }}
        onDrop={() => setIsDraggingOverAllTasks(false)}
      >
        <div className="flex items-center gap-2.5 mb-4 ml-2">
          <ListTodo className="w-5 h-5 text-gray-900" />
          <h2 className="text-xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>All Tasks</h2>
        </div>
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
        "h-full flex-shrink-0 transition-all duration-300 relative",
        "bg-gradient-to-br from-[#F0EAED] via-[#F8F6F6] to-[#FAFAFA]",
        isAllTasksCollapsed ? 'w-12' : 'w-80'
      )}
      onDragEnter={(e) => { e.preventDefault(); setIsDraggingOverAllTasks(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOverAllTasks(false);
        }
      }}
      onDrop={() => setIsDraggingOverAllTasks(false)}
    >
      {/* Collapse/Expand Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {isAllTasksCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {isAllTasksCollapsed ? "Collapse calendar" : "Expand calendar"}
        </TooltipContent>
      </Tooltip>

      {/* Content */}
      <div className="h-full overflow-hidden">
        <div className={cn(
          "p-5 h-full flex flex-col w-80 transition-opacity duration-300",
          isAllTasksCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5 ml-2">
            <ListTodo className="w-5 h-5 text-gray-900" />
            <h2 className="text-xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>All Tasks</h2>
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto">
            {emptyWithPlaceholders ? (
              <>
                {visiblePlaceholders.length > 0 ? (
                  placeholderList
                ) : (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
                      <ClipboardList className="w-4 h-4 text-[#612a4f]" />
                    </div>
                    <p className="text-xs text-[#8b7a85] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your to-do list is waiting to be written.</p>
                  </div>
                )}
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
              </>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
