import { useState, useEffect } from "react";
import { format, addDays, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { Copy, Trash2, Heart, AlarmClock, CalendarIcon, ChevronLeft, ChevronRight, ListChecks, ChevronRight as ChevronRightCollapse, Plus, Palette, X as XIcon, Check, GripVertical, Edit } from 'lucide-react';
import { PlannerDay, PlannerItem, GlobalPlannerData } from "@/types/planner";
import { PlannerSection } from "./PlannerSection";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

const CheckListIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-5 w-5 text-blue-500"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" className="text-blue-500" />
    <line x1="9" y1="9" x2="19" y2="9" className="text-blue-500" />
    <line x1="9" y1="15" x2="19" y2="15" className="text-blue-500" />
    <polyline points="5,9 6,10 8,7" className="text-blue-500" />
    <polyline points="5,15 6,16 8,13" className="text-blue-500" />
  </svg>
);

const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const sortTasksBySection = (items: PlannerItem[]): PlannerItem[] => {
  const sectionOrder: { [key: string]: number } = {
    'morning': 0,
    'midday': 1,
    'afternoon': 2,
    'evening': 3
  };

  return [...items].sort((a, b) => {
    // If both have order values, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one has an order, prioritize the one with order
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;

    // Fall back to section order if no manual order is set
    return (sectionOrder[a.section] ?? 999) - (sectionOrder[b.section] ?? 999);
  });
};

// Helper function to update order fields for all items in array
const updateItemOrders = (items: PlannerItem[]): PlannerItem[] => {
  return items.map((item, index) => ({
    ...item,
    order: index
  }));
};

type PlannerView = 'today' | 'week' | 'month';

