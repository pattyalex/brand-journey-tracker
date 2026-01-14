import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from '@clerk/clerk-react';
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  CheckSquare,
  Edit,
  BarChart2,
  Layers,
  Settings,
  Handshake,
  Award,
  Coffee,
  Sun,
  Moon,
  PlusCircle,
  Plus,
  Trash2,
  ChevronDown,
  TrendingUp,
  Target,
  Pin,
  Lightbulb,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AIRecommendations from '@/components/analytics/AIRecommendations';
import VerificationGuard from '@/components/VerificationGuard';
import { StorageKeys, getString, setString, setJSON, getJSON } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";

// Helper to get date string in same format as Planner (local timezone, not UTC)
const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(null);
  const [journalEntries, setJournalEntries] = useState({
    threeThingsImGratefulFor: "",
    todaysAffirmations: ""
  });
  const [goals, setGoals] = useState([]);
  const [moodboardImages, setMoodboardImages] = useState<string[]>([]);

  // All Tasks from planner - load from localStorage
  interface PlannerItem {
    id: string;
    text: string;
    section: "morning" | "midday" | "afternoon" | "evening";
    isCompleted: boolean;
    date: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    color?: string;
  }

  const [allTasks, setAllTasks] = useState<PlannerItem[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // Today's Tasks from planner
  const [todaysTasks, setTodaysTasks] = useState<PlannerItem[]>([]);
  const [isAddingTodayTask, setIsAddingTodayTask] = useState(false);
  const [newTodayTaskText, setNewTodayTaskText] = useState("");
  const [newTodayTaskStartTime, setNewTodayTaskStartTime] = useState("");
  const [newTodayTaskStartAmPm, setNewTodayTaskStartAmPm] = useState<"AM" | "PM">("AM");
  const [newTodayTaskEndTime, setNewTodayTaskEndTime] = useState("");
  const [newTodayTaskEndAmPm, setNewTodayTaskEndAmPm] = useState<"AM" | "PM">("PM");
  const [editingTodayTaskId, setEditingTodayTaskId] = useState<string | null>(null);
  const [editingTodayTaskText, setEditingTodayTaskText] = useState("");
  const [editingTimeTaskId, setEditingTimeTaskId] = useState<string | null>(null);
  const [editingStartTime, setEditingStartTime] = useState("");
  const [editingStartAmPm, setEditingStartAmPm] = useState<"AM" | "PM">("AM");
  const [editingEndTime, setEditingEndTime] = useState("");
  const [editingEndAmPm, setEditingEndAmPm] = useState<"AM" | "PM">("PM");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const addTaskFormRef = useRef<HTMLDivElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const startAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const endAmPmButtonRef = useRef<HTMLButtonElement>(null);

  // Refs for editing existing task times
  const editStartTimeInputRef = useRef<HTMLInputElement>(null);
  const editStartAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const editEndTimeInputRef = useRef<HTMLInputElement>(null);
  const editEndAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const timeEditorRef = useRef<HTMLDivElement>(null);

  // Today's Top 3 Priorities
  interface Priority {
    id: number;
    text: string;
    isCompleted: boolean;
  }
  const [priorities, setPriorities] = useState<Priority[]>(() => {
    const saved = getString('todaysPriorities');
    const today = getDateString(new Date());
    const savedDate = getString('todaysPrioritiesDate');

    // Reset priorities if it's a new day
    if (savedDate !== today) {
      setString('todaysPrioritiesDate', today);
      return [
        { id: 1, text: '', isCompleted: false },
        { id: 2, text: '', isCompleted: false },
        { id: 3, text: '', isCompleted: false }
      ];
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 1, text: '', isCompleted: false },
          { id: 2, text: '', isCompleted: false },
          { id: 3, text: '', isCompleted: false }
        ];
      }
    }
    return [
      { id: 1, text: '', isCompleted: false },
      { id: 2, text: '', isCompleted: false },
      { id: 3, text: '', isCompleted: false }
    ];
  });
  const [editingPriorityId, setEditingPriorityId] = useState<number | null>(null);

  // Pinned Content Cards from Content Hub (Production) page
  interface ProductionCard {
    id: string;
    title: string;
    description?: string;
    columnId: string;
    columnName?: string; // The name of the column this card is in (e.g., "To Film", "Shape Ideas")
    isPinned?: boolean;
    platforms?: string[];
    formats?: string[];
    script?: string;
    hook?: string;
    status?: "to-start" | "needs-work" | "ready" | null;
  }

  interface KanbanColumn {
    id: string;
    title: string;
    cards: ProductionCard[];
  }

  const [pinnedContent, setPinnedContent] = useState<ProductionCard[]>([]);
  const [isUsingPlaceholders, setIsUsingPlaceholders] = useState(false);

  // Column colors and emojis matching Content Hub
  const columnTagStyles: Record<string, { bg: string; text: string; border: string; emoji: string; displayName?: string }> = {
    ideate: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", emoji: "💡", displayName: "To Ideate Further" },
    "shape-ideas": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", emoji: "🧠", displayName: "To Shape Idea" },
    "to-film": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", emoji: "🎥" },
    "to-edit": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", emoji: "💻" },
    "to-schedule": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", emoji: "📅" },
  };

  const getColumnTagStyle = (columnId: string) => {
    return columnTagStyles[columnId] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", emoji: "📍" };
  };
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);

  // Default placeholder cards for new users or when no content is pinned
  const defaultPlaceholderCards: ProductionCard[] = [
    {
      id: 'placeholder-1',
      title: 'Pin your priority content here',
      description: 'Go to Content Hub and click the pin icon on any content card you want to prioritize. Your pinned cards will appear here so you can focus on what matters most.',
      columnId: 'placeholder',
      isPinned: false,
      formats: ['Carousel'],
      platforms: ['Instagram']
    },
    {
      id: 'placeholder-2',
      title: 'Auto-filled from Content Hub',
      description: "When you don't have any pinned content, we'll automatically show your most recent ideas from the Content Hub. Start creating content to see it here!",
      columnId: 'placeholder',
      isPinned: false,
      formats: ['Vlog'],
      platforms: ['TikTok']
    },
    {
      id: 'placeholder-3',
      title: 'Example: 5 morning habits that changed my life',
      columnId: 'placeholder',
      isPinned: false,
      hook: 'I used to wake up exhausted every day until I discovered these 5 simple morning rituals...',
      script: 'First thing I do is drink a full glass of water before touching my phone. Then I spend just 5 minutes stretching...',
      formats: ['Talking-to-camera video'],
      platforms: ['TikTok', 'Instagram']
    }
  ];

  // Mission Statement and Vision Board from Strategy & Growth
  const [missionStatement, setMissionStatement] = useState("");
  const [visionBoardImages, setVisionBoardImages] = useState<string[]>([]);

  // Celebration state for completing all priorities
  const [showCelebration, setShowCelebration] = useState(false);

  // State for adding monthly goals
  const [isAddingMonthlyGoal, setIsAddingMonthlyGoal] = useState(false);
  const [newMonthlyGoalText, setNewMonthlyGoalText] = useState("");

  // State for editing monthly goals
  const [editingMonthlyGoalId, setEditingMonthlyGoalId] = useState<number | null>(null);
  const [editingMonthlyGoalText, setEditingMonthlyGoalText] = useState("");
  const [showProgressNotesForGoalId, setShowProgressNotesForGoalId] = useState<number | null>(null);

  // Monthly Goals state - synced with Growth Goals page via localStorage
  type GoalStatus = 'not-started' | 'in-progress' | 'completed';
  interface MonthlyGoal {
    id: number;
    text: string;
    status: GoalStatus;
    progressNote?: string;
  }
  interface MonthlyGoalsData {
    [year: string]: {
      [month: string]: MonthlyGoal[];
    };
  }

  // Content Calendar state - synced with planner page
  interface ContentCalendarItem {
    id: string;
    text: string;
    section: "morning" | "midday" | "afternoon" | "evening";
    isCompleted: boolean;
    date: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    color?: string;
    isContentCalendar?: boolean;
  }
  const [contentCalendarData, setContentCalendarData] = useState<ContentCalendarItem[]>([]);
  const [calendarCurrentMonth, setCalendarCurrentMonth] = useState(new Date());

  const [monthlyGoalsData, setMonthlyGoalsData] = useState<MonthlyGoalsData>(() => {
    const saved = getString(StorageKeys.monthlyGoalsData);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Get current month and year
  const getCurrentMonth = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[new Date().getMonth()];
  };

  const getCurrentYear = () => new Date().getFullYear();

  // State to track connected social media platforms
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Habit Tracker state
  interface Habit {
    id: string;
    name: string;
    completedDates: string[]; // Array of date strings in 'YYYY-MM-DD' format
    goal?: {
      target: number;           // e.g., 5
      period: 'week' | 'month'; // "per week" or "per month"
    };
  }
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = getString('workHabits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [habitWeekOffset, setHabitWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState("");
  const [editingGoalHabitId, setEditingGoalHabitId] = useState<string | null>(null);
  const [editingGoalTarget, setEditingGoalTarget] = useState<string>("5");
  const [editingGoalPeriod, setEditingGoalPeriod] = useState<'week' | 'month'>('week');
  const [newHabitGoalTarget, setNewHabitGoalTarget] = useState<string>("");
  const [newHabitGoalPeriod, setNewHabitGoalPeriod] = useState<'week' | 'month'>('week');

  // Auto-dismiss celebration after 3.5 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Load All Tasks from localStorage
  useEffect(() => {
    const loadAllTasks = () => {
      const saved = getString(StorageKeys.allTasks);
      if (saved) {
        try {
          setAllTasks(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load allTasks:', error);
        }
      }
    };

    loadAllTasks();

    // Listen for changes to allTasks from the planner
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'allTasks' && e.newValue) {
        try {
          setAllTasks(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse allTasks:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load Today's Tasks from plannerData
  useEffect(() => {
    const loadTodaysTasks = () => {
      const plannerDataStr = getString(StorageKeys.plannerData);
      if (plannerDataStr) {
        try {
          const plannerData = JSON.parse(plannerDataStr);
          const today = getDateString(new Date());
          const todayData = plannerData.find((day: any) => day.date === today);
          if (todayData && todayData.items) {
            // Sort by start time
            const sortedItems = todayData.items.sort((a: PlannerItem, b: PlannerItem) => {
              if (!a.startTime) return 1;
              if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
            });
            setTodaysTasks(sortedItems);
          } else {
            setTodaysTasks([]);
          }
        } catch (error) {
          console.error('Failed to load today\'s tasks:', error);
        }
      }
    };

    loadTodaysTasks();

    // Listen for changes to plannerData
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plannerData' && e.newValue) {
        loadTodaysTasks();
      }
    };

    // Listen for custom events (same-tab sync)
    const handleCustomEvent = (e: CustomEvent) => {
      loadTodaysTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribe = on(window, EVENTS.plannerDataUpdated, handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Load Content Calendar data from plannerData
  useEffect(() => {
    const loadContentCalendarData = () => {
      const plannerDataStr = getString(StorageKeys.plannerData);
      if (plannerDataStr) {
        try {
          const plannerData = JSON.parse(plannerDataStr);
          // Collect all tasks marked as content calendar across all days
          const contentTasks: ContentCalendarItem[] = [];
          plannerData.forEach((day: any) => {
            if (day.items) {
              day.items.forEach((item: ContentCalendarItem) => {
                if (item.isContentCalendar) {
                  contentTasks.push(item);
                }
              });
            }
          });
          setContentCalendarData(contentTasks);
        } catch (error) {
          console.error('Failed to load content calendar data:', error);
        }
      }
    };

    loadContentCalendarData();

    // Listen for changes to plannerData
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plannerData' && e.newValue) {
        loadContentCalendarData();
      }
    };

    // Listen for custom events (same-tab sync)
    const handleCustomEvent = (e: CustomEvent) => {
      loadContentCalendarData();
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribe = on(window, EVENTS.plannerDataUpdated, handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Handle click outside to close add task form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is on a Select dropdown (which renders in a portal)
      if (target.closest('[role="listbox"]') || target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }

      if (addTaskFormRef.current && !addTaskFormRef.current.contains(event.target as Node)) {
        setIsAddingTodayTask(false);
        setNewTodayTaskText('');
        setNewTodayTaskStartTime('');
        setNewTodayTaskStartAmPm('AM');
        setNewTodayTaskEndTime('');
        setNewTodayTaskEndAmPm('PM');
      }
    };

    if (isAddingTodayTask) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingTodayTask]);

  // Handle click outside to save time edit
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't save if a Select dropdown is open
      if (isSelectOpen) {
        return;
      }

      const target = event.target as HTMLElement;

      // Check if click is on a Select dropdown (which renders in a portal)
      // Check multiple selectors to catch all Select dropdown elements
      if (
        target.closest('[role="listbox"]') ||
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[data-radix-select-content]') ||
        target.closest('[data-radix-select-viewport]') ||
        target.closest('[role="option"]') ||
        target.getAttribute('role') === 'option' ||
        target.getAttribute('role') === 'listbox'
      ) {
        return;
      }

      if (timeEditorRef.current && !timeEditorRef.current.contains(event.target as Node)) {
        if (editingTimeTaskId) {
          handleSaveEditingTime();
        }
      }
    };

    if (editingTimeTaskId) {
      // Use a slight delay to ensure the event listener is set up after the editor opens
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingTimeTaskId, isSelectOpen]);
  useEffect(() => {
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();
      const userName = user?.firstName || "there";

      if (hour >= 5 && hour < 12) {
        setGreeting(`Good morning, ${userName}!`);
        setGreetingIcon(<Coffee className="h-7 w-7 text-amber-500" />);
      } else if (hour >= 12 && hour < 18) {
        setGreeting(`Good afternoon, ${userName}!`);
        setGreetingIcon(<Sun className="h-7 w-7 text-yellow-500" />);
      } else {
        setGreeting(`Good evening, ${userName}!`);
        setGreetingIcon(<Moon className="h-7 w-7 text-indigo-400" />);
      }
    };

    getCurrentGreeting();
  }, [user]);

  // Load journal entries from localStorage
  useEffect(() => {
    // Check if it's a new day - reset journal entries if needed
    const checkNewDay = () => {
      const lastAccessDate = getString(StorageKeys.lastAccessDate);
      const currentDate = new Date().toDateString();

      if (lastAccessDate !== currentDate) {
        // It's a new day, reset journal entries
        const emptyJournalEntries = {
          threeThingsImGratefulFor: "",
          todaysAffirmations: ""
        };

        setJournalEntries(emptyJournalEntries);
        setString(StorageKeys.journalEntries, JSON.stringify(emptyJournalEntries));

        // Save current date as last access date
        setString(StorageKeys.lastAccessDate, currentDate);
      } else {
        // Same day, load existing entries
        const savedEntries = getString(StorageKeys.journalEntries);
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        }
      }
    };

    // Run the day change check
    checkNewDay();

    // Set up an interval to check for day change if user keeps app open overnight
    const midnightCheckInterval = setInterval(() => {
      checkNewDay();
    }, 60000); // Check every minute

    return () => clearInterval(midnightCheckInterval);
  }, []);

  // Load pinned content cards from Content Hub (Production) page
  useEffect(() => {
    const loadPinnedContent = () => {
      const productionData = getJSON<KanbanColumn[]>(StorageKeys.productionKanban, []);

      // Get all pinned cards from all columns (include column name)
      const pinned: ProductionCard[] = [];
      productionData.forEach(column => {
        column.cards.forEach(card => {
          if (card.isPinned) {
            pinned.push({ ...card, columnName: column.title });
          }
        });
      });

      // If user has pinned content, use it
      if (pinned.length > 0) {
        setPinnedContent(pinned);
        setIsUsingPlaceholders(false);
        return;
      }

      // Otherwise, try to auto-pull recent content from Content Hub (include column name)
      const allCards: ProductionCard[] = [];
      productionData.forEach(column => {
        column.cards.forEach(card => {
          allCards.push({ ...card, columnName: column.title });
        });
      });

      // If there's content in Content Hub, show the first 3 items
      if (allCards.length > 0) {
        setPinnedContent(allCards.slice(0, 3));
        setIsUsingPlaceholders(false);
        return;
      }

      // No content at all - show placeholder cards
      setPinnedContent(defaultPlaceholderCards);
      setIsUsingPlaceholders(true);
    };

    loadPinnedContent();

    // Listen for changes to production kanban data (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.productionKanban) {
        loadPinnedContent();
      }
    };

    // Listen for changes from same tab via custom event
    const unsubscribe = on(window, EVENTS.productionKanbanUpdated, () => {
      loadPinnedContent();
    });

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Load Mission Statement and Vision Board from Strategy & Growth
  useEffect(() => {
    const loadMissionAndVision = () => {
      // Load Mission Statement
      const savedMission = getString(StorageKeys.missionStatement);
      if (savedMission) {
        setMissionStatement(savedMission);
      }

      // Load Vision Board
      const savedVisionBoard = getString(StorageKeys.visionBoardData);
      if (savedVisionBoard) {
        try {
          const data = JSON.parse(savedVisionBoard);
          setVisionBoardImages(data.images || []);
        } catch {
          setVisionBoardImages([]);
        }
      }
    };

    loadMissionAndVision();

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.missionStatement || e.key === StorageKeys.visionBoardData) {
        loadMissionAndVision();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load goals from localStorage (these would be fetched from the Goals page in a real app)
  useEffect(() => {
    // For demo, fetch goals from StrategyGrowth page
    const loadGoals = () => {
      const goalsStr = getString(StorageKeys.growthGoals);
      if (goalsStr) {
        setGoals(JSON.parse(goalsStr));
      } else {
        // Default demo data if none exists
        setGoals([
          { metric: "Followers", current: 5000, target: 10000, timeframe: "3 months" },
          { metric: "Engagement Rate", current: 3.5, target: 5, timeframe: "2 months" },
          { metric: "Brand Deals", current: 1, target: 3, timeframe: "6 months" }
        ]);
      }
    };

    loadGoals();
  }, []);

  // In a real app, these would be loaded from a database or storage
  useEffect(() => {
    // Demo mood board images
    setMoodboardImages([
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206"
    ]);
  }, []);

  // Handle journal entry changes
  const handleJournalChange = (field: string, value: string) => {
    const updatedEntries = {
      ...journalEntries,
      [field]: value
    };
    setJournalEntries(updatedEntries);
    setString(StorageKeys.journalEntries, JSON.stringify(updatedEntries));
  };

  // Handle adding new task
  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: PlannerItem = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        section: "morning",
        isCompleted: false,
        date: "",
      };
      const updatedTasks = [...allTasks, newTask];
      console.log('HomePage: Adding task', newTask);
      console.log('HomePage: Updated tasks', updatedTasks);
      setAllTasks(updatedTasks);
      setString(StorageKeys.allTasks, JSON.stringify(updatedTasks));
      console.log('HomePage: Saved to localStorage');
      // Dispatch custom event for same-tab sync
      emit(window, EVENTS.allTasksUpdated, updatedTasks);
      console.log(`HomePage: Dispatched ${EVENTS.allTasksUpdated} event`);
      setNewTaskText("");
      setIsAddingTask(false);
    }
  };

  // Handle toggling task completion
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setAllTasks(updatedTasks);
    setString(StorageKeys.allTasks, JSON.stringify(updatedTasks));
    // Dispatch custom event for same-tab sync
    emit(window, EVENTS.allTasksUpdated, updatedTasks);
  };

  // Handle deleting task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedTasks);
    setString(StorageKeys.allTasks, JSON.stringify(updatedTasks));
    // Dispatch custom event for same-tab sync
    emit(window, EVENTS.allTasksUpdated, updatedTasks);
  };

  // Handle toggling today's task completion
  const handleToggleTodayTask = (taskId: string) => {
    const plannerDataStr = getString(StorageKeys.plannerData);
    if (plannerDataStr) {
      try {
        const plannerData = JSON.parse(plannerDataStr);
        const today = getDateString(new Date());
        const todayIndex = plannerData.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
          const updatedPlannerData = [...plannerData];
          updatedPlannerData[todayIndex] = {
            ...updatedPlannerData[todayIndex],
            items: updatedPlannerData[todayIndex].items.map((item: PlannerItem) =>
              item.id === taskId ? { ...item, isCompleted: !item.isCompleted } : item
            )
          };

          setJSON(StorageKeys.plannerData, updatedPlannerData);
          emit(window, EVENTS.plannerDataUpdated, updatedPlannerData);

          // Update local state
          setTodaysTasks(todaysTasks.map(task =>
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
          ));
        }
      } catch (error) {
        console.error('Failed to toggle today\'s task:', error);
      }
    }
  };

  // Handle editing a task from today's tasks
  const handleStartEditingTodayTask = (task: PlannerItem) => {
    setEditingTodayTaskId(task.id);
    setEditingTodayTaskText(task.text);
  };

  const handleSaveEditingTodayTask = () => {
    if (!editingTodayTaskId || !editingTodayTaskText.trim()) {
      setEditingTodayTaskId(null);
      setEditingTodayTaskText("");
      return;
    }

    const plannerDataStr = getString(StorageKeys.plannerData);
    if (plannerDataStr) {
      try {
        const plannerData = JSON.parse(plannerDataStr);
        const today = getDateString(new Date());
        const todayIndex = plannerData.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
          const updatedPlannerData = [...plannerData];
          updatedPlannerData[todayIndex] = {
            ...updatedPlannerData[todayIndex],
            items: updatedPlannerData[todayIndex].items.map((item: PlannerItem) =>
              item.id === editingTodayTaskId ? { ...item, text: editingTodayTaskText.trim() } : item
            )
          };

          setJSON(StorageKeys.plannerData, updatedPlannerData);
          emit(window, EVENTS.plannerDataUpdated, updatedPlannerData);

          // Update local state
          setTodaysTasks(todaysTasks.map(task =>
            task.id === editingTodayTaskId ? { ...task, text: editingTodayTaskText.trim() } : task
          ));
        }
      } catch (error) {
        console.error('Failed to update today\'s task:', error);
      }
    }

    setEditingTodayTaskId(null);
    setEditingTodayTaskText("");
  };

  const handleCancelEditingTodayTask = () => {
    setEditingTodayTaskId(null);
    setEditingTodayTaskText("");
  };

  // Handle editing time for a task
  const handleStartEditingTime = (task: PlannerItem) => {
    setEditingTimeTaskId(task.id);

    if (task.startTime) {
      const { hours, minutes } = parseTimeInput(task.startTime.split(':')[0] + ':' + task.startTime.split(':')[1]);
      const hour = parseInt(hours);
      const isPM = hour >= 12;
      const hour12 = hour % 12 || 12;
      setEditingStartTime(`${hour12}:${minutes}`);
      setEditingStartAmPm(isPM ? 'PM' : 'AM');
    } else {
      setEditingStartTime('');
      setEditingStartAmPm('AM');
    }

    if (task.endTime) {
      const { hours, minutes } = parseTimeInput(task.endTime.split(':')[0] + ':' + task.endTime.split(':')[1]);
      const hour = parseInt(hours);
      const isPM = hour >= 12;
      const hour12 = hour % 12 || 12;
      setEditingEndTime(`${hour12}:${minutes}`);
      setEditingEndAmPm(isPM ? 'PM' : 'AM');
    } else {
      setEditingEndTime('');
      setEditingEndAmPm('PM');
    }
  };

  const handleSaveEditingTime = (overrideStartAmPm?: "AM" | "PM", overrideEndAmPm?: "AM" | "PM") => {
    if (!editingTimeTaskId) return;

    const plannerDataStr = getString(StorageKeys.plannerData);
    if (plannerDataStr) {
      try {
        const plannerData = JSON.parse(plannerDataStr);
        const today = getDateString(new Date());
        const todayIndex = plannerData.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
          // Use override values if provided, otherwise use state
          const startAmPm = overrideStartAmPm ?? editingStartAmPm;
          const endAmPm = overrideEndAmPm ?? editingEndAmPm;

          // Convert times, use defaults if empty (9:00 AM - 5:00 PM)
          const startTime24 = editingStartTime ? convertTo24Hour(editingStartTime, startAmPm) : '09:00';
          const endTime24 = editingEndTime ? convertTo24Hour(editingEndTime, endAmPm) : '17:00';

          const updatedPlannerData = [...plannerData];
          updatedPlannerData[todayIndex] = {
            ...updatedPlannerData[todayIndex],
            items: updatedPlannerData[todayIndex].items.map((item: PlannerItem) =>
              item.id === editingTimeTaskId ? { ...item, startTime: startTime24, endTime: endTime24 } : item
            )
          };

          setJSON(StorageKeys.plannerData, updatedPlannerData);
          emit(window, EVENTS.plannerDataUpdated, updatedPlannerData);

          // Update local state
          setTodaysTasks(todaysTasks.map(task =>
            task.id === editingTimeTaskId ? { ...task, startTime: startTime24, endTime: endTime24 } : task
          ));
        }
      } catch (error) {
        console.error('Failed to update task time:', error);
      }
    }

    setEditingTimeTaskId(null);
    setEditingStartTime('');
    setEditingStartAmPm('AM');
    setEditingEndTime('');
    setEditingEndAmPm('PM');
  };

  const handleCancelEditingTime = () => {
    setEditingTimeTaskId(null);
    setEditingStartTime('');
    setEditingStartAmPm('AM');
    setEditingEndTime('');
    setEditingEndAmPm('PM');
  };

  // Handle deleting a task from today's tasks
  const handleDeleteTodayTask = (taskId: string) => {
    const plannerDataStr = getString(StorageKeys.plannerData);
    if (plannerDataStr) {
      try {
        const plannerData = JSON.parse(plannerDataStr);
        const today = getDateString(new Date());
        const todayIndex = plannerData.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
          const updatedPlannerData = [...plannerData];
          updatedPlannerData[todayIndex] = {
            ...updatedPlannerData[todayIndex],
            items: updatedPlannerData[todayIndex].items.filter((item: PlannerItem) => item.id !== taskId)
          };

          setJSON(StorageKeys.plannerData, updatedPlannerData);
          emit(window, EVENTS.plannerDataUpdated, updatedPlannerData);

          // Update local state
          setTodaysTasks(todaysTasks.filter(task => task.id !== taskId));
        }
      } catch (error) {
        console.error('Failed to delete today\'s task:', error);
      }
    }
  };

  // Helper to format time from 24h to 12h format
  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper to parse and format time input
  const parseTimeInput = (input: string) => {
    if (!input) return { hours: '', minutes: '' };

    // Remove any non-digit characters except colon
    const cleaned = input.replace(/[^\d:]/g, '');

    // Handle different input formats
    if (cleaned.includes(':')) {
      // Format: "1:30" or "01:30"
      const [h, m] = cleaned.split(':');
      return {
        hours: h,
        minutes: m || '00'
      };
    } else if (cleaned.length <= 2) {
      // Format: "1" or "12" (just hours)
      return {
        hours: cleaned,
        minutes: '00'
      };
    } else {
      // Format: "130" (1:30) or "1230" (12:30)
      const h = cleaned.slice(0, -2);
      const m = cleaned.slice(-2);
      return {
        hours: h,
        minutes: m
      };
    }
  };

  // Helper to convert 12h time with AM/PM to 24h format
  const convertTo24Hour = (time12: string, ampm: "AM" | "PM") => {
    if (!time12) return '';

    const { hours, minutes } = parseTimeInput(time12);
    let hour = parseInt(hours);

    if (isNaN(hour)) return '';

    // Validate hour is in 12-hour format (1-12)
    // If user enters 13-23, wrap to 1-11 (they probably meant 1:30 not 13:30 with AM/PM)
    if (hour > 12) {
      hour = hour % 12;
      if (hour === 0) hour = 12;
    }

    // Ensure hour is at least 1
    if (hour < 1) hour = 1;

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Handle adding today's task
  const handleAddTodayTask = () => {
    if (!newTodayTaskText.trim()) return;

    const plannerDataStr = getString(StorageKeys.plannerData);
    const plannerData = plannerDataStr ? JSON.parse(plannerDataStr) : [];
    const today = getDateString(new Date());
    const todayIndex = plannerData.findIndex((day: any) => day.date === today);

    // Convert 12-hour time to 24-hour format, or use defaults if not provided
    // Default to 9:00 AM - 5:00 PM if no times specified
    let startTime24 = newTodayTaskStartTime ? convertTo24Hour(newTodayTaskStartTime, newTodayTaskStartAmPm) : '09:00';
    let endTime24 = newTodayTaskEndTime ? convertTo24Hour(newTodayTaskEndTime, newTodayTaskEndAmPm) : '17:00';

    const newTask: PlannerItem = {
      id: `task_${Date.now()}`,
      text: newTodayTaskText.trim(),
      section: 'morning',
      isCompleted: false,
      date: today,
      startTime: startTime24,
      endTime: endTime24,
      description: '',
      color: '#f3f4f6'
    };

    if (todayIndex >= 0) {
      // Day exists, add task to items
      plannerData[todayIndex].items = [...(plannerData[todayIndex].items || []), newTask];
    } else {
      // Create new day entry
      plannerData.push({
        date: today,
        items: [newTask],
        tasks: '',
        greatDay: '',
        grateful: ''
      });
    }

    setJSON(StorageKeys.plannerData, plannerData);
    emit(window, EVENTS.plannerDataUpdated, plannerData);

    // Update local state
    setTodaysTasks([...todaysTasks, newTask]);
    setNewTodayTaskText('');
    setNewTodayTaskStartTime('');
    setNewTodayTaskStartAmPm('AM');
    setNewTodayTaskEndTime('');
    setNewTodayTaskEndAmPm('PM');
    setIsAddingTodayTask(false);
  };


  // Save monthly goals to localStorage whenever they change
  useEffect(() => {
    try {
      setString(StorageKeys.monthlyGoalsData, JSON.stringify(monthlyGoalsData));
      // Dispatch custom event for same-tab sync with Strategy & Growth page
      emit(window, EVENTS.monthlyGoalsUpdated, monthlyGoalsData);
    } catch (error) {
      console.error('Failed to save monthly goals data:', error);
    }
  }, [monthlyGoalsData]);


  // Listen for storage events to sync between tabs/pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'monthlyGoalsData' && e.newValue) {
        try {
          setMonthlyGoalsData(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse monthly goals data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get monthly goals for the current month
  const getCurrentMonthGoals = (): MonthlyGoal[] => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    return monthlyGoalsData[year]?.[month] || [];
  };

  // Toggle monthly goal status (same system as in Growth Goals page)
  const handleToggleMonthlyGoal = (id: number) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const updatedGoals = currentGoals.map(g => {
      if (g.id === id) {
        // Cycle through statuses: not-started → in-progress → completed → not-started
        const nextStatus: GoalStatus =
          g.status === 'not-started' ? 'in-progress' :
          g.status === 'in-progress' ? 'completed' :
          'not-started';
        // Clear progressNote when leaving in-progress status
        if (g.status === 'in-progress' && nextStatus !== 'in-progress') {
          return { ...g, status: nextStatus, progressNote: undefined };
        }
        return { ...g, status: nextStatus };
      }
      return g;
    });

    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: updatedGoals
      }
    }));
  };

  // Update progress note for monthly goal
  const handleUpdateMonthlyProgressNote = (id: number, note: string) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const updatedGoals = currentGoals.map(g =>
      g.id === id ? { ...g, progressNote: note } : g
    );

    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: updatedGoals
      }
    }));
  };

  // Add new monthly goal
  const handleAddMonthlyGoal = () => {
    if (newMonthlyGoalText.trim()) {
      const year = getCurrentYear();
      const month = getCurrentMonth();
      const currentGoals = getCurrentMonthGoals();

      const newGoal: MonthlyGoal = {
        id: Date.now(),
        text: newMonthlyGoalText.trim(),
        status: 'not-started'
      };

      const updatedGoals = [...currentGoals, newGoal];

      setMonthlyGoalsData(prev => ({
        ...prev,
        [year]: {
          ...prev[year],
          [month]: updatedGoals
        }
      }));

      setNewMonthlyGoalText("");
      setIsAddingMonthlyGoal(false);
    }
  };

  // Edit monthly goal
  const handleEditMonthlyGoal = (id: number, newText: string) => {
    if (newText.trim()) {
      const year = getCurrentYear();
      const month = getCurrentMonth();
      const currentGoals = getCurrentMonthGoals();

      const updatedGoals = currentGoals.map(g =>
        g.id === id ? { ...g, text: newText.trim() } : g
      );

      setMonthlyGoalsData(prev => ({
        ...prev,
        [year]: {
          ...prev[year],
          [month]: updatedGoals
        }
      }));
    }
    setEditingMonthlyGoalId(null);
    setEditingMonthlyGoalText("");
  };

  // Delete monthly goal
  const handleDeleteMonthlyGoal = (id: number) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const updatedGoals = currentGoals.filter(g => g.id !== id);

    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: updatedGoals
      }
    }));
  };

  // Handle priority updates
  const handleUpdatePriority = (id: number, text: string) => {
    const updatedPriorities = priorities.map(p =>
      p.id === id ? { ...p, text: text } : p
    );
    setPriorities(updatedPriorities);
    setString('todaysPriorities', JSON.stringify(updatedPriorities));
  };

  // Toggle priority completion
  const handleTogglePriority = (id: number) => {
    const updatedPriorities = priorities.map(p =>
      p.id === id ? { ...p, isCompleted: !p.isCompleted } : p
    );
    setPriorities(updatedPriorities);
    setString('todaysPriorities', JSON.stringify(updatedPriorities));

    // Check if all priorities are now completed
    const allCompleted = updatedPriorities.every(p => p.isCompleted && p.text.trim() !== '');
    const wasCompleted = priorities.every(p => p.isCompleted && p.text.trim() !== '');

    // Only show celebration when transitioning from not-all-complete to all-complete
    if (allCompleted && !wasCompleted) {
      // Delay celebration by 500ms for better UX
      setTimeout(() => {
        setShowCelebration(true);
      }, 500);
    }
  };

  // Save priorities to localStorage whenever they change
  useEffect(() => {
    setString('todaysPriorities', JSON.stringify(priorities));
  }, [priorities]);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    setString('workHabits', JSON.stringify(habits));
  }, [habits]);

  // Habit Tracker Functions
  const getWeekDays = (offset: number = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (offset * 7));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(dateStr);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== dateStr)
            : [...habit.completedDates, dateStr]
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: `habit_${Date.now()}`,
        name: newHabitName.trim(),
        completedDates: []
      };

      // Add goal if target was specified
      if (newHabitGoalTarget && parseInt(newHabitGoalTarget) > 0) {
        newHabit.goal = {
          target: parseInt(newHabitGoalTarget),
          period: newHabitGoalPeriod
        };
      }

      setHabits(prev => [...prev, newHabit]);
      setNewHabitName("");
      setNewHabitGoalTarget("");
      setNewHabitGoalPeriod('week');
      setIsAddingHabit(false);
    }
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const startEditingHabit = (habitId: string, currentName: string) => {
    setEditingHabitId(habitId);
    setEditingHabitName(currentName);
  };

  const saveEditingHabit = () => {
    if (editingHabitId && editingHabitName.trim()) {
      setHabits(prev => prev.map(h =>
        h.id === editingHabitId
          ? { ...h, name: editingHabitName.trim() }
          : h
      ));
    }
    setEditingHabitId(null);
    setEditingHabitName("");
  };

  const cancelEditingHabit = () => {
    setEditingHabitId(null);
    setEditingHabitName("");
  };

  // Calculate progress for a habit based on its goal period
  const calculateHabitProgress = (habit: Habit): { completed: number; target: number } | null => {
    if (!habit.goal) return null;

    const { target, period } = habit.goal;
    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      // Use current week (Monday to Sunday)
      const currentDay = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Use current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const startStr = getDateString(startDate);
    const endStr = getDateString(endDate);

    const completed = habit.completedDates.filter(dateStr => {
      return dateStr >= startStr && dateStr <= endStr;
    }).length;

    return { completed, target };
  };

  // Determine progress color based on completion
  const getProgressColor = (completed: number, target: number): string => {
    if (completed >= target) return 'text-green-600';
    if (completed >= target * 0.5) return 'text-amber-500';
    return 'text-gray-400';
  };

  // Goal management functions
  const startEditingGoal = (habit: Habit) => {
    setEditingGoalHabitId(habit.id);
    setEditingGoalTarget(habit.goal?.target.toString() || "5");
    setEditingGoalPeriod(habit.goal?.period || 'week');
  };

  const saveGoal = () => {
    if (editingGoalHabitId) {
      const target = parseInt(editingGoalTarget);
      if (target > 0 && target <= 31) {
        setHabits(prev => prev.map(h =>
          h.id === editingGoalHabitId
            ? { ...h, goal: { target, period: editingGoalPeriod } }
            : h
        ));
      }
    }
    setEditingGoalHabitId(null);
  };

  const removeGoal = (habitId: string) => {
    setHabits(prev => prev.map(h =>
      h.id === habitId
        ? { ...h, goal: undefined }
        : h
    ));
    setEditingGoalHabitId(null);
  };

  // Handle drag and drop for pinned content cards
  const handleDragStart = (index: number) => {
    setDraggedCardIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverCardIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedCardIndex === null) return;

    const newPinnedContent = [...pinnedContent];
    const draggedCard = newPinnedContent[draggedCardIndex];

    // Remove the dragged card from its original position
    newPinnedContent.splice(draggedCardIndex, 1);

    // Insert it at the new position
    newPinnedContent.splice(dropIndex, 0, draggedCard);

    setPinnedContent(newPinnedContent);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);

    // Persist the new order to localStorage
    const productionData = getJSON('productionKanbanData') || { lists: [] };
    productionData.lists.forEach((list: ProductionList) => {
      list.cards.forEach((card: ProductionCard) => {
        // Update pinned status in the data based on new order
        const newIndex = newPinnedContent.findIndex(c => c.id === card.id);
        if (newIndex !== -1) {
          card.pinnedOrder = newIndex;
        }
      });
    });
    setJSON('productionKanbanData', productionData);
  };

  const handleDragEnd = () => {
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  // Navigation shortcuts
  const shortcuts = [
    { 
      title: "Plan your week", 
      icon: Calendar, 
      path: "/task-board?view=weekly-content-tasks",
      description: "Schedule your week ahead"
    },
    { 
      title: "Plan your day", 
      icon: CheckSquare, 
      path: "/task-board",
      description: "Organize today's tasks"
    },
    { 
      title: "Create a post", 
      icon: Edit, 
      path: "/bank-of-content",
      description: "Draft your next content piece"
    },
    { 
      title: "Check content calendar", 
      icon: Layers, 
      path: "/content-calendar",
      description: "View your content schedule"
    },
    { 
      title: "Check how your posts are doing", 
      icon: BarChart2, 
      path: "/analytics",
      description: "Monitor your performance"
    },
    { 
      title: "Build your personal brand", 
      icon: Award, 
      path: "/strategy-growth",
      description: "Develop your brand strategy"
    },
    { 
      title: "Manage your partnerships", 
      icon: Handshake, 
      path: "/partnerships-management",
      description: "Track your collaborations"
    },
    { 
      title: "Admin Hub", 
      icon: Settings, 
      path: "/settings",
      description: "Manage your account"
    }
  ];

  // Add Priority Dialog component is moved inside the main component
  return (
      <Layout>
        <ScrollArea className="h-full">
          <div className="container px-6 md:px-8 pt-0 pb-10">
            {/* Greeting Section - Top Banner */}
            <section className="mb-8 fade-in">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">{greeting}</h1>
                  <p className="text-sm text-muted-foreground">Welcome to your content hub—where you can operate, create, and grow intentionally. What would you like to create today?</p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm">
                  {greetingIcon}
                </div>
              </div>
            </section>

            {/* Grid Layout Container - Fixed positions, Pinterest style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-in items-start">
              {/* Left Column - Priorities, Next to Work On */}
              <div className="space-y-12">
              {/* Today's Top 3 Priorities Section */}
              <section className="mt-8">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Today's Top 3 Priorities
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">What matters most today?</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {priorities.map((priority, index) => {
                        const colors = [
                          { bg: 'bg-gradient-to-br from-blue-50/50 to-blue-100/30', border: 'border-blue-200', text: 'text-blue-800', number: 'bg-blue-400' },
                          { bg: 'bg-gradient-to-br from-amber-50/50 to-amber-100/30', border: 'border-amber-200', text: 'text-amber-800', number: 'bg-amber-400' },
                          { bg: 'bg-gradient-to-br from-purple-50/50 to-purple-100/30', border: 'border-purple-200', text: 'text-purple-800', number: 'bg-purple-400' }
                        ];
                        const color = colors[index];

                        return (
                          <div
                            key={priority.id}
                            className={`relative p-4 rounded-lg border ${color.border} ${color.bg} hover:shadow-md transition-all group`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color.number} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                {priority.id}
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingPriorityId === priority.id ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={priority.text}
                                    onChange={(e) => handleUpdatePriority(priority.id, e.target.value)}
                                    onBlur={() => setEditingPriorityId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingPriorityId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingPriorityId(null);
                                      }
                                    }}
                                    placeholder={`Priority ${priority.id}...`}
                                    className={`w-full bg-white/70 border-0 shadow-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1 text-sm ${color.text} font-medium placeholder:text-gray-400`}
                                  />
                                ) : (
                                  <div
                                    onClick={() => setEditingPriorityId(priority.id)}
                                    className={`cursor-pointer ${color.text} font-medium text-sm min-h-[28px] flex items-center ${
                                      !priority.text ? 'text-gray-400 italic' : ''
                                    } ${priority.isCompleted ? 'line-through text-gray-500' : ''}`}
                                  >
                                    {priority.text || `Click to set priority ${priority.id}...`}
                                  </div>
                                )}
                              </div>
                              <Checkbox
                                checked={priority.isCompleted}
                                onCheckedChange={() => handleTogglePriority(priority.id)}
                                className="h-5 w-5 rounded data-[state=checked]:bg-green-500 data-[state=checked]:text-white border-gray-300 flex-shrink-0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Celebration - Inline between sections */}
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="my-8"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px] shadow-2xl">
                      <div className="relative bg-white rounded-2xl p-6">
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute"
                              initial={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                scale: 0
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360]
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 1
                              }}
                            >
                              <div className="text-2xl opacity-20">
                                {['✨', '⭐', '🎉', '💫'][i % 4]}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-4">
                          <motion.div
                            animate={{
                              rotate: [0, -10, 10, -10, 0],
                              scale: [1, 1.1, 1, 1.1, 1]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                            className="flex-shrink-0"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                              <span className="text-3xl">🎉</span>
                            </div>
                          </motion.div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                              Amazing Work!
                            </h3>
                            <p className="text-gray-700 text-sm">
                              You've completed all your top priorities for today. Keep crushing it! 💪
                            </p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCelebration(false)}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            ✕
                          </motion.button>
                        </div>

                        {/* Progress indicator */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 3.5, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next to Work On Section */}
              <section className="mt-48 pt-12">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Pin className="h-5 w-5 text-amber-600" />
                      Next to Work On
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isUsingPlaceholders
                        ? "Get started by pinning content from your Content Hub"
                        : pinnedContent.some(c => c.isPinned)
                          ? "Pinned content cards from your Content Hub"
                          : "Recent content from your Content Hub"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {pinnedContent.slice(0, pinnedContent.some(c => c.isPinned) ? 5 : 3).map((content, index) => {
                        // Create rotation pattern: left, right, straight, left, right...
                        const rotations = [-2.5, 1.8, 0, -1.5, 2.2, -2, 1.5, 0, -2.8, 1.2];
                        const rotation = rotations[index % rotations.length];

                        // Add slight horizontal offsets for more organic feel
                        const xOffsets = ['-2%', '3%', '0%', '2%', '-3%', '-1%', '2.5%', '0%', '-2.5%', '1.5%'];
                        const xOffset = xOffsets[index % xOffsets.length];

                        return (
                        <div key={`card-wrapper-${content.id}`} className="relative">
                          {/* Insertion indicator - shows where card will be dropped */}
                          {dragOverCardIndex === index && draggedCardIndex !== null && draggedCardIndex !== index && (
                            <div className="absolute -top-4 left-0 right-0 flex justify-center z-30">
                              <div className="w-[85%] h-1 bg-amber-500 rounded-full shadow-lg animate-pulse"></div>
                            </div>
                          )}

                        <div
                          key={content.id}
                          draggable={true}
                          onDragStart={(e) => {
                            handleDragStart(index);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDragOver(e, index);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDrop(e, index);
                          }}
                          onDragEnd={handleDragEnd}
                          className={`relative group mb-4 transition-all ${draggedCardIndex === index ? 'opacity-40 scale-95' : ''}`}
                          style={{
                            transform: draggedCardIndex === index ? 'rotate(0deg)' : `rotate(${rotation}deg) translateX(${xOffset})`,
                            transition: 'all 0.3s ease',
                            cursor: 'grab'
                          }}
                        >
                          {/* Pin visual at the top */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                            <Pin className="h-6 w-6 text-amber-500 fill-amber-400 drop-shadow-md rotate-45" />
                          </div>

                          {/* Priority Number Badge */}
                          <div className="absolute -top-1 -left-1 z-20 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center text-base font-bold shadow-lg ring-2 ring-white ring-offset-0">
                            {index + 1}
                          </div>

                          {/* Content card with pinned effect */}
                          <div
                            className={`relative bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-4 pt-6 pb-3 shadow-md hover:shadow-xl transition-all max-w-[85%] mx-auto min-h-[80px] ${isUsingPlaceholders ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
                            style={{
                              transform: 'none',
                              pointerEvents: draggedCardIndex === index ? 'none' : 'auto'
                            }}
                            onClick={() => {
                              if (isUsingPlaceholders) {
                                navigate('/production');
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (draggedCardIndex === null) {
                                e.currentTarget.parentElement!.style.transform = `rotate(0deg) translateX(0%) translateY(-4px)`;
                                e.currentTarget.parentElement!.style.zIndex = '10';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (draggedCardIndex === null) {
                                e.currentTarget.parentElement!.style.transform = `rotate(${rotation}deg) translateX(${xOffset})`;
                                e.currentTarget.parentElement!.style.zIndex = '';
                              }
                            }}
                          >
                            {/* Tape effect at top corners */}
                            <div className="absolute top-0 left-0 w-8 h-6 bg-amber-100/60 border border-amber-200 -rotate-12 -translate-x-1 -translate-y-2"></div>
                            <div className="absolute top-0 right-0 w-8 h-6 bg-amber-100/60 border border-amber-200 rotate-12 translate-x-1 -translate-y-2"></div>

                            {/* Content */}
                            <div className="space-y-2 pb-6">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                                  {content.title || "Untitled Content"}
                                </h3>
                              </div>

                              {(content.formats || content.platforms) && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {content.formats?.map((format, idx) => (
                                    <span key={`format-${idx}`} className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                      {format}
                                    </span>
                                  ))}
                                  {content.platforms?.map((platform, idx) => (
                                    <span key={`platform-${idx}`} className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {content.hook && (
                                <p className="text-xs text-gray-600 line-clamp-2 italic">
                                  "{content.hook}"
                                </p>
                              )}

                              {content.script && (
                                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-amber-200 line-clamp-2">
                                  {content.script}
                                </p>
                              )}

                              {content.description && (
                                <p className={`text-xs text-gray-500 mt-2 pt-2 border-t border-amber-200 ${isUsingPlaceholders ? '' : 'line-clamp-2'}`}>
                                  {content.description}
                                </p>
                              )}

                              {content.status && (
                                <div className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  content.status === 'to-start' ? 'bg-gray-200 text-gray-700' :
                                  content.status === 'needs-work' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {content.status === 'to-start' ? 'To start' :
                                   content.status === 'needs-work' ? 'Needs more work' :
                                   'Ready to film'}
                                </div>
                              )}

                              {/* Column/Stage indicator */}
                              {content.columnName && !isUsingPlaceholders && (() => {
                                const tagStyle = getColumnTagStyle(content.columnId);
                                return (
                                  <div className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${tagStyle.bg} ${tagStyle.text} border ${tagStyle.border}`}>
                                    {tagStyle.emoji} {tagStyle.displayName || content.columnName}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Click hint */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/production');
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                {isUsingPlaceholders ? 'Start Creating' : 'View'} <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Work Habits Section */}
              <section className="mt-12">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Work Habits
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingHabit(true)}
                        className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Habit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Week Navigation */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHabitWeekOffset(prev => prev - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-medium text-gray-700">
                        {habitWeekOffset === 0 ? 'This Week' :
                         habitWeekOffset === -1 ? 'Last Week' :
                         habitWeekOffset === 1 ? 'Next Week' :
                         `Week ${habitWeekOffset > 0 ? '+' + habitWeekOffset : habitWeekOffset}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHabitWeekOffset(prev => prev + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Habits Grid */}
                    {habits.length > 0 || isAddingHabit ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50/50">
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 sticky left-0 bg-gray-50/50 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">Habit</th>
                              {getWeekDays(habitWeekOffset).map((day, idx) => {
                                const isToday = getDateString(day) === getDateString(new Date());
                                return (
                                  <th key={idx} className="text-center px-0.5 py-2 w-10">
                                    <div className={`text-[9px] font-medium ${isToday ? 'text-green-600' : 'text-gray-600'}`}>
                                      {format(day, 'EEE')}
                                    </div>
                                    <div className={`text-[10px] ${isToday ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                      {format(day, 'd')}
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {habits.map((habit, habitIdx) => (
                              <tr key={habit.id} className={`border-b hover:bg-gray-50/50 transition-colors group ${habitIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className={`px-3 py-2 text-sm font-medium text-gray-800 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] ${habitIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center flex-1 min-w-0">
                                      {editingHabitId === habit.id ? (
                                        <Input
                                          autoFocus
                                          value={editingHabitName}
                                          onChange={(e) => setEditingHabitName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditingHabit();
                                            if (e.key === 'Escape') cancelEditingHabit();
                                          }}
                                          onBlur={saveEditingHabit}
                                          className="flex-1 h-7 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span
                                            className="truncate cursor-pointer hover:text-green-600 transition-colors"
                                            onClick={() => startEditingHabit(habit.id, habit.name)}
                                          >
                                            {habit.name}
                                          </span>
                                          {/* Goal Progress Indicator */}
                                          {(() => {
                                            const progress = calculateHabitProgress(habit);
                                            if (!progress) return null;
                                            const { completed, target } = progress;
                                            return (
                                              <span
                                                className={`text-[10px] font-medium ${getProgressColor(completed, target)} flex-shrink-0`}
                                                title={`${completed}/${target} ${habit.goal?.period === 'week' ? 'this week' : 'this month'}`}
                                              >
                                                {completed}/{target}
                                              </span>
                                            );
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                    {/* Goal Edit Button with Popover */}
                                    <Popover
                                      open={editingGoalHabitId === habit.id}
                                      onOpenChange={(open) => {
                                        if (open) startEditingGoal(habit);
                                        else setEditingGoalHabitId(null);
                                      }}
                                    >
                                      <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <PopoverTrigger asChild>
                                              <button
                                                className={`${habit.goal ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-gray-400 hover:text-green-600 flex-shrink-0`}
                                              >
                                                <Target className="h-3 w-3" />
                                              </button>
                                            </PopoverTrigger>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs px-2 py-1 min-w-0">
                                            Set goal
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-xl rounded-xl" align="start" sideOffset={8}>
                                        <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                              <Target className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                              <div className="text-sm font-semibold text-gray-900">Set Goal</div>
                                              <div className="text-[10px] text-gray-500">Track your progress</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Input
                                              type="number"
                                              min="1"
                                              max="31"
                                              value={editingGoalTarget}
                                              onChange={(e) => setEditingGoalTarget(e.target.value)}
                                              className="h-10 w-16 text-center text-lg font-semibold border-gray-200 rounded-lg"
                                              placeholder="5"
                                            />
                                            <span className="text-sm text-gray-600">days per</span>
                                            <Select
                                              value={editingGoalPeriod}
                                              onValueChange={(v: 'week' | 'month') => setEditingGoalPeriod(v)}
                                            >
                                              <SelectTrigger className="h-10 w-24 text-sm font-medium border-gray-200 rounded-lg">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="week">week</SelectItem>
                                                <SelectItem value="month">month</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={saveGoal}
                                              className="h-9 text-sm font-medium bg-green-600 hover:bg-green-700 flex-1 rounded-lg shadow-sm"
                                            >
                                              Save Goal
                                            </Button>
                                            {habit.goal && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeGoal(habit.id)}
                                                className="h-9 text-sm font-medium text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg"
                                              >
                                                Remove
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <button
                                      onClick={() => deleteHabit(habit.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex-shrink-0"
                                      title="Delete habit"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                                {getWeekDays(habitWeekOffset).map((day, dayIdx) => {
                                  const dateStr = getDateString(day);
                                  const isCompleted = habit.completedDates.includes(dateStr);
                                  const isToday = dateStr === getDateString(new Date());

                                  return (
                                    <td key={dayIdx} className="text-center px-0.5 py-1">
                                      <button
                                        onClick={() => toggleHabit(habit.id, dateStr)}
                                        className={`w-6 h-6 rounded border transition-all ${
                                          isCompleted
                                            ? 'bg-green-500 border-green-500 text-white shadow-sm hover:bg-green-600'
                                            : isToday
                                            ? 'border-green-300 hover:border-green-400 hover:bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        {isCompleted && (
                                          <svg className="w-3.5 h-3.5 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                          </svg>
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}

                            {/* Add Habit Row */}
                            {isAddingHabit && (
                              <tr className="border-b bg-green-50/30">
                                <td className="px-3 py-2 sticky left-0 bg-green-50/30 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" colSpan={8}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Input
                                      autoFocus
                                      placeholder="Enter habit name..."
                                      value={newHabitName}
                                      onChange={(e) => setNewHabitName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') addHabit();
                                        if (e.key === 'Escape') {
                                          setIsAddingHabit(false);
                                          setNewHabitName("");
                                          setNewHabitGoalTarget("");
                                        }
                                      }}
                                      className="flex-1 h-8 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
                                    />
                                    {/* Optional Goal Setting */}
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <span>Goal:</span>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        placeholder="5"
                                        value={newHabitGoalTarget}
                                        onChange={(e) => setNewHabitGoalTarget(e.target.value)}
                                        className="h-7 w-12 text-xs px-2"
                                      />
                                      <span>/</span>
                                      <Select
                                        value={newHabitGoalPeriod}
                                        onValueChange={(v: 'week' | 'month') => setNewHabitGoalPeriod(v)}
                                      >
                                        <SelectTrigger className="h-7 w-16 text-xs border-gray-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="week">week</SelectItem>
                                          <SelectItem value="month">month</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={addHabit}
                                      className="h-8 px-4 text-sm bg-green-600 hover:bg-green-700"
                                    >
                                      Add
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setIsAddingHabit(false);
                                        setNewHabitName("");
                                        setNewHabitGoalTarget("");
                                      }}
                                      className="h-8 px-3 text-sm"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-4">No habits yet. Start tracking your work habits!</p>
                        <Button
                          size="sm"
                          onClick={() => setIsAddingHabit(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Your First Habit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              </div>
              {/* End Left Column */}

              {/* Right Column - Today's Tasks, Mission Statement, Monthly Goals, Content Calendar */}
              <div className="space-y-12">

              {/* Today's Tasks Section */}
              <section className="mt-24">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                        Today's Tasks
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingTodayTask(true)}
                          className="h-7 w-7 p-0"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                        </Button>
                        {todaysTasks.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/task-board?view=today')}
                            className="h-7 text-xs px-2"
                          >
                            View All →
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 pb-4">
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-2">
                        {todaysTasks.length === 0 && !isAddingTodayTask ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckSquare className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No tasks scheduled for today</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/task-board?view=today')}
                              className="mt-3"
                            >
                              Plan Your Day
                            </Button>
                          </div>
                        ) : todaysTasks.length > 0 ? (
                          todaysTasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded group"
                              style={{
                                backgroundColor: task.color ? `${task.color}15` : 'transparent'
                              }}
                            >
                              <Checkbox
                                id={`today-task-${task.id}`}
                                checked={task.isCompleted}
                                onCheckedChange={() => handleToggleTodayTask(task.id)}
                                className="h-4 w-4 rounded mt-0.5 flex-shrink-0 data-[state=checked]:bg-green-500 data-[state=checked]:text-white border-gray-300"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  {editingTodayTaskId === task.id ? (
                                    <Input
                                      autoFocus
                                      value={editingTodayTaskText}
                                      onChange={(e) => setEditingTodayTaskText(e.target.value)}
                                      onBlur={handleSaveEditingTodayTask}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveEditingTodayTask();
                                        } else if (e.key === 'Escape') {
                                          handleCancelEditingTodayTask();
                                        }
                                      }}
                                      className="text-sm flex-1 border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
                                    />
                                  ) : (
                                    <span
                                      onClick={() => handleStartEditingTodayTask(task)}
                                      className={`text-sm cursor-pointer ${
                                        task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                      }`}
                                    >
                                      {task.text}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-3">
                                    {editingTimeTaskId === task.id ? (
                                      <div ref={timeEditorRef} className="flex items-center gap-1 time-editor">
                                        <Input
                                          ref={editStartTimeInputRef}
                                          autoFocus
                                          type="text"
                                          value={editingStartTime}
                                          onChange={(e) => {
                                            const input = e.target.value;
                                            if (input === '' || /^[\d:]+$/.test(input)) {
                                              setEditingStartTime(input);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              // Format before moving to next field
                                              const { hours, minutes } = parseTimeInput(editingStartTime);
                                              if (hours) {
                                                setEditingStartTime(`${hours}:${minutes}`);
                                              }
                                              // Move to AM/PM dropdown instead of saving
                                              editStartAmPmButtonRef.current?.click();
                                            } else if (e.key === 'Escape') {
                                              handleCancelEditingTime();
                                            }
                                          }}
                                          placeholder="9:00"
                                          className="text-xs h-6 w-12 border-0 shadow-none focus-visible:ring-0 p-0 text-center bg-transparent"
                                        />
                                        <Select
                                          value={editingStartAmPm}
                                          onValueChange={(value: "AM" | "PM") => {
                                            setEditingStartAmPm(value);
                                            // After changing AM/PM, move to end time
                                            setTimeout(() => editEndTimeInputRef.current?.focus(), 0);
                                          }}
                                          onOpenChange={(open) => {
                                            setIsSelectOpen(open);
                                          }}
                                        >
                                          <SelectTrigger
                                            ref={editStartAmPmButtonRef}
                                            className="h-6 w-10 text-xs border-0 shadow-none focus:ring-0 p-0"
                                            onPointerDown={(e) => {
                                              e.stopPropagation();
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                // Move to end time instead of saving
                                                editEndTimeInputRef.current?.focus();
                                              } else if (e.key === 'Escape') {
                                                handleCancelEditingTime();
                                              }
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="AM">AM</SelectItem>
                                            <SelectItem value="PM">PM</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <span className="text-xs">-</span>
                                        <Input
                                          ref={editEndTimeInputRef}
                                          type="text"
                                          value={editingEndTime}
                                          onChange={(e) => {
                                            const input = e.target.value;
                                            if (input === '' || /^[\d:]+$/.test(input)) {
                                              setEditingEndTime(input);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              // Format before moving to next field
                                              const { hours, minutes } = parseTimeInput(editingEndTime);
                                              if (hours) {
                                                setEditingEndTime(`${hours}:${minutes}`);
                                              }
                                              // Move to end AM/PM dropdown instead of saving
                                              editEndAmPmButtonRef.current?.click();
                                            } else if (e.key === 'Escape') {
                                              handleCancelEditingTime();
                                            }
                                          }}
                                          placeholder="5:00"
                                          className="text-xs h-6 w-12 border-0 shadow-none focus-visible:ring-0 p-0 text-center bg-transparent"
                                        />
                                        <Select
                                          value={editingEndAmPm}
                                          onValueChange={(value: "AM" | "PM") => {
                                            setEditingEndAmPm(value);
                                            // After changing end AM/PM, save with the new value
                                            setTimeout(() => handleSaveEditingTime(editingStartAmPm, value), 0);
                                          }}
                                          onOpenChange={(open) => {
                                            setIsSelectOpen(open);
                                          }}
                                        >
                                          <SelectTrigger
                                            ref={editEndAmPmButtonRef}
                                            className="h-6 w-10 text-xs border-0 shadow-none focus:ring-0 p-0"
                                            onPointerDown={(e) => {
                                              e.stopPropagation();
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                // Now save since this is the last field
                                                handleSaveEditingTime();
                                              } else if (e.key === 'Escape') {
                                                handleCancelEditingTime();
                                              }
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="AM">AM</SelectItem>
                                            <SelectItem value="PM">PM</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : (
                                      task.startTime && (
                                        <span
                                          onClick={() => handleStartEditingTime(task)}
                                          className="text-xs font-medium text-blue-600 whitespace-nowrap cursor-pointer hover:underline"
                                        >
                                          {formatTime(task.startTime)}
                                          {task.endTime && ` - ${formatTime(task.endTime)}`}
                                        </span>
                                      )
                                    )}
                                    <button
                                      onClick={() => handleDeleteTodayTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded"
                                      title="Delete task"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : null}

                        {/* Add Task Form - appears after tasks */}
                        {isAddingTodayTask && (
                          <div ref={addTaskFormRef} className="flex items-start gap-3 p-2">
                            <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 border border-gray-300" />
                            <div className="flex-1 min-w-0 space-y-2">
                              <Input
                                autoFocus
                                value={newTodayTaskText}
                                onChange={(e) => setNewTodayTaskText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Move to start time input
                                    startTimeInputRef.current?.focus();
                                  } else if (e.key === 'Escape') {
                                    setIsAddingTodayTask(false);
                                    setNewTodayTaskText('');
                                    setNewTodayTaskStartTime('');
                                    setNewTodayTaskStartAmPm('AM');
                                    setNewTodayTaskEndTime('');
                                    setNewTodayTaskEndAmPm('PM');
                                  }
                                }}
                                placeholder="Task name..."
                                className="text-sm flex-1 border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
                              />
                              <div className="flex items-center gap-2 text-xs">
                                <Input
                                  ref={startTimeInputRef}
                                  type="text"
                                  value={newTodayTaskStartTime}
                                  onChange={(e) => {
                                    const input = e.target.value;
                                    // Allow digits, colon, and empty
                                    if (input === '' || /^[\d:]+$/.test(input)) {
                                      setNewTodayTaskStartTime(input);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    // Format the time on blur
                                    const { hours, minutes } = parseTimeInput(e.target.value);
                                    if (hours) {
                                      setNewTodayTaskStartTime(`${hours}:${minutes}`);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      // Format before moving to next field
                                      const { hours, minutes } = parseTimeInput(newTodayTaskStartTime);
                                      if (hours) {
                                        setNewTodayTaskStartTime(`${hours}:${minutes}`);
                                      }
                                      startAmPmButtonRef.current?.click();
                                    }
                                  }}
                                  placeholder="9:00"
                                  className="text-xs h-7 border-0 border-b border-gray-300 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-400 w-14 px-0 text-center"
                                />
                                <Select
                                  value={newTodayTaskStartAmPm}
                                  onValueChange={(value: "AM" | "PM") => {
                                    setNewTodayTaskStartAmPm(value);
                                    // Move to next field after selection
                                    setTimeout(() => endTimeInputRef.current?.focus(), 0);
                                  }}
                                >
                                  <SelectTrigger
                                    ref={startAmPmButtonRef}
                                    className="h-7 w-14 text-xs border-0 border-b border-gray-300 rounded-none shadow-none focus:ring-0"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        endTimeInputRef.current?.focus();
                                      }
                                    }}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="text-xs text-gray-400">-</span>
                                <Input
                                  ref={endTimeInputRef}
                                  type="text"
                                  value={newTodayTaskEndTime}
                                  onChange={(e) => {
                                    const input = e.target.value;
                                    // Allow digits, colon, and empty
                                    if (input === '' || /^[\d:]+$/.test(input)) {
                                      setNewTodayTaskEndTime(input);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    // Format the time on blur
                                    const { hours, minutes } = parseTimeInput(e.target.value);
                                    if (hours) {
                                      setNewTodayTaskEndTime(`${hours}:${minutes}`);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      // Format before moving to next field
                                      const { hours, minutes } = parseTimeInput(newTodayTaskEndTime);
                                      if (hours) {
                                        setNewTodayTaskEndTime(`${hours}:${minutes}`);
                                      }
                                      endAmPmButtonRef.current?.click();
                                    }
                                  }}
                                  placeholder="5:00"
                                  className="text-xs h-7 border-0 border-b border-gray-300 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-400 w-14 px-0 text-center"
                                />
                                <Select
                                  value={newTodayTaskEndAmPm}
                                  onValueChange={(value: "AM" | "PM") => {
                                    setNewTodayTaskEndAmPm(value);
                                    // Submit after selection
                                    setTimeout(() => handleAddTodayTask(), 0);
                                  }}
                                >
                                  <SelectTrigger
                                    ref={endAmPmButtonRef}
                                    className="h-7 w-14 text-xs border-0 border-b border-gray-300 rounded-none shadow-none focus:ring-0"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTodayTask();
                                      }
                                    }}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    {todaysTasks.length > 0 && (() => {
                      const progress = Math.round((todaysTasks.filter(t => t.isCompleted).length / todaysTasks.length) * 100);

                      // Determine color based on progress
                      let colorClass = '';
                      let textColorClass = '';

                      if (progress === 100) {
                        colorClass = 'bg-gradient-to-r from-green-500 to-green-600';
                        textColorClass = 'text-green-600';
                      } else if (progress >= 67) {
                        colorClass = 'bg-gradient-to-r from-yellow-400 to-green-500';
                        textColorClass = 'text-green-600';
                      } else {
                        colorClass = 'bg-gradient-to-r from-yellow-500 to-yellow-600';
                        textColorClass = 'text-yellow-600';
                      }

                      return (
                        <div className="space-y-1 mt-3 px-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className={`font-semibold ${textColorClass}`}>
                              {progress}% complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
                              style={{
                                width: `${progress}%`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </section>

              {/* Mission Statement Section */}
              <section className="mt-24 pt-16">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl relative">
                  <CardContent className="py-8 px-6">
                    {missionStatement ? (
                      <>
                        <div className="mb-8">
                          <span className="text-gray-400 text-xs">Mission Statement</span>
                        </div>
                        <div className="flex items-center justify-center min-h-[120px] py-4">
                          <p
                            className="text-2xl leading-relaxed text-gray-800 text-center font-serif italic"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {missionStatement}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/strategy-growth')}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            Edit →
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 flex flex-col items-center">
                        <p className="text-base text-gray-400 italic text-center">
                          Your mission statement will appear here as a daily reminder
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/strategy-growth')}
                          className="h-7 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Mission Statement
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Monthly Goals Section */}
              <section className="mt-24 pt-16">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Monthly Goals - {getCurrentMonth()}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => navigate('/strategy-growth?tab=growth-goals')}
                      >
                        View All →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px]">
                      <div className="space-y-2 pr-4">
                        {getCurrentMonthGoals().slice(0, 8).map((goal) => (
                          <div key={goal.id}>
                            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded group">
                              <button
                                onClick={() => handleToggleMonthlyGoal(goal.id)}
                                className={`h-4 w-4 rounded mr-2 mt-0.5 flex-shrink-0 border-2 transition-colors flex items-center justify-center ${
                                  goal.status === 'completed'
                                    ? 'bg-green-500 border-green-500'
                                    : goal.status === 'in-progress'
                                    ? 'bg-yellow-400 border-yellow-400'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {goal.status === 'completed' && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {goal.status === 'in-progress' && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                )}
                              </button>
                              {editingMonthlyGoalId === goal.id ? (
                                <Input
                                  value={editingMonthlyGoalText}
                                  onChange={(e) => setEditingMonthlyGoalText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditMonthlyGoal(goal.id, editingMonthlyGoalText);
                                    } else if (e.key === 'Escape') {
                                      setEditingMonthlyGoalId(null);
                                      setEditingMonthlyGoalText("");
                                    }
                                  }}
                                  onBlur={() => handleEditMonthlyGoal(goal.id, editingMonthlyGoalText)}
                                  className="flex-1 text-sm h-7"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onDoubleClick={() => {
                                    setEditingMonthlyGoalId(goal.id);
                                    setEditingMonthlyGoalText(goal.text);
                                  }}
                                  className={`flex-1 text-sm cursor-pointer ${
                                    goal.status === 'completed' ? 'line-through text-gray-500' : ''
                                  }`}
                                >
                                  {goal.text}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMonthlyGoal(goal.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {goal.status === 'in-progress' && showProgressNotesForGoalId === goal.id && (
                              <div className="ml-8 mr-8">
                                <Input
                                  value={goal.progressNote || ""}
                                  onChange={(e) => handleUpdateMonthlyProgressNote(goal.id, e.target.value)}
                                  placeholder="Progress notes..."
                                  className="text-xs bg-yellow-50/50 border-yellow-200/60 placeholder:text-yellow-600/60"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {isAddingMonthlyGoal ? (
                      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-white mt-4">
                        <div className="h-4 w-4 rounded mr-2 mt-0.5 flex-shrink-0 border-2 border-gray-300"></div>
                        <Input
                          value={newMonthlyGoalText}
                          onChange={(e) => setNewMonthlyGoalText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddMonthlyGoal();
                            } else if (e.key === 'Escape') {
                              setIsAddingMonthlyGoal(false);
                              setNewMonthlyGoalText("");
                            }
                          }}
                          onBlur={() => {
                            if (!newMonthlyGoalText.trim()) {
                              setIsAddingMonthlyGoal(false);
                            }
                          }}
                          placeholder="Add goal for this month..."
                          className="flex-1 text-sm h-7 border-0 shadow-none focus-visible:ring-0"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingMonthlyGoal(true)}
                        className="flex items-center justify-center w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors mt-4"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Goal
                      </button>
                    )}

                    {getCurrentMonthGoals().length > 8 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{getCurrentMonthGoals().length - 8} more goals
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>
              </div>
              {/* End Right Column */}

            </div>
            {/* End Grid Container */}

            {/* Content Calendar - Full Width */}
            <section className="mt-12">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white via-purple-50/20 to-blue-50/30 rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Content Calendar
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCalendarCurrentMonth(new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() - 1))}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          {format(calendarCurrentMonth, 'MMMM yyyy')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCalendarCurrentMonth(new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() + 1))}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 hover:bg-purple-100"
                      onClick={() => navigate('/task-board?view=calendar')}
                    >
                      View Full Calendar →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="space-y-2">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const monthStart = startOfMonth(calendarCurrentMonth);
                        const monthEnd = endOfMonth(calendarCurrentMonth);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const days = eachDayOfInterval({ start: startDate, end: endDate });

                        return days.map(day => {
                          const dayString = getDateString(day);
                          const dayTasks = contentCalendarData.filter(task => task.date === dayString);
                          const isCurrentMonth = day.getMonth() === calendarCurrentMonth.getMonth();
                          const isToday = isSameDay(day, new Date());

                          return (
                            <div
                              key={dayString}
                              className={`min-h-[80px] p-2 rounded-lg border transition-all ${
                                isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-100'
                              } ${isToday ? 'ring-2 ring-purple-400' : ''} hover:shadow-sm cursor-pointer`}
                              onClick={() => navigate('/task-board?view=calendar')}
                            >
                              <div className={`text-xs font-medium mb-1 ${
                                isToday ? 'text-purple-600 font-bold' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                              }`}>
                                {format(day, 'd')}
                              </div>
                              <div className="space-y-1">
                                {dayTasks.slice(0, 2).map(task => (
                                  <div
                                    key={task.id}
                                    className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                                      task.color ? `bg-${task.color}-100 text-${task.color}-700` : 'bg-purple-100 text-purple-700'
                                    }`}
                                    title={task.text}
                                  >
                                    {task.text}
                                  </div>
                                ))}
                                {dayTasks.length > 2 && (
                                  <div className="text-[9px] text-gray-500 pl-1">
                                    +{dayTasks.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Empty State */}
                  {contentCalendarData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm mb-2">No content scheduled yet</p>
                      <p className="text-xs text-gray-400">
                        Go to <button onClick={() => navigate('/production?scrollTo=to-schedule')} className="text-purple-600 hover:underline">Content Hub</button> to schedule content
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </ScrollArea>

      </Layout>
  );
};

export default HomePage;
