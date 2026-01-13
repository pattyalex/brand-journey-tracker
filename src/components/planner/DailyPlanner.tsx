import { addDays, addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from "sonner";
import { PlannerItem } from "@/types/planner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TIMEZONES, getDateString } from "./dailyPlanner/utils/plannerUtils";
import { AllTasksSidebar } from "./dailyPlanner/components/AllTasksSidebar";
import { PlannerHeader } from "./dailyPlanner/components/PlannerHeader";
import { TodayView } from "./dailyPlanner/components/TodayView";
import { WeekView } from "./dailyPlanner/components/WeekView";
import { CalendarView } from "./dailyPlanner/components/CalendarView";
import { TaskDialog } from "./dailyPlanner/components/TaskDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePlannerState } from "./dailyPlanner/hooks/usePlannerState";
import { getPlannerInitialSettings, usePlannerPersistence } from "./dailyPlanner/hooks/usePlannerPersistence";
import { usePlannerActions } from "./dailyPlanner/hooks/usePlannerActions";

export const DailyPlanner = () => {
  const initialSettings = getPlannerInitialSettings();
  const { state, setters, refs, derived, helpers } = usePlannerState(initialSettings);

  const persistence = usePlannerPersistence({
    plannerData: state.plannerData,
    allTasks: state.allTasks,
    contentCalendarData: state.contentCalendarData,
    todayScrollPosition: state.todayScrollPosition,
    weeklyScrollPosition: state.weeklyScrollPosition,
    globalTasks: state.globalTasks,
    setPlannerData: setters.setPlannerData,
    setGlobalTasks: setters.setGlobalTasks,
    setAllTasks: setters.setAllTasks,
    setContentCalendarData: setters.setContentCalendarData,
    setTodayScrollPosition: setters.setTodayScrollPosition,
    setWeeklyScrollPosition: setters.setWeeklyScrollPosition,
  });

  const actions = usePlannerActions({
    selectedDate: state.selectedDate,
    plannerData: state.plannerData,
    allTasks: state.allTasks,
    contentCalendarData: state.contentCalendarData,
    currentDay: derived.currentDay,
    dateString: derived.dateString,
    tasks: state.tasks,
    greatDay: state.greatDay,
    grateful: state.grateful,
    currentView: state.currentView,
    todayZoomLevel: state.todayZoomLevel,
    todayScrollPosition: state.todayScrollPosition,
    weeklyScrollPosition: state.weeklyScrollPosition,
    isDraggingCreate: state.isDraggingCreate,
    dragCreateStart: state.dragCreateStart,
    dragCreateEnd: state.dragCreateEnd,
    weeklyDraggingCreate: state.weeklyDraggingCreate,
    weeklyDragCreateStart: state.weeklyDragCreateStart,
    weeklyDragCreateEnd: state.weeklyDragCreateEnd,
    weeklyNewTaskInputs: state.weeklyNewTaskInputs,
    weeklyEditTitle: state.weeklyEditTitle,
    weeklyEditColor: state.weeklyEditColor,
    weeklyEditDescription: state.weeklyEditDescription,
    dialogTaskTitle: state.dialogTaskTitle,
    dialogTaskDescription: state.dialogTaskDescription,
    dialogStartTime: state.dialogStartTime,
    dialogEndTime: state.dialogEndTime,
    dialogTaskColor: state.dialogTaskColor,
    dialogAddToContentCalendar: state.dialogAddToContentCalendar,
    editingTask: state.editingTask,
    copyToDate: state.copyToDate,
    deleteAfterCopy: state.deleteAfterCopy,
    pendingTaskFromAllTasks: state.pendingTaskFromAllTasks,
    isTaskDialogOpen: state.isTaskDialogOpen,
    todayScrollRef: refs.todayScrollRef,
    weeklyScrollRef: refs.weeklyScrollRef,
    titleInputRef: refs.titleInputRef,
    startTimeInputRef: refs.startTimeInputRef,
    endTimeInputRef: refs.endTimeInputRef,
    descriptionInputRef: refs.descriptionInputRef,
    isResizingRef: refs.isResizingRef,
    convert24To12Hour: helpers.convert24To12Hour,
    convert12To24Hour: helpers.convert12To24Hour,
    setSelectedDate: setters.setSelectedDate,
    setPlannerData: setters.setPlannerData,
    setCopyToDate: setters.setCopyToDate,
    setIsCopyDialogOpen: setters.setIsCopyDialogOpen,
    setDeleteAfterCopy: setters.setDeleteAfterCopy,
    setCurrentView: setters.setCurrentView,
    setSelectedTimezone: setters.setSelectedTimezone,
    setTodayZoomLevel: setters.setTodayZoomLevel,
    setTodayScrollPosition: setters.setTodayScrollPosition,
    setWeeklyScrollPosition: setters.setWeeklyScrollPosition,
    setIsDraggingCreate: setters.setIsDraggingCreate,
    setDragCreateStart: setters.setDragCreateStart,
    setDragCreateEnd: setters.setDragCreateEnd,
    setWeeklyDraggingCreate: setters.setWeeklyDraggingCreate,
    setWeeklyDragCreateStart: setters.setWeeklyDragCreateStart,
    setWeeklyDragCreateEnd: setters.setWeeklyDragCreateEnd,
    setGlobalTasks: setters.setGlobalTasks,
    setAllTasks: setters.setAllTasks,
    setContentCalendarData: setters.setContentCalendarData,
    setIsTaskDialogOpen: setters.setIsTaskDialogOpen,
    setEditingTask: setters.setEditingTask,
    setDialogTaskTitle: setters.setDialogTaskTitle,
    setDialogTaskDescription: setters.setDialogTaskDescription,
    setDialogStartTime: setters.setDialogStartTime,
    setDialogEndTime: setters.setDialogEndTime,
    setDialogTaskColor: setters.setDialogTaskColor,
    setDialogAddToContentCalendar: setters.setDialogAddToContentCalendar,
    setPendingTaskFromAllTasks: setters.setPendingTaskFromAllTasks,
    setTasks: setters.setTasks,
    setGreatDay: setters.setGreatDay,
    setGrateful: setters.setGrateful,
    setWeeklyNewTaskInputs: setters.setWeeklyNewTaskInputs,
    setWeeklyAddingTask: setters.setWeeklyAddingTask,
    setWeeklyEditingTask: setters.setWeeklyEditingTask,
    setWeeklyEditText: setters.setWeeklyEditText,
    setDraggedWeeklyTaskId: setters.setDraggedWeeklyTaskId,
    setDragOverWeeklyTaskId: setters.setDragOverWeeklyTaskId,
    setWeeklyDropIndicatorPosition: setters.setWeeklyDropIndicatorPosition,
    setWeeklyEditDialogOpen: setters.setWeeklyEditDialogOpen,
    setWeeklyEditDescription: setters.setWeeklyEditDescription,
    setWeeklyEditColor: setters.setWeeklyEditColor,
    setWeeklyEditTitle: setters.setWeeklyEditTitle,
    setWeeklyEditingTitle: setters.setWeeklyEditingTitle,
    setIsDraggingOverAllTasks: setters.setIsDraggingOverAllTasks,
    setDraggingTaskText: setters.setDraggingTaskText,
    savePlannerData: persistence.savePlannerData,
    saveAllTasks: persistence.saveAllTasks,
    saveScheduledContent: persistence.saveScheduledContent,
    saveTodayScrollPosition: persistence.saveTodayScrollPosition,
    saveWeeklyScrollPosition: persistence.saveWeeklyScrollPosition,
    saveSelectedTimezone: persistence.saveSelectedTimezone,
    saveTodayZoomLevel: persistence.saveTodayZoomLevel,
  });

  const {
    selectedDate,
    plannerData,
    currentView,
    selectedTimezone,
    calendarFilterMode,
    weeklyDraggingCreate,
    weeklyDragCreateStart,
    weeklyDragCreateEnd,
    allTasks,
    isAllTasksCollapsed,
    showContentCalendar,
    contentCalendarData,
    isTaskDialogOpen,
    calendarOpen,
  } = state;

  const {
    setSelectedDate,
    setCurrentView,
    setCalendarFilterMode,
    setDialogTaskTitle,
    setDialogTaskDescription,
    setDialogStartTime,
    setDialogEndTime,
    setDialogTaskColor,
    setDialogAddToContentCalendar,
    setIsTaskDialogOpen,
    setEditingTask,
    setIsAllTasksCollapsed,
    setIsDraggingOverAllTasks,
    setCalendarOpen,
    setShowContentCalendar,
    setAllTasks,
    setPlannerData,
    setContentCalendarData,
    setPendingTaskFromAllTasks,
    setWeeklyDraggingCreate,
    setWeeklyDragCreateStart,
    setWeeklyDragCreateEnd,
    setDraggedWeeklyTaskId,
  } = setters;

  const { weeklyScrollRef, isResizingRef } = refs;

  const { daysWithItems, getTimezoneDisplay } = derived;

  const { convert24To12Hour } = helpers;

  const {
    handleToggleWeeklyTask,
    handleDeleteWeeklyTask,
    handleEditItem,
    handlePreviousDay,
    handleNextDay,
    handleDateSelect,
    handleTimezoneChange,
    handleToggleAllTask,
    handleDeleteAllTask,
    handleEditAllTask,
    handleReorderAllTasks,
    handleAddAllTask,
    handleDropTaskFromWeeklyToAllTasks,
    handleDropTaskFromCalendarToAllTasks,
    handleMoveContentCalendarItem,
    handleOpenTaskDialog,
  } = actions;

  return (
    <div>
      <div className="flex gap-4">
        {/* All Tasks Section - Left Side - Visible in Today, Day, This Week, and Calendar views */}
        {(currentView === 'today' || currentView === 'week' || currentView === 'day' || currentView === 'calendar') && (
          <AllTasksSidebar
            isAllTasksCollapsed={isAllTasksCollapsed}
            setIsAllTasksCollapsed={setIsAllTasksCollapsed}
            setIsDraggingOverAllTasks={setIsDraggingOverAllTasks}
            allTasks={allTasks}
            handleToggleAllTask={handleToggleAllTask}
            handleDeleteAllTask={handleDeleteAllTask}
            handleEditAllTask={handleEditAllTask}
            handleAddAllTask={handleAddAllTask}
            handleReorderAllTasks={handleReorderAllTasks}
            handleDropTaskFromWeeklyToAllTasks={handleDropTaskFromWeeklyToAllTasks}
            handleDropTaskFromCalendarToAllTasks={handleDropTaskFromCalendarToAllTasks}
          />
        )}


        {/* Main Planner - Right Side */}
        <div className="flex-1">
          <Card className="border-none shadow-none bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 rounded-xl p-6">
            {/* Header with Tabs and Date Navigation */}
            <PlannerHeader
              currentView={currentView}
              setCurrentView={setCurrentView}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              handleDateSelect={handleDateSelect}
              daysWithItems={daysWithItems}
              handlePreviousDay={handlePreviousDay}
              handleNextDay={handleNextDay}
            />

        {currentView === 'today' && (
          <TodayView
            state={state}
            derived={derived}
            refs={refs}
            helpers={helpers}
            setters={setters}
            actions={actions}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            plannerData={plannerData}
            allTasks={allTasks}
            setAllTasks={setAllTasks}
            setPlannerData={setPlannerData}
            savePlannerData={persistence.savePlannerData}
            saveAllTasks={persistence.saveAllTasks}
            getTimezoneDisplay={getTimezoneDisplay}
            handleTimezoneChange={handleTimezoneChange}
            selectedTimezone={selectedTimezone}
            timezones={TIMEZONES}
            weeklyScrollRef={weeklyScrollRef}
            isTaskDialogOpen={isTaskDialogOpen}
            weeklyDraggingCreate={weeklyDraggingCreate}
            weeklyDragCreateStart={weeklyDragCreateStart}
            weeklyDragCreateEnd={weeklyDragCreateEnd}
            setWeeklyDraggingCreate={setWeeklyDraggingCreate}
            setWeeklyDragCreateStart={setWeeklyDragCreateStart}
            setWeeklyDragCreateEnd={setWeeklyDragCreateEnd}
            setDraggedWeeklyTaskId={setDraggedWeeklyTaskId}
            isResizingRef={isResizingRef}
            setEditingTask={setEditingTask}
            setDialogTaskTitle={setDialogTaskTitle}
            setDialogTaskDescription={setDialogTaskDescription}
            setDialogStartTime={setDialogStartTime}
            setDialogEndTime={setDialogEndTime}
            setDialogTaskColor={setDialogTaskColor}
            setDialogAddToContentCalendar={setDialogAddToContentCalendar}
            setIsTaskDialogOpen={setIsTaskDialogOpen}
            handleEditItem={handleEditItem}
            handleToggleWeeklyTask={handleToggleWeeklyTask}
            handleDeleteWeeklyTask={handleDeleteWeeklyTask}
            convert24To12Hour={convert24To12Hour}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            calendarFilterMode={calendarFilterMode}
            setCalendarFilterMode={setCalendarFilterMode}
            getTimezoneDisplay={getTimezoneDisplay}
            handleTimezoneChange={handleTimezoneChange}
            selectedTimezone={selectedTimezone}
            timezones={TIMEZONES}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setCurrentView={setCurrentView}
            plannerData={plannerData}
            allTasks={allTasks}
            setAllTasks={setAllTasks}
            setPlannerData={setPlannerData}
            setPendingTaskFromAllTasks={setPendingTaskFromAllTasks}
            setEditingTask={setEditingTask}
            setDialogTaskTitle={setDialogTaskTitle}
            setDialogTaskDescription={setDialogTaskDescription}
            setDialogStartTime={setDialogStartTime}
            setDialogEndTime={setDialogEndTime}
            setDialogTaskColor={setDialogTaskColor}
            setDialogAddToContentCalendar={setDialogAddToContentCalendar}
            setIsTaskDialogOpen={setIsTaskDialogOpen}
          />
        )}

        {currentView === 'month' && (
          <CardContent className="px-4 py-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center flex-1">
                <button
                  onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold mx-4">
                  {format(selectedDate, "MMMM yyyy")} - {showContentCalendar ? "Content Calendar" : "All Tasks"}
                </h2>
                <button
                  onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Toggle button for Content Calendar */}
              <Button
                variant={showContentCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => setShowContentCalendar(!showContentCalendar)}
                className="ml-4"
              >
                {showContentCalendar ? "Show All Tasks" : "Show Only Content Calendar"}
              </Button>
            </div>

            {/* Calendar grid */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-gray-50">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {(() => {
                  const monthStart = startOfMonth(selectedDate);
                  const monthEnd = endOfMonth(selectedDate);
                  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
                  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
                  const days = eachDayOfInterval({ start: startDate, end: endDate });

                  return days.map((day, index) => {
                    const dayString = getDateString(day);
                    const dayData = plannerData.find(d => d.date === dayString);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

                    // Filter tasks based on toggle state
                    let tasks = dayData?.items || [];
                    if (showContentCalendar) {
                      // Show only tasks marked for content calendar
                      tasks = tasks.filter(task => task.isContentCalendar === true);
                    }
                    // When showContentCalendar is false, show ALL tasks (including those with isContentCalendar: true)

                    return (
                      <div
                        key={dayString}
                        className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                          index % 7 === 6 ? 'border-r-0' : ''
                        } ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-blue-50');

                          const itemId = e.dataTransfer.getData('taskId');
                          const fromDate = e.dataTransfer.getData('fromDate');
                          const toDate = dayString;
                          const isContentItem = e.dataTransfer.getData('isContentItem') === 'true';

                          console.log('📅 MONTH VIEW DROP - itemId:', itemId, 'fromDate:', fromDate, 'toDate:', toDate, 'isContentItem:', isContentItem);

                          if (itemId && !fromDate) {
                            // Task is coming from All Tasks (no date)
                            const taskToMove = allTasks.find(t => t.id === itemId);
                            if (!taskToMove) return;

                            // Store the original task in case user cancels
                            setPendingTaskFromAllTasks(taskToMove);

                            // Remove from All Tasks
                            setAllTasks(allTasks.filter(t => t.id !== itemId));

                            // Open dialog to edit task details before adding to day
                            setEditingTask({ ...taskToMove, date: toDate } as PlannerItem);
                            setDialogTaskTitle(taskToMove.text);
                            setDialogTaskDescription(taskToMove.description || "");
                            setDialogStartTime(taskToMove.startTime || "");
                            setDialogEndTime(taskToMove.endTime || "");
                            setDialogTaskColor(taskToMove.color || "");
                            setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
                            setIsTaskDialogOpen(true);
                          } else if (itemId && fromDate && fromDate !== toDate) {
                            if (isContentItem) {
                              // Handle content calendar item move
                              const itemToMove = contentCalendarData.find(item => item.id === itemId);
                              if (!itemToMove) return;

                              handleMoveContentCalendarItem(itemId, toDate);

                              toast.success('Content item moved successfully');
                            } else {
                              // Handle regular task move
                              const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
                              if (fromDayIndex < 0) return;

                              const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === itemId);
                              if (!taskToMove) return;

                              // Remove from source day
                              const updatedPlannerData = [...plannerData];
                              updatedPlannerData[fromDayIndex] = {
                                ...updatedPlannerData[fromDayIndex],
                                items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== itemId)
                              };

                              // Add to destination day
                              const toDayIndex = updatedPlannerData.findIndex(d => d.date === toDate);
                              const movedTask = { ...taskToMove, date: toDate };

                              if (toDayIndex >= 0) {
                                updatedPlannerData[toDayIndex] = {
                                  ...updatedPlannerData[toDayIndex],
                                  items: [...updatedPlannerData[toDayIndex].items, movedTask]
                                };
                              } else {
                                updatedPlannerData.push({
                                  date: toDate,
                                  items: [movedTask],
                                  tasks: "",
                                  greatDay: "",
                                  grateful: ""
                                });
                              }

                              setPlannerData(updatedPlannerData);
                              toast.success('Task moved successfully');
                            }
                          }
                        }}
                      >
                        {/* Day number */}
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isToday ? 'bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center' :
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {format(day, 'd')}
                          </span>
                          {tasks.length > 0 && (
                            <span className="text-xs text-gray-500">{tasks.length}</span>
                          )}
                        </div>

                        {/* Tasks or Content Calendar Items */}
                        <div className="space-y-1">
                          {tasks.slice(0, 3).map(item => {
                            // Check if it's a content calendar item or regular task
                            const isContentItem = showContentCalendar;
                            const displayText = isContentItem ? item.title : item.text;
                            const displayColor = isContentItem ? '#e0f2fe' : (item.color || '#f3f4f6');

                            return (
                              <div
                                key={item.id}
                                draggable={true}
                                onDragStart={(e) => {
                                  console.log('🚀 DRAG START - Month Item:', item.id, displayText, 'from:', dayString);
                                  e.dataTransfer.setData('text/plain', item.id);
                                  e.dataTransfer.setData('taskId', item.id);
                                  e.dataTransfer.setData('fromDate', dayString);
                                  e.dataTransfer.setData('fromAllTasks', 'false');
                                  e.dataTransfer.setData('isContentItem', isContentItem ? 'true' : 'false');
                                  e.dataTransfer.effectAllowed = 'move';
                                  setTimeout(() => {
                                    e.currentTarget.style.opacity = '0.5';
                                  }, 0);
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                className="text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow"
                                style={{ backgroundColor: displayColor }}
                                title={displayText}
                              >
                                <div className="flex items-center gap-1">
                                  {isContentItem && item.format && (
                                    <span className="text-[10px] font-semibold text-blue-600">{item.format}</span>
                                  )}
                                  {!isContentItem && item.startTime && (
                                    <span className="text-[10px] font-medium">{convert24To12Hour(item.startTime)}{item.endTime && ` - ${convert24To12Hour(item.endTime)}`}</span>
                                  )}
                                  <span className={`truncate ${!isContentItem && item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {displayText}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {tasks.length > 3 && (
                            <div className="text-xs text-gray-500 pl-1">+{tasks.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </CardContent>
        )}
          </Card>
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        state={state}
        derived={derived}
        refs={refs}
        setters={setters}
        actions={actions}
      />

      {/* Floating Action Button */}
      {currentView === 'day' && (
        <button
          onClick={() => {
            const now = new Date();
            const currentHour = now.getHours();
            handleOpenTaskDialog(currentHour);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          title="Add new task"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
