import { useState, useEffect } from "react";
import { format, addDays, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { Copy, Trash2, Heart, AlarmClock, CalendarIcon, ChevronLeft, ChevronRight, ListChecks, ChevronRight as ChevronRightCollapse, Plus, Palette, X as XIcon, Check, GripVertical, Edit, Clock } from 'lucide-react';
import { PlannerDay, PlannerItem, GlobalPlannerData } from "@/types/planner";
import { PlannerSection } from "./PlannerSection";
import { PlannerCheckItem } from "./PlannerCheckItem";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd';

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

type PlannerView = 'today' | 'week' | 'month' | 'day';

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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerItem | null>(null);
  const [dialogTaskTitle, setDialogTaskTitle] = useState("");
  const [dialogTaskDescription, setDialogTaskDescription] = useState("");
  const [dialogStartTime, setDialogStartTime] = useState("");
  const [dialogEndTime, setDialogEndTime] = useState("");
  const [dialogTaskColor, setDialogTaskColor] = useState("");
  const [dialogTaskCompleted, setDialogTaskCompleted] = useState(false);
  const [pendingTaskFromAllTasks, setPendingTaskFromAllTasks] = useState<PlannerItem | null>(null);

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

    // Load All Tasks
    const savedAllTasks = localStorage.getItem("allTasks");
    console.log('DailyPlanner: Loading allTasks from localStorage', savedAllTasks);
    if (savedAllTasks) {
      const parsed = JSON.parse(savedAllTasks);
      console.log('DailyPlanner: Parsed allTasks', parsed);
      setAllTasks(parsed);
    }

  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);

  useEffect(() => {
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
  }, [allTasks]);

  // Listen for changes to allTasks from other pages (e.g., HomePage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'allTasks' && e.newValue) {
        try {
          setAllTasks(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse allTasks:', error);
        }
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomUpdate = (e: CustomEvent) => {
      console.log('DailyPlanner: Received allTasksUpdated event', e.detail);
      setAllTasks(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('allTasksUpdated', handleCustomUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('allTasksUpdated', handleCustomUpdate as EventListener);
    };
  }, []);


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

  const handleEditItem = (id: string, newText: string, startTime?: string, endTime?: string, color?: string, description?: string, isCompleted?: boolean) => {
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
        description: description !== undefined ? description : updatedPlannerData[dayIndex].items[itemIndex].description,
        isCompleted: isCompleted !== undefined ? isCompleted : updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
      localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
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

  const handleOpenTaskDialog = (hour: number, task?: PlannerItem) => {
    if (task) {
      // Editing existing task
      setEditingTask(task);
      setDialogTaskTitle(task.text);
      setDialogTaskDescription(task.description || "");
      setDialogStartTime(task.startTime || "");
      setDialogEndTime(task.endTime || "");
      setDialogTaskColor(task.color || "");
      setDialogTaskCompleted(task.isCompleted || false);
    } else {
      // Creating new task
      setEditingTask(null);
      setDialogTaskTitle("");
      setDialogTaskDescription("");
      const hourStr = hour.toString().padStart(2, '0');
      setDialogStartTime(`${hourStr}:00`);
      setDialogEndTime(`${hourStr}:30`);
      setDialogTaskColor("");
      setDialogTaskCompleted(false);
    }
    setIsTaskDialogOpen(true);
  };

  const handleSaveTaskDialog = () => {
    if (!dialogTaskTitle.trim()) return;

    if (editingTask) {
      // Check if this is a task being moved from All Tasks (has date but not in plannerData yet)
      const taskDate = editingTask.date;
      const isInPlannerData = plannerData.some(day =>
        day.date === taskDate && day.items.some(item => item.id === editingTask.id)
      );

      if (!isInPlannerData && taskDate) {
        // This is a task from All Tasks being added to a specific day
        const newTask: PlannerItem = {
          ...editingTask,
          text: dialogTaskTitle.trim(),
          section: "morning",
          isCompleted: dialogTaskCompleted,
          date: taskDate,
          startTime: dialogStartTime,
          endTime: dialogEndTime,
          color: dialogTaskColor,
          description: dialogTaskDescription,
        };

        const dayIndex = plannerData.findIndex(day => day.date === taskDate);
        const updatedPlannerData = [...plannerData];

        if (dayIndex >= 0) {
          updatedPlannerData[dayIndex] = {
            ...updatedPlannerData[dayIndex],
            items: [...updatedPlannerData[dayIndex].items, newTask]
          };
        } else {
          updatedPlannerData.push({
            date: taskDate,
            items: [newTask],
            tasks: "",
            greatDay: "",
            grateful: ""
          });
        }

        setPlannerData(updatedPlannerData);
        localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
      } else {
        // Update existing task in planner
        handleEditItem(
          editingTask.id,
          dialogTaskTitle.trim(),
          dialogStartTime,
          dialogEndTime,
          dialogTaskColor,
          dialogTaskDescription,
          dialogTaskCompleted
        );
      }
    } else {
      // Create new task
      const newTask: PlannerItem = {
        id: Date.now().toString(),
        text: dialogTaskTitle.trim(),
        section: "morning",
        isCompleted: dialogTaskCompleted,
        date: dateString,
        startTime: dialogStartTime,
        endTime: dialogEndTime,
        color: dialogTaskColor,
        description: dialogTaskDescription,
      };

      const dayIndex = plannerData.findIndex(day => day.date === dateString);
      const updatedPlannerData = [...plannerData];

      if (dayIndex >= 0) {
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newTask]
        };
      } else {
        updatedPlannerData.push({
          date: dateString,
          items: [newTask],
          tasks: tasks,
          greatDay: greatDay,
          grateful: grateful
        });
      }

      setPlannerData(updatedPlannerData);
      localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
    }

    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setPendingTaskFromAllTasks(null);
  };

  const handleCancelTaskDialog = () => {
    // If there's a pending task from All Tasks, restore it
    if (pendingTaskFromAllTasks) {
      setAllTasks([...allTasks, pendingTaskFromAllTasks]);
      setPendingTaskFromAllTasks(null);
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  const colorOptions = [
    { name: 'Red', value: '#FEE2E2' },
    { name: 'Orange', value: '#FFEDD5' },
    { name: 'Yellow', value: '#FEF3C7' },
    { name: 'Green', value: '#D1FAE5' },
    { name: 'Blue', value: '#DBEAFE' },
    { name: 'Indigo', value: '#E0E7FF' },
    { name: 'Purple', value: '#EDE9FE' },
    { name: 'Pink', value: '#FCE7F3' },
  ];

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

  // Weekly Objectives handlers

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

    // Extract hour from droppableId (e.g., "hour-8" -> 8)
    const getHourFromDroppableId = (id: string): number | null => {
      if (id.startsWith('hour-')) {
        return parseInt(id.split('-')[1]);
      }
      return null;
    };

    const sourceHour = getHourFromDroppableId(source.droppableId);
    const destHour = getHourFromDroppableId(destination.droppableId);

    // Handle drag from All Tasks to hour slot
    if (source.droppableId === "allTasks" && destHour !== null) {
      const taskToMove = allTasks[source.index];
      if (!taskToMove) return;

      // Remove from All Tasks
      const newAllTasks = allTasks.filter(task => task.id !== taskToMove.id);
      setAllTasks(newAllTasks);
      localStorage.setItem('allTasks', JSON.stringify(newAllTasks));

      // Add to planner with time set to destination hour
      const hourStr = destHour.toString().padStart(2, '0');
      const newItem: PlannerItem = {
        ...taskToMove,
        section: "morning",
        date: dateString,
        startTime: `${hourStr}:00`,
        endTime: `${hourStr}:30`,
      };

      const dayIndex = plannerData.findIndex(day => day.date === dateString);

      if (dayIndex >= 0) {
        const updatedPlannerData = [...plannerData];
        updatedPlannerData[dayIndex] = {
          ...updatedPlannerData[dayIndex],
          items: [...updatedPlannerData[dayIndex].items, newItem]
        };
        setPlannerData(updatedPlannerData);
        localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
      } else {
        const newPlannerData = [...plannerData, {
          date: dateString,
          items: [newItem],
          tasks: tasks,
          greatDay: greatDay,
          grateful: grateful
        }];
        setPlannerData(newPlannerData);
        localStorage.setItem('plannerData', JSON.stringify(newPlannerData));
      }
      return;
    }

    // Handle drag from hour slot to All Tasks
    if (sourceHour !== null && destination.droppableId === "allTasks") {
      const dayIndex = plannerData.findIndex(day => day.date === dateString);
      if (dayIndex < 0) return;

      const sourceHourTasks = currentDay.items.filter(item => {
        if (item.startTime) {
          const taskHour = parseInt(item.startTime.split(':')[0]);
          return taskHour === sourceHour;
        }
        return false;
      });

      const taskToMove = sourceHourTasks[source.index];
      if (!taskToMove) return;

      // Remove from planner
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: updatedPlannerData[dayIndex].items.filter(item => item.id !== taskToMove.id)
      };
      setPlannerData(updatedPlannerData);
      localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));

      // Add to All Tasks
      const newAllTaskItem: PlannerItem = {
        ...taskToMove,
        date: "",
        section: "morning",
        startTime: undefined,
        endTime: undefined,
      };
      const newAllTasks = [...allTasks, newAllTaskItem];
      setAllTasks(newAllTasks);
      localStorage.setItem('allTasks', JSON.stringify(newAllTasks));
      return;
    }

    // Handle drag between hour slots
    if (sourceHour !== null && destHour !== null) {
      const dayIndex = plannerData.findIndex(day => day.date === dateString);
      if (dayIndex < 0) return;

      const sourceHourTasks = currentDay.items.filter(item => {
        if (item.startTime) {
          const taskHour = parseInt(item.startTime.split(':')[0]);
          return taskHour === sourceHour;
        }
        return false;
      });

      const taskToMove = sourceHourTasks[source.index];
      if (!taskToMove) return;

      // Update the task's time to match the destination hour
      const destHourStr = destHour.toString().padStart(2, '0');
      const updatedTask = {
        ...taskToMove,
        startTime: `${destHourStr}:${taskToMove.startTime?.split(':')[1] || '00'}`,
        endTime: taskToMove.endTime ? `${destHourStr}:${taskToMove.endTime.split(':')[1]}` : undefined,
      };

      // Remove old task and add updated task
      const updatedPlannerData = [...plannerData];
      const otherItems = updatedPlannerData[dayIndex].items.filter(item => item.id !== taskToMove.id);
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...otherItems, updatedTask]
      };

      setPlannerData(updatedPlannerData);
      localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
      return;
    }

    // Handle old section-based drag logic for backward compatibility
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
        {/* All Tasks Section - Left Side - Visible in Today, Day, and This Week views */}
        {(currentView === 'today' || currentView === 'week' || currentView === 'day') && (
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
        )}


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
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="relative" style={{ height: '1440px' }}> {/* 24 hours * 60px */}
                {/* Hour labels and grid lines */}
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const timeLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'am' : 'pm'}`;

                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 flex gap-2 border-t border-gray-200"
                      style={{ top: `${hour * 60}px`, height: '60px' }}
                    >
                      {/* Time label */}
                      <div className="w-14 flex-shrink-0 py-2 pl-2 text-xs text-gray-500 font-medium">
                        {timeLabel}
                      </div>

                      {/* Clickable area for adding tasks */}
                      <div
                        className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            const hourStr = hour.toString().padStart(2, '0');
                            setDialogStartTime(`${hourStr}:00`);
                            setDialogEndTime(`${hourStr}:30`);
                            handleOpenTaskDialog(hour);
                          }
                        }}
                      />
                    </div>
                  );
                })}

                {/* Render task time labels on the left */}
                <div className="absolute top-0 left-0 w-14">
                  {currentDay.items
                    .filter(item => item.startTime && item.endTime)
                    .map((task) => {
                      const [startHour, startMinute] = task.startTime!.split(':').map(Number);
                      const startTotalMinutes = startHour * 60 + startMinute;

                      // Only show time label if it's not at the hour mark (to avoid duplication with hour labels)
                      if (startMinute === 0) return null;

                      return (
                        <div
                          key={`time-${task.id}`}
                          className="absolute right-1 text-[9px] text-gray-400 font-normal"
                          style={{
                            top: `${startTotalMinutes}px`,
                            zIndex: 5,
                          }}
                        >
                          {task.startTime}
                        </div>
                      );
                    })}
                </div>

                {/* Render all tasks with absolute positioning */}
                <div className="absolute top-0 left-[72px] right-2"> {/* 72px = 56px (w-14) + 16px (gap-2 * 2) */}
                  {currentDay.items
                    .filter(item => item.startTime && item.endTime)
                    .map((task) => {
                      // Calculate position and height
                      const [startHour, startMinute] = task.startTime!.split(':').map(Number);
                      const [endHour, endMinute] = task.endTime!.split(':').map(Number);

                      const startTotalMinutes = startHour * 60 + startMinute;
                      const endTotalMinutes = endHour * 60 + endMinute;
                      const durationMinutes = endTotalMinutes - startTotalMinutes;

                      const top = startTotalMinutes; // 1 minute = 1px
                      const height = Math.max(durationMinutes, 36); // Minimum 36px for content

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTaskDialog(startHour, task);
                          }}
                          className="group absolute left-0 right-0 rounded px-2 py-1 border-l-4 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
                          style={{
                            top: `${top}px`,
                            minHeight: `${height}px`,
                            backgroundColor: task.color ? `${task.color}40` : '#f9fafb',
                            borderLeftColor: task.color || '#d1d5db',
                            zIndex: 10,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={task.isCompleted}
                              onCheckedChange={(checked) => {
                                handleToggleItem(task.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {task.text}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
          </ScrollArea>
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

                          // Store the original task in case user cancels
                          setPendingTaskFromAllTasks(taskToMove);

                          // Remove from All Tasks
                          setAllTasks(allTasks.filter(t => t.id !== taskId));

                          // Open dialog to edit task details before adding to day
                          setEditingTask({ ...taskToMove, date: toDate } as PlannerItem);
                          setDialogTaskTitle(taskToMove.text);
                          setDialogTaskDescription(taskToMove.description || "");
                          setDialogStartTime(taskToMove.startTime || "09:00");
                          setDialogEndTime(taskToMove.endTime || "09:30");
                          setDialogTaskColor(taskToMove.color || "");
                          setDialogTaskCompleted(taskToMove.isCompleted || false);
                          setIsTaskDialogOpen(true);
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

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancelTaskDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5">
            {/* Task Title */}
            <div>
              <Input
                placeholder="Add title"
                value={dialogTaskTitle}
                onChange={(e) => setDialogTaskTitle(e.target.value)}
                className="text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-400"
              />
            </div>

            {/* Time inputs */}
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={dialogStartTime}
                  onChange={(e) => setDialogStartTime(e.target.value)}
                  className="flex-1 h-9 text-sm"
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="time"
                  value={dialogEndTime}
                  onChange={(e) => setDialogEndTime(e.target.value)}
                  className="flex-1 h-9 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <Edit size={18} className="text-gray-500 flex-shrink-0 mt-2" />
              <Textarea
                placeholder="Add description"
                value={dialogTaskDescription}
                onChange={(e) => setDialogTaskDescription(e.target.value)}
                rows={3}
                className="flex-1 resize-none text-sm"
              />
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-3">
              <Palette size={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setDialogTaskColor(color.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      dialogTaskColor === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <button
                  onClick={() => setDialogTaskColor('')}
                  className={`w-8 h-8 rounded-full border-2 border-gray-300 transition-all flex items-center justify-center bg-white ${
                    dialogTaskColor === ''
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title="No color"
                >
                  <XIcon size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Completed Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="task-completed"
                checked={dialogTaskCompleted}
                onCheckedChange={(checked) => setDialogTaskCompleted(checked as boolean)}
                className="h-5 w-5"
              />
              <label
                htmlFor="task-completed"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Mark as completed
              </label>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 flex-row justify-end gap-2 sm:space-x-0">
            <Button variant="ghost" onClick={handleCancelTaskDialog} className="px-4">
              Cancel
            </Button>
            <Button onClick={handleSaveTaskDialog} className="px-6 bg-blue-600 hover:bg-blue-700">
              {editingTask ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      {currentView === 'day' && (
        <button
          onClick={() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const hourStr = currentHour.toString().padStart(2, '0');
            const minuteStr = currentMinute.toString().padStart(2, '0');
            setDialogStartTime(`${hourStr}:${minuteStr}`);
            setDialogEndTime(`${hourStr}:${(currentMinute + 30).toString().padStart(2, '0')}`);
            handleOpenTaskDialog(currentHour);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          title="Add new task"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}
    </DragDropContext>
  );
};
