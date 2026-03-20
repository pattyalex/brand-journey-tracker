import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, Sun, Moon } from "lucide-react";
import { StorageKeys, getString, setString, setJSON, getJSON } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import { KanbanColumn } from "@/pages/production/types";
import {
  BrandDeal,
  BrandDeadline,
  BrandDealsState,
  PlannerItem,
  Priority,
  ProductionCard,
  ContinueCreatingCard,
  GoalStatus,
  MonthlyGoal,
  MonthlyGoalsData,
  ContentCalendarItem,
  Habit,
  getDateString,
} from "@/components/home/types";

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

const computeBrandDealsData = (): BrandDealsState => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fourteenDaysFromNow = new Date(today);
  fourteenDaysFromNow.setDate(today.getDate() + 14);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const savedDeals = getString('brandDeals');
  if (!savedDeals) return { deadlines: [], expectedPayments: 0 };

  try {
    const deals: BrandDeal[] = JSON.parse(savedDeals);
    const deadlines: BrandDeadline[] = [];
    let expectedPayments = 0;

    deals.forEach(deal => {
      if (deal.isArchived) return;
      if (deal.status !== 'signed' && deal.status !== 'in-progress') return;

      deal.deliverables?.forEach(deliverable => {
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

      if (!deal.paymentReceived && deal.totalFee) {
        let paymentExpectedThisMonth = false;

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
          const remainingPayment = deal.depositPaid
            ? deal.totalFee - (deal.depositAmount || 0)
            : deal.totalFee;
          expectedPayments += remainingPayment;
        }
      }
    });

    deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      deadlines: deadlines.slice(0, 2),
      expectedPayments
    };
  } catch (e) {
    return { deadlines: [], expectedPayments: 0 };
  }
};

