import { PlannerDay, PlannerItem } from "@/types/planner";
import { useTaskDialogInputs } from "./useTaskDialogInputs";
import { useCopyDialogActions } from "./useCopyDialogActions";
import { usePlannerNavigation } from "./usePlannerNavigation";
import { usePlannerTaskCRUD } from "./usePlannerTaskCRUD";
import { usePlannerDragCreate } from "./usePlannerDragCreate";
import { usePlannerDialogs } from "./usePlannerDialogs";
import { usePlannerCopy } from "./usePlannerCopy";

interface UsePlannerActionsArgs {
  selectedDate: Date;
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  contentCalendarData: any[];
  currentDay: PlannerDay;
  dateString: string;
  tasks: string;
  greatDay: string;
  grateful: string;
  currentView: string;
  contentDisplayMode?: 'tasks' | 'content' | 'both';
  todayZoomLevel: number;
  weeklyZoomLevel: number;
  todayScrollPosition: number;
  weeklyScrollPosition: number;
  isDraggingCreate: boolean;
  dragCreateStart: { hour: number; minute: number } | null;
  dragCreateEnd: { hour: number; minute: number } | null;
  weeklyDraggingCreate: Record<string, boolean>;
  weeklyDragCreateStart: Record<string, { hour: number; minute: number }>;
  weeklyDragCreateEnd: Record<string, { hour: number; minute: number }>;
  weeklyNewTaskInputs: Record<string, string>;
  weeklyEditTitle: string;
  weeklyEditColor: string;
  weeklyEditDescription: string;
  dialogTaskTitle: string;
  dialogTaskDescription: string;
  dialogStartTime: string;
  dialogEndTime: string;
  dialogTaskColor: string;
  dialogAddToContentCalendar: boolean;
  editingTask: PlannerItem | null;
  copyToDate: Date | undefined;
  deleteAfterCopy: boolean;
  pendingTaskFromAllTasks: PlannerItem | null;
  isTaskDialogOpen: boolean;
  todayScrollRef: React.RefObject<HTMLDivElement>;
  weeklyScrollRef: React.RefObject<HTMLDivElement>;
  titleInputRef: React.RefObject<HTMLInputElement>;
  startTimeInputRef: React.RefObject<HTMLInputElement>;
  endTimeInputRef: React.RefObject<HTMLInputElement>;
  descriptionInputRef: React.RefObject<HTMLTextAreaElement>;
  isResizingRef: React.MutableRefObject<boolean>;
  convert24To12Hour: (time: string) => string;
  convert12To24Hour: (time: string) => string;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setCopyToDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setIsCopyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteAfterCopy: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: React.Dispatch<React.SetStateAction<any>>;
  setSelectedTimezone: React.Dispatch<React.SetStateAction<string>>;
  setTodayZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setTodayScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setWeeklyScrollPosition: React.Dispatch<React.SetStateAction<number>>;
  setIsDraggingCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setDragCreateStart: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setDragCreateEnd: React.Dispatch<React.SetStateAction<{ hour: number; minute: number } | null>>;
  setWeeklyDraggingCreate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyDragCreateStart: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setWeeklyDragCreateEnd: React.Dispatch<React.SetStateAction<Record<string, { hour: number; minute: number }>>>;
  setGlobalTasks: React.Dispatch<React.SetStateAction<string>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setContentCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskDialogPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingTaskFromAllTasks: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setTasks: React.Dispatch<React.SetStateAction<string>>;
  setGreatDay: React.Dispatch<React.SetStateAction<string>>;
  setGrateful: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyNewTaskInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setWeeklyAddingTask: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyEditingTask: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditText: React.Dispatch<React.SetStateAction<string>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragOverWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyDropIndicatorPosition: React.Dispatch<React.SetStateAction<'before' | 'after' | null>>;
  setWeeklyEditDialogOpen: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditDescription: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditColor: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditTitle: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditingTitle: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDraggingOverAllTasks: React.Dispatch<React.SetStateAction<boolean>>;
  setDraggingTaskText: React.Dispatch<React.SetStateAction<string>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  saveScheduledContent: (data: any[]) => void;
  saveTodayScrollPosition: (scrollPosition: number) => void;
  saveWeeklyScrollPosition: (scrollPosition: number) => void;
  saveSelectedTimezone: (timezone: string) => void;
  saveTodayZoomLevel: (zoomLevel: number) => void;
  saveWeeklyZoomLevel: (zoomLevel: number) => void;
  onWeeklyAddDialogOpen?: (dayString: string, startTime: string, endTime: string) => void;
  onTodayAddDialogOpen?: (startTime: string, endTime: string) => void;
}

