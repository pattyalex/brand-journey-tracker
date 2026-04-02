import { PlannerDay, PlannerItem } from "@/types/planner";
import { updateItemOrders } from "../utils/plannerUtils";

interface UsePlannerTaskCRUDArgs {
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  dateString: string;
  tasks: string;
  greatDay: string;
  grateful: string;
  weeklyNewTaskInputs: Record<string, string>;
  weeklyEditTitle: string;
  weeklyEditColor: string;
  weeklyEditDescription: string;
  isResizingRef: React.MutableRefObject<boolean>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setGlobalTasks: React.Dispatch<React.SetStateAction<string>>;
  setTasks: React.Dispatch<React.SetStateAction<string>>;
  setGreatDay: React.Dispatch<React.SetStateAction<string>>;
  setGrateful: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyNewTaskInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setWeeklyAddingTask: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setWeeklyEditingTask: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditText: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditDialogOpen: React.Dispatch<React.SetStateAction<string | null>>;
  setWeeklyEditTitle: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditDescription: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditColor: React.Dispatch<React.SetStateAction<string>>;
  setWeeklyEditingTitle: React.Dispatch<React.SetStateAction<boolean>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  weeklyEditText: string;
  resolvedTimezone: string;
}

export const usePlannerTaskCRUD = ({
  plannerData,
  allTasks,
  dateString,
  tasks,
  greatDay,
  grateful,
  weeklyNewTaskInputs,
  weeklyEditTitle,
  weeklyEditColor,
  weeklyEditDescription,
  weeklyEditText,
  isResizingRef,
  setPlannerData,
  setAllTasks,
  setGlobalTasks,
  setTasks,
  setGreatDay,
  setGrateful,
  setWeeklyNewTaskInputs,
  setWeeklyAddingTask,
  setWeeklyEditingTask,
  setWeeklyEditText,
  setWeeklyEditDialogOpen,
  setWeeklyEditTitle,
  setWeeklyEditDescription,
  setWeeklyEditColor,
  setWeeklyEditingTitle,
  savePlannerData,
  saveAllTasks,
  resolvedTimezone,
}: UsePlannerTaskCRUDArgs) => {

  const getTasksWithTimes = (dayString: string) => {
    return (plannerData.find(d => d.date === dayString)?.items || [])
      .filter(item => item.startTime && item.endTime);
  };

  const handleAddItem = (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text,
      section,
      isCompleted: false,
      date: dateString,
      startTime,
      endTime,
      timezone: resolvedTimezone,
    };

    const dayIndex = plannerData.findIndex(day => day.date === dateString);

    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newItem]
      };
      setPlannerData(updatedPlannerData);
    } else {
      setPlannerData([...plannerData, {
        date: dateString,
        items: [newItem],
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      }]);
    }
  };

  const handleAddWeeklyTask = (dayString: string, text: string) => {
    if (!text.trim()) return;

    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text: text.trim(),
      section: "morning",
      isCompleted: false,
      date: dayString,
      timezone: resolvedTimezone,
    };

    const dayIndex = plannerData.findIndex(day => day.date === dayString);

    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newItem]
      };
      setPlannerData(updatedPlannerData);
    } else {
      setPlannerData([...plannerData, {
        date: dayString,
        items: [newItem],
        tasks: "",
        greatDay: "",
        grateful: ""
      }]);
    }

    // Clear input
    setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: "" }));
    setWeeklyAddingTask(prev => ({ ...prev, [dayString]: false }));
  };

  const handleEditWeeklyTask = (taskId: string, dayString: string, newText: string) => {
    if (!newText.trim()) return;

    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText.trim(),
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditingTask(null);
    setWeeklyEditText("");
  };

  const handleDeleteWeeklyTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskId)
    };
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleSaveWeeklyTaskDetails = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: weeklyEditTitle,
        color: weeklyEditColor,
        description: weeklyEditDescription
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleToggleWeeklyTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        isCompleted: !updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleReorderWeeklyTasks = (dayString: string, draggedTaskId: string, targetTaskId: string, position: 'before' | 'after') => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const items = [...updatedPlannerData[dayIndex].items];

    const draggedIndex = items.findIndex(item => item.id === draggedTaskId);
    const targetIndex = items.findIndex(item => item.id === targetTaskId);

    if (draggedIndex < 0 || targetIndex < 0) return;

    // Remove the dragged item
    const [draggedItem] = items.splice(draggedIndex, 1);

    // Calculate new position based on whether we're dropping before or after
    let newIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      // If dragging down, adjust for the removed item
      newIndex = position === 'before' ? targetIndex - 1 : targetIndex;
    } else {
      // If dragging up
      newIndex = position === 'before' ? targetIndex : targetIndex + 1;
    }

    // Insert at new position
    items.splice(newIndex, 0, draggedItem);

    // Update orders
    const itemsWithOrder = updateItemOrders(items);

    updatedPlannerData[dayIndex].items = itemsWithOrder;
    setPlannerData(updatedPlannerData);
    savePlannerData(updatedPlannerData);
  };

  const handleToggleItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        isCompleted: !updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleDeleteItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== id)
    };
    setPlannerData(updatedPlannerData);
  };

  const handleEditItem = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string, isCompleted?: boolean, taskDate?: string, isContentCalendar?: boolean) => {
    // Use provided taskDate or fall back to current dateString
    const searchDate = taskDate || dateString;
    const dayIndex = plannerData.findIndex(day => day.date === searchDate);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText,
        startTime,
        endTime,
        color: color !== undefined ? color : updatedPlannerData[dayIndex].items[itemIndex].color,
        description: description !== undefined ? description : updatedPlannerData[dayIndex].items[itemIndex].description,
        isCompleted: isCompleted !== undefined ? isCompleted : updatedPlannerData[dayIndex].items[itemIndex].isCompleted,
        isContentCalendar: isContentCalendar !== undefined ? isContentCalendar : updatedPlannerData[dayIndex].items[itemIndex].isContentCalendar,
        // When times change, update timezone to user's current timezone
        timezone: (startTime !== undefined || endTime !== undefined) ? resolvedTimezone : updatedPlannerData[dayIndex].items[itemIndex].timezone,
      };
      setPlannerData(updatedPlannerData);
      savePlannerData(updatedPlannerData);
    }
  };

  const handleAddTask = (section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const text = section === 'morning' ? tasks : section === 'midday' ? greatDay : grateful;
    handleAddItem(text, section, startTime, endTime);

    if (section === 'morning') {
      setTasks('');
    } else if (section === 'midday') {
      setGreatDay('');
    } else if (section === 'afternoon') {
      setGrateful('');
    }
  };

  const handleUpdateSectionText = (section: PlannerItem["section"], text: string) => {
    if (section === 'morning') {
      setTasks(text);
    } else if (section === 'midday') {
      setGreatDay(text);
    } else if (section === 'afternoon') {
      setGrateful(text);
    }
  };

  const handleSaveSectionText = (section: PlannerItem["section"], text: string) => {
    // Update current day data with new text for the section
    const updatedPlannerData = [...plannerData];
    const dayIndex = updatedPlannerData.findIndex(day => day.date === dateString);

    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        tasks: section === 'morning' ? text : updatedPlannerData[dayIndex].tasks,
        greatDay: section === 'midday' ? text : updatedPlannerData[dayIndex].greatDay,
        grateful: section === 'afternoon' ? text : updatedPlannerData[dayIndex].grateful
      };
      setPlannerData(updatedPlannerData);
    } else {
      const newDay: PlannerDay = {
        date: dateString,
        items: [],
        tasks: section === 'morning' ? text : "",
        greatDay: section === 'midday' ? text : "",
        grateful: section === 'afternoon' ? text : ""
      };
      setPlannerData([...plannerData, newDay]);
    }
  };

  const handleToggleAllTask = (id: string) => {
    setAllTasks(allTasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const handleDeleteAllTask = (id: string) => {
    setAllTasks(allTasks.filter(task => task.id !== id));
  };

  const handleEditAllTask = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string) => {
    setAllTasks(allTasks.map(task =>
      task.id === id ? {
        ...task,
        text: newText,
        startTime,
        endTime,
        color: color !== undefined ? color : task.color,
        description: description !== undefined ? description : task.description
      } : task
    ));
  };

  const handleReorderAllTasks = (reorderedTasks: PlannerItem[]) => {
    // Update order fields to persist the new order
    const tasksWithOrder = updateItemOrders(reorderedTasks);
    setAllTasks(tasksWithOrder);
    saveAllTasks(tasksWithOrder);
  };

  const handleAddAllTask = (text: string, section: PlannerItem["section"]) => {
    const newTask: PlannerItem = {
      id: Date.now().toString(),
      text,
      section: "morning",
      isCompleted: false,
      // No date field for All Tasks items
      timezone: resolvedTimezone,
    };
    setAllTasks([...allTasks, newTask]);
  };

  const handleSaveWeeklyObjective = (text: string) => {
    setGlobalTasks(text);
  };

  const handleWeeklyTaskAdd = (dayString: string) => {
    const input = weeklyNewTaskInputs[dayString] || "";
    if (!input.trim()) return;

    handleAddWeeklyTask(dayString, input);
  };

  const handleWeeklyTaskEdit = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const task = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!task) return;

    setWeeklyEditingTask(taskId);
    setWeeklyEditText(task.text);
  };

  const handleWeeklyTaskEditConfirm = (taskId: string, dayString: string) => {
    handleEditWeeklyTask(taskId, dayString, weeklyEditText);
  };

  const handleWeeklyTaskEditCancel = () => {
    setWeeklyEditingTask(null);
    setWeeklyEditText("");
  };

  const handleWeeklyEditTask = (taskId: string, dayString: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const task = plannerData[dayIndex].items.find(item => item.id === taskId);
    if (!task) return;

    setWeeklyEditDialogOpen(taskId);
    setWeeklyEditTitle(task.text);
    setWeeklyEditDescription(task.description || "");
    setWeeklyEditColor(task.color || "");
  };

  const handleWeeklyEditSave = (taskId: string, dayString: string) => {
    handleSaveWeeklyTaskDetails(taskId, dayString);
  };

  const handleWeeklyEditCancel = () => {
    setWeeklyEditDialogOpen(null);
  };

  const handleWeeklyEditTitleChange = (value: string) => {
    setWeeklyEditTitle(value);
  };

  const handleWeeklyEditDescriptionChange = (value: string) => {
    setWeeklyEditDescription(value);
  };

  const handleWeeklyEditColorChange = (value: string) => {
    setWeeklyEditColor(value);
  };

  const handleWeeklyEditStart = () => {
    setWeeklyEditingTitle(true);
  };

  const handleWeeklyEditEnd = () => {
    setWeeklyEditingTitle(false);
  };

  const handleWeeklyAddTaskClick = (dayString: string) => {
    setWeeklyAddingTask(prev => ({ ...prev, [dayString]: true }));
  };

  const handleWeeklyTaskInputChange = (dayString: string, value: string) => {
    setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: value }));
  };

  const handleWeeklyTaskInputBlur = (dayString: string) => {
    if (!weeklyNewTaskInputs[dayString]?.trim()) {
      setWeeklyAddingTask(prev => ({ ...prev, [dayString]: false }));
    }
  };

  const handleWeeklyEditTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setWeeklyEditingTitle(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, section: PlannerItem["section"]) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask(section);
    }
  };

  const handleSectionChange = (section: PlannerItem["section"], value: string) => {
    handleUpdateSectionText(section, value);
  };

  const handleSectionBlur = (section: PlannerItem["section"], value: string) => {
    handleSaveSectionText(section, value);
  };

  const handleSaveWeeklyTaskTitle = (taskId: string, dayString: string, title: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: title,
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleSaveWeeklyTaskDescription = (taskId: string, dayString: string, description: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        description
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleSaveWeeklyTaskColor = (taskId: string, dayString: string, color: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dayString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === taskId);

    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        color
      };
      setPlannerData(updatedPlannerData);
    }

    setWeeklyEditDialogOpen(null);
  };

  const handleWeeklyTaskClickOutside = () => {
    setWeeklyEditDialogOpen(null);
  };

  const handleWeeklyTaskTimeChange = (taskId: string, dayString: string, startTime?: string, endTime?: string) => {
    handleEditItem(taskId, weeklyEditTitle, startTime, endTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
  };

  const handleUpdateTaskCompletion = (taskId: string, dayString: string) => {
    handleToggleWeeklyTask(taskId, dayString);
  };

  const handleTaskResizeStart = (taskId: string, dayString: string, startTime: string, endTime: string, e: React.MouseEvent, isStart: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;

    const startY = e.clientY;
    const originalTime = isStart ? startTime : endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = Math.round(deltaY / 0.8);
      const [hour, minute] = originalTime.split(':').map(Number);
      const originalMinutes = hour * 60 + minute;
      const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

      if (isStart) {
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const endTotalMinutes = endHour * 60 + endMinute;

        if (newMinutes < endTotalMinutes - 15) {
          const newHour = Math.floor(newMinutes / 60);
          const newMinute = newMinutes % 60;
          const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

          handleEditItem(taskId, weeklyEditTitle, newStartTime, endTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
        }
      } else {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;

        if (newMinutes > startTotalMinutes + 15) {
          const newHour = Math.floor(newMinutes / 60);
          const newMinute = newMinutes % 60;
          const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

          handleEditItem(taskId, weeklyEditTitle, startTime, newEndTime, weeklyEditColor, weeklyEditDescription, undefined, dayString);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => {
        isResizingRef.current = false;
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    getTasksWithTimes,
    handleAddItem,
    handleAddWeeklyTask,
    handleEditWeeklyTask,
    handleDeleteWeeklyTask,
    handleSaveWeeklyTaskDetails,
    handleToggleWeeklyTask,
    handleReorderWeeklyTasks,
    handleToggleItem,
    handleDeleteItem,
    handleEditItem,
    handleAddTask,
    handleUpdateSectionText,
    handleSaveSectionText,
    handleToggleAllTask,
    handleDeleteAllTask,
    handleEditAllTask,
    handleReorderAllTasks,
    handleAddAllTask,
    handleSaveWeeklyObjective,
    handleWeeklyTaskAdd,
    handleWeeklyTaskEdit,
    handleWeeklyTaskEditConfirm,
    handleWeeklyTaskEditCancel,
    handleWeeklyEditTask,
    handleWeeklyEditSave,
    handleWeeklyEditCancel,
    handleWeeklyEditTitleChange,
    handleWeeklyEditDescriptionChange,
    handleWeeklyEditColorChange,
    handleWeeklyEditStart,
    handleWeeklyEditEnd,
    handleWeeklyAddTaskClick,
    handleWeeklyTaskInputChange,
    handleWeeklyTaskInputBlur,
    handleWeeklyEditTitleKeyDown,
    handleInputKeyDown,
    handleSectionChange,
    handleSectionBlur,
    handleSaveWeeklyTaskTitle,
    handleSaveWeeklyTaskDescription,
    handleSaveWeeklyTaskColor,
    handleWeeklyTaskClickOutside,
    handleWeeklyTaskTimeChange,
    handleUpdateTaskCompletion,
    handleTaskResizeStart,
  };
};
