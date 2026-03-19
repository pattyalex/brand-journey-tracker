import { useEffect } from "react";
import { addDays, format } from "date-fns";
import { Lightbulb, X, Clock, FileText, GripHorizontal, ListTodo, Check, Calendar, ExternalLink } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDateString } from "../utils/plannerUtils";
import { scheduleColors, defaultScheduledColor } from "../utils/colorConstants";
import { TaskColorPicker } from "./TaskColorPicker";
import { TimePicker } from "./TimePicker";
import { PlannerDerived, PlannerHelpers, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";
import { ProductionCard } from "@/pages/production/types";
import { cn } from "@/lib/utils";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useTodayViewState } from "../hooks/useTodayViewState";
import { TodayHeader } from "./TodayHeader";
import { TimeGrid } from "./TimeGrid";
import { TimeSlotTask, calculateTaskLayout } from "./TimeSlotTask";

interface TodayViewProps {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  helpers: PlannerHelpers;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
  todayAddDialogState?: {
    open: boolean;
    startTime: string;
    endTime: string;
  };
  setTodayAddDialogState?: React.Dispatch<React.SetStateAction<{
    open: boolean;
    startTime: string;
    endTime: string;
  }>>;
  onOpenContentDialog?: (content: ProductionCard, type: 'scheduled' | 'planned') => void;
  onOpenContentFlow?: (cardId: string) => void;
}

