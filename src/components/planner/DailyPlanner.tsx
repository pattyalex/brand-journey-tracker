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
  const isResizingRef = useRef(false);

  // State for drag-to-create task (Today view)
  const [isDraggingCreate, setIsDraggingCreate] = useState(false);
  const [dragCreateStart, setDragCreateStart] = useState<{ hour: number; minute: number } | null>(null);
  const [dragCreateEnd, setDragCreateEnd] = useState<{ hour: number; minute: number } | null>(null);

  // Per-day drag-to-create state (Weekly view)
  const [weeklyDraggingCreate, setWeeklyDraggingCreate] = useState<{[dayString: string]: boolean}>({});
  const [weeklyDragCreateStart, setWeeklyDragCreateStart] = useState<{[dayString: string]: {hour: number, minute: number}}>({});
  const [weeklyDragCreateEnd, setWeeklyDragCreateEnd] = useState<{[dayString: string]: {hour: number, minute: number}}>({});

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

  // Handle global mouse events for drag-to-create
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingCreate && dragCreateStart) {
        // Calculate which time slot we're over based on mouse position
        const scrollArea = todayScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const calendarElement = todayScrollRef.current?.querySelector('.relative');
        if (calendarElement && scrollArea) {
          const rect = calendarElement.getBoundingClientRect();
          const scrollTop = scrollArea.scrollTop || 0;
          const relativeY = e.clientY - rect.top + scrollTop;

          // Each hour is 90px, each 20-minute slot is 30px
          const totalMinutes = Math.floor((relativeY / 90) * 60);
          const hour = Math.floor(totalMinutes / 60);
          const minute = Math.floor((totalMinutes % 60) / 20) * 20; // Round to nearest 20-min slot

          if (hour >= 0 && hour < 24) {
            setDragCreateEnd({ hour, minute });
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingCreate) {
        // User released mouse - finalize the drag or cancel
        if (dragCreateStart && dragCreateEnd) {
          // Calculate times and open dialog
          const startMinutes = dragCreateStart.hour * 60 + dragCreateStart.minute;
          const endMinutes = dragCreateEnd.hour * 60 + dragCreateEnd.minute;

          const actualStart = Math.min(startMinutes, endMinutes);
          const actualEnd = Math.max(startMinutes, endMinutes + 20);

          const startHour = Math.floor(actualStart / 60);
          const startMin = actualStart % 60;
          const endHour = Math.floor(actualEnd / 60);
          const endMin = actualEnd % 60;

          const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

          // Reset drag state first
          setIsDraggingCreate(false);
          setDragCreateStart(null);
          setDragCreateEnd(null);

          // Open dialog
          handleOpenTaskDialog(startHour, undefined, startTimeStr, endTimeStr);
        } else {
          // Cancel the drag
          setIsDraggingCreate(false);
          setDragCreateStart(null);
          setDragCreateEnd(null);
        }
      }
    };

    if (isDraggingCreate) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingCreate, dragCreateStart, dragCreateEnd]);

  // Handle global mouse events for weekly drag-to-create
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Find which day column is being dragged in
      const dayColumns = document.querySelectorAll('[data-day-column]');
      let targetDay: string | null = null;
      let targetColumn: Element | null = null;

      dayColumns.forEach(col => {
        const rect = col.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          targetDay = col.getAttribute('data-day-column');
          targetColumn = col;
        }
      });

      if (targetDay && targetColumn && weeklyDraggingCreate[targetDay]) {
        const timelineElement = targetColumn.querySelector('[data-timeline]');
        if (timelineElement) {
          const rect = timelineElement.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const totalMinutes = Math.floor(relativeY / 0.8);
          const hour = Math.floor(totalMinutes / 60);
          const minute = totalMinutes % 60;

          if (hour >= 0 && hour < 24) {
            setWeeklyDragCreateEnd(prev => ({
              ...prev,
              [targetDay!]: { hour, minute }
            }));
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      // Check if any day is being dragged
      Object.keys(weeklyDraggingCreate).forEach(dayString => {
        if (weeklyDraggingCreate[dayString]) {
          const start = weeklyDragCreateStart[dayString];
          const end = weeklyDragCreateEnd[dayString];

          if (start && end) {
            // Calculate times
            const startMinutes = start.hour * 60 + start.minute;
            const endMinutes = end.hour * 60 + end.minute;
            const actualStart = Math.min(startMinutes, endMinutes);
            const actualEnd = Math.max(startMinutes, endMinutes);

            // Ensure minimum duration of 30 minutes
            const duration = actualEnd - actualStart;
            const finalEnd = duration < 30 ? actualStart + 30 : actualEnd;

            const startHour = Math.floor(actualStart / 60);
            const startMin = actualStart % 60;
            const endHour = Math.floor(finalEnd / 60);
            const endMin = finalEnd % 60;

            const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
            const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

            // Reset drag state
            setWeeklyDraggingCreate(prev => ({ ...prev, [dayString]: false }));
            setWeeklyDragCreateStart(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
            setWeeklyDragCreateEnd(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });

            // Open dialog with pre-filled times
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
            setDialogStartTime(startTimeStr);
            setDialogEndTime(endTimeStr);
            setDialogTaskColor('');
            setDialogAddToContentCalendar(false);
            setIsTaskDialogOpen(true);
          } else {
            // Cancel the drag
            setWeeklyDraggingCreate(prev => ({ ...prev, [dayString]: false }));
            setWeeklyDragCreateStart(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
            setWeeklyDragCreateEnd(prev => {
              const newState = { ...prev };
              delete newState[dayString];
              return newState;
            });
          }
        }
      });
    };

    const isDragging = Object.values(weeklyDraggingCreate).some(val => val);
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [weeklyDraggingCreate, weeklyDragCreateStart, weeklyDragCreateEnd]);

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

  const handleOpenTaskDialog = (hour: number, task?: PlannerItem, startTime?: string, endTime?: string) => {
    if (task) {
      // Editing existing task - convert times to 12-hour format for display
      setEditingTask(task);
      setDialogTaskTitle(task.text);
      setDialogTaskDescription(task.description || "");
      setDialogStartTime(task.startTime ? convert24To12Hour(task.startTime) : "");
      setDialogEndTime(task.endTime ? convert24To12Hour(task.endTime) : "");
      setDialogTaskColor(task.color || "");
      setDialogAddToContentCalendar(task.isContentCalendar || false);
    } else {
      // Creating new task - convert times to 12-hour format for display
      setEditingTask(null);
      setDialogTaskTitle("");
      setDialogTaskDescription("");
      setDialogStartTime(startTime ? convert24To12Hour(startTime) : "");
      setDialogEndTime(endTime ? convert24To12Hour(endTime) : "");
      setDialogTaskColor("");
      setDialogAddToContentCalendar(false);
    }
    setIsTaskDialogOpen(true);
  };

  const handleSaveTaskDialog = () => {
    if (!dialogTaskTitle.trim()) return;

    // Convert times from 12-hour format to 24-hour format for storage
    const startTime24 = dialogStartTime ? convert12To24Hour(dialogStartTime) : '';
    const endTime24 = dialogEndTime ? convert12To24Hour(dialogEndTime) : '';

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
          startTime: startTime24,
          endTime: endTime24,
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
          startTime24,
          endTime24,
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
        startTime: startTime24,
        endTime: endTime24,
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

  // Convert 24-hour format (HH:MM) to 12-hour format (h:mm am/pm)
  const convert24To12Hour = (time24: string): string => {
    if (!time24 || !time24.includes(':')) return '';
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMin = minute.toString().padStart(2, '0');

    return `${displayHour}:${displayMin} ${period}`;
  };

  // Convert 12-hour format (h:mm am/pm) to 24-hour format (HH:MM)
  const convert12To24Hour = (time12: string): string => {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return '';

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3].toLowerCase();

    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  const formatTimeInput = (value: string): string => {
    // Remove any extra spaces and lowercase
    value = value.trim().toLowerCase();

    // If the value contains 'a' or 'p', treat as 12-hour input
    const hasAmPm = /[ap]/.test(value);

    // Extract digits
    const digitsOnly = value.replace(/\D/g, '');

    // Auto-format as user types
    if (digitsOnly.length === 0) {
      return '';
    } else if (digitsOnly.length <= 2) {
      const hours = parseInt(digitsOnly, 10);
      if (hours > 12) return '12:';
      return digitsOnly;
    } else if (digitsOnly.length <= 4) {
      const formatted = digitsOnly.slice(0, 2) + ':' + digitsOnly.slice(2);
      // If user is typing am/pm
      if (hasAmPm) {
        const period = value.includes('p') ? 'pm' : 'am';
        return formatted + ' ' + period;
      }
      return formatted;
    } else {
      const formatted = digitsOnly.slice(0, 2) + ':' + digitsOnly.slice(2, 4);
      // Extract am/pm if present
      if (hasAmPm) {
        const period = value.includes('p') ? 'pm' : 'am';
        return formatted + ' ' + period;
      }
      return formatted;
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
      e.target.placeholder = '__:__ am/pm';
    }
  };

  const handleEndTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dialogEndTime) {
      e.target.placeholder = '__:__ am/pm';
    }
  };

  const handleStartTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = '9:00 am';

    // Auto-add AM/PM if user didn't specify
    if (dialogStartTime && !dialogStartTime.includes('am') && !dialogStartTime.includes('pm')) {
      const match = dialogStartTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1], 10);
        // Default to PM if hour is 1-11, AM if 12
        const period = hour === 12 ? 'pm' : hour >= 1 && hour <= 11 ? 'pm' : 'am';
        setDialogStartTime(dialogStartTime + ' ' + period);
      }
    }
  };

  const handleEndTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = '10:00 pm';

    // Auto-add AM/PM if user didn't specify
    if (dialogEndTime && !dialogEndTime.includes('am') && !dialogEndTime.includes('pm')) {
      const match = dialogEndTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1], 10);
        // Default to PM if hour is 1-11, AM if 12
        const period = hour === 12 ? 'pm' : hour >= 1 && hour <= 11 ? 'pm' : 'am';
        setDialogEndTime(dialogEndTime + ' ' + period);
      }
    }
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
    localStorage.setItem('plannerData', JSON.stringify(updatedPlannerData));

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
    localStorage.setItem('allTasks', JSON.stringify(newAllTasks));

    console.log('✅ Task inserted at position', targetIndex);
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
            // The actual drop handling is now done by PlannerSection at specific positions
            // This outer handler just cleans up the drag state
            setIsDraggingOverAllTasks(false);
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
                  onDropTaskFromCalendar={handleDropTaskFromCalendarToAllTasks}
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
                                className="flex-1 cursor-crosshair relative group/slot"
                                onMouseDown={(e) => {
                                  // Only start drag create if clicking directly on the slot (not on a task)
                                  if (e.target === e.currentTarget || (e.currentTarget.contains(e.target as Node) && (e.target as HTMLElement).classList.contains('pointer-events-none'))) {
                                    e.preventDefault();
                                    setIsDraggingCreate(true);
                                    setDragCreateStart({ hour, minute });
                                    setDragCreateEnd({ hour, minute });
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
                                {/* Remove Plus icon - drag to create instead */}
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
                  {(() => {
                    const tasksWithTimes = currentDay.items.filter(item => item.startTime && item.endTime);

                    // Calculate time ranges and detect overlaps
                    const tasksWithLayout = tasksWithTimes.map((task, index) => {
                      const [startHour, startMinute] = task.startTime!.split(':').map(Number);
                      const [endHour, endMinute] = task.endTime!.split(':').map(Number);
                      const startTotalMinutes = startHour * 60 + startMinute;
                      const endTotalMinutes = endHour * 60 + endMinute;
                      const durationMinutes = endTotalMinutes - startTotalMinutes;

                      return {
                        task,
                        startMinutes: startTotalMinutes,
                        endMinutes: endTotalMinutes,
                        durationMinutes,
                        column: 0,
                        totalColumns: 1,
                        isBackground: false,
                        inOverlapGroup: false
                      };
                    });

                    // Detect overlaps and assign columns
                    const processedTasks = new Set<typeof tasksWithLayout[0]>();

                    for (let i = 0; i < tasksWithLayout.length; i++) {
                      const currentTask = tasksWithLayout[i];

                      // Skip if already processed as part of another group
                      if (processedTasks.has(currentTask)) continue;

                      const overlappingTasks = [currentTask];

                      // Find all tasks that overlap with this one
                      for (let j = i + 1; j < tasksWithLayout.length; j++) {
                        const otherTask = tasksWithLayout[j];

                        // Check if this task overlaps with ANY task in the current group
                        const overlapsWithGroup = overlappingTasks.some(groupTask =>
                          (groupTask.startMinutes < otherTask.endMinutes &&
                           groupTask.endMinutes > otherTask.startMinutes)
                        );

                        if (overlapsWithGroup && !overlappingTasks.includes(otherTask)) {
                          overlappingTasks.push(otherTask);
                        }
                      }

                      // Mark all tasks in this group as processed
                      overlappingTasks.forEach(t => processedTasks.add(t));

                      // Assign columns to overlapping tasks
                      if (overlappingTasks.length > 1) {
                        // Find the longest task - it should be the background
                        const longestTask = overlappingTasks.reduce((longest, current) =>
                          current.durationMinutes > longest.durationMinutes ? current : longest
                        );

                        // Mark longest task as background (full width, behind others)
                        longestTask.isBackground = true;
                        longestTask.column = 0;
                        longestTask.totalColumns = 1;
                        longestTask.inOverlapGroup = true;

                        // Other tasks are positioned on top in columns
                        const foregroundTasks = overlappingTasks.filter(t => t !== longestTask);
                        const totalColumns = foregroundTasks.length;

                        foregroundTasks.forEach((t) => {
                          const originalIndex = tasksWithLayout.indexOf(t);
                          const columnIndex = foregroundTasks
                            .map(ot => tasksWithLayout.indexOf(ot))
                            .sort((a, b) => a - b)
                            .indexOf(originalIndex);

                          t.column = columnIndex;
                          t.totalColumns = totalColumns;
                          t.isBackground = false;
                          t.inOverlapGroup = true;
                        });
                      }
                    }

                    return tasksWithLayout.map(({ task, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
                      const durationMinutes = endMinutes - startMinutes;
                      const top = startMinutes * 1.5;
                      const height = Math.max(durationMinutes * 1.5, 28);
                      const [startHour, startMinute] = task.startTime!.split(':').map(Number);

                      // Calculate width and position for overlapping tasks
                      let widthPercent, leftPercent, zIndex;

                      if (isBackground) {
                        // Background task: full width, behind others
                        widthPercent = 100;
                        leftPercent = 0;
                        zIndex = 5; // Lower z-index to stay behind
                      } else if (inOverlapGroup) {
                        // Foreground tasks in an overlapping group: position on right side
                        // Leave left 40% for background task visibility
                        const availableSpace = 60;
                        const startPosition = 40;
                        widthPercent = availableSpace / totalColumns;
                        leftPercent = startPosition + (column * widthPercent);
                        zIndex = 15 + column; // Higher z-index to appear on top
                      } else {
                        // Standalone task (no overlap): full width
                        widthPercent = 100;
                        leftPercent = 0;
                        zIndex = 10;
                      }

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
                            // Don't open dialog if we just finished resizing
                            if (isResizingRef.current) {
                              return;
                            }
                            handleOpenTaskDialog(startHour, task);
                          }}
                          className="group absolute rounded px-2 py-1 border-l-4 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${leftPercent}%`,
                            width: `calc(${widthPercent}% - 4px)`,
                            backgroundColor: task.color || '#f9fafb',
                            borderLeftColor: task.color || '#d1d5db',
                            zIndex: zIndex,
                          }}
                        >
                          {/* Top resize handle */}
                          <div
                            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              isResizingRef.current = true;

                              const startY = e.clientY;
                              const originalStartMinutes = startMinutes;

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaY = moveEvent.clientY - startY;
                                const deltaMinutes = Math.round(deltaY / 1.5); // 1.5px per minute
                                const newStartMinutes = Math.max(0, Math.min(1439, originalStartMinutes + deltaMinutes));

                                // Ensure start time is before end time (at least 15 min duration)
                                if (newStartMinutes < endMinutes - 15) {
                                  const newStartHour = Math.floor(newStartMinutes / 60);
                                  const newStartMinute = newStartMinutes % 60;
                                  const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;

                                  handleEditItem(task.id, task.text, newStartTime, task.endTime, task.color, task.description, task.isCompleted, task.date);
                                }
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                                // Reset after a short delay to allow click event to be checked
                                setTimeout(() => {
                                  isResizingRef.current = false;
                                }, 100);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />

                          {/* Bottom resize handle */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              isResizingRef.current = true;

                              const startY = e.clientY;
                              const originalEndMinutes = endMinutes;

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaY = moveEvent.clientY - startY;
                                const deltaMinutes = Math.round(deltaY / 1.5); // 1.5px per minute
                                const newEndMinutes = Math.max(0, Math.min(1439, originalEndMinutes + deltaMinutes));

                                // Ensure end time is after start time (at least 15 min duration)
                                if (newEndMinutes > startMinutes + 15) {
                                  const newEndHour = Math.floor(newEndMinutes / 60);
                                  const newEndMinute = newEndMinutes % 60;
                                  const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

                                  handleEditItem(task.id, task.text, task.startTime, newEndTime, task.color, task.description, task.isCompleted, task.date);
                                }
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                                // Reset after a short delay to allow click event to be checked
                                setTimeout(() => {
                                  isResizingRef.current = false;
                                }, 100);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />

                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={task.isCompleted}
                              onCheckedChange={(checked) => {
                                handleToggleItem(task.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {height >= 45 ? (
                                // Show time below title when there's enough space
                                <>
                                  <div className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {task.text}
                                  </div>
                                  {(task.startTime || task.endTime) && (
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                      {task.startTime && convert24To12Hour(task.startTime)}
                                      {task.startTime && task.endTime && ' - '}
                                      {task.endTime && convert24To12Hour(task.endTime)}
                                    </div>
                                  )}
                                </>
                              ) : (
                                // Show time inline with title when space is limited
                                <div className={`text-xs font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {task.text}
                                  {(task.startTime || task.endTime) && (
                                    <span className="text-[10px] text-gray-500 ml-1.5 font-normal">
                                      {task.startTime && convert24To12Hour(task.startTime)}
                                      {task.startTime && task.endTime && ' - '}
                                      {task.endTime && convert24To12Hour(task.endTime)}
                                    </span>
                                  )}
                                </div>
                              )}
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
                    });
                  })()}

                  {/* Drag-to-create preview */}
                  {isDraggingCreate && dragCreateStart && dragCreateEnd && (() => {
                    const startMinutes = dragCreateStart.hour * 60 + dragCreateStart.minute;
                    const endMinutes = dragCreateEnd.hour * 60 + dragCreateEnd.minute;

                    const actualStart = Math.min(startMinutes, endMinutes);
                    const actualEnd = Math.max(startMinutes, endMinutes + 20);

                    const top = (actualStart / 60) * 90; // 90px per hour
                    const height = Math.max(30, ((actualEnd - actualStart) / 60) * 90);

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

                    return (
                      <div
                        className="absolute rounded px-2 py-1 border-l-4 border-blue-400"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: '0',
                          right: '0',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          zIndex: 100,
                          pointerEvents: 'none'
                        }}
                      >
                        <div className="text-xs text-blue-700 font-semibold">
                          {startTimeStr}
                        </div>
                        {height > 40 && (
                          <div className="text-xs text-blue-700 font-semibold absolute bottom-1 left-2">
                            {endTimeStr}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
              <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Time column on the left */}
                <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: '50px' }}>
                  {/* Header spacer */}
                  <div className="h-[60px] border-b border-gray-200 flex items-center justify-center px-0.5">
                    <span className="text-[9px] text-gray-400">GMT-08</span>
                  </div>
                  {/* Time labels */}
                  <div className="relative" style={{ height: '1152px' }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 flex items-start justify-start pl-0.5 pt-0.5"
                        style={{ top: `${hour * 48}px`, height: '48px' }}
                      >
                        <span className="text-[10px] text-gray-400 leading-none">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day columns */}
                <div className="flex-1 grid grid-cols-7 gap-0 relative">
                  {/* Horizontal grid lines spanning all days */}
                  <div className="absolute inset-0 pointer-events-none" style={{ top: '60px' }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${hour * 48}px`,
                          borderTop: '1px solid #f9fafb'
                        }}
                      />
                    ))}
                  </div>

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
                      data-day-column={dayString}
                      className={`${dayColor} transition-colors`}
                      style={{ borderRight: index < 6 ? '1px solid #f3f4f6' : 'none' }}
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
                      {/* Day header */}
                      <div className={`h-[60px] flex flex-col items-center justify-center border-b border-gray-200 ${isToday ? 'bg-purple-50' : 'bg-gray-50'}`} style={{ opacity: isPast ? 0.5 : 1 }}>
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {format(day, "EEE")}
                        </div>
                        <div className={`text-2xl font-semibold ${isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                          {format(day, "d")}
                        </div>
                      </div>
                      {/* Timeline container */}
                      <div className="relative" data-timeline style={{ height: '1152px' }}>

                        {/* Tasks positioned absolutely by time */}
                        {(() => {
                          const tasksWithTimes = (dayData?.items || []).filter(item => item.startTime && item.endTime);

                          // Calculate time ranges and detect overlaps
                          const tasksWithLayout = tasksWithTimes.map((task, index) => {
                            const [startHour, startMinute] = task.startTime!.split(':').map(Number);
                            const [endHour, endMinute] = task.endTime!.split(':').map(Number);
                            const startTotalMinutes = startHour * 60 + startMinute;
                            const endTotalMinutes = endHour * 60 + endMinute;
                            const durationMinutes = endTotalMinutes - startTotalMinutes;

                            return {
                              task,
                              startMinutes: startTotalMinutes,
                              endMinutes: endTotalMinutes,
                              durationMinutes,
                              column: 0,
                              totalColumns: 1,
                              isBackground: false,
                              inOverlapGroup: false
                            };
                          });

                          // Detect overlaps and assign columns
                          const processedTasks = new Set<typeof tasksWithLayout[0]>();

                          for (let i = 0; i < tasksWithLayout.length; i++) {
                            const currentTask = tasksWithLayout[i];

                            // Skip if already processed as part of another group
                            if (processedTasks.has(currentTask)) continue;

                            const overlappingTasks = [currentTask];

                            // Find all tasks that overlap with this one
                            for (let j = i + 1; j < tasksWithLayout.length; j++) {
                              const otherTask = tasksWithLayout[j];

                              // Check if this task overlaps with ANY task in the current group
                              const overlapsWithGroup = overlappingTasks.some(groupTask =>
                                (groupTask.startMinutes < otherTask.endMinutes &&
                                 groupTask.endMinutes > otherTask.startMinutes)
                              );

                              if (overlapsWithGroup && !overlappingTasks.includes(otherTask)) {
                                overlappingTasks.push(otherTask);
                              }
                            }

                            // Mark all tasks in this group as processed
                            overlappingTasks.forEach(t => processedTasks.add(t));

                            // Assign columns to overlapping tasks
                            if (overlappingTasks.length > 1) {
                              // Find the longest task - it should be the background
                              const longestTask = overlappingTasks.reduce((longest, current) =>
                                current.durationMinutes > longest.durationMinutes ? current : longest
                              );

                              // Mark longest task as background (full width, behind others)
                              longestTask.isBackground = true;
                              longestTask.column = 0;
                              longestTask.totalColumns = 1;
                              longestTask.inOverlapGroup = true;

                              // Other tasks are positioned on top in columns
                              const foregroundTasks = overlappingTasks.filter(t => t !== longestTask);
                              const totalColumns = foregroundTasks.length;

                              foregroundTasks.forEach((t) => {
                                const originalIndex = tasksWithLayout.indexOf(t);
                                const columnIndex = foregroundTasks
                                  .map(ot => tasksWithLayout.indexOf(ot))
                                  .sort((a, b) => a - b)
                                  .indexOf(originalIndex);

                                t.column = columnIndex;
                                t.totalColumns = totalColumns;
                                t.isBackground = false;
                                t.inOverlapGroup = true;
                              });
                            }
                          }

                          return tasksWithLayout.map(({ task: item, startMinutes, endMinutes, column, totalColumns, isBackground, inOverlapGroup }) => {
                            const durationMinutes = endMinutes - startMinutes;
                            const topPos = startMinutes * 0.8;
                            const height = Math.max(durationMinutes * 0.8, 24);

                            // Calculate width and position for overlapping tasks
                            let widthPercent, leftPercent, zIndex;

                            if (isBackground) {
                              // Background task: full width, behind others
                              widthPercent = 100;
                              leftPercent = 0;
                              zIndex = 5;
                            } else if (inOverlapGroup) {
                              // Foreground tasks: position on right side
                              // Leave left 50% for background task visibility (wider for weekly view)
                              const availableSpace = 50;
                              const startPosition = 50;
                              widthPercent = availableSpace / totalColumns;
                              leftPercent = startPosition + (column * widthPercent);
                              zIndex = 15 + column;
                            } else {
                              // Standalone task (no overlap): full width
                              widthPercent = 100;
                              leftPercent = 0;
                              zIndex = 10;
                            }

                            return (
                              <div
                                key={item.id}
                                className="absolute group px-1"
                                style={{
                                  top: `${topPos}px`,
                                  height: `${height}px`,
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  zIndex
                                }}
                              >
                                <div
                                  draggable={true}
                                  onDragStart={(e) => {
                                    console.log('🚀 DRAG START - Weekly Task:', item.id, item.text, 'from:', dayString);
                                    setDraggedWeeklyTaskId(item.id);
                                    e.dataTransfer.setData('text/plain', item.id);
                                    e.dataTransfer.setData('taskId', item.id);
                                    e.dataTransfer.setData('fromDate', dayString);
                                    e.dataTransfer.setData('fromAllTasks', 'false');
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.currentTarget.style.opacity = '0.5';
                                  }}
                                  onDragEnd={(e) => {
                                    e.currentTarget.style.opacity = isPast ? '0.5' : '1';
                                    setDraggedWeeklyTaskId(null);
                                  }}
                                  onClick={(e) => {
                                    if (isResizingRef.current) {
                                      return;
                                    }
                                    setEditingTask(item);
                                    setDialogTaskTitle(item.text);
                                    setDialogTaskDescription(item.description || "");
                                    setDialogStartTime(item.startTime || "");
                                    setDialogEndTime(item.endTime || "");
                                    setDialogTaskColor(item.color || "");
                                    setDialogAddToContentCalendar(item.isContentCalendar || false);
                                    setIsTaskDialogOpen(true);
                                  }}
                                  className="h-full relative rounded cursor-pointer hover:brightness-95 transition-all overflow-hidden"
                                  style={{
                                    backgroundColor: item.color || '#4caf50',
                                    opacity: isPast ? 0.6 : 0.9,
                                    padding: '6px 8px',
                                    border: 'none'
                                  }}
                                >
                                  {/* Resize handles */}
                                  <div
                                    className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      isResizingRef.current = true;
                                      const startY = e.clientY;
                                      const originalStartTime = item.startTime!;

                                      const handleMouseMove = (moveEvent: MouseEvent) => {
                                        const deltaY = moveEvent.clientY - startY;
                                        const deltaMinutes = Math.round(deltaY / 0.8);
                                        const [hour, minute] = originalStartTime.split(':').map(Number);
                                        const originalMinutes = hour * 60 + minute;
                                        const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

                                        // Get end time in minutes
                                        const [endHour, endMinute] = item.endTime!.split(':').map(Number);
                                        const endTotalMinutes = endHour * 60 + endMinute;

                                        // Ensure start time is before end time (at least 15 min duration)
                                        if (newMinutes < endTotalMinutes - 15) {
                                          const newHour = Math.floor(newMinutes / 60);
                                          const newMinute = newMinutes % 60;
                                          const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

                                          handleEditItem(item.id, item.text, newStartTime, item.endTime, item.color, item.description, item.isCompleted, dayString, item.isContentCalendar);
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
                                    }}
                                  />

                                  <div
                                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-30"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      isResizingRef.current = true;
                                      const startY = e.clientY;
                                      const originalEndTime = item.endTime!;

                                      const handleMouseMove = (moveEvent: MouseEvent) => {
                                        const deltaY = moveEvent.clientY - startY;
                                        const deltaMinutes = Math.round(deltaY / 0.8);
                                        const [hour, minute] = originalEndTime.split(':').map(Number);
                                        const originalMinutes = hour * 60 + minute;
                                        const newMinutes = Math.max(0, Math.min(1439, originalMinutes + deltaMinutes));

                                        // Get start time in minutes
                                        const [startHour, startMinute] = item.startTime!.split(':').map(Number);
                                        const startTotalMinutes = startHour * 60 + startMinute;

                                        // Ensure end time is after start time (at least 15 min duration)
                                        if (newMinutes > startTotalMinutes + 15) {
                                          const newHour = Math.floor(newMinutes / 60);
                                          const newMinute = newMinutes % 60;
                                          const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

                                          handleEditItem(item.id, item.text, item.startTime, newEndTime, item.color, item.description, item.isCompleted, dayString, item.isContentCalendar);
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
                                    }}
                                  />

                                  {/* Task content */}
                                  <div className="h-full relative z-20 flex flex-col">
                                    <div className={`text-[11px] font-medium leading-snug ${item.isCompleted ? 'line-through opacity-70' : ''} text-white break-words`}>
                                      {item.text}
                                    </div>
                                    {height >= 45 && (
                                      <div className="text-[10px] text-white/90 mt-0.5">
                                        {convert24To12Hour(item.startTime!)}
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteWeeklyTask(item.id, dayString);
                                      }}
                                      className="absolute top-0.5 right-0.5 p-0.5 rounded text-white/60 hover:text-white hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Tasks without times - shown at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
                          {(dayData?.items || [])
                            .filter(item => !item.startTime || !item.endTime)
                            .map((item, taskIndex) => (
                              <div
                                key={item.id}
                                draggable={true}
                                onDragStart={(e) => {
                                  setDraggedWeeklyTaskId(item.id);
                                  e.dataTransfer.setData('taskId', item.id);
                                  e.dataTransfer.setData('fromDate', dayString);
                                  e.dataTransfer.setData('fromAllTasks', 'false');
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.currentTarget.style.opacity = '0.5';
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.style.opacity = isPast ? '0.5' : '1';
                                  setDraggedWeeklyTaskId(null);
                                }}
                                onClick={(e) => {
                                  setEditingTask(item);
                                  setDialogTaskTitle(item.text);
                                  setDialogTaskDescription(item.description || "");
                                  setDialogStartTime(item.startTime || "");
                                  setDialogEndTime(item.endTime || "");
                                  setDialogTaskColor(item.color || "");
                                  setDialogAddToContentCalendar(item.isContentCalendar || false);
                                  setIsTaskDialogOpen(true);
                                }}
                                className="group text-xs px-2 py-1.5 rounded-md hover:shadow-sm transition-all cursor-pointer border-l-2 relative"
                                style={{
                                  backgroundColor: item.color ? `${item.color}10` : '#f5f5f5',
                                  borderLeftColor: item.color || '#9e9e9e',
                                  opacity: isPast ? 0.5 : 1
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={item.isCompleted}
                                    onCheckedChange={() => handleToggleWeeklyTask(item.id, dayString)}
                                    className="h-3 w-3 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-400 rounded-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className={`${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'} break-words flex-1 text-[11px]`}>
                                    {item.text}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWeeklyTask(item.id, dayString);
                                    }}
                                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Drag-to-create overlay */}
                        <div
                          className="absolute top-0 left-0 right-0 bottom-0 z-0"
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            const totalMinutes = Math.floor(y / 0.8);
                            const hour = Math.floor(totalMinutes / 60);
                            const minute = totalMinutes % 60;

                            setWeeklyDragCreateStart(prev => ({
                              ...prev,
                              [dayString]: { hour, minute }
                            }));
                            setWeeklyDragCreateEnd(prev => ({
                              ...prev,
                              [dayString]: { hour, minute }
                            }));
                            setWeeklyDraggingCreate(prev => ({
                              ...prev,
                              [dayString]: true
                            }));
                          }}
                        />

                        {/* Drag-to-create preview */}
                        {weeklyDraggingCreate[dayString] && weeklyDragCreateStart[dayString] && weeklyDragCreateEnd[dayString] && (() => {
                          const start = weeklyDragCreateStart[dayString];
                          const end = weeklyDragCreateEnd[dayString];
                          const startMinutes = start.hour * 60 + start.minute;
                          const endMinutes = end.hour * 60 + end.minute;
                          const topPos = Math.min(startMinutes, endMinutes) * 0.8;
                          const height = Math.abs(endMinutes - startMinutes) * 0.8;
                          const actualStart = startMinutes < endMinutes ? start : end;
                          const actualEnd = startMinutes < endMinutes ? end : start;

                          return (
                            <div
                              className="absolute left-2 right-2 rounded-md pointer-events-none z-50 border-l-4"
                              style={{
                                top: `${topPos}px`,
                                height: `${Math.max(height, 45)}px`,
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderLeftColor: '#3b82f6'
                              }}
                            >
                              <div className="p-2 text-[10px] font-medium text-blue-700">
                                {actualStart.hour === 0 ? '12' : actualStart.hour > 12 ? actualStart.hour - 12 : actualStart.hour}:{actualStart.minute.toString().padStart(2, '0')} {actualStart.hour >= 12 ? 'PM' : 'AM'}
                                {' - '}
                                {actualEnd.hour === 0 ? '12' : actualEnd.hour > 12 ? actualEnd.hour - 12 : actualEnd.hour}:{actualEnd.minute.toString().padStart(2, '0')} {actualEnd.hour >= 12 ? 'PM' : 'AM'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
                </div>
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
                        // Filter to show only tasks marked for content calendar
                        tasksToShow = tasksToShow.filter(task => task.isContentCalendar === true);
                      }
                      // When calendarFilterMode === 'all', show ALL tasks (including those with isContentCalendar: true)

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
                                className="text-xs p-1 rounded truncate border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
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
                  placeholder="9:00 am"
                  className="flex-1 h-9 text-sm"
                  maxLength={8}
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
                  placeholder="10:00 pm"
                  className="flex-1 h-9 text-sm"
                  maxLength={8}
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