export const usePlannerActions = (args: UsePlannerActionsArgs) => {
  // Use composed hooks for smaller, focused functionality
  const taskDialogInputs = useTaskDialogInputs({
    dialogStartTime: args.dialogStartTime,
    dialogEndTime: args.dialogEndTime,
    setDialogTaskColor: args.setDialogTaskColor,
    setDialogStartTime: args.setDialogStartTime,
    setDialogEndTime: args.setDialogEndTime,
    startTimeInputRef: args.startTimeInputRef,
    endTimeInputRef: args.endTimeInputRef,
    descriptionInputRef: args.descriptionInputRef,
  });

  const copyDialogActions = useCopyDialogActions({
    setIsCopyDialogOpen: args.setIsCopyDialogOpen,
    setCopyToDate: args.setCopyToDate,
    setDeleteAfterCopy: args.setDeleteAfterCopy,
  });

  // Navigation: date selection, view switching, scroll handlers, zoom
  const navigation = usePlannerNavigation({
    currentView: args.currentView,
    todayZoomLevel: args.todayZoomLevel,
    weeklyZoomLevel: args.weeklyZoomLevel,
    todayScrollPosition: args.todayScrollPosition,
    weeklyScrollPosition: args.weeklyScrollPosition,
    todayScrollRef: args.todayScrollRef,
    weeklyScrollRef: args.weeklyScrollRef,
    setSelectedDate: args.setSelectedDate,
    setSelectedTimezone: args.setSelectedTimezone,
    setTodayZoomLevel: args.setTodayZoomLevel,
    setWeeklyZoomLevel: args.setWeeklyZoomLevel,
    setTodayScrollPosition: args.setTodayScrollPosition,
    setWeeklyScrollPosition: args.setWeeklyScrollPosition,
    saveSelectedTimezone: args.saveSelectedTimezone,
    saveTodayScrollPosition: args.saveTodayScrollPosition,
    saveWeeklyScrollPosition: args.saveWeeklyScrollPosition,
    saveTodayZoomLevel: args.saveTodayZoomLevel,
    saveWeeklyZoomLevel: args.saveWeeklyZoomLevel,
  });

  // Task CRUD: create, update, delete, reorder tasks
  const taskCRUD = usePlannerTaskCRUD({
    plannerData: args.plannerData,
    allTasks: args.allTasks,
    dateString: args.dateString,
    tasks: args.tasks,
    greatDay: args.greatDay,
    grateful: args.grateful,
    weeklyNewTaskInputs: args.weeklyNewTaskInputs,
    weeklyEditTitle: args.weeklyEditTitle,
    weeklyEditColor: args.weeklyEditColor,
    weeklyEditDescription: args.weeklyEditDescription,
    weeklyEditText: "",
    isResizingRef: args.isResizingRef,
    setPlannerData: args.setPlannerData,
    setAllTasks: args.setAllTasks,
    setGlobalTasks: args.setGlobalTasks,
    setTasks: args.setTasks,
    setGreatDay: args.setGreatDay,
    setGrateful: args.setGrateful,
    setWeeklyNewTaskInputs: args.setWeeklyNewTaskInputs,
    setWeeklyAddingTask: args.setWeeklyAddingTask,
    setWeeklyEditingTask: args.setWeeklyEditingTask,
    setWeeklyEditText: args.setWeeklyEditText,
    setWeeklyEditDialogOpen: args.setWeeklyEditDialogOpen,
    setWeeklyEditTitle: args.setWeeklyEditTitle,
    setWeeklyEditDescription: args.setWeeklyEditDescription,
    setWeeklyEditColor: args.setWeeklyEditColor,
    setWeeklyEditingTitle: args.setWeeklyEditingTitle,
    savePlannerData: args.savePlannerData,
    saveAllTasks: args.saveAllTasks,
  });

  // Dialogs: task dialog state, editing fields, content calendar items
  const dialogs = usePlannerDialogs({
    plannerData: args.plannerData,
    allTasks: args.allTasks,
    contentCalendarData: args.contentCalendarData,
    dateString: args.dateString,
    dialogTaskTitle: args.dialogTaskTitle,
    dialogTaskDescription: args.dialogTaskDescription,
    dialogStartTime: args.dialogStartTime,
    dialogEndTime: args.dialogEndTime,
    dialogTaskColor: args.dialogTaskColor,
    dialogAddToContentCalendar: args.dialogAddToContentCalendar,
    editingTask: args.editingTask,
    pendingTaskFromAllTasks: args.pendingTaskFromAllTasks,
    convert24To12Hour: args.convert24To12Hour,
    convert12To24Hour: args.convert12To24Hour,
    titleInputRef: args.titleInputRef,
    setPlannerData: args.setPlannerData,
    setAllTasks: args.setAllTasks,
    setContentCalendarData: args.setContentCalendarData,
    setIsTaskDialogOpen: args.setIsTaskDialogOpen,
    setEditingTask: args.setEditingTask,
    setDialogTaskTitle: args.setDialogTaskTitle,
    setDialogTaskDescription: args.setDialogTaskDescription,
    setDialogStartTime: args.setDialogStartTime,
    setDialogEndTime: args.setDialogEndTime,
    setDialogTaskColor: args.setDialogTaskColor,
    setDialogAddToContentCalendar: args.setDialogAddToContentCalendar,
    setPendingTaskFromAllTasks: args.setPendingTaskFromAllTasks,
    savePlannerData: args.savePlannerData,
    saveAllTasks: args.saveAllTasks,
    saveScheduledContent: args.saveScheduledContent,
    handleEditItem: taskCRUD.handleEditItem,
  });

  // Drag-to-create: drag-to-create state and handlers for today and weekly views
  usePlannerDragCreate({
    isDraggingCreate: args.isDraggingCreate,
    dragCreateStart: args.dragCreateStart,
    dragCreateEnd: args.dragCreateEnd,
    weeklyDraggingCreate: args.weeklyDraggingCreate,
    weeklyDragCreateStart: args.weeklyDragCreateStart,
    weeklyDragCreateEnd: args.weeklyDragCreateEnd,
    todayZoomLevel: args.todayZoomLevel,
    isTaskDialogOpen: args.isTaskDialogOpen,
    contentDisplayMode: args.contentDisplayMode,
    todayScrollRef: args.todayScrollRef,
    convert24To12Hour: args.convert24To12Hour,
    setIsDraggingCreate: args.setIsDraggingCreate,
    setDragCreateStart: args.setDragCreateStart,
    setDragCreateEnd: args.setDragCreateEnd,
    setWeeklyDraggingCreate: args.setWeeklyDraggingCreate,
    setWeeklyDragCreateStart: args.setWeeklyDragCreateStart,
    setWeeklyDragCreateEnd: args.setWeeklyDragCreateEnd,
    setTaskDialogPosition: args.setTaskDialogPosition,
    setEditingTask: args.setEditingTask,
    setDialogTaskTitle: args.setDialogTaskTitle,
    setDialogTaskDescription: args.setDialogTaskDescription,
    setDialogStartTime: args.setDialogStartTime,
    setDialogEndTime: args.setDialogEndTime,
    setDialogTaskColor: args.setDialogTaskColor,
    setDialogAddToContentCalendar: args.setDialogAddToContentCalendar,
    setIsTaskDialogOpen: args.setIsTaskDialogOpen,
    handleOpenTaskDialog: dialogs.handleOpenTaskDialog,
    onWeeklyAddDialogOpen: args.onWeeklyAddDialogOpen,
    onTodayAddDialogOpen: args.onTodayAddDialogOpen,
  });

  // Copy/move: copy/move task logic, drag-drop between areas
  const copy = usePlannerCopy({
    plannerData: args.plannerData,
    allTasks: args.allTasks,
    dateString: args.dateString,
    copyToDate: args.copyToDate,
    deleteAfterCopy: args.deleteAfterCopy,
    draggedWeeklyTaskId: null, // Managed internally by drag handlers
    weeklyDropIndicatorPosition: null, // Managed internally by drag handlers
    setPlannerData: args.setPlannerData,
    setAllTasks: args.setAllTasks,
    setIsCopyDialogOpen: args.setIsCopyDialogOpen,
    setCopyToDate: args.setCopyToDate,
    setDeleteAfterCopy: args.setDeleteAfterCopy,
    setDraggedWeeklyTaskId: args.setDraggedWeeklyTaskId,
    setDragOverWeeklyTaskId: args.setDragOverWeeklyTaskId,
    setWeeklyDropIndicatorPosition: args.setWeeklyDropIndicatorPosition,
    setDraggingTaskText: args.setDraggingTaskText,
    setIsDraggingOverAllTasks: args.setIsDraggingOverAllTasks,
    setEditingTask: args.setEditingTask,
    setDialogTaskTitle: args.setDialogTaskTitle,
    setDialogTaskDescription: args.setDialogTaskDescription,
    setDialogStartTime: args.setDialogStartTime,
    setDialogEndTime: args.setDialogEndTime,
    setDialogTaskColor: args.setDialogTaskColor,
    setDialogAddToContentCalendar: args.setDialogAddToContentCalendar,
    setIsTaskDialogOpen: args.setIsTaskDialogOpen,
    setPendingTaskFromAllTasks: args.setPendingTaskFromAllTasks,
    savePlannerData: args.savePlannerData,
    saveAllTasks: args.saveAllTasks,
    handleReorderWeeklyTasks: taskCRUD.handleReorderWeeklyTasks,
  });

  // handleAddTaskAtTime delegates to dialog's handleOpenTaskDialog
  const handleAddTaskAtTime = (hour: number) => {
    dialogs.handleOpenTaskDialog(hour);
  };

  return {
    // From dialogs
    handleOpenTaskDialog: dialogs.handleOpenTaskDialog,
    handleSaveTaskDialog: dialogs.handleSaveTaskDialog,
    handleCancelTaskDialog: dialogs.handleCancelTaskDialog,
    handleDialogOpenChange: dialogs.handleDialogOpenChange,
    handleWeeklyTaskClick: dialogs.handleWeeklyTaskClick,
    handleCalendarTaskClick: dialogs.handleCalendarTaskClick,
    handleContentCalendarTaskClick: dialogs.handleContentCalendarTaskClick,
    handleRemoveContentCalendarItem: dialogs.handleRemoveContentCalendarItem,
    handleMoveContentCalendarItem: dialogs.handleMoveContentCalendarItem,
    handleAddWeeklyTaskAtTime: dialogs.handleAddWeeklyTaskAtTime,

    // From taskCRUD
    getTasksWithTimes: taskCRUD.getTasksWithTimes,
    handleAddItem: taskCRUD.handleAddItem,
    handleAddWeeklyTask: taskCRUD.handleAddWeeklyTask,
    handleEditWeeklyTask: taskCRUD.handleEditWeeklyTask,
    handleDeleteWeeklyTask: taskCRUD.handleDeleteWeeklyTask,
    handleSaveWeeklyTaskDetails: taskCRUD.handleSaveWeeklyTaskDetails,
    handleToggleWeeklyTask: taskCRUD.handleToggleWeeklyTask,
    handleReorderWeeklyTasks: taskCRUD.handleReorderWeeklyTasks,
    handleToggleItem: taskCRUD.handleToggleItem,
    handleDeleteItem: taskCRUD.handleDeleteItem,
    handleEditItem: taskCRUD.handleEditItem,
    handleAddTask: taskCRUD.handleAddTask,
    handleUpdateSectionText: taskCRUD.handleUpdateSectionText,
    handleSaveSectionText: taskCRUD.handleSaveSectionText,
    handleAddTaskAtTime,
    handleToggleAllTask: taskCRUD.handleToggleAllTask,
    handleDeleteAllTask: taskCRUD.handleDeleteAllTask,
    handleEditAllTask: taskCRUD.handleEditAllTask,
    handleReorderAllTasks: taskCRUD.handleReorderAllTasks,
    handleAddAllTask: taskCRUD.handleAddAllTask,
    handleSaveWeeklyObjective: taskCRUD.handleSaveWeeklyObjective,
    handleWeeklyTaskAdd: taskCRUD.handleWeeklyTaskAdd,
    handleWeeklyTaskEdit: taskCRUD.handleWeeklyTaskEdit,
    handleWeeklyTaskEditConfirm: taskCRUD.handleWeeklyTaskEditConfirm,
    handleWeeklyTaskEditCancel: taskCRUD.handleWeeklyTaskEditCancel,
    handleWeeklyEditTask: taskCRUD.handleWeeklyEditTask,
    handleWeeklyEditSave: taskCRUD.handleWeeklyEditSave,
    handleWeeklyEditCancel: taskCRUD.handleWeeklyEditCancel,
    handleWeeklyEditTitleChange: taskCRUD.handleWeeklyEditTitleChange,
    handleWeeklyEditDescriptionChange: taskCRUD.handleWeeklyEditDescriptionChange,
    handleWeeklyEditColorChange: taskCRUD.handleWeeklyEditColorChange,
    handleWeeklyEditStart: taskCRUD.handleWeeklyEditStart,
    handleWeeklyEditEnd: taskCRUD.handleWeeklyEditEnd,
    handleWeeklyAddTaskClick: taskCRUD.handleWeeklyAddTaskClick,
    handleWeeklyTaskInputChange: taskCRUD.handleWeeklyTaskInputChange,
    handleWeeklyTaskInputBlur: taskCRUD.handleWeeklyTaskInputBlur,
    handleWeeklyEditTitleKeyDown: taskCRUD.handleWeeklyEditTitleKeyDown,
    handleInputKeyDown: taskCRUD.handleInputKeyDown,
    handleSectionChange: taskCRUD.handleSectionChange,
    handleSectionBlur: taskCRUD.handleSectionBlur,
    handleSaveWeeklyTaskTitle: taskCRUD.handleSaveWeeklyTaskTitle,
    handleSaveWeeklyTaskDescription: taskCRUD.handleSaveWeeklyTaskDescription,
    handleSaveWeeklyTaskColor: taskCRUD.handleSaveWeeklyTaskColor,
    handleWeeklyTaskClickOutside: taskCRUD.handleWeeklyTaskClickOutside,
    handleWeeklyTaskTimeChange: taskCRUD.handleWeeklyTaskTimeChange,
    handleUpdateTaskCompletion: taskCRUD.handleUpdateTaskCompletion,
    handleTaskResizeStart: taskCRUD.handleTaskResizeStart,

    // From navigation
    handlePreviousDay: navigation.handlePreviousDay,
    handleNextDay: navigation.handleNextDay,
    handleDateSelect: navigation.handleDateSelect,
    handleTimezoneChange: navigation.handleTimezoneChange,
    handleMoveToToday: navigation.handleMoveToToday,
    handleTodayScrollToCurrentTime: navigation.handleTodayScrollToCurrentTime,
    handleWeeklyScrollToCurrentTime: navigation.handleWeeklyScrollToCurrentTime,

    // From copy/move
    handleCopyTasks: copy.handleCopyTasks,
    handleCopyDay: copy.handleCopyDay,
    handleDropTaskFromWeeklyToAllTasks: copy.handleDropTaskFromWeeklyToAllTasks,
    handleDropTaskFromCalendarToAllTasks: copy.handleDropTaskFromCalendarToAllTasks,
    handleWeeklyTaskDragStart: copy.handleWeeklyTaskDragStart,
    handleWeeklyTaskDragEnd: copy.handleWeeklyTaskDragEnd,
    handleWeeklyTaskDragOver: copy.handleWeeklyTaskDragOver,
    handleWeeklyTaskDragLeave: copy.handleWeeklyTaskDragLeave,
    handleWeeklyTaskDrop: copy.handleWeeklyTaskDrop,
    handleTaskDragStart: copy.handleTaskDragStart,
    handleTaskDragEnd: copy.handleTaskDragEnd,
    handleAllTasksDragEnter: copy.handleAllTasksDragEnter,
    handleAllTasksDragLeave: copy.handleAllTasksDragLeave,
    handleAllTasksDragOver: copy.handleAllTasksDragOver,
    handleAllTasksDrop: copy.handleAllTasksDrop,
    handleAllTasksDropInSection: copy.handleAllTasksDropInSection,
    handleAllTasksDropOnSection: copy.handleAllTasksDropOnSection,
    handleCalendarTaskDropToDay: copy.handleCalendarTaskDropToDay,
    handleAllTasksDropOnDay: copy.handleAllTasksDropOnDay,
    handleTodayCalendarDrop: copy.handleTodayCalendarDrop,
    handleTaskDropToToday: copy.handleTaskDropToToday,
    handleAllTasksDragStart: copy.handleAllTasksDragStart,
    handleAllTasksDragEnd: copy.handleAllTasksDragEnd,
    handleContentCalendarDrop: copy.handleContentCalendarDrop,
    handleAllTasksDragOverContentCalendar: copy.handleAllTasksDragOverContentCalendar,
    handleAllTasksDropContentCalendar: copy.handleAllTasksDropContentCalendar,
    handleAllTasksDragOverCalendar: copy.handleAllTasksDragOverCalendar,
    handleAllTasksDropCalendar: copy.handleAllTasksDropCalendar,
    handleAllTasksDropCalendarDay: copy.handleAllTasksDropCalendarDay,
    handleAllTasksDropCalendarTask: copy.handleAllTasksDropCalendarTask,
    handleTaskSectionDrop: copy.handleTaskSectionDrop,

    // From copyDialogActions
    ...copyDialogActions,

    // From taskDialogInputs
    ...taskDialogInputs,

    // Pass-through save functions
    savePlannerData: args.savePlannerData,
    saveAllTasks: args.saveAllTasks,
    saveScheduledContent: args.saveScheduledContent,
  };
};
