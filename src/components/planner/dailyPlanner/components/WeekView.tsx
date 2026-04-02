import { eachDayOfInterval, endOfWeek, startOfWeek } from "date-fns";
import { Lightbulb, Clock, FileText, GripHorizontal, ListTodo } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { TimezoneOption } from "../types";
import { getDateString } from "../utils/plannerUtils";
import { TaskColorPicker } from "./TaskColorPicker";
import { TimePicker } from "./TimePicker";
import { ContentDisplayMode } from "../hooks/usePlannerState";
import { getWeekStartsOn } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ProductionCard } from "@/pages/production/types";
import { useWeekViewState } from "../hooks/useWeekViewState";
import { WeekHeader } from "./WeekHeader";
import { DayColumn } from "./DayColumn";

interface WeekViewProps {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  getTimezoneDisplay: () => string;
  handleTimezoneChange: (timezone: string) => void;
  selectedTimezone: string;
  timezones: TimezoneOption[];
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  weeklyZoomLevel: number;
  isTaskDialogOpen: boolean;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  isResizingRef: React.MutableRefObject<boolean>;
  editingTask: PlannerItem | null;
  dialogTaskColor: string;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskDialogPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  handleEditItem: (
    id: string,
    text: string,
    startTime?: string,
    endTime?: string,
    color?: string,
    description?: string,
    isCompleted?: boolean,
    date?: string,
    isContentCalendar?: boolean
  ) => void;
  handleToggleWeeklyTask: (id: string, dayString: string) => void;
  handleDeleteWeeklyTask: (id: string, dayString: string) => void;
  convert24To12Hour: (time: string) => string;
  showTasks?: boolean;
  showContent?: boolean;
  contentDisplayMode?: ContentDisplayMode;
  productionContent?: {
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  };
  setProductionContent?: React.Dispatch<React.SetStateAction<{
    scheduled: ProductionCard[];
    planned: ProductionCard[];
  }>>;
  weeklyAddDialogState?: {
    open: boolean;
    dayString: string;
    startTime: string;
    endTime: string;
  };
  setWeeklyAddDialogState?: React.Dispatch<React.SetStateAction<{
    open: boolean;
    dayString: string;
    startTime: string;
    endTime: string;
  }>>;
  loadProductionContent?: () => void;
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  onOpenTimePickerDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  onOpenContentFlow?: (cardId: string) => void;
  resolvedTimezone: string;
}

