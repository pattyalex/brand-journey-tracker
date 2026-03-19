import { EVENTS, emit } from "@/lib/events";
import { PlannerDay, PlannerItem } from "@/types/planner";

interface UsePlannerDialogsArgs {
  plannerData: PlannerDay[];
  allTasks: PlannerItem[];
  contentCalendarData: any[];
  dateString: string;
  dialogTaskTitle: string;
  dialogTaskDescription: string;
  dialogStartTime: string;
  dialogEndTime: string;
  dialogTaskColor: string;
  dialogAddToContentCalendar: boolean;
  editingTask: PlannerItem | null;
  pendingTaskFromAllTasks: PlannerItem | null;
  convert24To12Hour: (time: string) => string;
  convert12To24Hour: (time: string) => string;
  titleInputRef: React.RefObject<HTMLInputElement>;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerDay[]>>;
  setAllTasks: React.Dispatch<React.SetStateAction<PlannerItem[]>>;
  setContentCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
  setIsTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingTask: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  setDialogTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogAddToContentCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingTaskFromAllTasks: React.Dispatch<React.SetStateAction<PlannerItem | null>>;
  savePlannerData: (data: PlannerDay[]) => void;
  saveAllTasks: (tasks: PlannerItem[]) => void;
  saveScheduledContent: (data: any[]) => void;
  handleEditItem: (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string, isCompleted?: boolean, taskDate?: string, isContentCalendar?: boolean) => void;
}