// Helper to parse and format time input
const parseTimeInput = (input: string) => {
  if (!input) return { hours: '', minutes: '' };

  const cleaned = input.replace(/[^\d:]/g, '');

  if (cleaned.includes(':')) {
    const [h, m] = cleaned.split(':');
    return {
      hours: h,
      minutes: m || '00'
    };
  } else if (cleaned.length <= 2) {
    return {
      hours: cleaned,
      minutes: '00'
    };
  } else {
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

  if (hour > 12) {
    hour = hour % 12;
    if (hour === 0) hour = 12;
  }

  if (hour < 1) hour = 1;

  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const useHomePageState = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    const startOfMonthDate = new Date(currentYear, currentMonth, 1);
    const endOfMonthDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    let scheduled = 0;
    let posted = 0;
    let planned = 0;

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
        toScheduleColumn?.cards.forEach(c => {
          if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
            const schedDate = new Date(c.scheduledDate);
            if (schedDate >= startOfMonthDate && schedDate <= endOfMonthDate) {
              if (schedDate < today) {
                posted++;
              } else {
                scheduled++;
              }
            }
          }
        });

        const ideateColumn = columns.find(col => col.id === 'ideate');
        ideateColumn?.cards.forEach(c => {
          if (c.plannedDate) {
            const planDate = new Date(c.plannedDate);
            if (planDate >= startOfMonthDate && planDate <= endOfMonthDate) {
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

  const [brandDealsData, setBrandDealsData] = useState<BrandDealsState>(computeBrandDealsData);

  // Refresh brand deals data when page becomes visible or storage changes
  useEffect(() => {
    const refreshBrandDeals = () => {
      setBrandDealsData(computeBrandDealsData());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBrandDeals();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'brandDeals') {
        refreshBrandDeals();
      }
    };

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

  // All Tasks from planner
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
  const habitsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const startAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const endAmPmButtonRef = useRef<HTMLButtonElement>(null);

  const editStartTimeInputRef = useRef<HTMLInputElement>(null);
  const editStartAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const editEndTimeInputRef = useRef<HTMLInputElement>(null);
  const editEndAmPmButtonRef = useRef<HTMLButtonElement>(null);
  const timeEditorRef = useRef<HTMLDivElement>(null);

  // Today's Top 3 Priorities
  const [priorities, setPriorities] = useState<Priority[]>(() => {
    const saved = getString('todaysPriorities');
    const today = getDateString(new Date());
    const savedDate = getString('todaysPrioritiesDate');

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

  // Pinned Content Cards
  const [pinnedContent, setPinnedContent] = useState<ProductionCard[]>([]);
  const [isUsingPlaceholders, setIsUsingPlaceholders] = useState(false);

  const columnTagStyles: Record<string, { bg: string; text: string; border: string; emoji: string; displayName?: string }> = {
    ideate: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", emoji: "💡", displayName: "Bank of Ideas" },
    "shape-ideas": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", emoji: "🧠", displayName: "Script and Concept" },
    "to-film": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", emoji: "🎥" },
    "to-edit": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", emoji: "💻" },
    "to-schedule": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", emoji: "📅" },
  };

  const getColumnTagStyle = (columnId: string) => {
    return columnTagStyles[columnId] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", emoji: "📍" };
  };

  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);

  // Mission Statement and Vision Board
  const [missionStatement, setMissionStatement] = useState("");
  const [visionBoardImages, setVisionBoardImages] = useState<string[]>([]);

  // Continue Creating section
  const [continueCreatingCards, setContinueCreatingCards] = useState<ContinueCreatingCard[]>([]);

  // Dismissed placeholder rows
  const [dismissedPlaceholders, setDismissedPlaceholders] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!user?.id) return;
    try { setDismissedPlaceholders(JSON.parse(localStorage.getItem(`dismissedDashboardPlaceholders_${user.id}`) || '{}')); }
    catch { setDismissedPlaceholders({}); }
  }, [user?.id]);
  const dismissPlaceholder = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedPlaceholders(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem(`dismissedDashboardPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);

  // Monthly goals state
  const [isAddingMonthlyGoal, setIsAddingMonthlyGoal] = useState(false);
  const [newMonthlyGoalText, setNewMonthlyGoalText] = useState("");
  const [editingMonthlyGoalId, setEditingMonthlyGoalId] = useState<number | null>(null);
  const [editingMonthlyGoalText, setEditingMonthlyGoalText] = useState("");
  const [showProgressNotesForGoalId, setShowProgressNotesForGoalId] = useState<number | null>(null);

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

  const getCurrentMonth = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[new Date().getMonth()];
  };

  const getCurrentYear = () => new Date().getFullYear();

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Habit Tracker state
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
  const [habitWeekOffset, setHabitWeekOffset] = useState(0);
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

  // Auto-dismiss celebration after 5 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plannerData' && e.newValue) {
        loadTodaysTasks();
      }
    };

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plannerData' && e.newValue) {
        loadContentCalendarData();
      }
    };

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
      if (isSelectOpen) {
        return;
      }

      const target = event.target as HTMLElement;

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
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingTimeTaskId, isSelectOpen]);

  // Set greeting
  useEffect(() => {
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();

      let userName = "";
      if (user?.user_metadata?.full_name) {
        userName = user.user_metadata.full_name.split(' ')[0];
      }

      const greetingText = userName ? `, ${userName}` : "";

      if (hour >= 5 && hour < 12) {
        setGreeting(`Good morning${greetingText}!`);
        setGreetingIcon(React.createElement(Coffee, { className: "h-7 w-7 text-amber-500" }));
      } else if (hour >= 12 && hour < 18) {
        setGreeting(`Good afternoon${greetingText}!`);
        setGreetingIcon(React.createElement(Sun, { className: "h-7 w-7 text-yellow-500" }));
      } else {
        setGreeting(`Good evening${greetingText}!`);
        setGreetingIcon(React.createElement(Moon, { className: "h-7 w-7 text-indigo-400" }));
      }
    };

    getCurrentGreeting();
  }, [user]);

  // Load journal entries
  useEffect(() => {
    const checkNewDay = () => {
      const lastAccessDate = getString(StorageKeys.lastAccessDate);
      const currentDate = new Date().toDateString();

      if (lastAccessDate !== currentDate) {
        const emptyJournalEntries = {
          threeThingsImGratefulFor: "",
          todaysAffirmations: ""
        };

        setJournalEntries(emptyJournalEntries);
        setString(StorageKeys.journalEntries, JSON.stringify(emptyJournalEntries));
        setString(StorageKeys.lastAccessDate, currentDate);
      } else {
        const savedEntries = getString(StorageKeys.journalEntries);
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        }
      }
    };

    checkNewDay();

    const midnightCheckInterval = setInterval(() => {
      checkNewDay();
    }, 60000);

    return () => clearInterval(midnightCheckInterval);
  }, []);

  // Load pinned content cards
  useEffect(() => {
    const loadPinnedContent = () => {
      const productionData = getJSON<KanbanColumn[]>(StorageKeys.productionKanban, []);

      const pinned: ProductionCard[] = [];
      productionData.forEach(column => {
        column.cards.forEach(card => {
          if (card.isPinned) {
            pinned.push({ ...card, columnName: column.title });
          }
        });
      });

      if (pinned.length > 0) {
        setPinnedContent(pinned);
        setIsUsingPlaceholders(false);
        return;
      }

      const allCards: ProductionCard[] = [];
      productionData.forEach(column => {
        column.cards.forEach(card => {
          allCards.push({ ...card, columnName: column.title });
        });
      });

      if (allCards.length > 0) {
        setPinnedContent(allCards.slice(0, 3));
        setIsUsingPlaceholders(false);
        return;
      }

      setPinnedContent(defaultPlaceholderCards);
      setIsUsingPlaceholders(true);
    };

    loadPinnedContent();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.productionKanban) {
        loadPinnedContent();
      }
    };

    const unsubscribe = on(window, EVENTS.productionKanbanUpdated, () => {
      loadPinnedContent();
    });

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Load Continue Creating cards
  useEffect(() => {
    const loadContinueCreating = () => {
      const productionData = getJSON<KanbanColumn[]>(StorageKeys.productionKanban, []);

      const columnMapping: Record<string, { stage: 'Edit' | 'Film' | 'Script' | 'Bank of Ideas', priority: number }> = {
        'to-edit': { stage: 'Edit', priority: 1 },
        'to-film': { stage: 'Film', priority: 2 },
        'shape-ideas': { stage: 'Script', priority: 3 },
        'ideate': { stage: 'Bank of Ideas', priority: 4 },
      };

      const cardsByColumn: Record<string, ContinueCreatingCard[]> = {
        'to-edit': [],
        'to-film': [],
        'shape-ideas': [],
        'ideate': [],
      };

      productionData.forEach(column => {
        if (columnMapping[column.id]) {
          const { stage } = columnMapping[column.id];
          column.cards.forEach(card => {
            if (!card.isCompleted) {
              cardsByColumn[column.id].push({
                id: card.id,
                title: card.hook || card.title,
                stage,
                columnId: column.id,
                lastUpdated: card.lastUpdated ? new Date(card.lastUpdated) : new Date(),
              });
            }
          });
        }
      });

      const selectedCards: ContinueCreatingCard[] = [];
      const priorityOrder = ['to-edit', 'to-film', 'shape-ideas', 'ideate'];

      for (const colId of priorityOrder) {
        if (selectedCards.length >= 2) break;
        if (cardsByColumn[colId].length > 0) {
          selectedCards.push(cardsByColumn[colId].shift()!);
        }
      }

      for (const colId of priorityOrder) {
        if (selectedCards.length >= 2) break;
        while (cardsByColumn[colId].length > 0 && selectedCards.length < 2) {
          selectedCards.push(cardsByColumn[colId].shift()!);
        }
      }

      setContinueCreatingCards(selectedCards);
    };

    loadContinueCreating();

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

  // Load Mission Statement and Vision Board
  useEffect(() => {
    const loadMissionAndVision = () => {
      const savedMission = getString(StorageKeys.missionStatement);
      if (savedMission) {
        setMissionStatement(savedMission);
      }

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === StorageKeys.missionStatement || e.key === StorageKeys.visionBoardData) {
        loadMissionAndVision();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load goals
  useEffect(() => {
    const loadGoals = () => {
      const goalsStr = getString(StorageKeys.growthGoals);
      if (goalsStr) {
        setGoals(JSON.parse(goalsStr));
      } else {
        setGoals([
          { metric: "Followers", current: 5000, target: 10000, timeframe: "3 months" },
          { metric: "Engagement Rate", current: 3.5, target: 5, timeframe: "2 months" },
          { metric: "Brand Deals", current: 1, target: 3, timeframe: "6 months" }
        ]);
      }
    };

    loadGoals();
  }, []);

  // Demo mood board images
  useEffect(() => {
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
    emit(window, EVENTS.allTasksUpdated, updatedTasks);
  };

  // Handle deleting task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedTasks);
    setString(StorageKeys.allTasks, JSON.stringify(updatedTasks));
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

          setTodaysTasks(todaysTasks.map(task =>
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
          ));
        }
      } catch (error) {
        console.error('Failed to toggle today\'s task:', error);
      }
    }
  };

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
          const startAmPm = overrideStartAmPm ?? editingStartAmPm;
          const endAmPm = overrideEndAmPm ?? editingEndAmPm;

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

  // Handle adding today's task
  const handleAddTodayTask = () => {
    if (!newTodayTaskText.trim()) return;

    const plannerDataStr = getString(StorageKeys.plannerData);
    const plannerData = plannerDataStr ? JSON.parse(plannerDataStr) : [];
    const today = getDateString(new Date());
    const todayIndex = plannerData.findIndex((day: any) => day.date === today);

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
      plannerData[todayIndex].items = [...(plannerData[todayIndex].items || []), newTask];
    } else {
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

    setTodaysTasks([...todaysTasks, newTask]);
    setNewTodayTaskText('');
    setNewTodayTaskStartTime('');
    setNewTodayTaskStartAmPm('AM');
    setNewTodayTaskEndTime('');
    setNewTodayTaskEndAmPm('PM');
    setIsAddingTodayTask(false);
  };

  // Save monthly goals to localStorage
  useEffect(() => {
    try {
      setString(StorageKeys.monthlyGoalsData, JSON.stringify(monthlyGoalsData));
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

  const getCurrentMonthGoals = (): MonthlyGoal[] => {
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    return monthlyGoalsData[year]?.[month] || [];
  };

  const handleToggleMonthlyGoal = (id: number) => {
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();

    const updatedGoals = currentGoals.map(g => {
      if (g.id === id) {
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

      setTimeout(() => {
        if (monthlyGoalsScrollRef.current) {
          monthlyGoalsScrollRef.current.scrollTop = monthlyGoalsScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

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

  // Priority handlers
  const handleUpdatePriority = (id: number, text: string) => {
    const updatedPriorities = priorities.map(p =>
      p.id === id ? { ...p, text: text } : p
    );
    setPriorities(updatedPriorities);
    setString('todaysPriorities', JSON.stringify(updatedPriorities));
  };

  const handleTogglePriority = (id: number) => {
    const updatedPriorities = priorities.map(p =>
      p.id === id ? { ...p, isCompleted: !p.isCompleted } : p
    );
    setPriorities(updatedPriorities);
    setString('todaysPriorities', JSON.stringify(updatedPriorities));

    const allCompleted = updatedPriorities.every(p => p.isCompleted && p.text.trim() !== '');
    const wasCompleted = priorities.every(p => p.isCompleted && p.text.trim() !== '');

    if (allCompleted && !wasCompleted) {
      setTimeout(() => {
        setShowCelebration(true);
      }, 150);
    }
  };

  // Save priorities
  useEffect(() => {
    setString('todaysPriorities', JSON.stringify(priorities));
  }, [priorities]);

  // Save habits
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

  const getWeeklyCompletions = (habit: Habit, weekOffset: number = 0) => {
    const weekDays = getWeekDays(weekOffset);
    const weekDateStrings = weekDays.map(d => getDateString(d));
    return habit.completedDates.filter(date => weekDateStrings.includes(date)).length;
  };

  const isHabitBehindPace = (habit: Habit, completed: number, weekOffset: number = 0) => {
    if (!habit.goal) return false;
    const target = habit.goal.target;
    const weekDays = getWeekDays(weekOffset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysPassed = 0;
    for (const day of weekDays) {
      if (day <= today) daysPassed++;
    }

    const expectedProgress = (target / 7) * daysPassed;
    return completed < expectedProgress - 0.5;
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

  const keepPlaceholderHabit = (name: string, key: string) => {
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name,
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
    setDismissedPlaceholders(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem(`dismissedDashboardPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };

  const keepPlaceholderGoal = (text: string, status: string, key: string) => {
    const year = String(getCurrentYear());
    const month = getCurrentMonth();
    const currentGoals = getCurrentMonthGoals();
    const statusMap: Record<string, string> = {
      'On It': 'somewhat-done',
      'Not Started': 'not-started',
      'Almost There': 'great-progress',
    };
    const newGoal: MonthlyGoal = {
      id: Date.now(),
      text,
      status: (statusMap[status] || 'not-started') as MonthlyGoal['status'],
    };
    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: [...currentGoals, newGoal],
      },
    }));
    setDismissedPlaceholders(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem(`dismissedDashboardPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
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

  const calculateHabitProgress = (habit: Habit): { completed: number; target: number } | null => {
    if (!habit.goal) return null;

    const { target, period } = habit.goal;
    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      const currentDay = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
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

  const getProgressColor = (completed: number, target: number): string => {
    if (completed >= target) return 'text-green-600';
    if (completed >= target * 0.5) return 'text-amber-500';
    return 'text-gray-400';
  };

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

    newPinnedContent.splice(draggedCardIndex, 1);
    newPinnedContent.splice(dropIndex, 0, draggedCard);

    setPinnedContent(newPinnedContent);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);

    const productionData = getJSON('productionKanbanData') || { lists: [] };
    productionData.lists.forEach((list: any) => {
      list.cards.forEach((card: ProductionCard) => {
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

  return {
    // Navigation
    navigate,
    user,

    // Greeting
    greeting,
    greetingIcon,

    // Journal
    journalEntries,
    handleJournalChange,

    // Goals
    goals,
    moodboardImages,

    // Monthly stats
    monthlyStats,
    upcomingContent,

    // Brand deals
    brandDealsData,

    // All tasks
    allTasks,
    isAddingTask,
    setIsAddingTask,
    newTaskText,
    setNewTaskText,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,

    // Today's tasks
    todaysTasks,
    isAddingTodayTask,
    setIsAddingTodayTask,
    newTodayTaskText,
    setNewTodayTaskText,
    newTodayTaskStartTime,
    setNewTodayTaskStartTime,
    newTodayTaskStartAmPm,
    setNewTodayTaskStartAmPm,
    newTodayTaskEndTime,
    setNewTodayTaskEndTime,
    newTodayTaskEndAmPm,
    setNewTodayTaskEndAmPm,
    editingTodayTaskId,
    editingTodayTaskText,
    setEditingTodayTaskText,
    editingTimeTaskId,
    editingStartTime,
    setEditingStartTime,
    editingStartAmPm,
    setEditingStartAmPm,
    editingEndTime,
    setEditingEndTime,
    editingEndAmPm,
    setEditingEndAmPm,
    isSelectOpen,
    setIsSelectOpen,
    addTaskFormRef,
    timeEditorRef,
    startTimeInputRef,
    startAmPmButtonRef,
    endTimeInputRef,
    endAmPmButtonRef,
    editStartTimeInputRef,
    editStartAmPmButtonRef,
    editEndTimeInputRef,
    editEndAmPmButtonRef,
    handleToggleTodayTask,
    handleStartEditingTodayTask,
    handleSaveEditingTodayTask,
    handleCancelEditingTodayTask,
    handleStartEditingTime,
    handleSaveEditingTime,
    handleCancelEditingTime,
    handleDeleteTodayTask,
    formatTime,
    handleAddTodayTask,

    // Priorities
    priorities,
    editingPriorityId,
    setEditingPriorityId,
    handleUpdatePriority,
    handleTogglePriority,
    showCelebration,
    setShowCelebration,

    // Pinned content
    pinnedContent,
    isUsingPlaceholders,
    columnTagStyles,
    getColumnTagStyle,
    draggedCardIndex,
    dragOverCardIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,

    // Continue creating
    continueCreatingCards,

    // Mission
    missionStatement,
    visionBoardImages,

    // Dismissed placeholders
    dismissedPlaceholders,
    dismissPlaceholder,

    // Monthly goals
    isAddingMonthlyGoal,
    setIsAddingMonthlyGoal,
    newMonthlyGoalText,
    setNewMonthlyGoalText,
    editingMonthlyGoalId,
    setEditingMonthlyGoalId,
    editingMonthlyGoalText,
    setEditingMonthlyGoalText,
    showProgressNotesForGoalId,
    setShowProgressNotesForGoalId,
    monthlyGoalsScrollRef,
    monthlyGoalsData,
    getCurrentMonth,
    getCurrentYear,
    getCurrentMonthGoals,
    handleToggleMonthlyGoal,
    handleUpdateMonthlyProgressNote,
    handleAddMonthlyGoal,
    handleEditMonthlyGoal,
    handleDeleteMonthlyGoal,
    handleCycleGoalStatus,

    // Content calendar
    contentCalendarData,
    calendarCurrentMonth,
    setCalendarCurrentMonth,

    // Connected platforms
    connectedPlatforms,

    // Habits
    habits,
    habitWeekOffset,
    setHabitWeekOffset,
    isAddingHabit,
    setIsAddingHabit,
    newHabitName,
    setNewHabitName,
    editingHabitId,
    editingHabitName,
    setEditingHabitName,
    editingGoalHabitId,
    truncatedHabitHover,
    setTruncatedHabitHover,
    editingGoalTarget,
    setEditingGoalTarget,
    editingGoalPeriod,
    setEditingGoalPeriod,
    newHabitGoalTarget,
    setNewHabitGoalTarget,
    newHabitGoalPeriod,
    setNewHabitGoalPeriod,
    habitsScrollRef,
    getWeekDays,
    getWeeklyCompletions,
    isHabitBehindPace,
    toggleHabit,
    addHabit,
    deleteHabit,
    keepPlaceholderHabit,
    keepPlaceholderGoal,
    startEditingHabit,
    saveEditingHabit,
    cancelEditingHabit,
    calculateHabitProgress,
    getProgressColor,
    startEditingGoal,
    saveGoal,
    removeGoal,
  };
};
