import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, getDay } from "date-fns";
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

type PlannerView = 'today' | 'week' | 'month' | 'day' | 'calendar';

export const DailyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
  const [currentView, setCurrentView] = useState<PlannerView>('today');
  const [calendarFilterMode, setCalendarFilterMode] = useState<'all' | 'content'>('all');
  const [todayScrollPosition, setTodayScrollPosition] = useState(() => {
    // Default to 7am (7 hours * 90px per hour = 630px)
    const DEFAULT_SCROLL = 630;

    const savedDate = localStorage.getItem('plannerLastAccessDate');
    const today = format(new Date(), 'yyyy-MM-dd');

    // If it's a new day, reset to 7am
    if (savedDate !== today) {
      localStorage.setItem('plannerLastAccessDate', today);
      return DEFAULT_SCROLL;
    }

    // Otherwise, try to restore saved position
    const savedPosition = localStorage.getItem('todayScrollPosition');
    return savedPosition ? parseInt(savedPosition, 10) : DEFAULT_SCROLL;
  });
  const todayScrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const [globalTasks, setGlobalTasks] = useState<string>("");
  const [allTasks, setAllTasks] = useState<PlannerItem[]>([
    {
      id: 'placeholder-1',
      text: 'Edit photos for upcoming post',
      section: 'morning',
      isCompleted: false,
      date: '',
      order: 0
    },
    {
      id: 'placeholder-2',
      text: 'Respond to comments and DMs',
      section: 'morning',
      isCompleted: false,
      date: '',
      order: 1
    },
    {
      id: 'placeholder-3',
      text: 'Plan next week\'s content calendar',
      section: 'morning',
      isCompleted: false,
      date: '',
      order: 2
    }
  ]);
  const [isAllTasksCollapsed, setIsAllTasksCollapsed] = useState(false);
  const [showContentCalendar, setShowContentCalendar] = useState(false);
  const [contentCalendarData, setContentCalendarData] = useState<any[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerItem | null>(null);
  const [dialogTaskTitle, setDialogTaskTitle] = useState("");
  const [dialogTaskDescription, setDialogTaskDescription] = useState("");
  const [dialogStartTime, setDialogStartTime] = useState("");
  const [dialogEndTime, setDialogEndTime] = useState("");
  const [dialogTaskColor, setDialogTaskColor] = useState("");
  const [dialogAddToContentCalendar, setDialogAddToContentCalendar] = useState(false);
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
  const [draggedWeeklyTaskId, setDraggedWeeklyTaskId] = useState<string | null>(null);
  const [dragOverWeeklyTaskId, setDragOverWeeklyTaskId] = useState<string | null>(null);
  const [weeklyDropIndicatorPosition, setWeeklyDropIndicatorPosition] = useState<'before' | 'after' | null>(null);
  const [weeklyEditDialogOpen, setWeeklyEditDialogOpen] = useState<string | null>(null);
  const [weeklyEditDescription, setWeeklyEditDescription] = useState<string>("");
  const [weeklyEditColor, setWeeklyEditColor] = useState<string>("");
  const [weeklyEditTitle, setWeeklyEditTitle] = useState<string>("");
  const [weeklyEditingTitle, setWeeklyEditingTitle] = useState<boolean>(false);
  const [isDraggingOverAllTasks, setIsDraggingOverAllTasks] = useState(false);
  const [draggingTaskText, setDraggingTaskText] = useState<string>("");

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

    // Load Content Calendar data
    const savedScheduledContent = localStorage.getItem("scheduledContent");
    if (savedScheduledContent) {
      try {
        const parsed = JSON.parse(savedScheduledContent);
        setContentCalendarData(parsed);
      } catch (error) {
        console.error('Failed to parse scheduledContent:', error);
      }
    }

  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);

  useEffect(() => {
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
  }, [allTasks]);

  useEffect(() => {
    localStorage.setItem("scheduledContent", JSON.stringify(contentCalendarData));
  }, [contentCalendarData]);

  // Save scroll position to localStorage
  useEffect(() => {
    localStorage.setItem('todayScrollPosition', todayScrollPosition.toString());
  }, [todayScrollPosition]);

  // Restore scroll position when switching to Today view
  useEffect(() => {
    if (currentView === 'today' && todayScrollRef.current) {
      // Use requestAnimationFrame to set scroll position before next paint
      requestAnimationFrame(() => {
        const viewport = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');

        if (viewport) {
          // Restore scroll position immediately
          viewport.scrollTop = todayScrollPosition;

          // Add scroll listener to save position
          const handleScroll = () => {
            setTodayScrollPosition(viewport.scrollTop);
          };

          viewport.addEventListener('scroll', handleScroll);
        }
      });

      return () => {
        const viewport = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.removeEventListener('scroll', () => {});
        }
      };
    }
  }, [currentView]);

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
      if (e.key === 'scheduledContent' && e.newValue) {
        try {
          setContentCalendarData(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse scheduledContent:', error);
        }
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomUpdate = (e: CustomEvent) => {
      console.log('DailyPlanner: Received allTasksUpdated event', e.detail);
      setAllTasks(e.detail);
    };

    const handleContentCalendarUpdate = (e: CustomEvent) => {
      console.log('DailyPlanner: Received scheduledContentUpdated event', e.detail);
      setContentCalendarData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('allTasksUpdated', handleCustomUpdate as EventListener);
    window.addEventListener('scheduledContentUpdated', handleContentCalendarUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('allTasksUpdated', handleCustomUpdate as EventListener);
      window.removeEventListener('scheduledContentUpdated', handleContentCalendarUpdate as EventListener);
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
    localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
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
        isContentCalendar: isContentCalendar !== undefined ? isContentCalendar : updatedPlannerData[dayIndex].items[itemIndex].isContentCalendar
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
      setDialogAddToContentCalendar(task.isContentCalendar || false);
    } else {
      // Creating new task
      setEditingTask(null);
      setDialogTaskTitle("");
      setDialogTaskDescription("");
      setDialogStartTime("");
      setDialogEndTime("");
      setDialogTaskColor("");
      setDialogAddToContentCalendar(false);
    }
    setIsTaskDialogOpen(true);
  };

  const handleSaveTaskDialog = () => {
    if (!dialogTaskTitle.trim()) return;

    if (editingTask && editingTask.id) {
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
          isCompleted: false,
          isContentCalendar: dialogAddToContentCalendar,
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
          undefined, // Keep existing isCompleted state
          taskDate, // Pass the task's date so we search in the correct day
          dialogAddToContentCalendar
        );
      }
    } else {
      // Create new task
      const targetDate = editingTask?.date || dateString; // Use the date from editingTask if available (for weekly view)
      const newTask: PlannerItem = {
        id: Date.now().toString(),
        text: dialogTaskTitle.trim(),
        section: "morning",
        isCompleted: false,
        isContentCalendar: dialogAddToContentCalendar,
        date: targetDate,
        startTime: dialogStartTime,
        endTime: dialogEndTime,
        color: dialogTaskColor,
        description: dialogTaskDescription,
      };

      const dayIndex = plannerData.findIndex(day => day.date === targetDate);
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

  const formatTimeInput = (value: string): string => {
    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Auto-format as user types
    if (digitsOnly.length === 0) {
      return '';
    } else if (digitsOnly.length <= 2) {
      return digitsOnly;
    } else if (digitsOnly.length <= 4) {
      return digitsOnly.slice(0, 2) + ':' + digitsOnly.slice(2);
    } else {
      return digitsOnly.slice(0, 2) + ':' + digitsOnly.slice(2, 4);
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If user clears the field, set empty
    if (value === '') {
      setDialogStartTime('');
      return;
    }

    const formatted = formatTimeInput(value);
    setDialogStartTime(formatted);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If user clears the field, set empty
    if (value === '') {
      setDialogEndTime('');
      return;
    }

    const formatted = formatTimeInput(value);
    setDialogEndTime(formatted);
  };

  const handleStartTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dialogStartTime) {
      e.target.placeholder = '__:__';
    }
  };

  const handleEndTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dialogEndTime) {
      e.target.placeholder = '__:__';
    }
  };

  const handleStartTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = 'Start time';
  };

  const handleEndTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = 'End time';
  };

  const handleTitleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent text selection on focus - move cursor to end
    setTimeout(() => {
      const length = e.target.value.length;
      e.target.setSelectionRange(length, length);
    }, 0);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startTimeInputRef.current?.focus();
    }
  };

  const handleStartTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      endTimeInputRef.current?.focus();
    }
  };

  const handleEndTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      descriptionInputRef.current?.focus();
    }
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
    { name: 'Light Gray', value: '#F3F4F6' },
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
      // No date field for All Tasks items
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
    localStorage.setItem('allTasks', JSON.stringify(tasksWithOrder));
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
    localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));

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
    localStorage.setItem('allTasks', JSON.stringify(newAllTasks));
  };

  return (
    <div>
      <div className="flex gap-4">
        {/* All Tasks Section - Left Side - Visible in Today, Day, This Week, and Calendar views */}
        {(currentView === 'today' || currentView === 'week' || currentView === 'day' || currentView === 'calendar') && (
        <div
          className={`${isAllTasksCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 ${isAllTasksCollapsed ? 'p-2' : 'p-5'} transition-all duration-300 shadow-sm`}
          onDragEnter={(e) => {
            console.log('👉 DRAG ENTER ALL TASKS');
            e.preventDefault();
            setIsDraggingOverAllTasks(true);
          }}
          onDragOver={(e) => {
            console.log('⬆️ DRAG OVER ALL TASKS');
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            // Only hide if we're leaving the container, not entering a child
            if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDraggingOverAllTasks(false);
            }
          }}
          onDrop={(e) => {
            console.log('💥 DROP EVENT FIRED ON ALL TASKS!');
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOverAllTasks(false);

            const taskId = e.dataTransfer.getData('taskId');
            const fromDate = e.dataTransfer.getData('fromDate');
            const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

            console.log('📦 Data received - taskId:', taskId, 'fromDate:', fromDate, 'fromAllTasks:', fromAllTasks);

            if (!taskId) {
              console.log('❌ No taskId');
              return;
            }

            // If dragging from All Tasks, ignore (already here)
            if (fromAllTasks === 'true' || !fromDate) {
              console.log('❌ Already in All Tasks or no fromDate');
              return;
            }

            // Task is from calendar, move it to All Tasks
            console.log('✅ Moving task from calendar to All Tasks...');
            const fromDayIndex = plannerData.findIndex(d => d.date === fromDate);
            if (fromDayIndex < 0) {
              console.log('❌ Day not found:', fromDate);
              return;
            }

            const taskToMove = plannerData[fromDayIndex].items.find(item => item.id === taskId);
            if (!taskToMove) {
              console.log('❌ Task not found:', taskId);
              return;
            }

            console.log('📋 Found task:', taskToMove.text);

            const updatedPlannerData = [...plannerData];
            updatedPlannerData[fromDayIndex] = {
              ...updatedPlannerData[fromDayIndex],
              items: updatedPlannerData[fromDayIndex].items.filter(item => item.id !== taskId)
            };
            setPlannerData(updatedPlannerData);
            localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));

            const newAllTaskItem: PlannerItem = {
              ...taskToMove,
              date: undefined, // Completely remove date to prevent any past-date styling
              section: "morning",
              startTime: undefined,
              endTime: undefined,
              color: "", // Clear color when moving to All Tasks
            };
            const updatedAllTasks = [...allTasks, newAllTaskItem];
            setAllTasks(updatedAllTasks);
            localStorage.setItem('allTasks', JSON.stringify(updatedAllTasks));

            console.log('✅✅✅ TASK MOVED TO ALL TASKS SUCCESSFULLY! ✅✅✅');
          }}
        >
          {isAllTasksCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
            >
              <ChevronRightCollapse className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          ) : (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-purple-600">
                  All Tasks
                </h2>
                <button
                  onClick={() => setIsAllTasksCollapsed(!isAllTasksCollapsed)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
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
              </div>
            </div>
          )}
        </div>
        )}


        {/* Main Planner - Right Side */}
        <div className="flex-1">
          <Card className="border-none shadow-none bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 rounded-xl p-6">
            {/* Header with Tabs and Date Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {/* Left: View Tabs */}
                <div className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  <button
                    onClick={() => setCurrentView('today')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'today'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentView('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'week'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setCurrentView('calendar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'calendar'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Calendar
                  </button>
                </div>

                {/* Right: Date Navigation */}
                <div className="flex items-center gap-3">
                  {currentView === 'today' ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={handlePreviousDay} className="h-9 w-9">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
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

                      <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-9 w-9">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  ) : currentView === 'week' ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => subWeeks(prev, 1))} className="h-9 w-9">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-gray-800">
                        {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addWeeks(prev, 1))} className="h-9 w-9">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addMonths(prev, -1))} className="h-9 w-9">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-gray-800">
                        {format(selectedDate, "MMMM yyyy")}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addMonths(prev, 1))} className="h-9 w-9">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

        {currentView === 'today' && (
          <>
        <CardContent className="px-4">
          <div ref={todayScrollRef}>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="relative" style={{ height: '2160px' }}> {/* 24 hours * 90px */}
                {/* Hour labels and grid lines */}
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const timeLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'am' : 'pm'}`;

                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0"
                      style={{ top: `${hour * 90}px`, height: '90px' }}
                    >
                      {/* Hour row container */}
                      <div className="flex gap-2 h-full border-t border-gray-200 bg-white">
                        {/* Time label */}
                        <div className="w-14 flex-shrink-0 py-3 pl-2 text-sm text-gray-500 font-medium">
                          {timeLabel}
                        </div>

                        {/* 20-minute slots (3 slots per hour) */}
                        <div className="flex-1 flex flex-col">
                          {[0, 20, 40].map((minute, idx) => {
                            return (
                              <div
                                key={`${hour}-${minute}`}
                                className="flex-1 cursor-pointer hover:bg-blue-50 transition-colors relative group/slot"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget || e.currentTarget.contains(e.target as Node)) {
                                    handleOpenTaskDialog(hour);
                                  }
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('bg-blue-100');
                                }}
                                onDragLeave={(e) => {
                                  e.currentTarget.classList.remove('bg-blue-100');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.currentTarget.classList.remove('bg-blue-100');

                                  const taskId = e.dataTransfer.getData('taskId');
                                  const fromAllTasks = e.dataTransfer.getData('fromAllTasks');

                                  console.log('=== DROP EVENT ===');
                                  console.log('TaskId:', taskId);
                                  console.log('FromAllTasks:', fromAllTasks);
                                  console.log('Hour:', hour, 'Minute:', minute);
                                  console.log('All Tasks:', allTasks);

                                  if (!taskId) {
                                    console.log('❌ No taskId found, aborting');
                                    return;
                                  }

                                  // Calculate new time based on drop position
                                  const hourStr = hour.toString().padStart(2, '0');
                                  const minuteStr = minute.toString().padStart(2, '0');

                                  if (fromAllTasks === 'true') {
                                    console.log('✅ Handling drop from All Tasks');

                                    // Task is from All Tasks
                                    const taskFromAllTasks = allTasks.find(t => t.id === taskId);
                                    console.log('Found task:', taskFromAllTasks);

                                    if (!taskFromAllTasks) {
                                      console.log('❌ Task not found in allTasks');
                                      return;
                                    }

                                    // Default duration of 20 minutes for tasks from All Tasks
                                    const endMinute = minute + 20;
                                    const endHourStr = endMinute >= 60 ? (hour + 1).toString().padStart(2, '0') : hourStr;
                                    const endMinuteStr = (endMinute % 60).toString().padStart(2, '0');

                                    const newStartTime = `${hourStr}:${minuteStr}`;
                                    const newEndTime = `${endHourStr}:${endMinuteStr}`;

                                    console.log('New times:', newStartTime, '-', newEndTime);

                                    // Add to calendar with time
                                    const newTask: PlannerItem = {
                                      ...taskFromAllTasks,
                                      date: dateString,
                                      startTime: newStartTime,
                                      endTime: newEndTime,
                                      section: "morning"
                                    };

                                    console.log('New task object:', newTask);

                                    const dayIndex = plannerData.findIndex(day => day.date === dateString);
                                    console.log('Day index:', dayIndex);

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

                                    console.log('Updating planner data...');
                                    setPlannerData(updatedPlannerData);
                                    localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));

                                    console.log('Removing from All Tasks...');
                                    // Remove from All Tasks AFTER adding to calendar
                                    const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                                    setAllTasks(filteredAllTasks);
                                    localStorage.setItem('allTasks', JSON.stringify(filteredAllTasks));
                                    console.log('New All Tasks count:', filteredAllTasks.length);

                                    console.log('✅ Drop complete!');
                                  } else {
                                    // Task is already in calendar, just moving it
                                    const dayIndex = plannerData.findIndex(day => day.date === dateString);
                                    if (dayIndex < 0) return;

                                    const taskToMove = currentDay.items.find(item => item.id === taskId);
                                    if (!taskToMove) return;

                                    // Calculate duration to maintain it
                                    const [oldStartHour, oldStartMinute] = taskToMove.startTime!.split(':').map(Number);
                                    const [oldEndHour, oldEndMinute] = taskToMove.endTime!.split(':').map(Number);
                                    const durationMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);

                                    // Calculate new end time
                                    const newStartMinutes = hour * 60 + minute;
                                    const newEndMinutes = newStartMinutes + durationMinutes;
                                    const newEndHour = Math.floor(newEndMinutes / 60);
                                    const newEndMinute = newEndMinutes % 60;

                                    const newStartTime = `${hourStr}:${minuteStr}`;
                                    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                                    // Update the task with new times
                                    handleEditItem(taskId, taskToMove.text, newStartTime, newEndTime, taskToMove.color, taskToMove.description, taskToMove.isCompleted);
                                  }
                                }}
                              >
                                {/* Plus icon hint on hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-30 transition-opacity pointer-events-none">
                                  <Plus size={20} className="text-gray-400" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Time labels are handled by hour labels only */}

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

                      const top = startTotalMinutes * 1.5; // 1.5px per minute (90px per hour)
                      const height = Math.max(durationMinutes * 1.5, 28); // Minimum 28px to fit content

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            console.log('🚀 DRAG START FROM TODAY:', { id: task.id, date: task.date, text: task.text });
                            e.dataTransfer.setData('taskId', task.id);
                            e.dataTransfer.setData('fromDate', task.date || dateString);
                            e.dataTransfer.setData('fromAllTasks', 'false');
                            e.dataTransfer.effectAllowed = 'move';
                            console.log('✅ Drag data set - taskId:', task.id, 'fromDate:', task.date || dateString);
                            e.currentTarget.style.opacity = '0.5';
                          }}
                          onDragEnd={(e) => {
                            console.log('🏁 DRAG END FROM TODAY');
                            e.currentTarget.style.opacity = '1';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTaskDialog(startHour, task);
                          }}
                          className="group absolute left-0 right-0 rounded px-2 py-1 border-l-4 hover:shadow-sm transition-all cursor-move overflow-hidden"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
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
          </div>
        </CardContent>
          </>
        )}

        {currentView === 'week' && (
          <>
            <CardContent className="px-0">
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {eachDayOfInterval({
                  start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                  end: endOfWeek(selectedDate, { weekStartsOn: 1 })
                }).map((day, index) => {
                  const dayString = getDateString(day);
                  const dayData = plannerData.find(d => d.date === dayString);
                  const isToday = isSameDay(day, new Date());
                  const isPast = day < new Date() && !isToday;

                  const dayColor = isToday ? 'bg-white' : 'bg-white';

                  return (
                    <div
                      key={dayString}
                      className={`min-h-[600px] border-r border-gray-200 last:border-r-0 ${dayColor} transition-colors`}
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

                        console.log('🎯 DROP ON DAY CONTAINER - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

                        if (taskId && fromDate && fromDate !== toDate) {
                          console.log('✅ Moving task between days');
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
                          localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
                        } else if (taskId && !fromDate) {
                          // Task is coming from All Tasks (no date)
                          const taskToMove = allTasks.find(t => t.id === taskId);
                          if (!taskToMove) return;

                          // Store the original task in case user cancels
                          setPendingTaskFromAllTasks(taskToMove);

                          // Remove from All Tasks
                          const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                          setAllTasks(filteredAllTasks);
                          localStorage.setItem('allTasks', JSON.stringify(filteredAllTasks));

                          // Open dialog to edit task details before adding to day
                          setEditingTask({ ...taskToMove, date: toDate } as PlannerItem);
                          setDialogTaskTitle(taskToMove.text);
                          setDialogTaskDescription(taskToMove.description || "");
                          setDialogStartTime(taskToMove.startTime || "");
                          setDialogEndTime(taskToMove.endTime || "");
                          setDialogTaskColor(taskToMove.color || "");
                          setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
                          setIsTaskDialogOpen(true);
                        }
                      }}
                    >
                      <div className={`py-2 px-3 border-b border-b-gray-200 ${isToday ? 'bg-purple-50' : 'bg-gray-50'}`} style={{ opacity: isPast ? 0.5 : 1 }}>
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          {format(day, "EEE")}
                        </div>
                        <div className={`text-lg font-semibold ${isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                          {format(day, "d")}
                        </div>
                      </div>
                      <div className="p-2 space-y-1 overflow-y-auto max-h-[500px]">
                        {sortTasksBySection(dayData?.items || []).map((item, taskIndex) => (
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
                            <div key={item.id} className="relative">
                              {/* Drop indicator */}
                              {dragOverWeeklyTaskId === item.id && weeklyDropIndicatorPosition === 'before' && (
                                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10"></div>
                              )}

                              <div
                                draggable={true}
                                onDragStart={(e) => {
                                  console.log('🚀 DRAG START - Weekly Task:', item.id, item.text, 'from:', dayString);
                                  setDraggedWeeklyTaskId(item.id);
                                  e.dataTransfer.setData('text/plain', item.id);
                                  e.dataTransfer.setData('taskId', item.id);
                                  e.dataTransfer.setData('fromDate', dayString);
                                  e.dataTransfer.setData('fromAllTasks', 'false');
                                  e.dataTransfer.setData('isWeeklyReorder', 'true');
                                  e.dataTransfer.effectAllowed = 'move';

                                // Create a custom drag image showing the full task
                                const taskElement = e.currentTarget as HTMLElement;
                                if (taskElement) {
                                  // Clone the element to use as drag image
                                  const dragImage = taskElement.cloneNode(true) as HTMLElement;
                                  dragImage.style.position = 'absolute';
                                  dragImage.style.top = '-1000px';
                                  dragImage.style.opacity = '0.8';
                                  dragImage.style.pointerEvents = 'none';
                                  document.body.appendChild(dragImage);

                                  // Set the custom drag image
                                  e.dataTransfer.setDragImage(dragImage, 0, 0);

                                  // Remove the temporary element after a brief delay
                                  setTimeout(() => {
                                    document.body.removeChild(dragImage);
                                  }, 0);

                                  // Make original semi-transparent
                                  setTimeout(() => {
                                    taskElement.style.opacity = '0.5';
                                  }, 0);
                                }
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const isWeeklyReorder = e.dataTransfer.types.includes('isweeklyreorder');
                                const fromDate = e.dataTransfer.types.includes('fromdate');

                                // Only handle reordering if dragging within same day column
                                if (isWeeklyReorder && draggedWeeklyTaskId && draggedWeeklyTaskId !== item.id) {
                                  // Calculate if we should show indicator before or after
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const midpoint = rect.top + rect.height / 2;
                                  const position = e.clientY < midpoint ? 'before' : 'after';

                                  setDragOverWeeklyTaskId(item.id);
                                  setWeeklyDropIndicatorPosition(position);
                                }
                              }}
                              onDragLeave={(e) => {
                                // Only clear if leaving the task element itself
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  setDragOverWeeklyTaskId(null);
                                  setWeeklyDropIndicatorPosition(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const isWeeklyReorder = e.dataTransfer.getData('isWeeklyReorder');

                                if (isWeeklyReorder && draggedWeeklyTaskId && draggedWeeklyTaskId !== item.id && weeklyDropIndicatorPosition) {
                                  handleReorderWeeklyTasks(dayString, draggedWeeklyTaskId, item.id, weeklyDropIndicatorPosition);
                                }

                                setDraggedWeeklyTaskId(null);
                                setDragOverWeeklyTaskId(null);
                                setWeeklyDropIndicatorPosition(null);
                              }}
                              onDragEnd={(e) => {
                                console.log('✅ DRAG END - Weekly Task');
                                e.currentTarget.style.opacity = isPast ? '0.5' : '1';
                                setDraggedWeeklyTaskId(null);
                                setDragOverWeeklyTaskId(null);
                                setWeeklyDropIndicatorPosition(null);
                              }}
                              onClick={(e) => {
                                // Open edit dialog on click
                                setEditingTask(item);
                                setDialogTaskTitle(item.text);
                                setDialogTaskDescription(item.description || "");
                                setDialogStartTime(item.startTime || "");
                                setDialogEndTime(item.endTime || "");
                                setDialogTaskColor(item.color || "");
                                setDialogAddToContentCalendar(item.isContentCalendar || false);
                                setIsTaskDialogOpen(true);
                              }}
                              className="group relative text-xs p-2 pr-5 rounded border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                              style={{
                                backgroundColor: item.color || 'white',
                                opacity: isPast ? 0.5 : 1
                              }}
                            >
                              <div className="flex items-start gap-1 flex-1 min-w-0">

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
                                      {item.startTime}{item.endTime && ` - ${item.endTime}`}
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
                              </div>
                            </div>

                            {/* Drop indicator after */}
                            {dragOverWeeklyTaskId === item.id && weeklyDropIndicatorPosition === 'after' && (
                              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10"></div>
                            )}
                          </div>
                          )
                        ))}
                        {/* Add task button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('➕ PLUS BUTTON CLICKED for day:', dayString);
                            // Open the same dialog as the Today view
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
                            setDialogStartTime('');
                            setDialogEndTime('');
                            setDialogTaskColor('');
                            setDialogAddToContentCalendar(false);
                            setIsTaskDialogOpen(true);
                            console.log('✅ Dialog should be open now');
                          }}
                          className="w-full mt-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded flex items-center justify-center transition-colors"
                          style={{ opacity: isPast ? 0.5 : 1 }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </>
        )}

        {currentView === 'calendar' && (
          <>
            {/* Calendar Filter Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setCalendarFilterMode('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    calendarFilterMode === 'all'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Tasks
                </button>
                <button
                  onClick={() => setCalendarFilterMode('content')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    calendarFilterMode === 'content'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Content Calendar
                </button>
              </div>
            </div>

            {/* Month Calendar Grid */}
            <CardContent className="px-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
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

                      // Filter tasks based on mode
                      let tasksToShow = dayData?.items || [];
                      if (calendarFilterMode === 'content') {
                        // Filter to show only content-related tasks
                        tasksToShow = tasksToShow.filter(task =>
                          task.description?.toLowerCase().includes('content') ||
                          task.description?.toLowerCase().includes('post') ||
                          task.description?.toLowerCase().includes('video') ||
                          task.description?.toLowerCase().includes('photo') ||
                          task.text.toLowerCase().includes('content') ||
                          task.text.toLowerCase().includes('post') ||
                          task.text.toLowerCase().includes('video') ||
                          task.text.toLowerCase().includes('photo') ||
                          task.text.toLowerCase().includes('film') ||
                          task.text.toLowerCase().includes('edit') ||
                          task.text.toLowerCase().includes('schedule')
                        );
                      }

                      return (
                        <div
                          key={dayString}
                          className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-all hover:bg-gray-50 cursor-pointer ${
                            !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                          }`}
                          onClick={() => {
                            setSelectedDate(day);
                            setCurrentView('today');
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
                            e.stopPropagation();
                            e.currentTarget.classList.remove('bg-blue-50');

                            const taskId = e.dataTransfer.getData('taskId');
                            const fromDate = e.dataTransfer.getData('fromDate');
                            const toDate = dayString;

                            console.log('📅 CALENDAR VIEW DROP - taskId:', taskId, 'fromDate:', fromDate, 'toDate:', toDate);

                            if (taskId && !fromDate) {
                              // Task is coming from All Tasks (no date)
                              const taskToMove = allTasks.find(t => t.id === taskId);
                              if (!taskToMove) return;

                              // Store the original task in case user cancels
                              setPendingTaskFromAllTasks(taskToMove);

                              // Remove from All Tasks
                              const filteredAllTasks = allTasks.filter(t => t.id !== taskId);
                              setAllTasks(filteredAllTasks);
                              localStorage.setItem('allTasks', JSON.stringify(filteredAllTasks));

                              // Open dialog to edit task details before adding to day
                              setEditingTask({ ...taskToMove, date: toDate } as PlannerItem);
                              setDialogTaskTitle(taskToMove.text);
                              setDialogTaskDescription(taskToMove.description || "");
                              setDialogStartTime(taskToMove.startTime || "");
                              setDialogEndTime(taskToMove.endTime || "");
                              setDialogTaskColor(taskToMove.color || "");
                              setDialogAddToContentCalendar(taskToMove.isContentCalendar || false);
                              setIsTaskDialogOpen(true);
                            } else if (taskId && fromDate && fromDate !== toDate) {
                              // Handle regular task move between days
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
                              localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
                              toast.success('Task moved successfully');
                            }
                          }}
                        >
                          <div className={`text-sm font-semibold mb-2 ${
                            isToday ? 'text-purple-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {format(day, 'd')}
                          </div>

                          {/* Task indicators */}
                          <div className="space-y-1">
                            {tasksToShow.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                draggable={true}
                                onDragStart={(e) => {
                                  console.log('🚀 DRAG START - Calendar Task:', task.id, task.text, 'from:', dayString);
                                  e.stopPropagation();
                                  e.dataTransfer.setData('text/plain', task.id);
                                  e.dataTransfer.setData('taskId', task.id);
                                  e.dataTransfer.setData('fromDate', dayString);
                                  e.dataTransfer.setData('fromAllTasks', 'false');
                                  e.dataTransfer.effectAllowed = 'move';
                                  setTimeout(() => {
                                    e.currentTarget.style.opacity = '0.5';
                                  }, 0);
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                className="text-xs p-1 rounded truncate border border-gray-200 hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
                                style={{ backgroundColor: task.color || '#f3f4f6' }}
                                title={task.text}
                              >
                                <span className={task.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}>
                                  {task.text}
                                </span>
                              </div>
                            ))}
                            {tasksToShow.length > 3 && (
                              <div className="text-xs text-gray-500 pl-1">
                                +{tasksToShow.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </CardContent>
          </>
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
                    let displayItems: any[] = [];
                    if (showContentCalendar) {
                      // Show only content calendar items for this date
                      const contentForDay = contentCalendarData.filter(content => {
                        if (!content.date) return false;
                        const contentDateString = getDateString(new Date(content.date));
                        return contentDateString === dayString;
                      });
                      displayItems = contentForDay;
                    } else {
                      // Show regular tasks
                      displayItems = dayData?.items || [];
                    }

                    const tasks = displayItems;

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

                              const updatedContentData = contentCalendarData.map(item => {
                                if (item.id === itemId) {
                                  return { ...item, date: toDate };
                                }
                                return item;
                              });

                              setContentCalendarData(updatedContentData);
                              localStorage.setItem('scheduledContent', JSON.stringify(updatedContentData));

                              // Dispatch custom event for same-tab updates
                              const event = new CustomEvent('scheduledContentUpdated', { detail: updatedContentData });
                              window.dispatchEvent(event);

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
                              localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));
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
                                className="text-xs p-1 rounded truncate cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                                style={{ backgroundColor: displayColor }}
                                title={displayText}
                              >
                                <div className="flex items-center gap-1">
                                  {isContentItem && item.format && (
                                    <span className="text-[10px] font-semibold text-blue-600">{item.format}</span>
                                  )}
                                  {!isContentItem && item.startTime && (
                                    <span className="text-[10px] font-medium">{item.startTime}{item.endTime && ` - ${item.endTime}`}</span>
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
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancelTaskDialog();
        }
      }}>
        <DialogContent
          className="sm:max-w-[500px] p-0 gap-0 bg-white"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5">
            {/* Task Title */}
            <div>
              <Input
                ref={titleInputRef}
                placeholder="Add title"
                value={dialogTaskTitle}
                onChange={(e) => setDialogTaskTitle(e.target.value)}
                onFocus={handleTitleFocus}
                onKeyDown={handleTitleKeyDown}
                autoFocus={false}
                className="text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-400"
              />
            </div>

            {/* Time inputs */}
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <Input
                  ref={startTimeInputRef}
                  type="text"
                  value={dialogStartTime}
                  onChange={handleStartTimeChange}
                  onFocus={handleStartTimeFocus}
                  onBlur={handleStartTimeBlur}
                  onKeyDown={handleStartTimeKeyDown}
                  placeholder="Start time"
                  className="flex-1 h-9 text-sm"
                  maxLength={5}
                />
                <span className="text-gray-400">—</span>
                <Input
                  ref={endTimeInputRef}
                  type="text"
                  value={dialogEndTime}
                  onChange={handleEndTimeChange}
                  onFocus={handleEndTimeFocus}
                  onBlur={handleEndTimeBlur}
                  onKeyDown={handleEndTimeKeyDown}
                  placeholder="End time"
                  className="flex-1 h-9 text-sm"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <Edit size={18} className="text-gray-500 flex-shrink-0 mt-2" />
              <Textarea
                ref={descriptionInputRef}
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
                    className={`w-8 h-8 rounded-full border transition-all ${
                      dialogTaskColor === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 border-gray-300'
                        : 'hover:scale-105 border-gray-200'
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
                id="add-to-content-calendar"
                checked={dialogAddToContentCalendar}
                onCheckedChange={(checked) => setDialogAddToContentCalendar(checked as boolean)}
                className="h-5 w-5"
              />
              <label
                htmlFor="add-to-content-calendar"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Include in content calendar
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