export const TodayView = ({ state, derived, refs, helpers, setters, actions, todayAddDialogState, setTodayAddDialogState, onOpenContentDialog, onOpenContentFlow }: TodayViewProps) => {
  // Google Calendar integration
  const {
    connection: googleConnection,
    events: googleEvents,
    fetchEvents: fetchGoogleEvents,
  } = useGoogleCalendar();

  const {
    selectedDate,
    todayZoomLevel,
    isDraggingCreate,
    dragCreateStart,
    dragCreateEnd,
    allTasks,
    tasks,
    greatDay,
    grateful,
    plannerData,
    showTasks,
    showContent,
    contentDisplayMode,
    productionContent,
  } = state;

  const { dateString, currentDay, colors, getTimezoneDisplay } = derived;
  const { todayScrollRef, isResizingRef } = refs;
  const { convert24To12Hour, loadProductionContent } = helpers;
  const {
    handleOpenTaskDialog,
    handleTimezoneChange,
    handleToggleItem,
    handleDeleteItem,
    handleEditItem,
    savePlannerData,
    saveAllTasks,
  } = actions;
  const {
    setPlannerData,
    setAllTasks,
    setIsDraggingCreate,
    setDragCreateStart,
    setDragCreateEnd,
    setProductionContent,
  } = setters;

  // Extract state/handlers into custom hook
  const viewState = useTodayViewState({
    state,
    derived,
    refs,
    helpers,
    setters,
    actions,
    todayAddDialogState,
    setTodayAddDialogState,
  });

  // Fetch Google Calendar events for selected date
  useEffect(() => {
    if (googleConnection.isConnected && googleConnection.showEvents) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const nextDay = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
      fetchGoogleEvents(dateStr, nextDay);
    }
  }, [googleConnection.isConnected, googleConnection.showEvents, selectedDate]);

  // Get today's content
  const todayString = getDateString(selectedDate);
  const scheduledContent = productionContent?.scheduled?.filter(c =>
    c.scheduledDate?.split('T')[0] === todayString
  ) || [];
  const plannedContent = productionContent?.planned?.filter(c =>
    c.plannedDate?.split('T')[0] === todayString
  ) || [];
  const hasContent = (scheduledContent.length > 0 || plannedContent.length > 0) && showContent;

  // Get Google Calendar events for today (only in Tasks Calendar or Both mode)
  const googleEventsForToday = googleConnection.showEvents && showTasks
    ? googleEvents.filter(e => e.date === todayString)
    : [];

  // Debug logging for content rendering
  console.log('TodayView render - todayString:', todayString, 'showContent:', showContent);
  console.log('TodayView render - productionContent.planned:', productionContent?.planned?.length || 0);
  console.log('TodayView render - plannedContent (filtered):', plannedContent.length);

  return (
    <>
<CardContent className="px-0 h-full flex flex-col">
  <TodayHeader
    selectedDate={selectedDate}
    dateString={dateString}
    currentDay={currentDay}
    showTasks={showTasks}
    editingTask={state.editingTask}
    dialogTaskColor={state.dialogTaskColor}
    googleEventsForToday={googleEventsForToday}
    handleOpenTaskDialog={handleOpenTaskDialog}
    handleToggleItem={handleToggleItem}
    handleDeleteItem={handleDeleteItem}
  />

  <div ref={todayScrollRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Fixed header row */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {/* Time column header */}
        <div className="flex-shrink-0 border-r border-gray-200 h-[60px]" style={{ width: '60px' }}>
        </div>
        {/* Date header */}
        <div className="flex-1 h-[60px] flex items-center justify-between px-4">
          <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
            <span className="text-sm uppercase tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: '#8B7082' }}>
              {format(selectedDate, 'EEE')}
            </span>
            <span className="leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '38px', color: '#612a4f' }}>
              {format(selectedDate, 'd')}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 font-medium">
            {Math.round(todayZoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex">
          {/* Time column */}
          <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: '60px' }}>
            <div
              data-zoom-container="time"
              className="relative"
              style={{ height: `${24 * 90 * todayZoomLevel}px` }}
            >
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  data-hour-row={hour}
                  className="absolute left-0 right-0 flex items-start justify-end pr-2 pt-0.5"
                  style={{ top: `${hour * 90 * todayZoomLevel}px`, height: `${90 * todayZoomLevel}px` }}
                >
                  <span className="text-[11px] text-gray-400 leading-none">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 relative">
            <div
              data-zoom-container="content"
              className="relative"
              style={{ height: `${24 * 90 * todayZoomLevel}px` }}
            >
            <TimeGrid
              todayZoomLevel={todayZoomLevel}
              dateString={dateString}
              currentDay={currentDay}
              plannerData={plannerData}
              allTasks={allTasks}
              tasks={tasks}
              greatDay={greatDay}
              grateful={grateful}
              addDialogOpen={viewState.addDialogOpen}
              setPlannerData={setPlannerData}
              setAllTasks={setAllTasks}
              setIsDraggingCreate={setIsDraggingCreate}
              setDragCreateStart={setDragCreateStart}
              setDragCreateEnd={setDragCreateEnd}
              handleEditItem={handleEditItem}
              savePlannerData={savePlannerData}
              saveAllTasks={saveAllTasks}
            />

        {/* Time labels are handled by hour labels only */}

        {/* Render all tasks with absolute positioning - only when showTasks is true */}
        {showTasks && (
        <div className="absolute top-0 left-2 right-2" style={{ zIndex: 10 }}>
          {(() => {
            const tasksWithLayout = calculateTaskLayout(currentDay.items);

            return tasksWithLayout.map((layoutInfo) => (
              <TimeSlotTask
                key={layoutInfo.task.id}
                layoutInfo={layoutInfo}
                todayZoomLevel={todayZoomLevel}
                dateString={dateString}
                showContent={showContent}
                editingTask={state.editingTask}
                dialogTaskColor={state.dialogTaskColor}
                isResizingRef={isResizingRef}
                convert24To12Hour={convert24To12Hour}
                handleOpenTaskDialog={handleOpenTaskDialog}
                handleToggleItem={handleToggleItem}
                handleDeleteItem={handleDeleteItem}
                handleEditItem={handleEditItem}
              />
            ));
          })()}
        </div>
        )}

        {/* Render timed content on calendar grid - independent of showTasks */}
        {showContent && (
        <div className="absolute top-0 left-2 right-2" style={{ zIndex: 20 }}>
          {(() => {
            const allContent = [...scheduledContent, ...plannedContent];
            // Include content with either planned or scheduled time fields
            const timedContent = allContent.filter(c =>
              (c.plannedStartTime && c.plannedEndTime) ||
              (c.scheduledStartTime && c.scheduledEndTime)
            );

            console.log('TodayView content render - allContent:', allContent.length, 'timedContent:', timedContent.length);
            allContent.forEach((c, i) => console.log(`  Content ${i}:`, c.id, c.plannedStartTime, c.plannedEndTime));

            return timedContent.map((content) => {
              // Use scheduled times if available, otherwise use planned times
              const startTimeStr = content.scheduledStartTime || content.plannedStartTime!;
              const endTimeStr = content.scheduledEndTime || content.plannedEndTime!;

              const [startHour, startMinute] = startTimeStr.split(':').map(Number);
              const [endHour, endMinute] = endTimeStr.split(':').map(Number);
              const startTotalMinutes = startHour * 60 + startMinute;
              const endTotalMinutes = endHour * 60 + endMinute;
              const durationMinutes = Math.max(endTotalMinutes - startTotalMinutes, 30);

              const top = (startTotalMinutes * 1.5 * todayZoomLevel) + 0.5;
              const height = Math.max(durationMinutes * 1.5 * todayZoomLevel, 28) - 1;

              const isPlanned = !content.scheduledDate;
              const contentColors = isPlanned
                ? (scheduleColors[content.plannedColor || 'violet'] || scheduleColors.violet)
                : defaultScheduledColor;

              return (
                <div
                  key={content.id}
                  data-time-item
                  data-start-minutes={startTotalMinutes}
                  data-duration-minutes={durationMinutes}
                  onClick={() => {
                    onOpenContentDialog?.(content, isPlanned ? 'planned' : 'scheduled');
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const derivedFormats = [...(content.formats || [])];
                    if (content.contentType === 'image') {
                      const imageLabel = content.imageMode === 'carousel' ? 'Carousel' : 'Image';
                      if (!derivedFormats.includes(imageLabel)) derivedFormats.unshift(imageLabel);
                    }
                    viewState.setContentTooltip({
                      text: content.hook || content.title || '',
                      timeStr: `${convert24To12Hour(startTimeStr)} – ${convert24To12Hour(endTimeStr)}`,
                      isPlanned,
                      platforms: content.platforms || [],
                      formats: derivedFormats,
                      x: rect.left,
                      y: rect.bottom + 8,
                    });
                  }}
                  onMouseLeave={() => viewState.setContentTooltip(null)}
                  className="absolute rounded-2xl cursor-pointer hover:brightness-95 group border-l-4 overflow-hidden shadow-[0_2px_8px_rgba(139,112,130,0.25)] hover:shadow-[0_4px_12px_rgba(139,112,130,0.35)]"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    // In "Both" mode: content on right side (45% width). In "Content only" mode: full width
                    ...(showTasks ? { right: 0, width: '45%' } : { left: 0, width: '88%' }),
                    background: isPlanned
                      ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F2F4 50%, #E0D5DC 100%)'
                      : 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    borderLeftColor: isPlanned ? '#B8A0AD' : '#4a2a3f',
                    zIndex: 20,
                  }}
                >
                  <div className="p-2 h-full flex flex-col overflow-hidden">
                    <div className="flex items-start gap-1.5">
                      {isPlanned ? (
                        <Lightbulb className="w-3.5 h-3.5 text-[#8B7082] flex-shrink-0 mt-0.5" />
                      ) : (
                        <button
                          onClick={(e) => viewState.handleToggleComplete(content.id, e)}
                          className={cn(
                            "w-3.5 h-3.5 rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                            content.isCompleted ? "bg-white border-white" : "hover:bg-current/20"
                          )}
                          style={{ borderColor: content.isCompleted ? 'white' : contentColors.text }}
                        >
                          {content.isCompleted && <Check className="w-2.5 h-2.5 text-[#612A4F]" />}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-xs font-medium truncate",
                          content.isCompleted && "line-through opacity-60"
                        )} style={{ color: isPlanned ? '#8B7082' : contentColors.text }}>
                          {content.hook || content.title}
                        </div>
                        <div className="text-[9px] opacity-70 leading-tight" style={{ color: isPlanned ? '#8B7082' : contentColors.text }}>
                          {convert24To12Hour(startTimeStr)} - {convert24To12Hour(endTimeStr)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewState.handleDeleteContent(content.id, isPlanned ? 'planned' : 'scheduled');
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
        )}

        {/* Google Calendar Events */}
        {googleEventsForToday.length > 0 && (
        <div className="absolute top-0 left-2 right-2" style={{ zIndex: 18 }}>
          {googleEventsForToday.filter(e => e.startTime && e.endTime && !e.isAllDay).map((gEvent) => {
            const [startHour, startMinute] = gEvent.startTime!.split(':').map(Number);
            const [endHour, endMinute] = gEvent.endTime!.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const durationMinutes = Math.max(endTotalMinutes - startTotalMinutes, 30);

            const top = (startTotalMinutes * 1.5 * todayZoomLevel) + 0.5;
            const height = Math.max(durationMinutes * 1.5 * todayZoomLevel, 28) - 1;

            return (
              <div
                key={`google-${gEvent.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (gEvent.htmlLink) {
                    window.open(gEvent.htmlLink, '_blank');
                  }
                }}
                className="absolute rounded-lg px-2 py-1.5 border-l-4 cursor-pointer hover:brightness-95 overflow-hidden group"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: 0,
                  right: 0,
                  width: '88%',
                  background: 'linear-gradient(180deg, #E8F0FE 0%, #D2E3FC 50%, #AECBFA 100%)',
                  borderLeftColor: '#4285F4',
                  boxShadow: '0 1px 3px rgba(66,133,244,0.2)',
                }}
              >
                <div className="flex items-start gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#4285F4' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: '#1967D2' }}>
                      {gEvent.title}
                    </div>
                    {height >= 40 && (
                      <div className="text-[10px] mt-0.5 opacity-80" style={{ color: '#1967D2' }}>
                        {gEvent.startTime}{gEvent.endTime ? ` - ${gEvent.endTime}` : ''}
                      </div>
                    )}
                  </div>
                  {gEvent.htmlLink && (
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" style={{ color: '#4285F4' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Drag-to-create preview - always visible when dragging */}
        {isDraggingCreate && dragCreateStart && dragCreateEnd && (
        <div className="absolute top-0 left-2 right-2" style={{ zIndex: 100 }}>
          {(() => {
            const startMinutes = dragCreateStart.hour * 60 + dragCreateStart.minute;
            const endMinutes = dragCreateEnd.hour * 60 + dragCreateEnd.minute;

            const actualStart = Math.min(startMinutes, endMinutes);
            const actualEnd = Math.max(startMinutes, endMinutes + 10);

            const top = (actualStart / 60) * 90 * todayZoomLevel; // 90px per hour * zoom
            const height = Math.max(30, ((actualEnd - actualStart) / 60) * 90 * todayZoomLevel);

            // Format times for display in 12-hour format
            const startHour = Math.floor(actualStart / 60);
            const startMin = actualStart % 60;
            const endHour = Math.floor(actualEnd / 60);
            const endMin = actualEnd % 60;

            const formatTime12Hour = (hour: number, minute: number) => {
              const period = hour >= 12 ? 'pm' : 'am';
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              const displayMin = minute.toString().padStart(2, '0');
              return `${displayHour}:${displayMin}${period}`;
            };

            const startTimeStr = formatTime12Hour(startHour, startMin);
            const endTimeStr = formatTime12Hour(endHour, endMin);

            // Mauve colors for drag preview
            const bgColor = 'rgba(139, 112, 130, 0.08)';
            const borderColor = '#B8A0B0';
            const textColor = '#9A8090';

            return (
              <div
                className="absolute rounded-lg px-3 py-2 border-l-[3px] backdrop-blur-sm"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: '0',
                  right: '0',
                  backgroundColor: bgColor,
                  borderLeftColor: borderColor,
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <div className="text-xs font-medium" style={{ color: textColor }}>
                  {startTimeStr}
                </div>
                {height > 40 && (
                  <div className="text-xs font-medium absolute bottom-2 left-3" style={{ color: textColor }}>
                    {endTimeStr}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</CardContent>

      {/* Add Task/Content Dialog */}
      {viewState.addDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                    id="addToContentHubToday"
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
                    <label htmlFor="addToContentHubToday" className={cn(
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
