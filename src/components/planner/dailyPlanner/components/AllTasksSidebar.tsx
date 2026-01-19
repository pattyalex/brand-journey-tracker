import { useNavigate } from "react-router-dom";
import { PlannerItem } from "@/types/planner";
import { PlannerSection } from "@/components/planner/PlannerSection";
import { ChevronLeft, ListTodo, Video, TrendingUp, CalendarDays, Check, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard } from "@/pages/production/types";
import { ContentDisplayMode } from "../hooks/usePlannerState";

// Color options for scheduled content
const scheduleColors: Record<string, { bg: string; text: string }> = {
  indigo: { bg: '#e0e7ff', text: '#4338ca' },
  rose: { bg: '#ffe4e6', text: '#be123c' },
  amber: { bg: '#fef3c7', text: '#b45309' },
  emerald: { bg: '#d1fae5', text: '#047857' },
  sky: { bg: '#e0f2fe', text: '#0369a1' },
  violet: { bg: '#ede9fe', text: '#6d28d9' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  cyan: { bg: '#cffafe', text: '#0e7490' },
  sage: { bg: '#DCE5D4', text: '#5F6B52' },
};

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
}: AllTasksSidebarProps) => {
  const navigate = useNavigate();
  const today = new Date();

  // Derived values
  const showTasks = contentDisplayMode === 'tasks' || contentDisplayMode === 'both';
  const showContent = contentDisplayMode === 'content' || contentDisplayMode === 'both';

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Calculate monthly stats
  const monthlyStats = {
    posted: productionContent.scheduled.filter(c => {
      if (!c.scheduledDate) return false;
      const date = new Date(c.scheduledDate);
      return date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear &&
             date < today;
    }).length,
    scheduled: productionContent.scheduled.filter(c => {
      if (!c.scheduledDate) return false;
      const date = new Date(c.scheduledDate);
      return date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear &&
             date >= today;
    }).length,
    planned: productionContent.planned.filter(c => {
      if (!c.plannedDate) return false;
      const date = new Date(c.plannedDate);
      return date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear;
    }).length,
  };

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
        <div className="flex items-center justify-center gap-1 mb-4">
          <button
            onClick={() => setContentDisplayMode('tasks')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              contentDisplayMode === 'tasks'
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Tasks
          </button>
          <button
            onClick={() => setContentDisplayMode('content')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              contentDisplayMode === 'content'
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Video className="w-3.5 h-3.5" />
            Content
          </button>
          <button
            onClick={() => setContentDisplayMode('both')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              contentDisplayMode === 'both'
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Both
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Content Overview Section */}
          {showContent && (
            <>
              {/* Monthly Stats */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    {monthNames[currentMonth]} Overview
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{monthlyStats.posted}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{monthlyStats.scheduled}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{monthlyStats.planned}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Planned</div>
                  </div>
                </div>
              </div>

              {/* Planned Content Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Planned Content</h3>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">Ideas you're planning to create</p>

                {productionContent.planned.length === 0 ? (
                  <div className="text-center py-4 bg-violet-50/50 rounded-lg border border-violet-100">
                    <p className="text-xs text-gray-500">No planned content yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {productionContent.planned.slice(0, 5).map(card => {
                      const dateLabel = card.plannedDate
                        ? new Date(card.plannedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'No date';
                      return (
                        <div
                          key={card.id}
                          className="bg-white rounded-lg border border-violet-100 p-2.5 hover:border-violet-300 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{card.hook || card.title}</p>
                              <p className="text-[10px] text-violet-500 mt-0.5">{dateLabel}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {productionContent.planned.length > 5 && (
                      <p className="text-[10px] text-gray-400 text-center pt-1">
                        +{productionContent.planned.length - 5} more planned
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduled Content Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Scheduled Content</h3>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">Ready to post on these dates</p>

                {productionContent.scheduled.length === 0 ? (
                  <div className="text-center py-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <p className="text-xs text-gray-500">No scheduled content yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {productionContent.scheduled.slice(0, 5).map(card => {
                      const colors = scheduleColors[card.scheduledColor || 'indigo'] || scheduleColors.indigo;
                      const dateLabel = card.scheduledDate
                        ? new Date(card.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'No date';
                      return (
                        <div
                          key={card.id}
                          className="rounded-lg p-2.5 transition-colors"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <div className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: colors.text }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: colors.text }}>{card.hook || card.title}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: colors.text, opacity: 0.8 }}>{dateLabel}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {productionContent.scheduled.length > 5 && (
                      <p className="text-[10px] text-gray-400 text-center pt-1">
                        +{productionContent.scheduled.length - 5} more scheduled
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CTA to Content Hub - only show when Content mode is selected (not Both) */}
              {contentDisplayMode === 'content' && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/production')}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl p-4 text-left transition-all hover:shadow-lg hover:shadow-indigo-200/50"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Ready to create?</h4>
                          <p className="text-xs text-indigo-100 mt-0.5">Head to Content Hub to develop your ideas</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tasks Section */}
          {showTasks && (
            <div className={showContent ? "pt-4 border-t border-gray-200" : ""}>
              {showContent && (
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-800">All Tasks</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