export const DailyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
  const [currentView, setCurrentView] = useState<PlannerView>('today');

  const [globalTasks, setGlobalTasks] = useState<string>("");
  const [allTasks, setAllTasks] = useState<PlannerItem[]>([]);
  const [isAllTasksCollapsed, setIsAllTasksCollapsed] = useState(false);

  const [tasks, setTasks] = useState<string>("");
  const [greatDay, setGreatDay] = useState<string>("");
  const [grateful, setGrateful] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Weekly view states
  const [weeklyNewTaskInputs, setWeeklyNewTaskInputs] = useState<{[key: string]: string}>({});
  const [weeklyAddingTask, setWeeklyAddingTask] = useState<{[key: string]: boolean}>({});
  const [weeklyEditingTask, setWeeklyEditingTask] = useState<string | null>(null);
  const [weeklyEditText, setWeeklyEditText] = useState<string>("");
  const [weeklyEditDialogOpen, setWeeklyEditDialogOpen] = useState<string | null>(null);
  const [weeklyEditDescription, setWeeklyEditDescription] = useState<string>("");
  const [weeklyEditColor, setWeeklyEditColor] = useState<string>("");
  const [weeklyEditTitle, setWeeklyEditTitle] = useState<string>("");
  const [weeklyEditingTitle, setWeeklyEditingTitle] = useState<boolean>(false);

  const dateString = getDateString(selectedDate);

  const colors = [
    "#d4a373", "#deb887", "#f0dc82", "#fef3c7",
    "#e8f5e9", "#a5d6a7", "#80cbc4", "#d4f1f4",
    "#e3f2fd", "#a5b8d0", "#ce93d8", "#f3e5f5",
    "#eeeeee", "#ede8e3", "#f8bbd0", "#f5e1e5"
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("plannerData");
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }

    const savedGlobalData = localStorage.getItem("globalPlannerData");
    if (savedGlobalData) {
      const globalData: GlobalPlannerData = JSON.parse(savedGlobalData);
      setGlobalTasks(globalData.globalTasks || "");
    }

    const savedAllTasks = localStorage.getItem("allTasks");
    if (savedAllTasks) {
      setAllTasks(JSON.parse(savedAllTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);

  useEffect(() => {
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
  }, [allTasks]);
  
  useEffect(() => {
    const globalData: GlobalPlannerData = { globalTasks };
    localStorage.setItem("globalPlannerData", JSON.stringify(globalData));
  }, [globalTasks]);

  useEffect(() => {
    const currentDay = plannerData.find(day => day.date === dateString);
    if (currentDay) {
      if (currentDay.tasks) {
        setTasks(currentDay.tasks);
      } else {
        setTasks("");
      }
      
      if (currentDay.greatDay) {
        setGreatDay(currentDay.greatDay);
      } else {
        setGreatDay("");
      }
      
      if (currentDay.grateful) {
        setGrateful(currentDay.grateful);
      } else {
        setGrateful("");
      }
    } else {
      setTasks("");
      setGreatDay("");
      setGrateful("");
    }
  }, [dateString, plannerData]);

  const currentDay = plannerData.find(day => day.date === dateString) || {
    date: dateString,
    items: [],
    tasks: "",
    greatDay: "",
    grateful: ""
  };

  const getSectionItems = (section: PlannerItem["section"]) => {
    const filtered = currentDay.items.filter(item => item.section === section);
    // Sort by order if available, otherwise maintain array order
    return filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
  };

  const handleAddItem = (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text,
      section,
      isCompleted: false,
      date: dateString,
      startTime,
      endTime
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
    }
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

  const handleEditItem = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
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
        description: description !== undefined ? description : updatedPlannerData[dayIndex].items[itemIndex].description
      };
      setPlannerData(updatedPlannerData);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const copyTemplate = () => {
    if (!copyToDate) return;
    
    const fromDateString = getDateString(selectedDate);
    const toDateString = getDateString(copyToDate);
    
    console.log("Copying from:", fromDateString, "to:", toDateString);
    
    if (fromDateString === toDateString) {
      toast.error("Cannot copy to the same day");
      return;
    }
    
    const newItems = currentDay.items.map(item => ({
      ...item,
      id: Date.now() + Math.random().toString(),
      date: toDateString,
      isCompleted: false
    }));
    
    const targetDayIndex = plannerData.findIndex(day => day.date === toDateString);
    let updatedPlannerData = [...plannerData];
    
    if (targetDayIndex >= 0) {
      updatedPlannerData[targetDayIndex] = {
        ...updatedPlannerData[targetDayIndex],
        items: [...updatedPlannerData[targetDayIndex].items, ...newItems]
      };

      if (currentDay.tasks) {
        updatedPlannerData[targetDayIndex].tasks = currentDay.tasks;
      }
    } else {
      updatedPlannerData = [...updatedPlannerData, {
        date: toDateString,
        items: newItems,
        tasks: currentDay.tasks || "",
      }];
    }
    
    if (deleteAfterCopy) {
      const currentDayIndex = updatedPlannerData.findIndex(day => day.date === fromDateString);
      if (currentDayIndex >= 0) {
        updatedPlannerData.splice(currentDayIndex, 1);
        toast.success(`Template copied to ${format(copyToDate, "MMMM do, yyyy")} and deleted from current day`);
      }
    } else {
      toast.success(`Template copied to ${format(copyToDate, "MMMM do, yyyy")}`);
    }
    
    setPlannerData(updatedPlannerData);
    setIsCopyDialogOpen(false);
    setCopyToDate(undefined);
    setDeleteAfterCopy(false);
  };

  const handleDeleteAllItems = () => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    
    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData.splice(dayIndex, 1);
      setPlannerData(updatedPlannerData);
      toast.success(`All items for ${format(selectedDate, "MMMM do, yyyy")} have been deleted`);
    } else {
      toast.info("No items to delete for this day");
    }
  };

  const handleGlobalTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGlobalTasks = e.target.value;
    setGlobalTasks(newGlobalTasks);
  };

  const handleTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTasks = e.target.value;
    setTasks(newTasks);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        tasks: newTasks
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: newTasks,
        greatDay: greatDay,
        grateful: grateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const handleGreatDayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGreatDay = e.target.value;
    setGreatDay(newGreatDay);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        greatDay: newGreatDay
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: tasks,
        greatDay: newGreatDay,
        grateful: grateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const handleGratefulChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGrateful = e.target.value;
    setGrateful(newGrateful);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        grateful: newGrateful
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: tasks,
        greatDay: greatDay,
        grateful: newGrateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const hasItems = currentDay.items.length > 0;

  const daysWithItems = plannerData
    .filter(day => day.items.length > 0)
    .map(day => {
      const [year, month, day_num] = day.date.split('-').map(Number);
      return new Date(year, month - 1, day_num);
    });

  const handleAddAllTask = (text: string, section: PlannerItem["section"]) => {
    const newTask: PlannerItem = {
      id: Date.now().toString(),
      text,
      section: "morning",
      isCompleted: false,
      date: "",
    };
    setAllTasks([...allTasks, newTask]);
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

    // Add to All Tasks at specific position
    const newAllTaskItem: PlannerItem = {
      ...taskToMove,
      date: "",
      section: "morning",
    };

    const targetIndex = allTasks.findIndex(t => t.id === targetTaskId);
    const newAllTasks = [...allTasks];
    newAllTasks.splice(targetIndex, 0, newAllTaskItem);
    setAllTasks(newAllTasks);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle drag from All Tasks to planner sections
    if (source.droppableId === "allTasks" && destination.droppableId !== "allTasks") {
      const taskToMove = allTasks[source.index];
      if (!taskToMove) return;

      // Remove from All Tasks
      const newAllTasks = allTasks.filter(task => task.id !== taskToMove.id);
      setAllTasks(newAllTasks);

      // Add to planner section
      const destSection = destination.droppableId as PlannerItem["section"];
      const newItem: PlannerItem = {
        ...taskToMove,
        section: destSection,
        date: dateString,
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
      return;
    }

    // Handle drag from planner sections to All Tasks
    if (source.droppableId !== "allTasks" && destination.droppableId === "allTasks") {
      const dayIndex = plannerData.findIndex(day => day.date === dateString);
      if (dayIndex < 0) return;

      const sourceSection = source.droppableId as PlannerItem["section"];
      const sourceItems = getSectionItems(sourceSection);
      const taskToMove = sourceItems[source.index];
      if (!taskToMove) return;

      // Remove from planner
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskToMove.id)
      };
      setPlannerData(updatedPlannerData);

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: "",
        section: "morning",
      };
      setAllTasks([...allTasks, newAllTaskItem]);
      return;
    }

    // Handle drag within All Tasks
    if (source.droppableId === "allTasks" && destination.droppableId === "allTasks") {
      const reorderedTasks = Array.from(allTasks);
      const [removed] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, removed);
      setAllTasks(reorderedTasks);
      return;
    }

    const sourceSection = source.droppableId as PlannerItem["section"];
    const destSection = destination.droppableId as PlannerItem["section"];

    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const sourceItems = getSectionItems(sourceSection);
    const destItems = sourceSection === destSection
      ? sourceItems
      : getSectionItems(destSection);

    const itemToMove = sourceItems[source.index];

    if (!itemToMove) return;

    const newSourceItems = updatedPlannerData[dayIndex].items.filter(
      item => !(item.id === itemToMove.id && item.section === sourceSection)
    );

    const updatedItem = {
      ...itemToMove,
      section: destSection
    };

    const newItems = [...newSourceItems];

    const insertIndex = newItems.filter(i => i.section === destSection).length <= destination.index
      ? newItems.length
      : newItems.findIndex((item, idx) => {
          const sectionItems = newItems.filter(i => i.section === destSection);
          return item.section === destSection && idx === destination.index;
        });

    if (insertIndex >= 0) {
      newItems.splice(insertIndex, 0, updatedItem);
    } else {
      newItems.push(updatedItem);
    }

    // Update order fields to persist the new order
    const itemsWithOrder = updateItemOrders(newItems);

    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: itemsWithOrder
    };

    setPlannerData(updatedPlannerData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {/* All Tasks Section - Left Side */}
        <div
          className={`${isAllTasksCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 ${isAllTasksCollapsed ? 'bg-transparent' : 'bg-gray-100'} rounded-lg ${isAllTasksCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isAllTasksCollapsed) {
              e.currentTarget.classList.add('bg-blue-200');
            }
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-blue-200');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('bg-blue-200');

            const taskId = e.dataTransfer.getData('taskId');
            const fromDate = e.dataTransfer.getData('fromDate');

            // Only handle tasks from weekly view (tasks with a date)
            if (taskId && fromDate) {
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

              // Add to All Tasks (with empty date)
              const newAllTaskItem: PlannerItem = {
                ...taskToMove,
                date: "",
                section: "morning",
              };
              setAllTasks([...allTasks, newAllTaskItem]);
            }
          }}
        >
          <Card className={`h-full flex flex-col ${isAllTasksCollapsed ? 'border-0 shadow-none bg-transparent' : 'border-0 shadow-sm bg-white'}`}>
            <CardHeader className={`${isAllTasksCollapsed ? 'p-2 border-b bg-gray-50' : 'pb-2 bg-gray-50 border-b'} flex-shrink-0`}>
              <CardTitle className={`text-lg font-medium text-gray-800 flex ${isAllTasksCollapsed ? 'flex-col' : 'flex-row'} items-center justify-between gap-2`}>
                <div className={`flex items-center gap-2 ${isAllTasksCollapsed ? 'flex-col' : ''}`}>
                  <CheckListIcon />
                  {!isAllTasksCollapsed && <span>All Tasks</span>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
                >
                  {isAllTasksCollapsed ? (
                    <ChevronRightCollapse className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {!isAllTasksCollapsed && (
              <CardContent className="pt-4 px-1 flex-1 overflow-hidden">
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
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Planner - Right Side */}
        <div className="flex-1">
          <Card className="border-none shadow-none">
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <ListChecks className="h-5 w-5 text-amber-500" />
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setCurrentView('today')}
                    className={`text-lg transition-colors ${
                      currentView === 'today'
                        ? 'font-bold text-black'
                        : 'font-normal text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentView('week')}
                    className={`text-lg transition-colors ${
                      currentView === 'week'
                        ? 'font-bold text-black'
                        : 'font-normal text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setCurrentView('month')}
                    className={`text-lg transition-colors ${
                      currentView === 'month'
                        ? 'font-bold text-black'
                        : 'font-normal text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    This Month
                  </button>
                </div>
              </div>
            </div>

        {currentView === 'today' && (
          <>
            <CardHeader className="px-0 pt-0">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" onClick={handlePreviousDay} className="mr-2">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-medium"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      booked: daysWithItems,
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        fontWeight: "bold",
                        borderRadius: "0",
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="icon" onClick={handleNextDay} className="ml-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <TooltipProvider delayDuration={0}>
                <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!hasItems}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p>Copy Template</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Copy template to another day</DialogTitle>
                      <DialogDescription>
                        Select the date where you'd like to duplicate this day's template. This feature saves you from rewriting recurring tasks or habits.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Calendar
                        mode="single"
                        selected={copyToDate}
                        onSelect={setCopyToDate}
                        initialFocus
                      />
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <Checkbox 
                        id="delete-after-copy" 
                        checked={deleteAfterCopy}
                        onCheckedChange={(checked) => setDeleteAfterCopy(checked === true)}
                      />
                      <label
                        htmlFor="delete-after-copy"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Delete template from current day after copying
                      </label>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCopyDialogOpen(false);
                          setDeleteAfterCopy(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={copyTemplate}
                        disabled={!copyToDate}
                      >
                        Copy template
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={0}>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!hasItems}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p>Delete All</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all items for this day?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all planner items 
                        for {format(selectedDate, "MMMM do, yyyy")}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllItems}>
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          
          <div className="mb-4">
            <CardDescription>
              Schedule your tasks:
            </CardDescription>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PlannerSection
              title="Morning Routine"
              items={getSectionItems("morning")}
              section="morning"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Morning"
              items={getSectionItems("midday")}
              section="midday"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Afternoon"
              items={getSectionItems("afternoon")}
              section="afternoon"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Evening"
              items={getSectionItems("evening")}
              section="evening"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
          </div>

        </CardContent>
          </>
        )}

        {currentView === 'week' && (
          <>
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => subWeeks(prev, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">
                  {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}
                </h3>
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {eachDayOfInterval({
                  start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                  end: endOfWeek(selectedDate, { weekStartsOn: 1 })
                }).map((day, index) => {
                  const dayString = getDateString(day);
                  const dayData = plannerData.find(d => d.date === dayString);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={dayString}
                      className={`min-h-[600px] border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50/30' : 'bg-white'} transition-colors`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-100');

                        const taskId = e.dataTransfer.getData('taskId');
                        const fromDate = e.dataTransfer.getData('fromDate');
                        const toDate = dayString;

                        if (taskId && fromDate && fromDate !== toDate) {
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
                        } else if (taskId && !fromDate) {
                          // Task is coming from All Tasks (no date)
                          const taskToMove = allTasks.find(t => t.id === taskId);
                          if (!taskToMove) return;

                          // Remove from All Tasks
                          setAllTasks(allTasks.filter(t => t.id !== taskId));

                          // Add to this day
                          const toDayIndex = plannerData.findIndex(d => d.date === toDate);
                          const movedTask = { ...taskToMove, date: toDate };

                          if (toDayIndex >= 0) {
                            const updatedPlannerData = [...plannerData];
                            updatedPlannerData[toDayIndex] = {
                              ...updatedPlannerData[toDayIndex],
                              items: [...updatedPlannerData[toDayIndex].items, movedTask]
                            };
                            setPlannerData(updatedPlannerData);
                          } else {
                            // Create new day entry if it doesn't exist
                            setPlannerData([...plannerData, {
                              date: toDate,
                              items: [movedTask],
                              tasks: "",
                              greatDay: "",
                              grateful: ""
                            }]);
                          }
                        }
                      }}
                    >
                      <div className={`p-3 border-b border-gray-200 ${isToday ? 'bg-blue-100' : 'bg-gray-50'}`}>
                        <div className="text-xs text-gray-600 uppercase font-medium">
                          {format(day, "EEE")}
                        </div>
                        <div className={`text-2xl font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {format(day, "d")}
                        </div>
                      </div>
                      <div className="p-2 space-y-1 overflow-y-auto max-h-[500px]">
                        {sortTasksBySection(dayData?.items || []).map((item) => (
                          weeklyEditingTask === item.id ? (
                            <div key={item.id} className="flex items-center gap-1 p-2 bg-white border border-gray-200 rounded">
                              <Input
                                value={weeklyEditText}
                                onChange={(e) => setWeeklyEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleEditWeeklyTask(item.id, dayString, weeklyEditText);
                                  } else if (e.key === "Escape") {
                                    setWeeklyEditingTask(null);
                                    setWeeklyEditText("");
                                  }
                                }}
                                autoFocus
                                className="h-7 text-xs flex-1"
                              />
                              <button
                                onClick={() => handleEditWeeklyTask(item.id, dayString, weeklyEditText)}
                                className="text-green-600 p-1 rounded-sm hover:bg-green-100"
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('taskId', item.id);
                                e.dataTransfer.setData('fromDate', dayString);
                                e.dataTransfer.effectAllowed = 'move';
                                e.currentTarget.classList.add('opacity-50');
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-50');
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.add('border-t-4', 'border-t-blue-500');
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('border-t-4', 'border-t-blue-500');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove('border-t-4', 'border-t-blue-500');

                                const draggedTaskId = e.dataTransfer.getData('taskId');
                                const fromDate = e.dataTransfer.getData('fromDate');
                                const targetTaskId = item.id;

                                if (draggedTaskId === targetTaskId) return;

                                // Handle drop from All Tasks
                                if (!fromDate) {
                                  const taskToMove = allTasks.find(t => t.id === draggedTaskId);
                                  if (!taskToMove) return;

                                  // Remove from All Tasks
                                  setAllTasks(allTasks.filter(t => t.id !== draggedTaskId));

                                  // Find target position in this day
                                  const toDayIndex = plannerData.findIndex(d => d.date === dayString);
                                  const movedTask = { ...taskToMove, date: dayString };

                                  if (toDayIndex >= 0) {
                                    const updatedPlannerData = [...plannerData];
                                    const targetIndex = updatedPlannerData[toDayIndex].items.findIndex(i => i.id === targetTaskId);
                                    const newItems = [...updatedPlannerData[toDayIndex].items];
                                    newItems.splice(targetIndex, 0, movedTask);

                                    // Update order fields to persist the new order
                                    const itemsWithOrder = updateItemOrders(newItems);

                                    updatedPlannerData[toDayIndex] = {
                                      ...updatedPlannerData[toDayIndex],
                                      items: itemsWithOrder
                                    };
                                    setPlannerData(updatedPlannerData);
                                  } else {
                                    setPlannerData([...plannerData, {
                                      date: dayString,
                                      items: [movedTask],
                                      tasks: "",
                                      greatDay: "",
                                      grateful: ""
                                    }]);
                                  }
                                } else if (fromDate === dayString) {
                                  // Reorder within same day
                                  const toDayIndex = plannerData.findIndex(d => d.date === dayString);
                                  if (toDayIndex < 0) return;

                                  const updatedPlannerData = [...plannerData];
                                  const items = [...updatedPlannerData[toDayIndex].items];
                                  const draggedIndex = items.findIndex(i => i.id === draggedTaskId);
                                  const targetIndex = items.findIndex(i => i.id === targetTaskId);

                                  if (draggedIndex === -1 || targetIndex === -1) return;

                                  const [draggedItem] = items.splice(draggedIndex, 1);
                                  items.splice(targetIndex, 0, draggedItem);

                                  // Update order fields to persist the new order
                                  const itemsWithOrder = updateItemOrders(items);

                                  updatedPlannerData[toDayIndex] = {
                                    ...updatedPlannerData[toDayIndex],
                                    items: itemsWithOrder
                                  };
                                  setPlannerData(updatedPlannerData);
                                } else {
                                  // Move from different day
                                  const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
                                  if (fromDayIndex < 0) return;

                                  const taskToMove = plannerData[fromDayIndex].items.find(i => i.id === draggedTaskId);
                                  if (!taskToMove) return;

                                  const updatedPlannerData = [...plannerData];

                                  // Remove from source
                                  updatedPlannerData[fromDayIndex] = {
                                    ...updatedPlannerData[fromDayIndex],
                                    items: updatedPlannerData[fromDayIndex].items.filter(i => i.id !== draggedTaskId)
                                  };

                                  // Add to target position
                                  const toDayIndex = updatedPlannerData.findIndex(d => d.date === dayString);
                                  if (toDayIndex >= 0) {
                                    const targetIndex = updatedPlannerData[toDayIndex].items.findIndex(i => i.id === targetTaskId);
                                    const movedTask = { ...taskToMove, date: dayString };
                                    const newItems = [...updatedPlannerData[toDayIndex].items];
                                    newItems.splice(targetIndex, 0, movedTask);

                                    // Update order fields to persist the new order
                                    const itemsWithOrder = updateItemOrders(newItems);

                                    updatedPlannerData[toDayIndex] = {
                                      ...updatedPlannerData[toDayIndex],
                                      items: itemsWithOrder
                                    };
                                  }

                                  setPlannerData(updatedPlannerData);
                                }
                              }}
                              className="group relative text-xs p-2 pr-5 rounded border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                              style={{ backgroundColor: item.color || 'white' }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setWeeklyEditingTask(item.id);
                                setWeeklyEditText(item.text);
                              }}
                            >
                              <div className="flex items-start gap-1 flex-1 min-w-0">
                                {/* Drag handle */}
                                <div className="text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
                                  <GripVertical size={14} />
                                </div>

                                {/* Checkbox */}
                                <Checkbox
                                  checked={item.isCompleted}
                                  onCheckedChange={() => handleToggleWeeklyTask(item.id, dayString)}
                                  className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />

                                {/* Task content */}
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                                  {item.startTime && (
                                    <span className="text-gray-600 font-medium flex-shrink-0 text-[10px]">
                                      {item.startTime}
                                    </span>
                                  )}
                                  <span className={`${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'} break-words whitespace-normal`}>
                                    {item.text}
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons - always visible area on right */}
                              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWeeklyTask(item.id, dayString);
                                  }}
                                  className="p-0.5 rounded-sm text-gray-400 hover:text-red-600 hover:bg-white transition-colors z-20"
                                >
                                  <Trash2 size={10} />
                                </button>

                                <Dialog open={weeklyEditDialogOpen === item.id} onOpenChange={(open) => setWeeklyEditDialogOpen(open ? item.id : null)}>
                                  <DialogTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setWeeklyEditTitle(item.text);
                                        setWeeklyEditDescription(item.description || "");
                                        setWeeklyEditColor(item.color || "");
                                        setWeeklyEditingTitle(false);
                                        setWeeklyEditDialogOpen(item.id);
                                      }}
                                      className="p-0.5 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-white transition-colors z-20"
                                      title="Edit task details"
                                    >
                                      <Edit size={10} />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[400px]">
                                    <DialogHeader>
                                      <DialogTitle className="text-base">Edit Task Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 py-3">
                                      {/* Title */}
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-medium">Title</label>
                                        {weeklyEditingTitle ? (
                                          <Input
                                            value={weeklyEditTitle}
                                            onChange={(e) => setWeeklyEditTitle(e.target.value)}
                                            onBlur={() => setWeeklyEditingTitle(false)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                setWeeklyEditingTitle(false);
                                              }
                                            }}
                                            autoFocus
                                            className="text-sm"
                                          />
                                        ) : (
                                          <div
                                            className="p-2 rounded border border-gray-200 text-sm cursor-pointer hover:border-gray-400 transition-colors"
                                            style={{ backgroundColor: weeklyEditColor || 'white' }}
                                            onDoubleClick={() => setWeeklyEditingTitle(true)}
                                            title="Double-click to edit"
                                          >
                                            {weeklyEditTitle}
                                          </div>
                                        )}
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="text-xs font-medium">Description</label>
                                        <Textarea
                                          value={weeklyEditDescription}
                                          onChange={(e) => setWeeklyEditDescription(e.target.value)}
                                          placeholder="Add a description..."
                                          className="min-h-[80px] text-sm"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="text-xs font-medium">Color</label>
                                        <div className="grid grid-cols-8 gap-1">
                                          {colors.map((color) => (
                                            <button
                                              key={color}
                                              onClick={() => setWeeklyEditColor(color)}
                                              className={`w-8 h-8 rounded border transition-colors ${
                                                weeklyEditColor === color ? 'border-gray-800 border-2' : 'border-gray-300 hover:border-gray-500'
                                              }`}
                                              style={{ backgroundColor: color }}
                                              title={color}
                                            />
                                          ))}
                                        </div>
                                        <button
                                          onClick={() => setWeeklyEditColor("")}
                                          className="w-full py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 mt-1"
                                        >
                                          <XIcon size={10} />
                                          Remove color
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setWeeklyEditDialogOpen(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button size="sm" onClick={() => handleSaveWeeklyTaskDetails(item.id, dayString)}>
                                        Save
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )
                        ))}
                        {/* Add task input */}
                        {weeklyAddingTask[dayString] ? (
                          <div className="mt-2">
                            <Input
                              value={weeklyNewTaskInputs[dayString] || ""}
                              onChange={(e) => setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddWeeklyTask(dayString, weeklyNewTaskInputs[dayString] || "");
                                } else if (e.key === "Escape") {
                                  setWeeklyAddingTask(prev => ({ ...prev, [dayString]: false }));
                                  setWeeklyNewTaskInputs(prev => ({ ...prev, [dayString]: "" }));
                                }
                              }}
                              placeholder="Add task..."
                              autoFocus
                              className="h-8 text-xs"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setWeeklyAddingTask(prev => ({ ...prev, [dayString]: true }))}
                            className="w-full mt-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded flex items-center justify-center transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </>
        )}

        {currentView === 'month' && (
          <CardContent className="px-0 py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Monthly View</p>
              <p className="text-sm">This feature is coming soon! You'll be able to see your tasks across the entire month.</p>
            </div>
          </CardContent>
        )}
          </Card>
        </div>
      </div>
    </DragDropContext>
  );
};
