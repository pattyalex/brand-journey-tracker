import { format } from "date-fns";
import { PlannerDay, PlannerItem } from "@/types/planner";

interface UsePlannerCopyArgs {
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  dateString: string;
  copyToDate: Date | undefined;
  deleteAfterCopy: boolean;
  draggedWeeklyTaskId: string | null;
  weeklyDropIndicatorPosition: 'before' | 'after' | null;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setIsCopyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCopyToDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setDeleteAfterCopy: React.Dispatch<React.SetStateAction<boolean>>;
  setDraggedWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragOverWeeklyTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyDropIndicatorPosition: React.Dispatch<React.SetStateAction<'before' | 'after' | null>>;
  setDraggingTaskText: React.Dispatch<React.SetStateAction<string>>;
  setIsDraggingOverAllTasks: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingTaskFromAllTasks: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  handleReorderWeeklyTasks: (dayString: string, draggedTaskId: string, targetTaskId: string, position: 'before' | 'after') => void;
}

export const usePlannerCopy = ({
  plannerData,
  allTasks,
  dateString,
  copyToDate,
  deleteAfterCopy,
  draggedWeeklyTaskId,
  weeklyDropIndicatorPosition,
  setPlannerData,
  setAllTasks,
  setIsCopyDialogOpen,
  setCopyToDate,
  setDeleteAfterCopy,
  setDraggedWeeklyTaskId,
  setDragOverWeeklyTaskId,
  setWeeklyDropIndicatorPosition,
  setDraggingTaskText,
  setIsDraggingOverAllTasks,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setIsTaskDialogOpen,
  setPendingTaskFromAllTasks,
  savePlannerData,
  saveAllTasks,
  handleReorderWeeklyTasks,
}: UsePlannerCopyArgs) => {

  const handleCopyTasks = () => {
    if (!copyToDate) return;

    const sourceDayIndex = plannerData.findIndex(day => day.date === dateString);
    if (sourceDayIndex < 0) return;

    const copyToDateString = format(copyToDate, 'yyyy-MM-dd');
    const targetDayIndex = plannerData.findIndex(day => day.date === copyToDateString);

    const updatedPlannerData = [...plannerData];
    const sourceDay = plannerData[sourceDayIndex];

    if (targetDayIndex >= 0) {
      // Update existing day
      updatedPlannerData[targetDayIndex] = {
        ...updatedPlannerData[targetDayIndex],
        items: [...sourceDay.items],
        tasks: sourceDay.tasks || "",
        greatDay: sourceDay.greatDay || "",
        grateful: sourceDay.grateful || "",
      };
    } else {
      // Create new day
      updatedPlannerData.push({
        date: copyToDateString,
        items: [...sourceDay.items],
        tasks: sourceDay.tasks || "",
        greatDay: sourceDay.greatDay || "",
        grateful: sourceDay.grateful || "",
      });
    }

    if (deleteAfterCopy) {
      // Remove tasks from original day
      const currentDayIndex = updatedPlannerData.findIndex(day => day.date === dateString);
      if (currentDayIndex >= 0) {
        updatedPlannerData.splice(currentDayIndex, 1);
      }
    }

    setPlannerData(updatedPlannerData);
    setIsCopyDialogOpen(false);
    setCopyToDate(undefined);
    setDeleteAfterCopy(false);

    savePlannerData(updatedPlannerData);
  };

  const handleCopyDay = () => {
    setIsCopyDialogOpen(true);
  };

  const handleDropTaskFromWeeklyToAllTasks = (draggedTaskId: string, targetTaskId: string, fromDate: string) => {
    // Find the task in the source day
    const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === draggedTaskId);
    if (!taskToMove) return;

    // Remove from source day
    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== draggedTaskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);

    // Add to All Tasks at specific position
    const newAllTaskItem: PlannerItem = {
      ...taskToMove,
      date: undefined, // Completely remove date to prevent any past-date styling
      section: "morning",
      color: "", // Clear color when moving to All Tasks
    };

    const targetIndex = allTasks.findIndex(t => t.id === targetTaskId);
    const newAllTasks = [...allTasks];
    newAllTasks.splice(targetIndex, 0, newAllTaskItem);
    setAllTasks(newAllTasks);
    saveAllTasks(newAllTasks);
  };

  const handleDropTaskFromCalendarToAllTasks = (taskId: string, fromDate: string, targetIndex: number) => {
    console.log('🎯 Dropping task at index:', targetIndex);

    // Find the task in the source day
    const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    // Remove from source day
    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);

    // Add to All Tasks at specific position
    const newAllTaskItem: PlannerItem = {
      ...taskToMove,
      date: undefined, // Completely remove date to prevent any past-date styling
      section: "morning",
      startTime: undefined,
      endTime: undefined,
      color: "", // Clear color when moving to All Tasks
    };

    const newAllTasks = [...allTasks];
    newAllTasks.splice(targetIndex, 0, newAllTaskItem);
    setAllTasks(newAllTasks);
    saveAllTasks(newAllTasks);

    console.log('✅ Task inserted at position', targetIndex);
  };

  const handleWeeklyTaskDragStart = (taskId: string, dayString: string, e: React.DragEvent) => {
    setDraggedWeeklyTaskId(taskId);
    setDraggingTaskText(taskId);

    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('fromDate', dayString);
    e.dataTransfer.setData('fromAllTasks', 'false');
    e.dataTransfer.effectAllowed = 'move';

    e.currentTarget.style.opacity = '0.5';
  };

  const handleWeeklyTaskDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedWeeklyTaskId(null);
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
    setDraggingTaskText("");
  };

  const handleWeeklyTaskDragOver = (taskId: string, e: React.DragEvent) => {
    e.preventDefault();

    // If we're dragging over the same task, do nothing
    if (taskId === draggedWeeklyTaskId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const midpoint = rect.top + rect.height / 2;

    setDragOverWeeklyTaskId(taskId);
    setWeeklyDropIndicatorPosition(mouseY < midpoint ? 'before' : 'after');
  };

  const handleWeeklyTaskDragLeave = () => {
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
  };

  const handleWeeklyTaskDrop = (dayString: string, targetTaskId: string, e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedWeeklyTaskId || !weeklyDropIndicatorPosition) return;

    // Reorder within the same day
    handleReorderWeeklyTasks(dayString, draggedWeeklyTaskId, targetTaskId, weeklyDropIndicatorPosition);

    setDraggedWeeklyTaskId(null);
    setDragOverWeeklyTaskId(null);
    setWeeklyDropIndicatorPosition(null);
  };

  const handleTaskDragStart = (task: PlannerItem, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromDate', task.date || dateString);
    e.dataTransfer.setData('fromAllTasks', task.date ? 'false' : 'true');
    e.dataTransfer.effectAllowed = 'move';

    setDraggingTaskText(task.text);

    // Add drag class
    e.currentTarget.classList.add('opacity-50');

    console.log('✅ Drag data set - taskId:', task.id, 'fromDate:', task.date || dateString);
  };

  const handleTaskDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggingTaskText("");
  };

  const handleAllTasksDragEnter = () => {
    setIsDraggingOverAllTasks(true);
  };

  const handleAllTasksDragLeave = () => {
    setIsDraggingOverAllTasks(false);
  };

  const handleAllTasksDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      const dayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (dayIndex < 0) return;

      const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      setAllTasks(prev => [...prev, newAllTaskItem]);
      saveAllTasks([...allTasks, newAllTaskItem]);
    }

    setIsDraggingOverAllTasks(false);
  };

  const handleAllTasksDropInSection = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      handleDropTaskFromCalendarToAllTasks(taskId, fromDate, targetIndex);
    }
  };

  const handleAllTasksDropOnSection = (e: React.DragEvent) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromAllTasks = e.dataTransfer.getData('fromAllTasks') === 'true';

    if (taskId && fromDate && !fromAllTasks) {
      const dayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (dayIndex < 0) return;

      const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      setAllTasks(prev => [...prev, newAllTaskItem]);
      saveAllTasks([...allTasks, newAllTaskItem]);
    }
  };

  const handleCalendarTaskDropToDay = (taskId: string, fromDate: string, targetDate: string) => {
    if (!taskId || !fromDate) return;

    const fromDayIndex = plannerData.findIndex(day => day.date === fromDate);
    if (fromDayIndex < 0) return;

    const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[fromDayIndex] = {
      ...updatedPlannerData[fromDayIndex],
      items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
    };

    const toDayIndex = updatedPlannerData.findIndex(day => day.date === targetDate);
    const movedTask = { ...taskToMove, date: targetDate };

    if (toDayIndex >= 0) {
      updatedPlannerData[toDayIndex] = {
        ...updatedPlannerData[toDayIndex],
        items: [...updatedPlannerData[toDayIndex].items, movedTask]
      };
    } else {
      updatedPlannerData.push({
        date: targetDate,
        items: [movedTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleAllTasksDropOnDay = (taskId: string, targetDate: string) => {
    const taskToMove = allTasks.find(task => task.id === taskId);
    if (!taskToMove) return;

    // Remove from All Tasks
    const updatedAllTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedAllTasks);
    saveAllTasks(updatedAllTasks);

    // Add to target day
    const updatedPlannerData = [...plannerData];
    const dayIndex = updatedPlannerData.findIndex(day => day.date === targetDate);

    const newTask: PlannerItem = {
      ...taskToMove,
      date: targetDate,
      section: "morning",
    };

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newTask]
      };
    } else {
      updatedPlannerData.push({
        date: targetDate,
        items: [newTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleTodayCalendarDrop = (taskId: string, fromDate: string, targetDate: string) => {
    handleCalendarTaskDropToDay(taskId, fromDate, targetDate);
  };

  const handleTaskDropToToday = (taskId: string, fromDate: string, e: React.DragEvent) => {
    e.preventDefault();

    // If dropping on same day, ignore
    if (fromDate === dateString) return;

    const dayIndex = plannerData.findIndex(d => d.date === fromDate);
    if (dayIndex < 0) return;

    const taskToMove = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!taskToMove) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
    };

    const toDayIndex = updatedPlannerData.findIndex(d => d.date === dateString);
    const movedTask = { ...taskToMove, date: dateString };

    if (toDayIndex >= 0) {
      updatedPlannerData[toDayIndex] = {
        ...updatedPlannerData[toDayIndex],
        items: [...updatedPlannerData[toDayIndex].items, movedTask]
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [movedTask],
        tasks: "",
        greatDay: "",
        grateful: ""
      });
    }

    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleAllTasksDragStart = (task: PlannerItem, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromDate', '');
    e.dataTransfer.setData('fromAllTasks', 'true');
    e.dataTransfer.effectAllowed = 'move';

    setDraggingTaskText(task.text);

    // Add drag class
    e.currentTarget.classList.add('opacity-50');
  };

  const handleAllTasksDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggingTaskText("");
  };

  const handleContentCalendarDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');
    const toDate = targetDate;

    console.log('📅 Content Calendar Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

    if (taskId && fromDate && fromDate !== toDate) {
      const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
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
        // Create new day entry if it doesn't exist
        updatedPlannerData.push({
          date: toDate,
          items: [movedTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleAllTasksDragOverContentCalendar = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDropContentCalendar = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Content Calendar Drop - taskId:', taskId, 'fromDate:', fromDate);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: dateString } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDragOverCalendar = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAllTasksDropCalendar = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', targetDate);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: targetDate } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDropCalendarDay = (e: React.DragEvent, dayString: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData('taskId');
    const fromDate = e.dataTransfer.getData('fromDate');

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', dayString);

    if (taskId && !fromDate) {
      // Task is coming from All Tasks (no date)
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      // Store the original task in case user cancels
      setPendingTaskFromAllTasks(taskToMove);

      // Remove from All Tasks
      const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
      setAllTasks(filteredAllTasks);
      saveAllTasks(filteredAllTasks);

      // Open dialog to edit task details before adding to day
      setEditingTask({ ...taskToMove, date: dayString } as PlannerItem);
      setDialogTaskTitle(taskToMove.text);
      setDialogTaskDescription(taskToMove.description || "");
      setDialogStartTime(taskToMove.startTime || "");
      setDialogEndTime(taskToMove.endTime || "");
      setDialogTaskColor(taskToMove.color || "");
      setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
      setIsTaskDialogOpen(true);
    }
  };

  const handleAllTasksDropCalendarTask = (e: React.DragEvent, taskId: string, fromDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('📅 Calendar View Drop - taskId:', taskId, 'fromDate:', fromDate);

    if (taskId && fromDate) {
      const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: undefined,
        section: "morning",
        startTime: undefined,
        endTime: undefined,
        color: "",
      };

      const newAllTasks = [...allTasks, newAllTaskItem];
      setAllTasks(newAllTasks);
      saveAllTasks(newAllTasks);

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleTaskSectionDrop = (taskId: string, targetSection: PlannerItem["section"], fromDate?: string) => {
    if (fromDate) {
      // Task is coming from another day
      const fromDayIndex = plannerData.findIndex(day => day.date === fromDate);
      if (fromDayIndex < 0) return;

      const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
      if (!taskToMove) return;

      // Remove from source day
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[fromDayIndex] = {
        ...updatedPlannerData[fromDayIndex],
        items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
      };

      // Add to target section in current day
      const targetDayIndex = updatedPlannerData.findIndex(day => day.date === dateString);
      const movedTask = { ...taskToMove, date: dateString, section: targetSection };

      if (targetDayIndex >= 0) {
        updatedPlannerData[targetDayIndex] = {
          ...updatedPlannerData[targetDayIndex],
          items: [...updatedPlannerData[targetDayIndex].items, movedTask]
        };
      } else {
        updatedPlannerData.push({
          date: dateString,
          items: [movedTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    } else {
      // Task is coming from All Tasks
      const taskToMove = allTasks.find(task => task.id === taskId);
      if (!taskToMove) return;

      // Remove from All Tasks
      const updatedAllTasks = allTasks.filter(task => task.id !== taskId);
      setAllTasks(updatedAllTasks);
      saveAllTasks(updatedAllTasks);

      // Add to target section in current day
      const updatedPlannerData = [...plannerData];
      const dayIndex = updatedPlannerData.findIndex(day => day.date === dateString);

      const newTask: PlannerItem = {
        ...taskToMove,
        date: dateString,
        section: targetSection,
      };

      if (dayIndex >= 0) {
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newTask]
        };
      } else {
        updatedPlannerData.push({
          date: dateString,
          items: [newTask],
          tasks: "",
          greatDay: "",
          grateful: ""
        });
      }

      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  return {
    handleCopyTasks,
    handleCopyDay,
    handleDropTaskFromWeeklyToAllTasks,
    handleDropTaskFromCalendarToAllTasks,
    handleWeeklyTaskDragStart,
    handleWeeklyTaskDragEnd,
    handleWeeklyTaskDragOver,
    handleWeeklyTaskDragLeave,
    handleWeeklyTaskDrop,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleAllTasksDragEnter,
    handleAllTasksDragLeave,
    handleAllTasksDragOver,
    handleAllTasksDrop,
    handleAllTasksDropInSection,
    handleAllTasksDropOnSection,
    handleCalendarTaskDropToDay,
    handleAllTasksDropOnDay,
    handleTodayCalendarDrop,
    handleTaskDropToToday,
    handleAllTasksDragStart,
    handleAllTasksDragEnd,
    handleContentCalendarDrop,
    handleAllTasksDragOverContentCalendar,
    handleAllTasksDropContentCalendar,
    handleAllTasksDragOverCalendar,
    handleAllTasksDropCalendar,
    handleAllTasksDropCalendarDay,
    handleAllTasksDropCalendarTask,
    handleTaskSectionDrop,
  };
};
