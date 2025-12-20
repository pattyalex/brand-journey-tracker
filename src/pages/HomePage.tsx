import React, { useState, useEffect } from "react";
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
  Trash2,
  ChevronDown,
  TrendingUp
} from "lucide-react";
import AIRecommendations from '@/components/analytics/AIRecommendations';
import VerificationGuard from '@/components/VerificationGuard';

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
    const saved = localStorage.getItem('monthlyGoalsData');
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
      const saved = localStorage.getItem('allTasks');
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
      const lastAccessDate = localStorage.getItem('lastAccessDate');
      const currentDate = new Date().toDateString();

      if (lastAccessDate !== currentDate) {
        // It's a new day, reset journal entries
        const emptyJournalEntries = {
          threeThingsImGratefulFor: "",
          todaysAffirmations: ""
        };

        setJournalEntries(emptyJournalEntries);
        localStorage.setItem('journalEntries', JSON.stringify(emptyJournalEntries));

        // Save current date as last access date
        localStorage.setItem('lastAccessDate', currentDate);
      } else {
        // Same day, load existing entries
        const savedEntries = localStorage.getItem('journalEntries');
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

  // Load goals from localStorage (these would be fetched from the Goals page in a real app)
  useEffect(() => {
    // For demo, fetch goals from StrategyGrowth page
    const loadGoals = () => {
      const goalsStr = localStorage.getItem('growthGoals');
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
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
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
      localStorage.setItem('allTasks', JSON.stringify(updatedTasks));
      console.log('HomePage: Saved to localStorage');
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('allTasksUpdated', { detail: updatedTasks }));
      console.log('HomePage: Dispatched allTasksUpdated event');
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
    localStorage.setItem('allTasks', JSON.stringify(updatedTasks));
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new CustomEvent('allTasksUpdated', { detail: updatedTasks }));
  };

  // Handle deleting task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasks(updatedTasks);
    localStorage.setItem('allTasks', JSON.stringify(updatedTasks));
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new CustomEvent('allTasksUpdated', { detail: updatedTasks }));
  };


  // Save monthly goals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('monthlyGoalsData', JSON.stringify(monthlyGoalsData));
      // Dispatch custom event for same-tab sync with Strategy & Growth page
      window.dispatchEvent(new CustomEvent('monthlyGoalsUpdated', { detail: monthlyGoalsData }));
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
          <div className="container px-4 md:px-6 py-6 md:py-10">
            {/* Greeting Section - Top Banner */}
            <section className="mb-6 fade-in">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">{greeting}</h1>
                  <p className="text-sm text-muted-foreground">Welcome to your content hub. What would you like to create today?</p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm">
                  {greetingIcon}
                </div>
              </div>
            </section>

            {/* Three Main Sections - To-Dos, Projects, Content Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in">
              {/* All Tasks Section */}
              <section>
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">All Tasks</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/task-board')}
                        className="h-7 text-xs px-2"
                      >
                        View All →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 pb-4">
                    {/* All Tasks from Planner */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingTask(true)}
                        className="h-7 w-7 p-0 absolute top-2 right-0"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                      </Button>
                      <div className="space-y-2 pt-10">
                        {allTasks.length === 0 && !isAddingTask ? (
                          <p className="text-xs text-gray-400 italic">No tasks yet. Click + to add a task!</p>
                        ) : (
                          allTasks.map((task) => (
                            <div key={task.id} className="flex items-start group justify-between hover:bg-gray-50 rounded-sm p-1">
                              <div className="flex items-start flex-1">
                                <Checkbox
                                  id={`task-${task.id}`}
                                  checked={task.isCompleted}
                                  onCheckedChange={() => handleToggleTask(task.id)}
                                  className="h-4 w-4 rounded mr-2 mt-0.5 flex-shrink-0 data-[state=checked]:bg-green-500 data-[state=checked]:text-white border-gray-300"
                                />
                                <label
                                  htmlFor={`task-${task.id}`}
                                  className={`text-xs cursor-pointer ${task.isCompleted ? 'line-through text-gray-500' : ''}`}
                                >
                                  {task.text}
                                </label>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                        {isAddingTask && (
                          <div className="flex items-center gap-1 p-1">
                            <div className="h-4 w-4 rounded mr-2 mt-0.5 flex-shrink-0 border border-gray-300"></div>
                            <Input
                              autoFocus
                              value={newTaskText}
                              onChange={(e) => setNewTaskText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddTask();
                                } else if (e.key === 'Escape') {
                                  setIsAddingTask(false);
                                  setNewTaskText("");
                                }
                              }}
                              onBlur={() => {
                                if (!newTaskText.trim()) {
                                  setIsAddingTask(false);
                                }
                              }}
                              placeholder="Enter task..."
                              className="flex-1 text-xs h-6"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Projects Section */}
              <section>
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Content will be added here</p>
                  </CardContent>
                </Card>
              </section>

              {/* Content Calendar Section */}
              <section>
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Content Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Content will be added here</p>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Partnerships and Strategy & Growth Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 fade-in">
              {/* Partnerships Section */}
              <section>
                <Card
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/collab-management')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Handshake className="h-5 w-5 text-blue-500" />
                        Partnerships
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                      >
                        View All →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Active Partnerships</span>
                        <span className="text-lg font-bold text-blue-600">3</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Pending Proposals</span>
                        <span className="text-lg font-bold text-yellow-600">2</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Completed Collabs</span>
                        <span className="text-lg font-bold text-green-600">8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Strategy & Growth Section */}
              <section>
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl flex items-center gap-2">
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
                    <div className="space-y-2">
                      {getCurrentMonthGoals().slice(0, 5).map((goal) => (
                        <div key={goal.id} className="space-y-2">
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

                            {/* Arrow for in-progress goals */}
                            {goal.status === 'in-progress' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowProgressNotesForGoalId(
                                    showProgressNotesForGoalId === goal.id ? null : goal.id
                                  );
                                }}
                                className="text-yellow-600/70 hover:text-yellow-600 flex-shrink-0"
                              >
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${
                                  showProgressNotesForGoalId === goal.id ? 'rotate-180' : ''
                                }`} />
                              </button>
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
                          {/* Progress notes for in-progress goals */}
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

                      {/* Add new goal input */}
                      {isAddingMonthlyGoal ? (
                        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-white">
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
                          className="flex items-center justify-center w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Goal
                        </button>
                      )}

                      {getCurrentMonthGoals().length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{getCurrentMonthGoals().length - 5} more goals
                        </p>
                      )}
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