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
  ArrowRight
} from "lucide-react";
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
  const addTaskFormRef = useRef<HTMLDivElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const startAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const endAmPmButtonRef = useRef<HTMLButtonElement>(null);

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

  // Mission Statement and Vision Board from Strategy & Growth
  const [missionStatement, setMissionStatement] = useState("");
  const [visionBoardImages, setVisionBoardImages] = useState<string[]>([]);

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

  // Set greeting based on time of day
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

      // Get all pinned cards from all columns
      const pinned: ProductionCard[] = [];
      productionData.forEach(column => {
        column.cards.forEach(card => {
          if (card.isPinned) {
            pinned.push(card);
          }
        });
      });

      setPinnedContent(pinned);
    };

    loadPinnedContent();

    // Listen for changes to production kanban data
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.productionKanban) {
        loadPinnedContent();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

  const handleSaveEditingTime = () => {
    if (!editingTimeTaskId) return;

    const plannerDataStr = getString(StorageKeys.plannerData);
    if (plannerDataStr) {
      try {
        const plannerData = JSON.parse(plannerDataStr);
        const today = getDateString(new Date());
        const todayIndex = plannerData.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
          // Convert times, use defaults if empty (9:00 AM - 5:00 PM)
          const startTime24 = editingStartTime ? convertTo24Hour(editingStartTime, editingStartAmPm) : '09:00';
          const endTime24 = editingEndTime ? convertTo24Hour(editingEndTime, editingEndAmPm) : '17:00';

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
  };

  // Save priorities to localStorage whenever they change
  useEffect(() => {
    setString('todaysPriorities', JSON.stringify(priorities));
  }, [priorities]);

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
        <ScrollArea className="h-screen">
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

            {/* Masonry Layout Container */}
            <div className="columns-1 md:columns-2 gap-8 fade-in">
              {/* Today's Tasks Section */}
              <section className="break-inside-avoid mb-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl rounded-2xl">
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
                                      <div className="flex items-center gap-1">
                                        <Input
                                          autoFocus
                                          type="text"
                                          value={editingStartTime}
                                          onChange={(e) => {
                                            const input = e.target.value;
                                            if (input === '' || /^[\d:]+$/.test(input)) {
                                              setEditingStartTime(input);
                                            }
                                          }}
                                          onBlur={(e) => {
                                            // Only save if clicking outside the time editing area
                                            const relatedTarget = e.relatedTarget as HTMLElement;
                                            if (!relatedTarget || !relatedTarget.closest('.time-editor')) {
                                              handleSaveEditingTime();
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleSaveEditingTime();
                                            } else if (e.key === 'Escape') {
                                              handleCancelEditingTime();
                                            }
                                          }}
                                          placeholder="9:00"
                                          className="text-xs h-6 w-12 border-0 shadow-none focus-visible:ring-0 p-0 text-center bg-transparent time-editor"
                                        />
                                        <Select value={editingStartAmPm} onValueChange={(value: "AM" | "PM") => setEditingStartAmPm(value)}>
                                          <SelectTrigger
                                            className="h-6 w-10 text-xs border-0 shadow-none focus:ring-0 p-0 time-editor"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveEditingTime();
                                              } else if (e.key === 'Escape') {
                                                handleCancelEditingTime();
                                              }
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="time-editor">
                                            <SelectItem value="AM">AM</SelectItem>
                                            <SelectItem value="PM">PM</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <span className="text-xs">-</span>
                                        <Input
                                          type="text"
                                          value={editingEndTime}
                                          onChange={(e) => {
                                            const input = e.target.value;
                                            if (input === '' || /^[\d:]+$/.test(input)) {
                                              setEditingEndTime(input);
                                            }
                                          }}
                                          onBlur={(e) => {
                                            // Only save if clicking outside the time editing area
                                            const relatedTarget = e.relatedTarget as HTMLElement;
                                            if (!relatedTarget || !relatedTarget.closest('.time-editor')) {
                                              handleSaveEditingTime();
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleSaveEditingTime();
                                            } else if (e.key === 'Escape') {
                                              handleCancelEditingTime();
                                            }
                                          }}
                                          placeholder="5:00"
                                          className="text-xs h-6 w-12 border-0 shadow-none focus-visible:ring-0 p-0 text-center bg-transparent time-editor"
                                        />
                                        <Select value={editingEndAmPm} onValueChange={(value: "AM" | "PM") => setEditingEndAmPm(value)}>
                                          <SelectTrigger
                                            className="h-6 w-10 text-xs border-0 shadow-none focus:ring-0 p-0 time-editor"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveEditingTime();
                                              } else if (e.key === 'Escape') {
                                                handleCancelEditingTime();
                                              }
                                            }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="time-editor">
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
                            <Checkbox
                              disabled
                              className="h-4 w-4 rounded mt-0.5 flex-shrink-0 border-gray-300 opacity-40"
                            />
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <Input
                                autoFocus
                                value={newTodayTaskText}
                                onChange={(e) => setNewTodayTaskText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
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
                                className="text-sm h-7 border-0 border-b border-gray-300 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-400 flex-1 px-0"
                              />
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

              {/* Monthly Goals Section */}
              <section className="break-inside-avoid mb-6">
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

              {/* Today's Top 3 Priorities Section */}
              <section className="break-inside-avoid mb-6">
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
                          { bg: 'bg-gradient-to-br from-purple-50/50 to-purple-100/30', border: 'border-purple-200', text: 'text-purple-800', number: 'bg-purple-400' },
                          { bg: 'bg-gradient-to-br from-amber-50/50 to-amber-100/30', border: 'border-amber-200', text: 'text-amber-800', number: 'bg-amber-400' }
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

              {/* Mission Statement Section */}
              <section className="break-inside-avoid mb-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl relative">
                  <CardContent className="py-8 px-6">
                    {missionStatement ? (
                      <>
                        <p
                          className="text-2xl leading-relaxed text-gray-800 text-center mb-4 font-serif italic"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {missionStatement}
                        </p>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/strategy-growth')}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            Edit <ArrowRight className="h-3 w-3 ml-1" />
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

              {/* Next to Work On Section */}
              {pinnedContent.length > 0 && (
              <section className="break-inside-avoid mb-6">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Pin className="h-5 w-5 text-amber-600" />
                      Next to Work On
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pinned content cards from your Content Hub
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="columns-1 sm:columns-2 gap-4">
                      {pinnedContent.map((content) => (
                        <div
                          key={content.id}
                          className="relative group break-inside-avoid mb-4"
                        >
                          {/* Pin visual at the top */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                            <Pin className="h-6 w-6 text-amber-500 fill-amber-400 drop-shadow-md rotate-45" />
                          </div>

                          {/* Content card with pinned effect */}
                          <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-4 pt-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer">
                            {/* Tape effect at top corners */}
                            <div className="absolute top-0 left-0 w-8 h-6 bg-amber-100/60 border border-amber-200 -rotate-12 -translate-x-1 -translate-y-2"></div>
                            <div className="absolute top-0 right-0 w-8 h-6 bg-amber-100/60 border border-amber-200 rotate-12 translate-x-1 -translate-y-2"></div>

                            {/* Content */}
                            <div className="space-y-2">
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

                              {content.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-2 pt-2 border-t border-amber-200">
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
                                   content.status === 'needs-work' ? 'Needs work' :
                                   'Ready to film'}
                                </div>
                              )}
                            </div>

                            {/* Click hint */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-amber-700 hover:text-amber-900"
                                onClick={() => navigate('/production')}
                              >
                                View →
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
              )}

              {/* Content Calendar */}
              <section className="break-inside-avoid mb-6">
                <Card
                  className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-white via-purple-50/20 to-blue-50/30 rounded-2xl"
                  onClick={() => navigate('/task-board?view=calendar')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Content Calendar
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 hover:bg-purple-100"
                      >
                        View →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[200px] flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="inline-block p-4 bg-purple-100 rounded-full">
                          <Calendar className="h-12 w-12 text-purple-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">View your content schedule</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/task-board?view=calendar');
                          }}
                        >
                          Open Calendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </ScrollArea>

      </Layout>
  );
};

export default HomePage;
