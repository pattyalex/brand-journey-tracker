import { useState, useCallback, useEffect } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, FileText, Palette, Lightbulb, ListTodo, ArrowRight, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PlannerItem } from "@/types/planner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TIMEZONES, getDateString } from "./dailyPlanner/utils/plannerUtils";
import { AllTasksSidebar } from "./dailyPlanner/components/AllTasksSidebar";
import { ContentOverviewSidebar } from "./dailyPlanner/components/ContentOverviewSidebar";
import { PlannerHeader } from "./dailyPlanner/components/PlannerHeader";
import { TodayView } from "./dailyPlanner/components/TodayView";
import { WeekView } from "./dailyPlanner/components/WeekView";
import { CalendarView } from "./dailyPlanner/components/CalendarView";
import ExpandedScheduleView from "@/pages/production/components/ExpandedScheduleView";
import { TaskDialog } from "./dailyPlanner/components/TaskDialog";
import { ContentDialog } from "./dailyPlanner/components/ContentDialog";
import StandaloneContentFlow from "./dailyPlanner/components/StandaloneContentFlow";
import { ProductionCard } from "@/pages/production/types";
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

  // State for weekly add dialog (task/content choice)
  const [weeklyAddDialogState, setWeeklyAddDialogState] = useState<{
    open: boolean;
    dayString: string;
    startTime: string;
    endTime: string;
  }>({ open: false, dayString: '', startTime: '', endTime: '' });

  // State for today add dialog (task/content choice)
  const [todayAddDialogState, setTodayAddDialogState] = useState<{
    open: boolean;
    startTime: string;
    endTime: string;
  }>({ open: false, startTime: '', endTime: '' });

  // State for content dialog (view/edit content)
  const [contentDialogState, setContentDialogState] = useState<{
    open: boolean;
    content: ProductionCard | null;
    type: 'scheduled' | 'planned';
  }>({ open: false, content: null, type: 'planned' });

  // State for standalone content flow (for scheduled content)
  const [contentFlowCardId, setContentFlowCardId] = useState<string | null>(null);

  // State for monthly add dialog
  const [monthlyAddDialogState, setMonthlyAddDialogState] = useState<{
    open: boolean;
    dayString: string;
  }>({ open: false, dayString: '' });

  // Monthly dialog form state
  const [monthlyTaskTitle, setMonthlyTaskTitle] = useState("");
  const [monthlyTaskStartTime, setMonthlyTaskStartTime] = useState("");
  const [monthlyTaskEndTime, setMonthlyTaskEndTime] = useState("");
  const [monthlyTaskDescription, setMonthlyTaskDescription] = useState("");
  const [monthlyTaskColor, setMonthlyTaskColor] = useState("");

  // Color palette options for monthly dialog
  const colorOptions = [
    { name: 'gray', bg: '#f3f4f6', hex: '#f3f4f6' },
    { name: 'rose', bg: '#fecdd3', hex: '#fecdd3' },
    { name: 'pink', bg: '#fbcfe8', hex: '#fbcfe8' },
    { name: 'purple', bg: '#e9d5ff', hex: '#e9d5ff' },
    { name: 'indigo', bg: '#c7d2fe', hex: '#c7d2fe' },
    { name: 'sky', bg: '#bae6fd', hex: '#bae6fd' },
    { name: 'teal', bg: '#99f6e4', hex: '#99f6e4' },
    { name: 'green', bg: '#bbf7d0', hex: '#bbf7d0' },
    { name: 'lime', bg: '#d9f99d', hex: '#d9f99d' },
    { name: 'yellow', bg: '#fef08a', hex: '#fef08a' },
    { name: 'orange', bg: '#fed7aa', hex: '#fed7aa' },
  ];

  // Reset monthly form state
  const resetMonthlyFormState = () => {
    setMonthlyTaskTitle("");
    setMonthlyTaskStartTime("");
    setMonthlyTaskEndTime("");
    setMonthlyTaskDescription("");
    setMonthlyTaskColor("");
  };

  // Close monthly dialog
  const closeMonthlyDialog = () => {
    setMonthlyAddDialogState({ open: false, dayString: '' });
    resetMonthlyFormState();
  };

  // Handle creating a task from monthly dialog
  const handleCreateMonthlyTask = () => {
    if (!monthlyTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: PlannerItem = {
      id: `task-${Date.now()}`,
      text: monthlyTaskTitle.trim(),
      completed: false,
      section: 'morning',
      date: monthlyAddDialogState.dayString,
      startTime: monthlyTaskStartTime || undefined,
      endTime: monthlyTaskEndTime || undefined,
      description: monthlyTaskDescription || undefined,
      color: monthlyTaskColor || undefined,
    };

    // Add to planner data
    const dayIndex = state.plannerData.findIndex(d => d.date === monthlyAddDialogState.dayString);
    const updatedPlannerData = [...state.plannerData];

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newTask]
      };
    } else {
      updatedPlannerData.push({
        date: monthlyAddDialogState.dayString,
        items: [newTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setters.setPlannerData(updatedPlannerData);
    persistence.savePlannerData(updatedPlannerData);
    toast.success('Task created for ' + format(new Date(monthlyAddDialogState.dayString), 'MMM d'));
    closeMonthlyDialog();
  };

  // Handler to open content dialog (for planned/ideas)
  const handleOpenContentDialog = useCallback((content: ProductionCard, type: 'scheduled' | 'planned') => {
    setContentDialogState({ open: true, content, type });
  }, []);

  // Handler to open content flow (for scheduled content)
  const handleOpenContentFlow = useCallback((cardId: string) => {
    setContentFlowCardId(cardId);
  }, []);

  // Callback for when drag-to-create completes in 'both' or 'content' mode
  const handleWeeklyAddDialogOpen = useCallback((dayString: string, startTime: string, endTime: string) => {
    setWeeklyAddDialogState({ open: true, dayString, startTime, endTime });
  }, []);

  // Callback for Today view drag-to-create in 'both' or 'content' mode
  const handleTodayAddDialogOpen = useCallback((startTime: string, endTime: string) => {
    setTodayAddDialogState({ open: true, startTime, endTime });
  }, []);

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

  // Refresh plannerData when view or date changes to ensure sync across views
  useEffect(() => {
    persistence.refreshPlannerData();
  }, [state.currentView, state.selectedDate]);

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
    taskDialogPosition: state.taskDialogPosition,
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
    setTaskDialogPosition: setters.setTaskDialogPosition,
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
    contentDisplayMode: state.contentDisplayMode,
    onWeeklyAddDialogOpen: handleWeeklyAddDialogOpen,
    onTodayAddDialogOpen: handleTodayAddDialogOpen,
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
    showTasks,
    showContent,
    contentDisplayMode,
    productionContent,
    editingTask,
    dialogTaskColor,
  } = state;

  const {
    setSelectedDate,
    setCurrentView,
    setCalendarFilterMode,
    setContentDisplayMode,
    setProductionContent,
    setDialogTaskTitle,
    setDialogTaskDescription,
    setDialogStartTime,
    setDialogEndTime,
    setDialogTaskColor,
    setDialogAddToContentCalendar,
    setIsTaskDialogOpen,
    setTaskDialogPosition,
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

  const { convert24To12Hour, loadProductionContent } = helpers;

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

  // Content Calendar view has its own layout
  if (currentView === 'content-calendar-new') {
    return (
      <div className="h-full flex flex-col">
        <ExpandedScheduleView
          embedded={true}
          headerComponent={
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
              getTimezoneDisplay={getTimezoneDisplay}
              handleTimezoneChange={handleTimezoneChange}
              selectedTimezone={selectedTimezone}
              timezones={TIMEZONES}
              contentDisplayMode={contentDisplayMode}
              setContentDisplayMode={setContentDisplayMode}
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        {/* Sidebar - Left Side - Visible in Today, This Week, and Calendar views */}
        {(currentView === 'today' || currentView === 'week' || currentView === 'calendar') && (
          contentDisplayMode === 'content' ? (
            <ContentOverviewSidebar
              isCollapsed={isAllTasksCollapsed}
              setIsCollapsed={setIsAllTasksCollapsed}
            />
          ) : (
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
          )
        )}

        {/* Main Planner - Right Side */}
        <div className="flex-1 pl-6 bg-white h-full flex flex-col">
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
              getTimezoneDisplay={getTimezoneDisplay}
              handleTimezoneChange={handleTimezoneChange}
              selectedTimezone={selectedTimezone}
              timezones={TIMEZONES}
              contentDisplayMode={contentDisplayMode}
              setContentDisplayMode={setContentDisplayMode}
            />

        {currentView === 'today' && (
          <div className="flex-1 overflow-hidden">
            <TodayView
              state={state}
              derived={derived}
              refs={refs}
              helpers={helpers}
              setters={setters}
              actions={actions}
              todayAddDialogState={todayAddDialogState}
              setTodayAddDialogState={setTodayAddDialogState}
              onOpenContentDialog={handleOpenContentDialog}
              onOpenContentFlow={handleOpenContentFlow}
            />
          </div>
        )}

        {currentView === 'week' && (
          <div className="flex-1 overflow-hidden">
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
              handleEditItem={handleEditItem}
              handleToggleWeeklyTask={handleToggleWeeklyTask}
              handleDeleteWeeklyTask={handleDeleteWeeklyTask}
              convert24To12Hour={convert24To12Hour}
              showTasks={showTasks}
              showContent={showContent}
              contentDisplayMode={contentDisplayMode}
              productionContent={productionContent}
              setProductionContent={setProductionContent}
              weeklyAddDialogState={weeklyAddDialogState}
              setWeeklyAddDialogState={setWeeklyAddDialogState}
              loadProductionContent={loadProductionContent}
              onOpenContentDialog={handleOpenContentDialog}
              onOpenContentFlow={handleOpenContentFlow}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="flex-1 overflow-hidden">
            <CalendarView
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
              showTasks={showTasks}
              showContent={showContent}
              contentDisplayMode={contentDisplayMode}
              productionContent={productionContent}
              setProductionContent={setProductionContent}
              loadProductionContent={loadProductionContent}
              onOpenContentDialog={handleOpenContentDialog}
              onOpenContentFlow={handleOpenContentFlow}
              savePlannerData={persistence.savePlannerData}
            />
          </div>
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
                        className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer ${
                          index % 7 === 6 ? 'border-r-0' : ''
                        } ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                        onClick={() => {
                          // Open monthly add dialog
                          setMonthlyAddDialogState({ open: true, dayString });
                        }}
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

                            // Remove from All Tasks and add directly to day
                            setAllTasks(allTasks.filter(t => t.id !== itemId));

                            // Add task to the day
                            const newTask: PlannerItem = {
                              ...taskToMove,
                              id: `task-${Date.now()}`,
                              date: toDate,
                            };

                            setPlannerData((prev) => {
                              const dayIndex = prev.findIndex(d => d.date === toDate);
                              if (dayIndex >= 0) {
                                const updated = [...prev];
                                updated[dayIndex] = {
                                  ...updated[dayIndex],
                                  items: [...updated[dayIndex].items, newTask]
                                };
                                return updated;
                              } else {
                                return [...prev, {
                                  date: toDate,
                                  items: [newTask],
                                  tasks: '',
                                  greatDay: '',
                                  grateful: ''
                                }];
                              }
                            });

                            toast.success('Task added to day');
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
        </div>
      </div>

      {/* Monthly Add Task Dialog */}
      {monthlyAddDialogState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/15"
            onClick={closeMonthlyDialog}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden pt-8">
            <div className="px-6 pb-6 space-y-4 relative">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Add task"
                  value={monthlyTaskTitle}
                  onChange={(e) => setMonthlyTaskTitle(e.target.value)}
                  autoFocus
                  className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Start time"
                  value={monthlyTaskStartTime}
                  onChange={(e) => setMonthlyTaskStartTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="text"
                  placeholder="End time"
                  value={monthlyTaskEndTime}
                  onChange={(e) => setMonthlyTaskEndTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-2" />
                <textarea
                  placeholder="Add description"
                  value={monthlyTaskDescription}
                  onChange={(e) => setMonthlyTaskDescription(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
              </div>

              {/* Color Palette */}
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setMonthlyTaskColor(monthlyTaskColor === color.hex ? '' : color.hex)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        monthlyTaskColor === color.hex ? "ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: color.bg }}
                    >
                      {monthlyTaskColor === color.hex && (
                        <X className="w-4 h-4 mx-auto text-gray-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeMonthlyDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMonthlyTask}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Dialog */}
      <TaskDialog
        state={state}
        derived={derived}
        refs={refs}
        setters={setters}
        actions={actions}
      />

      {/* Content Dialog */}
      <ContentDialog
        open={contentDialogState.open}
        onOpenChange={(open) => setContentDialogState(prev => ({ ...prev, open }))}
        content={contentDialogState.content}
        type={contentDialogState.type}
        onSave={() => helpers.loadProductionContent()}
      />

      {/* Standalone Content Flow (for scheduled content) */}
      {contentFlowCardId && (
        <StandaloneContentFlow
          cardId={contentFlowCardId}
          onClose={() => {
            setContentFlowCardId(null);
            helpers.loadProductionContent();
          }}
        />
      )}

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
