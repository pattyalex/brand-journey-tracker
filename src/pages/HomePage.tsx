import React, { useState, useEffect, useRef, useMemo } from "react";
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
  CheckCircle,
  Clock,
  Check,
  Pencil,
  Clapperboard
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AIRecommendations from '@/components/analytics/AIRecommendations';
import VerificationGuard from '@/components/VerificationGuard';
import { StorageKeys, getString, setString, setJSON, getJSON } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import { KanbanColumn } from "./production/types";
import { Diamond } from "lucide-react";

// Brand Deals types (from Brands.tsx)
interface BrandDealDeliverable {
  id: string;
  title: string;
  contentType: string;
  submissionDeadline?: string;
  publishDeadline?: string;
  status: string;
  isPaid?: boolean;
  paymentAmount?: number;
}

interface BrandDeal {
  id: string;
  brandName: string;
  status: 'inbound' | 'negotiating' | 'signed' | 'in-progress' | 'completed' | 'other';
  deliverables: BrandDealDeliverable[];
  totalFee: number;
  depositAmount: number;
  depositPaid: boolean;
  finalPaymentDueDate?: string;
  invoiceSent: boolean;
  paymentReceived: boolean;
  isArchived?: boolean;
}

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

  // Calculate monthly stats from production kanban
  const monthlyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    let scheduled = 0;
    let posted = 0;
    let planned = 0;

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        // Find to-schedule column for scheduled/posted content
        const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
        toScheduleColumn?.cards.forEach(c => {
          if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
            const schedDate = new Date(c.scheduledDate);
            if (schedDate >= startOfMonth && schedDate <= endOfMonth) {
              if (schedDate < today) {
                posted++;
              } else {
                scheduled++;
              }
            }
          }
        });

        // Find ideate column for planned content
        const ideateColumn = columns.find(col => col.id === 'ideate');
        ideateColumn?.cards.forEach(c => {
          if (c.plannedDate) {
            const planDate = new Date(c.plannedDate);
            if (planDate >= startOfMonth && planDate <= endOfMonth) {
              planned++;
            }
          }
        });
      } catch (e) {
        console.error("Error parsing production data:", e);
      }
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return { scheduled, posted, planned, monthName: monthNames[currentMonth] };
  }, []);

  // Upcoming content for the next 7 days
  const upcomingContent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return [];

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
      const ideateColumn = columns.find(col => col.id === 'ideate');

      // Build maps by date
      const scheduledByDate: Record<string, typeof toScheduleColumn.cards> = {};
      const plannedByDate: Record<string, typeof ideateColumn.cards> = {};

      toScheduleColumn?.cards.forEach(c => {
        if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
          const dateKey = c.scheduledDate.split('T')[0];
          if (!scheduledByDate[dateKey]) scheduledByDate[dateKey] = [];
          scheduledByDate[dateKey].push(c);
        }
      });

      ideateColumn?.cards.forEach(c => {
        if (c.plannedDate) {
          const dateKey = c.plannedDate.split('T')[0];
          if (!plannedByDate[dateKey]) plannedByDate[dateKey] = [];
          plannedByDate[dateKey].push(c);
        }
      });

      // Get next 7 days
      const result: { date: Date; scheduled: any[]; planned: any[] }[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = getDateString(date);

        const scheduledForDay = scheduledByDate[dateStr] || [];
        const plannedForDay = plannedByDate[dateStr] || [];

        if (scheduledForDay.length > 0 || plannedForDay.length > 0) {
          result.push({ date, scheduled: scheduledForDay, planned: plannedForDay });
        }
      }

      return result;
    } catch (e) {
      return [];
    }
  }, []);

  // Brand Deals - upcoming deadlines and expected payments
  interface BrandDeadline {
    brandName: string;
    action: string;
    dueDate: Date;
    daysRemaining: number;
    isUrgent: boolean;
    contentType?: string;
  }

  interface BrandDealsState {
    deadlines: BrandDeadline[];
    expectedPayments: number;
  }

  const computeBrandDealsData = (): BrandDealsState => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(today.getDate() + 14);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Use the correct storage key for brand deals
    const savedDeals = getString('brandDeals');
    if (!savedDeals) return { deadlines: [], expectedPayments: 0 };

    try {
      const deals: BrandDeal[] = JSON.parse(savedDeals);
      const deadlines: BrandDeadline[] = [];
      let expectedPayments = 0;

      deals.forEach(deal => {
        // Skip archived deals
        if (deal.isArchived) return;

        // Only consider active deals (signed or in-progress)
        if (deal.status !== 'signed' && deal.status !== 'in-progress') return;

        // Check each deliverable for upcoming deadlines
        deal.deliverables?.forEach(deliverable => {
          // Check submission deadline
          if (deliverable.submissionDeadline && !deliverable.isPaid) {
            const submitDate = new Date(deliverable.submissionDeadline);
            if (!isNaN(submitDate.getTime()) && submitDate >= today && submitDate <= fourteenDaysFromNow) {
              const daysRemaining = Math.ceil((submitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              deadlines.push({
                brandName: deal.brandName,
                action: 'Submit content',
                dueDate: submitDate,
                daysRemaining,
                isUrgent: daysRemaining <= 3,
                contentType: deliverable.contentType
              });
            }
          }

          // Check publish deadline
          if (deliverable.publishDeadline && !deliverable.isPaid) {
            const publishDate = new Date(deliverable.publishDeadline);
            if (!isNaN(publishDate.getTime()) && publishDate >= today && publishDate <= fourteenDaysFromNow) {
              const daysRemaining = Math.ceil((publishDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              deadlines.push({
                brandName: deal.brandName,
                action: 'Publish',
                dueDate: publishDate,
                daysRemaining,
                isUrgent: daysRemaining <= 3,
                contentType: deliverable.contentType
              });
            }
          }
        });

        // Check invoice deadline
        if (deal.finalPaymentDueDate && !deal.invoiceSent) {
          const invoiceDate = new Date(deal.finalPaymentDueDate);
          const invoiceDueDate = new Date(invoiceDate);
          invoiceDueDate.setDate(invoiceDate.getDate() - 7);

          if (!isNaN(invoiceDueDate.getTime()) && invoiceDueDate >= today && invoiceDueDate <= fourteenDaysFromNow) {
            const daysRemaining = Math.ceil((invoiceDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            deadlines.push({
              brandName: deal.brandName,
              action: 'Send invoice',
              dueDate: invoiceDueDate,
              daysRemaining,
              isUrgent: daysRemaining <= 3
            });
          }
        }

        // Calculate expected payments this month
        if (!deal.paymentReceived && deal.totalFee) {
          let paymentExpectedThisMonth = false;

          // Check if any deliverable is due this month
          deal.deliverables?.forEach(deliverable => {
            if (deliverable.submissionDeadline) {
              const submitDate = new Date(deliverable.submissionDeadline);
              if (!isNaN(submitDate.getTime()) &&
                  submitDate.getMonth() === currentMonth &&
                  submitDate.getFullYear() === currentYear) {
                paymentExpectedThisMonth = true;
              }
            }
            if (deliverable.publishDeadline) {
              const publishDate = new Date(deliverable.publishDeadline);
              if (!isNaN(publishDate.getTime()) &&
                  publishDate.getMonth() === currentMonth &&
                  publishDate.getFullYear() === currentYear) {
                paymentExpectedThisMonth = true;
              }
            }
          });

          if (paymentExpectedThisMonth) {
            // Calculate remaining payment (total fee minus deposit if paid)
            const remainingPayment = deal.depositPaid
              ? deal.totalFee - (deal.depositAmount || 0)
              : deal.totalFee;
            expectedPayments += remainingPayment;
          }
        }
      });

      // Sort by soonest deadline first and remove duplicates for same brand+action
      deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

      return {
        deadlines: deadlines.slice(0, 2), // Show up to 2
        expectedPayments
      };
    } catch (e) {
      return { deadlines: [], expectedPayments: 0 };
    }
  };

  const [brandDealsData, setBrandDealsData] = useState<BrandDealsState>(computeBrandDealsData);

  // Refresh brand deals data when page becomes visible or storage changes
  useEffect(() => {
    const refreshBrandDeals = () => {
      setBrandDealsData(computeBrandDealsData());
    };

    // Listen for visibility changes (when user navigates back to this page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBrandDeals();
      }
    };

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'brandDeals') {
        refreshBrandDeals();
      }
    };

    // Listen for custom event when brand deals are updated (same tab)
    const unsubscribeBrandDealsEvent = on(window, EVENTS.brandDealsUpdated, () => {
      refreshBrandDeals();
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeBrandDealsEvent();
    };
  }, []);

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
  const monthlyGoalsScrollRef = useRef<HTMLDivElement>(null);
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

  // Continue Creating section - cards from kanban
  interface ContinueCreatingCard {
    id: string;
    title: string;
    stage: 'Edit' | 'Film' | 'Script' | 'Ideate';
    columnId: string;
    lastUpdated: Date;
  }
  const [continueCreatingCards, setContinueCreatingCards] = useState<ContinueCreatingCard[]>([]);

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
  type GoalStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'completed';
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
  const [truncatedHabitHover, setTruncatedHabitHover] = useState<string | null>(null);
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

  // Load Continue Creating cards from kanban
  useEffect(() => {
    const loadContinueCreating = () => {
      const productionData = getJSON<KanbanColumn[]>(StorageKeys.productionKanban, []);

      // Map column IDs to stages and get cards
      const columnMapping: Record<string, { stage: 'Edit' | 'Film' | 'Script' | 'Ideate', priority: number }> = {
        'to-edit': { stage: 'Edit', priority: 1 },
        'to-film': { stage: 'Film', priority: 2 },
        'script-ideas': { stage: 'Script', priority: 3 },
        'ideate': { stage: 'Ideate', priority: 4 },
      };

      // Collect cards from each column (excluding to-schedule)
      const cardsByColumn: Record<string, ContinueCreatingCard[]> = {
        'to-edit': [],
        'to-film': [],
        'script-ideas': [],
        'ideate': [],
      };

      productionData.forEach(column => {
        if (columnMapping[column.id]) {
          const { stage } = columnMapping[column.id];
          column.cards.forEach(card => {
            // Skip cards that are completed or in schedule
            if (!card.isCompleted) {
              cardsByColumn[column.id].push({
                id: card.id,
                title: card.title,
                stage,
                columnId: column.id,
                // Use a pseudo last-updated based on card position (newer cards at top)
                lastUpdated: new Date(),
              });
            }
          });
        }
      });

      // Select up to 3 cards with diversity across stages
      const selectedCards: ContinueCreatingCard[] = [];

      // Priority order: Edit -> Film -> Script -> Ideate
      const priorityOrder = ['to-edit', 'to-film', 'script-ideas', 'ideate'];

      // First pass: take 1 from each column in priority order
      for (const colId of priorityOrder) {
        if (selectedCards.length >= 2) break;
        if (cardsByColumn[colId].length > 0) {
          selectedCards.push(cardsByColumn[colId].shift()!);
        }
      }

      // Second pass: fill remaining slots from columns that still have cards
      for (const colId of priorityOrder) {
        if (selectedCards.length >= 2) break;
        while (cardsByColumn[colId].length > 0 && selectedCards.length < 2) {
          selectedCards.push(cardsByColumn[colId].shift()!);
        }
      }

      setContinueCreatingCards(selectedCards);
    };

    loadContinueCreating();

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.productionKanban) {
        loadContinueCreating();
      }
    };
    const unsubscribe = on(window, EVENTS.productionKanbanUpdated, loadContinueCreating);
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
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    return monthlyGoalsData[year]?.[month] || [];
  };

  // Toggle monthly goal status (same system as in Growth Goals page)
  const handleToggleMonthlyGoal = (id: number) => {
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const updatedGoals = currentGoals.map(g => {
      if (g.id === id) {
        // Cycle through statuses: not-started → somewhat-done → great-progress → completed → not-started
        const nextStatus: GoalStatus =
          g.status === 'not-started' ? 'somewhat-done' :
          g.status === 'somewhat-done' ? 'great-progress' :
          g.status === 'great-progress' ? 'completed' :
          'not-started';
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
    const year = String(getCurrentYear());
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
      const year = String(getCurrentYear());
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

      // Scroll to bottom to show the new goal
      setTimeout(() => {
        if (monthlyGoalsScrollRef.current) {
          monthlyGoalsScrollRef.current.scrollTop = monthlyGoalsScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Edit monthly goal
  const handleEditMonthlyGoal = (id: number, newText: string) => {
    if (newText.trim()) {
      const year = String(getCurrentYear());
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
    const year = String(getCurrentYear());
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

  // Cycle monthly goal status
  const handleCycleGoalStatus = (id: number) => {
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const statusCycle: Record<string, string> = {
      'not-started': 'somewhat-done',
      'somewhat-done': 'great-progress',
      'great-progress': 'completed',
      'completed': 'not-started',
    };

    const updatedGoals = currentGoals.map(g =>
      g.id === id ? { ...g, status: statusCycle[g.status] || 'not-started' } : g
    );

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

  // Calculate weekly completions for a habit
  const getWeeklyCompletions = (habit: Habit, weekOffset: number = 0) => {
    const weekDays = getWeekDays(weekOffset);
    const weekDateStrings = weekDays.map(d => getDateString(d));
    return habit.completedDates.filter(date => weekDateStrings.includes(date)).length;
  };

  // Check if habit is behind pace (for badge color)
  const isHabitBehindPace = (habit: Habit, completed: number, weekOffset: number = 0) => {
    if (!habit.goal) return false;
    const target = habit.goal.target;
    const weekDays = getWeekDays(weekOffset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count how many days have passed in the week (including today)
    let daysPassed = 0;
    for (const day of weekDays) {
      if (day <= today) daysPassed++;
    }

    // Calculate expected progress: if target is 4/7 days, by day 4 you should have ~2.3 done
    const expectedProgress = (target / 7) * daysPassed;
    return completed < expectedProgress - 0.5; // Give a little buffer
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
          <div
            className="min-h-full"
            style={{
              background: '#f9f7f5',
            }}
          >
            <div className="container px-6 md:px-8 pt-5 pb-10">
              {/* Greeting Section with Date Badge */}
              <section className="mb-8">
                <div className="flex items-start justify-between">
                  {/* Left: Greeting */}
                  <div>
                    <h1
                      className="text-[32px] leading-tight mb-2"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        color: '#2d2a26'
                      }}
                    >
                      {greeting}
                    </h1>
                    <p
                      className="text-[16px] text-gray-400"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Welcome to your creator studio
                    </p>
                  </div>

                  {/* Right: Today's Date Badge */}
                  <div
                    className="flex-shrink-0 flex items-center gap-3"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <span
                      className="text-[40px] font-light text-[#2d2a26]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {new Date().getDate()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#2d2a26]">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 auto-rows-min">

              {/* Top 3 Priorities - 1 column */}
              <section className="bg-white/60 rounded-2xl p-5 border border-[#8B7082]/8">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Target className="w-5 h-5 text-[#612a4f]" />
                    <h3
                      className="text-base text-[#2d2a26]"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                    >
                      Top 3 Priorities
                    </h3>
                  </div>

                  {/* Priority Items */}
                  <div className="space-y-0">
                    {priorities.map((priority) => {
                      return (
                        <div
                          key={priority.id}
                          className="flex items-baseline gap-3 py-2.5"
                        >
                          {/* Priority Number */}
                          <span
                            className="flex-shrink-0 text-xl text-[#612a4f]"
                            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                          >
                            {priority.id}.
                          </span>

                          {/* Priority Text */}
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
                                className="w-full bg-white border border-gray-200 focus:border-[#612a4f] focus:ring-1 focus:ring-[#612a4f]/20 rounded-lg px-3 py-1 text-[14px] text-[#2d2a26] placeholder:text-gray-400 outline-none transition-all"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              />
                            ) : (
                              <div
                                onClick={() => setEditingPriorityId(priority.id)}
                                className={`cursor-pointer text-[14px] min-h-[24px] flex items-center ${
                                  priority.isCompleted
                                    ? 'line-through text-gray-400'
                                    : priority.text
                                      ? 'text-[#2d2a26] font-semibold'
                                      : 'text-gray-400 italic'
                                }`}
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {priority.text || `Click to set priority ${priority.id}...`}
                              </div>
                            )}
                          </div>

                          {/* Checkbox */}
                          <Checkbox
                            checked={priority.isCompleted}
                            onCheckedChange={() => handleTogglePriority(priority.id)}
                            className="h-4 w-4 rounded border-[1.5px] border-gray-300 data-[state=checked]:bg-[#5a8a5a] data-[state=checked]:border-[#5a8a5a] data-[state=checked]:text-white flex-shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Plan Your Day Link */}
                  <div className="border-t border-[#8B7082]/10 mt-4 pt-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/planner')}
                        className="px-2 py-0.5 text-[11px] font-medium text-[#612a4f] bg-[#612a4f]/10 hover:bg-[#612a4f]/15 rounded transition-colors flex items-center gap-1"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Plan Your Day <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
              </section>

              {/* Continue Creating Section - 1 column */}
              <section className="bg-white/60 rounded-2xl p-5 border border-[#8B7082]/8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <Clapperboard className="w-5 h-5 text-[#612a4f]" />
                      <h3
                        className="text-base text-[#2d2a26]"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Continue Creating
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate('/production')}
                      className="text-[#8B7082] hover:text-[#612a4f] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Cards */}
                  <div className="space-y-2">
                    {continueCreatingCards.length > 0 ? (
                      continueCreatingCards.map((card) => {
                        const stageBadgeColors: Record<string, string> = {
                          'Edit': '#6b4a5e',
                          'Film': '#8b6a7e',
                          'Script': '#a8899a',
                          'Ideate': 'rgba(184, 169, 170, 0.6)',
                        };

                        return (
                          <div
                            key={card.id}
                            onClick={() => navigate('/production')}
                            className="py-3 cursor-pointer border-b border-[#8B7082]/10 last:border-b-0 transition-all"
                          >
                            {/* Title */}
                            <p
                              className="text-sm font-semibold text-[#2d2a26] mb-1.5 line-clamp-2"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {card.title}
                            </p>

                            {/* Stage Badge */}
                            <span
                              className="inline-block text-[10px] font-semibold text-white px-2 py-0.5 rounded mb-1"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                backgroundColor: stageBadgeColors[card.stage],
                              }}
                            >
                              {card.stage}
                            </span>
                            {/* Last Updated */}
                            <span
                              className="block text-[10px] text-[#8b7a85]"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {formatDistanceToNow(card.lastUpdated, { addSuffix: false })} ago
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center">
                        <p
                          className="text-sm text-gray-400 mb-2"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          No content in progress
                        </p>
                        <button
                          onClick={() => navigate('/production')}
                          className="text-sm font-medium text-[#6b4a5e] hover:text-[#4a3442] transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Start creating →
                        </button>
                      </div>
                    )}
                  </div>
              </section>

              {/* Upcoming Partnerships Section - 1 column */}
              <section className="bg-white/60 rounded-2xl p-5 border border-[#8B7082]/8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <Handshake className="w-5 h-5 text-[#612a4f]" />
                      <h3
                        className="text-base text-[#2d2a26]"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Upcoming Partnerships
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate('/brands')}
                      className="text-[#8B7082] hover:text-[#612a4f] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="mb-5">
                    {brandDealsData.deadlines.length === 0 ? (
                      <p
                        className="text-sm py-3"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#8b7a85' }}
                      >
                        No upcoming deadlines
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {brandDealsData.deadlines.map((deadline, index) => (
                          <div
                            key={`${deadline.brandName}-${index}`}
                            className="flex items-center justify-between pb-4 pt-2 border-b border-[#8B7082]/10 last:border-b-0"
                          >
                            <div>
                              <p
                                className="text-sm font-semibold text-[#2d2a26]"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {deadline.brandName}
                              </p>
                              <p
                                className="text-[11px] text-[#8b7a85]"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {deadline.action} by {format(deadline.dueDate, 'MMM d')}
                              </p>
                            </div>
                            {deadline.contentType && (
                              <span
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide"
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  color: '#8b7a85',
                                  background: 'rgba(139, 115, 130, 0.1)',
                                }}
                              >
                                {deadline.contentType.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expected Payments */}
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: 'linear-gradient(145deg, rgba(122, 154, 122, 0.06) 0%, rgba(122, 154, 122, 0.1) 100%)',
                      border: '1px solid rgba(122, 154, 122, 0.12)',
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase mb-0.5"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#5a8a5a',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Expected This Month
                    </p>
                    <p
                      className="text-xl text-[#2d2a26]"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                    >
                      ${brandDealsData.expectedPayments.toLocaleString()}
                    </p>
                  </div>
              </section>

              {/* Celebration - Full width in bento grid */}
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="md:col-span-3"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px] shadow-2xl">
                      <div className="relative bg-white/80 rounded-2xl p-6">
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


              {/* Work Habits + Monthly Goals Row */}
              <div className="md:col-span-3 flex gap-4">
              {/* Work Habits Section */}
              <section className="flex-1 bg-white/60 rounded-2xl p-5 border border-[#8B7082]/8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <svg width="18" height="14" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4.5Q2 6 3.5 7Q5.5 4 9 1" stroke="#612a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3
                        className="text-base text-[#2d2a26]"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Work Habits
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddingHabit(true)}
                      className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        background: 'linear-gradient(145deg, #6b4a5e 0%, #4a3442 100%)',
                        boxShadow: '0 2px 8px rgba(107, 74, 94, 0.2)',
                      }}
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {/* Habits Grid */}
                  {habits.length > 0 || isAddingHabit ? (
                    <div>
                      {/* Day Headers */}
                      <div className="grid grid-cols-[1fr_repeat(7,36px)] gap-1 mb-1 pb-3" style={{ borderBottom: '1px solid rgba(139, 115, 130, 0.08)' }}>
                        <div></div>
                        {getWeekDays(habitWeekOffset).map((day, idx) => {
                          const isToday = getDateString(day) === getDateString(new Date());
                          const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx];
                          return (
                            <div key={idx} className="text-center">
                              <div
                                className="text-[10px] font-semibold"
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  color: isToday ? '#6b4a5e' : '#8b7a85',
                                }}
                              >
                                {dayLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Habit Rows */}
                      <div className="space-y-2 pt-2">
                        {habits.map((habit) => {
                          const weeklyCompleted = getWeeklyCompletions(habit, habitWeekOffset);
                          const weeklyTarget = habit.goal?.target || 7;
                          const isBehind = isHabitBehindPace(habit, weeklyCompleted, habitWeekOffset);

                          return (
                          <div
                            key={habit.id}
                            className="grid grid-cols-[1fr_repeat(7,36px)] gap-1 items-center py-2 group"
                          >
                            {/* Habit Name */}
                            <div className="flex items-center gap-2 min-w-0 pr-2">
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
                                  className="flex-1 h-7 text-[13px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent"
                                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                                />
                              ) : (
                                <>
                                  <div className="relative min-w-0 flex-1">
                                    <span
                                      className="text-[13px] text-[#2d2a26] truncate cursor-pointer hover:text-[#6b4a5e] transition-colors block"
                                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                                      onClick={() => startEditingHabit(habit.id, habit.name)}
                                      onMouseEnter={(e) => {
                                        const el = e.currentTarget;
                                        if (el.scrollWidth > el.clientWidth) {
                                          setTruncatedHabitHover(habit.id);
                                        }
                                      }}
                                      onMouseLeave={() => setTruncatedHabitHover(null)}
                                    >
                                      {habit.name}
                                    </span>
                                    {truncatedHabitHover === habit.id && (
                                      <div
                                        className="absolute left-0 bottom-full mb-1 z-50 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                                        style={{
                                          fontFamily: "'DM Sans', sans-serif",
                                          fontSize: '12px',
                                          backgroundColor: '#1a1a1a',
                                          color: 'white',
                                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        }}
                                      >
                                        {habit.name}
                                      </div>
                                    )}
                                  </div>
                                  {/* Progress Badge - Clickable to edit goal */}
                                  {editingGoalHabitId === habit.id ? (
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                      <span
                                        className="text-[10px] text-[#7a9a7a]"
                                        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                                      >
                                        {weeklyCompleted}/
                                      </span>
                                      <input
                                        autoFocus
                                        type="text"
                                        value={editingGoalTarget}
                                        onChange={(e) => setEditingGoalTarget(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveGoal();
                                          if (e.key === 'Escape') setEditingGoalHabitId(null);
                                        }}
                                        onBlur={saveGoal}
                                        className="w-6 h-5 text-[10px] text-center border border-[#7a9a7a] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#7a9a7a]"
                                        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startEditingGoal(habit)}
                                      className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                      style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '10px',
                                        color: isBehind ? '#8b7a85' : '#7a9a7a',
                                        backgroundColor: isBehind ? 'rgba(139, 122, 133, 0.1)' : 'rgba(122, 154, 122, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        marginLeft: '8px',
                                        border: 'none',
                                      }}
                                    >
                                      {weeklyCompleted}/{weeklyTarget}
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex-shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Day Checkboxes */}
                            {getWeekDays(habitWeekOffset).map((day, dayIdx) => {
                              const dateStr = getDateString(day);
                              const isCompleted = habit.completedDates.includes(dateStr);
                              const isToday = dateStr === getDateString(new Date());

                              return (
                                <div
                                  key={dayIdx}
                                  className="flex justify-center"
                                >
                                  <button
                                    onClick={() => toggleHabit(habit.id, dateStr)}
                                    className="w-[26px] h-[26px] rounded-md flex items-center justify-center transition-all"
                                    style={{
                                      background: isCompleted
                                        ? 'linear-gradient(145deg, #8aae8a 0%, #6a9a6a 100%)'
                                        : 'transparent',
                                      border: isCompleted
                                        ? 'none'
                                        : '1.5px solid rgba(139, 115, 130, 0.15)',
                                      boxShadow: isCompleted
                                        ? '0 2px 6px rgba(106, 154, 106, 0.25)'
                                        : 'none',
                                    }}
                                  >
                                    {isCompleted && (
                                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4.5Q2 6 3.5 7Q5.5 4 9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                        })}

                        {/* Add Habit Row */}
                        {isAddingHabit && (
                          <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(139, 115, 130, 0.08)' }}>
                            <div className="flex items-center gap-2">
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
                                className="flex-1 h-9 text-[13px] border border-gray-200 rounded-lg focus:border-[#6b4a5e] focus:ring-1 focus:ring-[#6b4a5e]/20"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              />
                              <div className="flex items-center gap-1">
                                <Input
                                  placeholder="4"
                                  value={newHabitGoalTarget}
                                  onChange={(e) => setNewHabitGoalTarget(e.target.value.replace(/\D/g, ''))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') addHabit();
                                    if (e.key === 'Escape') {
                                      setIsAddingHabit(false);
                                      setNewHabitName("");
                                      setNewHabitGoalTarget("");
                                    }
                                  }}
                                  className="w-10 h-9 text-[13px] text-center border border-gray-200 rounded-lg focus:border-[#6b4a5e] focus:ring-1 focus:ring-[#6b4a5e]/20"
                                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                                />
                                <span
                                  className="text-[11px] text-[#8b7a85]"
                                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                  /wk
                                </span>
                              </div>
                              <button
                                onClick={addHabit}
                                className="h-9 px-4 rounded-lg text-white text-xs font-semibold"
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  background: 'linear-gradient(145deg, #7a9a7a 0%, #5a8a5a 100%)',
                                }}
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setIsAddingHabit(false);
                                  setNewHabitName("");
                                  setNewHabitGoalTarget("");
                                }}
                                className="h-9 px-3 rounded-lg text-[13px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div
                        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: 'rgba(139, 115, 130, 0.08)' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#8b7a85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p
                        className="text-sm text-gray-400 mb-4"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        No habits yet. Start tracking your work habits!
                      </p>
                      <button
                        onClick={() => setIsAddingHabit(true)}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          background: 'linear-gradient(145deg, #7a9a7a 0%, #5a8a5a 100%)',
                          boxShadow: '0 2px 8px rgba(90, 138, 90, 0.2)',
                        }}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Your First Habit
                      </button>
                    </div>
                  )}
              </section>

              {/* Monthly Goals Section */}
              <section className="flex-1 bg-white/60 rounded-2xl p-5 border border-[#8B7082]/8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-[#612a4f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <h3
                          className="text-base text-[#2d2a26]"
                          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        >
                          Monthly Goals
                        </h3>
                        <p className="text-[11px] text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{getCurrentMonth()} {getCurrentYear()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')}
                      className="text-[#8B7082] hover:text-[#612a4f] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Goals List */}
                  <div ref={monthlyGoalsScrollRef} className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                    <div className="space-y-2.5">
                      {getCurrentMonthGoals().map((goal) => {
                        const statusConfig: Record<string, { bgColor: string; textColor: string; borderColor: string; label: string }> = {
                          'not-started': { bgColor: 'rgba(156, 163, 175, 0.15)', textColor: '#6b7280', borderColor: 'rgba(156, 163, 175, 0.4)', label: 'Not Started' },
                          'somewhat-done': { bgColor: 'rgba(212, 165, 32, 0.15)', textColor: '#b8860b', borderColor: 'rgba(212, 165, 32, 0.4)', label: 'On It' },
                          'great-progress': { bgColor: 'rgba(124, 184, 124, 0.15)', textColor: '#5a9a5a', borderColor: 'rgba(124, 184, 124, 0.4)', label: 'Great Progress' },
                          'completed': { bgColor: '#5a8a5a', textColor: '#ffffff', borderColor: '#5a8a5a', label: 'Fully Completed!' },
                        };
                        const status = statusConfig[goal.status] || statusConfig['not-started'];

                        return (
                          <div key={goal.id} className="group">
                            <div
                              className="flex items-center gap-4 py-3 border-b border-[#8B7082]/10 last:border-b-0 transition-all"
                            >
                              {/* Goal text */}
                              {editingMonthlyGoalId === goal.id ? (
                                <Input
                                  value={editingMonthlyGoalText}
                                  onChange={(e) => setEditingMonthlyGoalText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditMonthlyGoal(goal.id, editingMonthlyGoalText);
                                    else if (e.key === 'Escape') { setEditingMonthlyGoalId(null); setEditingMonthlyGoalText(""); }
                                  }}
                                  onBlur={() => handleEditMonthlyGoal(goal.id, editingMonthlyGoalText)}
                                  className="flex-1 text-sm h-8 bg-white"
                                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                                  autoFocus
                                />
                            ) : (
                              <span
                                onDoubleClick={() => { setEditingMonthlyGoalId(goal.id); setEditingMonthlyGoalText(goal.text); }}
                                className="flex-1 text-[15px] font-semibold cursor-pointer text-[#2d2a26]"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {goal.text}
                              </span>
                            )}

                            {/* Status badge - clickable to cycle */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCycleGoalStatus(goal.id); }}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: status.bgColor,
                                color: status.textColor,
                                border: `1px solid ${status.borderColor}`,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {status.label}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteMonthlyGoal(goal.id); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Goal */}
                {isAddingMonthlyGoal ? (
                  <div
                    className="flex items-center gap-3 p-4 mt-3 rounded-[14px]"
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(139, 115, 130, 0.12)',
                      boxShadow: '0 2px 8px rgba(139, 115, 130, 0.08)',
                    }}
                  >
                    <Input
                      value={newMonthlyGoalText}
                      onChange={(e) => setNewMonthlyGoalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddMonthlyGoal();
                        else if (e.key === 'Escape') { setIsAddingMonthlyGoal(false); setNewMonthlyGoalText(""); }
                      }}
                      onBlur={() => { if (!newMonthlyGoalText.trim()) setIsAddingMonthlyGoal(false); }}
                      placeholder={`Add a goal for ${getCurrentMonth()}...`}
                      className="flex-1 text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                      autoFocus
                    />
                    <button
                      onClick={handleAddMonthlyGoal}
                      className="w-8 h-8 rounded-lg text-white flex items-center justify-center transition-colors"
                      style={{
                        background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
                      }}
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingMonthlyGoal(true)}
                    className="flex items-center justify-center w-full py-3 mt-3 text-sm text-[#8B7082] hover:text-[#612a4f] hover:bg-[#8B7082]/5 rounded-xl transition-colors border border-dashed border-[#8B7082]/20"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Goal
                  </button>
                )}
            </section>
              </div>

              {/* Mission Statement - Full width */}
              <section className="md:col-span-3 bg-white/60 rounded-2xl p-6 border border-[#8B7082]/8">
                  {/* Header with Edit button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => navigate('/strategy-growth#mission')}
                      className="text-xs font-semibold text-[#6b4a5e] hover:text-[#4a3442] transition-colors flex items-center gap-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Edit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Decorative line above */}
                    <div className="w-20 h-px mb-4 bg-gradient-to-r from-transparent via-[#8B7082]/40 to-transparent" />

                    {/* Label */}
                    <span
                      className="text-xs tracking-[0.2em] text-[#8B7082] uppercase mb-4"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Your Mission
                    </span>

                    {/* Mission Quote */}
                    <p
                      className="text-2xl md:text-3xl italic text-[#2d2a26] text-center max-w-2xl leading-relaxed"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                    >
                      "{missionStatement || 'Set your mission statement...'}"
                    </p>

                    {/* Decorative line below */}
                    <div className="mt-6 w-20 h-px bg-gradient-to-r from-transparent via-[#8B7082]/40 to-transparent" />
                  </div>
              </section>

            </div>
            {/* End Bento Grid */}

            </div>
          </div>
        </ScrollArea>

      </Layout>
  );
};

export default HomePage;
