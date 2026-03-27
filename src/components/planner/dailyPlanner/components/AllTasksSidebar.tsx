import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ChevronRight, ListTodo, ClipboardList, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  /** When true, hides the header (icon + title) — used when tabs already provide context */
  hideHeader?: boolean;
}

const PLACEHOLDER_TASKS = [
  { id: 'p-0', text: 'Film this week\'s YouTube video' },
  { id: 'p-1', text: 'Reply to brand partnership emails' },
  { id: 'p-2', text: 'Schedule Instagram posts for next week' },
];

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
  hideHeader = false,
}: AllTasksSidebarProps) => {
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === 'collapsed';
  const { user } = useAuth();

  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    try { setDismissed(JSON.parse(localStorage.getItem(`dismissedAllTasksPlaceholders_${user.id}`) || '{}')); }
    catch { setDismissed({}); }
  }, [user?.id]);

  const dismissTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem(`dismissedAllTasksPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };

  const visiblePlaceholders = PLACEHOLDER_TASKS.filter(t => !dismissed[t.id]);

  const placeholderList = (
    <div className="pt-[22vh]">
      {/* Empty state illustration */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-6 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(97,42,79,0.07)' }}>
          <GripVertical className="w-5 h-5 text-[#612a4f]" />
        </div>
        <p className="text-[13px] font-medium text-gray-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Add your to-dos below, then drag into your timeline to schedule
        </p>
      </div>

      {/* Example */}
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 px-2 mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Example</p>
      {visiblePlaceholders.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-2 px-2 py-2 rounded-lg opacity-85 hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
          <span className="flex-1 text-[13px] text-gray-500 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {task.text}
          </span>
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
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOverAllTasks(false);
          const taskId = e.dataTransfer.getData('taskId');
          const fromDate = e.dataTransfer.getData('fromDate');
          const fromAllTasks = e.dataTransfer.getData('fromAllTasks');
          if (taskId && fromDate && fromAllTasks === 'false') {
            handleDropTaskFromCalendarToAllTasks(taskId, fromDate, allTasks.length);
          }
        }}
      >
        {!hideHeader && (
          <div className="flex items-center gap-2.5 mb-5 ml-2">
            <ListTodo className="w-5 h-5 text-gray-900" />
            <h2 className="text-xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>All Tasks</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {emptyWithPlaceholders && !isAddingTask && (
            visiblePlaceholders.length > 0 ? (
              placeholderList
            ) : (
              <div className="py-12 flex flex-col items-center gap-5 text-center px-4">
                <div
                  className="flex items-center justify-center text-white"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                    boxShadow: '0 8px 24px rgba(97,42,79,0.2)'
                  }}
                >
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-[#2d2a26] mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>No tasks yet</p>
                  <p className="text-sm text-[#8b7a85]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Start your to-do list</p>
                </div>
              </div>
            )
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
            onAddingStateChange={setIsAddingTask}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex-shrink-0 transition-all duration-300 relative",
        "",
        isAllTasksCollapsed ? 'w-12' : 'w-80'
      )}
      onDragEnter={(e) => { e.preventDefault(); setIsDraggingOverAllTasks(true); setIsDragOver(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOverAllTasks(false);
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOverAllTasks(false);
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        const fromDate = e.dataTransfer.getData('fromDate');
        const fromAllTasks = e.dataTransfer.getData('fromAllTasks');
        if (taskId && fromDate && fromAllTasks === 'false') {
          handleDropTaskFromCalendarToAllTasks(taskId, fromDate, allTasks.length);
        }
      }}
    >
      {/* Drop zone overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-[#612a4f]/40 pointer-events-none" style={{ background: 'linear-gradient(135deg, #F0EAED, #F8F6F6)' }}>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#612a4f]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#612a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Drop here</p>
          </div>
        </div>
      )}

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
                {!isAddingTask && (
                  visiblePlaceholders.length > 0 ? (
                    placeholderList
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-5 text-center px-4">
                      <div
                        className="flex items-center justify-center text-white"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                          boxShadow: '0 8px 24px rgba(97,42,79,0.2)'
                        }}
                      >
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#2d2a26] mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>No tasks yet</p>
                        <p className="text-sm text-[#8b7a85]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Start your to-do list</p>
                      </div>
                    </div>
                  )
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
                  onAddingStateChange={setIsAddingTask}
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