export const WeekView = ({
  selectedDate,
  plannerData,
  allTasks,
  setAllTasks,
  setPlannerData,
  savePlannerData,
  saveAllTasks,
  getTimezoneDisplay,
  handleTimezoneChange,
  selectedTimezone,
  timezones,
  weeklyScrollRef,
  weeklyZoomLevel,
  isTaskDialogOpen,
  weeklyDraggingCreate,
  weeklyDragCreateStart,
  weeklyDragCreateEnd,
  setWeeklyDraggingCreate,
  setWeeklyDragCreateStart,
  setWeeklyDragCreateEnd,
  setDraggedWeeklyTaskId,
  isResizingRef,
  editingTask,
  dialogTaskColor,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setIsTaskDialogOpen,
  setTaskDialogPosition,
  handleEditItem,
  handleToggleWeeklyTask,
  handleDeleteWeeklyTask,
  convert24To12Hour,
  showTasks = true,
  showContent = false,
  contentDisplayMode = 'tasks',
  productionContent = { scheduled: [], planned: [] },
  setProductionContent,
  weeklyAddDialogState,
  setWeeklyAddDialogState,
  loadProductionContent,
  onOpenContentDialog,
  onOpenTimePickerDialog,
  onOpenContentFlow,
  resolvedTimezone,
}: WeekViewProps) => {
  // Extract state/handlers into custom hook
  const viewState = useWeekViewState({
    selectedDate,
    plannerData,
    allTasks,
    setAllTasks,
    setPlannerData,
    savePlannerData,
    weeklyScrollRef,
    weeklyZoomLevel,
    contentDisplayMode,
    productionContent,
    setProductionContent,
    loadProductionContent,
    weeklyAddDialogState,
    setWeeklyAddDialogState,
  });

  return (
    <>
      <CardContent className="px-0 h-full flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Fixed header row */}
          <WeekHeader />

          {/* Scrollable timeline area */}
          <div ref={weeklyScrollRef} className="flex-1 min-h-0 overflow-auto">
              <div className="flex">
                {/* Time column */}
                <div className="flex-shrink-0 border-r border-gray-200" style={{ width: '40px' }}>
                  <div
                    data-zoom-container="weekly-time"
                    className="relative"
                    style={{ height: `${24 * 48 * weeklyZoomLevel}px` }}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        data-hour-row={hour}
                        className="absolute left-0 right-0 flex items-start justify-end pr-1 pt-0.5"
                        style={{ top: `${hour * 48 * weeklyZoomLevel}px`, height: `${48 * weeklyZoomLevel}px` }}
                      >
                        <span className="text-[10px] text-gray-400 leading-none">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day columns */}
                <div className="flex-1 grid grid-cols-7 gap-0 relative">
                  {/* Horizontal grid lines spanning all days */}
                  <div className="absolute inset-0 pointer-events-none" style={{ height: `${24 * 48 * weeklyZoomLevel}px` }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        data-grid-line={hour}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${hour * 48 * weeklyZoomLevel}px`,
                          borderTop: '1px solid #eceef0'
                        }}
                      />
                    ))}
                  </div>

                  {eachDayOfInterval({
                    start: startOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() }),
                    end: endOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() })
                  }).map((day, index) => {
                    const dayString = getDateString(day);
                    const dayData = plannerData.find(d => d.date === dayString);

                    return (
                      <DayColumn
                        key={dayString}
                        day={day}
                        index={index}
                        dayString={dayString}
                        dayData={dayData}
                        plannerData={plannerData}
                        allTasks={allTasks}
                        weeklyZoomLevel={weeklyZoomLevel}
                        isTaskDialogOpen={isTaskDialogOpen}
                        addDialogOpen={viewState.addDialogOpen}
                        weeklyDraggingCreate={weeklyDraggingCreate}
                        weeklyDragCreateStart={weeklyDragCreateStart}
                        weeklyDragCreateEnd={weeklyDragCreateEnd}
                        setWeeklyDraggingCreate={setWeeklyDraggingCreate}
                        setWeeklyDragCreateStart={setWeeklyDragCreateStart}
                        setWeeklyDragCreateEnd={setWeeklyDragCreateEnd}
                        setDraggedWeeklyTaskId={setDraggedWeeklyTaskId}
                        isResizingRef={isResizingRef}
                        editingTask={editingTask}
                        dialogTaskColor={dialogTaskColor}
                        setEditingTask={setEditingTask}
                        setDialogTaskTitle={setDialogTaskTitle}
                        setDialogTaskDescription={setDialogTaskDescription}
                        setDialogStartTime={setDialogStartTime}
                        setDialogEndTime={setDialogEndTime}
                        setDialogTaskColor={setDialogTaskColor}
                        setDialogAddToContentCalendar={setDialogAddToContentCalendar}
                        setIsTaskDialogOpen={setIsTaskDialogOpen}
                        setTaskDialogPosition={setTaskDialogPosition}
                        setAllTasks={setAllTasks}
                        setPlannerData={setPlannerData}
                        savePlannerData={savePlannerData}
                        handleEditItem={handleEditItem}
                        handleToggleWeeklyTask={handleToggleWeeklyTask}
                        handleDeleteWeeklyTask={handleDeleteWeeklyTask}
                        convert24To12Hour={convert24To12Hour}
                        showTasks={showTasks}
                        showContent={showContent}
                        productionContent={productionContent}
                        loadProductionContent={loadProductionContent}
                        onOpenContentDialog={onOpenContentDialog}
                        onOpenTimePickerDialog={onOpenTimePickerDialog}
                        handleDeleteContent={viewState.handleDeleteContent}
                        handleToggleComplete={viewState.handleToggleComplete}
                        setContentTooltip={viewState.setContentTooltip}
                        googleConnection={viewState.googleConnection}
                        googleEvents={viewState.googleEvents}
                        resolvedTimezone={resolvedTimezone}
                      />
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      </CardContent>

      {/* Add Task/Content Dialog */}
      {viewState.addDialogOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/15"
            onClick={() => {
              viewState.closeAddDialog();
              viewState.resetFormState();
            }}
          />

          {/* Dialog */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            style={{ transform: `translate(${viewState.dialogDragOffset.x}px, ${viewState.dialogDragOffset.y}px)` }}
          >
            {/* Drag handle */}
            <div
              onMouseDown={viewState.handleDialogDragStart}
              className="flex justify-center py-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <GripHorizontal className="w-5 h-5 text-gray-300" />
            </div>
            {/* Tabs - only show in "both" mode */}
            {contentDisplayMode === 'both' && (
              <div className="flex px-6 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => viewState.setAddDialogTab('task')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                    viewState.addDialogTab === 'task'
                      ? "bg-[#8B7082] text-white shadow-sm"
                      : "bg-[#F5F0F3] text-gray-700 hover:bg-[#EDE5EA]"
                  )}
                >
                  <ListTodo className="w-4 h-4" />
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => viewState.setAddDialogTab('content')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                    viewState.addDialogTab === 'content'
                      ? "bg-[#8B7082] text-white shadow-sm"
                      : "bg-[#F5F0F3] text-gray-700 hover:bg-[#EDE5EA]"
                  )}
                >
                  <Lightbulb className="w-4 h-4" />
                  Add Content
                </button>
              </div>
            )}

            {/* Task Form */}
            {viewState.addDialogTab === 'task' && (
              <div className="px-6 pb-6 space-y-4 relative">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add task"
                    value={viewState.taskTitle}
                    onChange={(e) => viewState.setTaskTitle(e.target.value)}
                    autoFocus
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <TimePicker
                    value={viewState.taskStartTime}
                    onChange={viewState.setTaskStartTime}
                    placeholder="Start time"
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <TimePicker
                    value={viewState.taskEndTime}
                    onChange={viewState.setTaskEndTime}
                    placeholder="End time"
                    className="flex-1"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <textarea
                    placeholder="Add description"
                    value={viewState.taskDescription}
                    onChange={(e) => viewState.setTaskDescription(e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Color Picker */}
                <TaskColorPicker
                  selectedColor={viewState.taskColor}
                  onColorSelect={viewState.setTaskColor}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      viewState.closeAddDialog();
                      viewState.resetFormState();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={viewState.handleCreateTaskFromDialog}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#612a4f] rounded-lg hover:bg-[#4a1f3c] transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Content Form */}
            {viewState.addDialogTab === 'content' && (
              <div className="px-6 pb-4 space-y-4">
                {/* Hook/Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Add hook"
                    value={viewState.contentHook}
                    onChange={(e) => viewState.setContentHook(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <TimePicker
                    value={viewState.contentStartTime}
                    onChange={viewState.setContentStartTime}
                    placeholder="Start time"
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <TimePicker
                    value={viewState.contentEndTime}
                    onChange={viewState.setContentEndTime}
                    placeholder="End time"
                    className="flex-1"
                  />
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <textarea
                    placeholder="Add description"
                    value={viewState.contentNotes}
                    onChange={(e) => viewState.setContentNotes(e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>


                {/* Add to Content Hub checkbox */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    viewState.addToContentHub
                      ? "bg-gradient-to-r from-[#F5F0F3] to-[#EDE5EA] border-[#8B7082]/30 shadow-[0_2px_8px_rgba(139,112,130,0.15)]"
                      : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Checkbox
                    id="addToContentHubWeek"
                    checked={viewState.addToContentHub}
                    onCheckedChange={(checked) => viewState.setAddToContentHub(checked as boolean)}
                    className={cn(
                      "h-5 w-5 border-2 cursor-pointer transition-all",
                      viewState.addToContentHub
                        ? "data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
                        : "border-gray-300"
                    )}
                  />
                  <div className="flex-1">
                    <label htmlFor="addToContentHubWeek" className={cn(
                      "text-sm font-medium cursor-pointer transition-colors",
                      viewState.addToContentHub ? "text-[#4a2a3f]" : "text-gray-600"
                    )}>
                      Add to{' '}
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          viewState.navigate('/production');
                        }}
                        className="text-[#612a4f] hover:text-[#8B7082] underline underline-offset-2 decoration-[#8B7082]/50 cursor-pointer font-semibold"
                      >
                        Content Hub
                      </span>
                      {' '}for production
                    </label>
                    <p className={cn(
                      "text-xs mt-0.5 transition-colors",
                      viewState.addToContentHub ? "text-[#8B7082]" : "text-gray-400"
                    )}>
                      Uncheck for quick content like Stories
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Actions - Outside content form */}
            {viewState.addDialogTab === 'content' && (
              <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    viewState.closeAddDialog();
                    viewState.resetFormState();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={viewState.handleCreateContentFromDialog}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#612a4f] rounded-lg hover:bg-[#4d2240] transition-colors"
                >
                  Create
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed-position content tooltip — renders above all stacking contexts */}
      {viewState.contentTooltip && (() => {
        const platformIconMap: Record<string, React.ReactNode> = {
          instagram: <SiInstagram style={{ color: '#ffffff' }} />,
          tiktok: <SiTiktok style={{ color: '#ffffff' }} />,
          youtube: <SiYoutube style={{ color: '#ffffff' }} />,
          facebook: <SiFacebook style={{ color: '#ffffff' }} />,
          linkedin: <SiLinkedin style={{ color: '#ffffff' }} />,
          x: <RiTwitterXLine style={{ color: '#ffffff' }} />,
          twitter: <RiTwitterXLine style={{ color: '#ffffff' }} />,
          threads: <RiThreadsLine style={{ color: '#ffffff' }} />,
        };
        const platforms = viewState.contentTooltip.platforms || [];
        const formats = viewState.contentTooltip.formats || [];
        return (
          <div
            className="pointer-events-none px-3 py-2.5 rounded-xl text-white text-[11px] leading-snug shadow-xl"
            style={{
              position: 'fixed',
              left: viewState.contentTooltip.x,
              top: viewState.contentTooltip.y,
              background: viewState.contentTooltip.isPlanned
                ? 'linear-gradient(135deg, #9a8090 0%, #7a6070 100%)'
                : 'linear-gradient(135deg, #7a3868 0%, #4e2040 100%)',
              zIndex: 99999,
              maxWidth: '240px',
            }}
          >
            <p className="font-semibold whitespace-normal">{viewState.contentTooltip.text}</p>
            <p className="opacity-75 mt-0.5 text-[10px]">{viewState.contentTooltip.timeStr}</p>

            {/* Formats */}
            {formats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formats.map(f => (
                  <span
                    key={f}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.18)', whiteSpace: 'nowrap' }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Platform icons */}
            {platforms.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {platforms.map(p => {
                  const icon = platformIconMap[p.toLowerCase()];
                  return icon ? (
                    <span key={p} className="text-[14px] leading-none" title={p}>
                      {icon}
                    </span>
                  ) : (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.18)' }}
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
};