export const usePlannerDialogs = ({
  plannerData,
  allTasks,
  contentCalendarData,
  dateString,
  dialogTaskTitle,
  dialogTaskDescription,
  dialogStartTime,
  dialogEndTime,
  dialogTaskColor,
  dialogAddToContentCalendar,
  editingTask,
  pendingTaskFromAllTasks,
  convert24To12Hour,
  convert12To24Hour,
  titleInputRef,
  setPlannerData,
  setAllTasks,
  setContentCalendarData,
  setIsTaskDialogOpen,
  setEditingTask,
  setDialogTaskTitle,
  setDialogTaskDescription,
  setDialogStartTime,
  setDialogEndTime,
  setDialogTaskColor,
  setDialogAddToContentCalendar,
  setPendingTaskFromAllTasks,
  savePlannerData,
  saveAllTasks,
  saveScheduledContent,
  handleEditItem,
}: UsePlannerDialogsArgs) => {

  const handleOpenTaskDialog = (hour: number, itemToEdit?: PlannerItem, startTime?: string, endTime?: string) => {
    if (itemToEdit) {
      setEditingTask(itemToEdit);
      setDialogTaskTitle(itemToEdit.text);
      setDialogTaskDescription(itemToEdit.description || "");
      setDialogStartTime(itemToEdit.startTime ? convert24To12Hour(itemToEdit.startTime) : "");
      setDialogEndTime(itemToEdit.endTime ? convert24To12Hour(itemToEdit.endTime) : "");
      setDialogTaskColor(itemToEdit.color || "");
      setDialogAddToContentCalendar(itemToEdit.isContentCalendar || false);
    } else {
      setEditingTask(null);
      setDialogTaskTitle("");
      setDialogTaskDescription("");

      // If start/end time provided, use those (e.g. from drag)
      if (startTime && endTime) {
        setDialogStartTime(convert24To12Hour(startTime));
        setDialogEndTime(convert24To12Hour(endTime));
      } else {
        // Default behavior: 1 hour duration starting at clicked hour
        const startTimeDefault = `${hour.toString().padStart(2, '0')}:00`;
        const endTimeDefault = `${(hour + 1).toString().padStart(2, '0')}:00`;
        setDialogStartTime(convert24To12Hour(startTimeDefault));
        setDialogEndTime(convert24To12Hour(endTimeDefault));
      }

      setDialogTaskColor("");
      setDialogAddToContentCalendar(false);
    }

    setIsTaskDialogOpen(true);

    // Focus title input after dialog opens
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  const handleSaveTaskDialog = () => {
    // Convert dialog times from 12-hour to 24-hour format
    const startTime24 = dialogStartTime ? convert12To24Hour(dialogStartTime) : undefined;
    const endTime24 = dialogEndTime ? convert12To24Hour(dialogEndTime) : undefined;

    // Check if this is a task being added from AllTasks sidebar
    const isFromAllTasks = pendingTaskFromAllTasks !== null;

    if (editingTask && editingTask.id && !isFromAllTasks) {
      // Editing existing task (only when NOT from AllTasks)
      handleEditItem(
        editingTask.id,
        dialogTaskTitle,
        startTime24,
        endTime24,
        dialogTaskColor,
        dialogTaskDescription,
        editingTask.isCompleted,
        editingTask.date,
        dialogAddToContentCalendar
      );
    } else {
      // Adding new task (or adding task from AllTasks)
      const newItem: PlannerItem = {
        id: isFromAllTasks ? editingTask?.id || Date.now().toString() : Date.now().toString(),
        text: dialogTaskTitle,
        section: "morning",
        isCompleted: false,
        date: editingTask?.date || dateString,
        startTime: startTime24,
        endTime: endTime24,
        color: dialogTaskColor,
        description: dialogTaskDescription,
        isContentCalendar: dialogAddToContentCalendar
      };

      const dayIndex = plannerData.findIndex(day => day.date === newItem.date);

      if (dayIndex >= 0) {
        const updatedPlannerData = [...plannerData];
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newItem]
        };
        setPlannerData(updatedPlannerData);
        savePlannerData(updatedPlannerData);
      } else {
        const updatedPlannerData = [...plannerData, {
          date: newItem.date,
          items: [newItem],
          tasks: "",
          greatDay: "",
          grateful: ""
        }];
        setPlannerData(updatedPlannerData);
        savePlannerData(updatedPlannerData);
      }

      // Clear the pending task from AllTasks since it's now added
      if (isFromAllTasks) {
        setPendingTaskFromAllTasks(null);
      }
    }

    // Close dialog
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setDialogTaskTitle("");
    setDialogTaskDescription("");
    setDialogStartTime("");
    setDialogEndTime("");
    setDialogTaskColor("");
    setDialogAddToContentCalendar(false);
  };

  const handleCancelTaskDialog = () => {
    setIsTaskDialogOpen(false);

    // If there was a pending task from All Tasks, restore it
    if (pendingTaskFromAllTasks) {
      setAllTasks(prev => [...prev, pendingTaskFromAllTasks]);
      saveAllTasks([...allTasks, pendingTaskFromAllTasks]);
      setPendingTaskFromAllTasks(null);
    }

    // Clear dialog states
    setEditingTask(null);
    setDialogTaskTitle("");
    setDialogTaskDescription("");
    setDialogStartTime("");
    setDialogEndTime("");
    setDialogTaskColor("");
    setDialogAddToContentCalendar(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelTaskDialog();
    }
  };

  const handleWeeklyTaskClick = (task: PlannerItem) => {
    setEditingTask(task);
    setDialogTaskTitle(task.text);
    setDialogTaskDescription(task.description || "");
    setDialogStartTime(task.startTime ? convert24To12Hour(task.startTime) : "");
    setDialogEndTime(task.endTime ? convert24To12Hour(task.endTime) : "");
    setDialogTaskColor(task.color || "");
    setDialogAddToContentCalendar(task.isContentCalendar || false);
    setIsTaskDialogOpen(true);
  };

  const handleCalendarTaskClick = (task: PlannerItem) => {
    setEditingTask(task);
    setDialogTaskTitle(task.text);
    setDialogTaskDescription(task.description || "");
    setDialogStartTime(task.startTime ? convert24To12Hour(task.startTime) : "");
    setDialogEndTime(task.endTime ? convert24To12Hour(task.endTime) : "");
    setDialogTaskColor(task.color || "");
    setDialogAddToContentCalendar(task.isContentCalendar || false);
    setIsTaskDialogOpen(true);
  };

  const handleContentCalendarTaskClick = (item: any) => {
    setDialogTaskTitle(item.title);
    setDialogTaskDescription(item.description || "");
    setDialogStartTime(item.startTime || "");
    setDialogEndTime(item.endTime || "");
    setDialogTaskColor(item.color || "");
    setDialogAddToContentCalendar(true);
    setEditingTask(item);
    setIsTaskDialogOpen(true);
  };

  const handleRemoveContentCalendarItem = (id: string) => {
    const updatedContentData = contentCalendarData.filter(item => item.id !== id);
    setContentCalendarData(updatedContentData);
    saveScheduledContent(updatedContentData);
    emit(window, EVENTS.scheduledContentUpdated, updatedContentData);
  };

  const handleMoveContentCalendarItem = (itemId: string, toDate: string) => {
    const updatedContentData = contentCalendarData.map(item => {
      if (item.id === itemId) {
        return { ...item, date: toDate };
      }
      return item;
    });

    setContentCalendarData(updatedContentData);
    saveScheduledContent(updatedContentData);
    emit(window, EVENTS.scheduledContentUpdated, updatedContentData);
  };

  const handleAddWeeklyTaskAtTime = (dayString: string, hour: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setEditingTask({
      id: '',
      date: dayString,
      text: '',
      section: 'morning',
      isCompleted: false,
      order: 0
    } as PlannerItem);

    setDialogTaskTitle('');
    setDialogTaskDescription('');
    setDialogStartTime(convert24To12Hour(startTime));
    setDialogEndTime(convert24To12Hour(endTime));
    setDialogTaskColor('');
    setDialogAddToContentCalendar(false);
    setIsTaskDialogOpen(true);
  };

  return {
    handleOpenTaskDialog,
    handleSaveTaskDialog,
    handleCancelTaskDialog,
    handleDialogOpenChange,
    handleWeeklyTaskClick,
    handleCalendarTaskClick,
    handleContentCalendarTaskClick,
    handleRemoveContentCalendarItem,
    handleMoveContentCalendarItem,
    handleAddWeeklyTaskAtTime,
  };
};
