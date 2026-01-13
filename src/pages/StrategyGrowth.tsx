import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useVisionBoard } from "@/hooks/useVisionBoard";
import { useOnboarding } from "@/hooks/useOnboarding";
import GoalsOnboarding from "@/components/GoalsOnboarding";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, on } from "@/lib/events";
import {
  PenTool,
  Users,
  MessageSquare,
  ImageIcon,
  Calendar,
  Video,
  BarChart,
  Target,
  FileText,
  TrendingUp,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  ChevronDown,
  Heart,
  Compass
} from "lucide-react";

const StrategyGrowth = () => {
  // Brand Identity states
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>(["25-34"]);
  const [audienceStruggles, setAudienceStruggles] = useState("");
  const [audienceDesires, setAudienceDesires] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(["relatable"]);
  const [missionStatement, setMissionStatement] = useState(() => getString(StorageKeys.missionStatement) || "");
  const [missionStatementFocused, setMissionStatementFocused] = useState(false);
  const [showMissionExamples, setShowMissionExamples] = useState(true);
  const [contentValues, setContentValues] = useState(() => getString(StorageKeys.contentValues) || "");
  const [contentValuesFocused, setContentValuesFocused] = useState(false);
  const [showValuesExamples, setShowValuesExamples] = useState(true);
  const [strugglesFocused, setStrugglesFocused] = useState(false);
  const [desiresFocused, setDesiresFocused] = useState(false);
  const { images: visionBoardImages, pinterestUrl, addImage: addVisionBoardImage, removeImage: removeVisionBoardImage, updatePinterestUrl } = useVisionBoard();

  // Growth Goals states with progress tracking
  type GoalStatus = 'not-started' | 'in-progress' | 'completed';
  interface Goal {
    id: number;
    text: string;
    status: GoalStatus;
    progressNote?: string;
  }
  interface MonthlyGoalsData {
    [year: string]: {
      [month: string]: Goal[];
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

  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>(() => {
    const saved = getString(StorageKeys.shortTermGoals);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [longTermGoals, setLongTermGoals] = useState<Goal[]>(() => {
    const saved = getString(StorageKeys.longTermGoals);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [newMonthlyGoalInputs, setNewMonthlyGoalInputs] = useState<{[key: string]: string}>({});
  const [newShortTermGoal, setNewShortTermGoal] = useState("");
  const [newLongTermGoal, setNewLongTermGoal] = useState("");

  const [selectedYear, setSelectedYear] = useState(2025);
  const [expandedMonths, setExpandedMonths] = useState<string[]>(["January"]);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [focusedMonth, setFocusedMonth] = useState("January");

  const [editingMonthlyId, setEditingMonthlyId] = useState<number | null>(null);
  const [editingShortTermId, setEditingShortTermId] = useState<number | null>(null);
  const [editingLongTermId, setEditingLongTermId] = useState<number | null>(null);

  const [editingMonthlyText, setEditingMonthlyText] = useState("");
  const [editingShortTermText, setEditingShortTermText] = useState("");
  const [editingLongTermText, setEditingLongTermText] = useState("");

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("brand-identity");
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Check URL params on mount to navigate to specific tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Scroll to section if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#vision-board') {
      setTimeout(() => {
        const element = document.getElementById('vision-board');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    try {
      setString(StorageKeys.monthlyGoalsData, JSON.stringify(monthlyGoalsData));
    } catch (error) {
      console.error('Failed to save monthly goals data:', error);
    }
  }, [monthlyGoalsData]);

  useEffect(() => {
    try {
      setString(StorageKeys.shortTermGoals, JSON.stringify(shortTermGoals));
    } catch (error) {
      console.error('Failed to save short-term goals:', error);
    }
  }, [shortTermGoals]);

  useEffect(() => {
    try {
      setString(StorageKeys.longTermGoals, JSON.stringify(longTermGoals));
    } catch (error) {
      console.error('Failed to save long-term goals:', error);
    }
  }, [longTermGoals]);

  useEffect(() => {
    try {
      setString(StorageKeys.missionStatement, missionStatement);
    } catch (error) {
      console.error('Failed to save mission statement:', error);
    }
  }, [missionStatement]);

  useEffect(() => {
    try {
      setString(StorageKeys.contentValues, contentValues);
    } catch (error) {
      console.error('Failed to save content values:', error);
    }
  }, [contentValues]);

  // Listen for storage events to sync with HomePage in real-time
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

    const handleCustomUpdate = (e: CustomEvent) => {
      setMonthlyGoalsData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribe = on(window, EVENTS.monthlyGoalsUpdated, handleCustomUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Brand Identity handlers
  const handleAddKeyword = () => {
    if (keywordInput.trim() !== "" && !brandKeywords.includes(keywordInput.trim())) {
      setBrandKeywords([...brandKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setBrandKeywords(brandKeywords.filter(k => k !== keyword));
  };

  // Handler for tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Helper to get goals for a specific month/year
  const getMonthlyGoals = (year: number, month: string): Goal[] => {
    return monthlyGoalsData[year]?.[month] || [];
  };

  // Helper to update goals for a specific month/year
  const updateMonthlyGoals = (year: number, month: string, goals: Goal[]) => {
    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: goals
      }
    }));
  };

  // Handlers for Monthly Goals
  const handleAddMonthlyGoal = (year: number, month: string) => {
    const inputKey = `${year}-${month}`;
    const inputValue = newMonthlyGoalInputs[inputKey] || '';

    if (inputValue.trim()) {
      const currentGoals = getMonthlyGoals(year, month);
      const newGoal = {
        id: Math.max(0, ...currentGoals.map(g => g.id)) + 1,
        text: inputValue.trim(),
        status: 'not-started' as GoalStatus
      };
      updateMonthlyGoals(year, month, [...currentGoals, newGoal]);
      setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: "" }));
    }
  };

  const handleToggleMonthlyGoal = (year: number, month: string, id: number) => {
    const currentGoals = getMonthlyGoals(year, month);
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
    updateMonthlyGoals(year, month, updatedGoals);
  };

  const handleDeleteMonthlyGoal = (year: number, month: string, id: number) => {
    const currentGoals = getMonthlyGoals(year, month);
    updateMonthlyGoals(year, month, currentGoals.filter(g => g.id !== id));
  };

  const handleEditMonthlyGoal = (id: number, text: string) => {
    setEditingMonthlyId(id);
    setEditingMonthlyText(text);
  };

  const handleSaveMonthlyGoal = (year: number, month: string) => {
    if (editingMonthlyId !== null && editingMonthlyText.trim()) {
      const currentGoals = getMonthlyGoals(year, month);
      updateMonthlyGoals(year, month, currentGoals.map(g =>
        g.id === editingMonthlyId ? { ...g, text: editingMonthlyText.trim() } : g
      ));
      setEditingMonthlyId(null);
      setEditingMonthlyText("");
    }
  };

  const handleUpdateProgressNote = (year: number, month: string, id: number, note: string) => {
    const currentGoals = getMonthlyGoals(year, month);
    updateMonthlyGoals(year, month, currentGoals.map(g =>
      g.id === id ? { ...g, progressNote: note } : g
    ));
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  // Handlers for Short-Term Goals
  const handleAddShortTermGoal = () => {
    if (newShortTermGoal.trim()) {
      const newGoal = {
        id: Math.max(0, ...shortTermGoals.map(g => g.id)) + 1,
        text: newShortTermGoal.trim(),
        status: 'not-started' as GoalStatus
      };
      setShortTermGoals([...shortTermGoals, newGoal]);
      setNewShortTermGoal("");
    }
  };

  const handleToggleShortTermGoal = (id: number) => {
    setShortTermGoals(shortTermGoals.map(g => {
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
    }));
  };

  const handleDeleteShortTermGoal = (id: number) => {
    setShortTermGoals(shortTermGoals.filter(g => g.id !== id));
  };

  const handleEditShortTermGoal = (id: number, text: string) => {
    setEditingShortTermId(id);
    setEditingShortTermText(text);
  };

  const handleSaveShortTermGoal = () => {
    if (editingShortTermId !== null && editingShortTermText.trim()) {
      setShortTermGoals(shortTermGoals.map(g =>
        g.id === editingShortTermId ? { ...g, text: editingShortTermText.trim() } : g
      ));
      setEditingShortTermId(null);
      setEditingShortTermText("");
    }
  };

  // Handlers for Long-Term Goals
  const handleAddLongTermGoal = () => {
    if (newLongTermGoal.trim()) {
      const newGoal = {
        id: Math.max(0, ...longTermGoals.map(g => g.id)) + 1,
        text: newLongTermGoal.trim(),
        status: 'not-started' as GoalStatus
      };
      setLongTermGoals([...longTermGoals, newGoal]);
      setNewLongTermGoal("");
    }
  };

  const handleToggleLongTermGoal = (id: number) => {
    setLongTermGoals(longTermGoals.map(g => {
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
    }));
  };

  const handleDeleteLongTermGoal = (id: number) => {
    setLongTermGoals(longTermGoals.filter(g => g.id !== id));
  };

  const handleEditLongTermGoal = (id: number, text: string) => {
    setEditingLongTermId(id);
    setEditingLongTermText(text);
  };

  const handleSaveLongTermGoal = () => {
    if (editingLongTermId !== null && editingLongTermText.trim()) {
      setLongTermGoals(longTermGoals.map(g =>
        g.id === editingLongTermId ? { ...g, text: editingLongTermText.trim() } : g
      ));
      setEditingLongTermId(null);
      setEditingLongTermText("");
    }
  };

  // Ref for file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler to trigger file input click
  const handleUploadClick = () => {
    console.log('Upload button clicked');
    console.log('File input ref:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('File input clicked');
    } else {
      console.error('File input ref is null');
    }
  };

  // Handler for vision board file upload
  const handleVisionBoardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Upload handler called');
    const files = e.target.files;
    console.log('Files:', files);

    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    Array.from(files).forEach(file => {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Check file size (2MB limit for localStorage)
      if (file.size > 2 * 1024 * 1024) {
        console.log('File too large:', file.size, 'bytes');
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "File too large",
            description: `${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please use images under 2MB.`,
            variant: "destructive",
          });
        });
        return;
      }

      // Check file type - accept all image types
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Invalid file type",
            description: "Please upload image files only",
            variant: "destructive",
          });
        });
        return;
      }

      console.log('Starting file read');
      // Convert to base64 and add to vision board
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('File read complete');
        if (event.target?.result) {
          console.log('Adding image to vision board');
          const success = addVisionBoardImage(event.target.result as string);
          console.log('Add image result:', success);

          import("@/hooks/use-toast").then(({ toast }) => {
            if (success) {
              toast({
                title: "Image uploaded",
                description: "Image added to your vision board",
              });
            } else {
              toast({
                title: "Storage limit exceeded",
                description: "Please remove some images or use smaller file sizes",
                variant: "destructive",
              });
            }
          });
        }
      };
      reader.onerror = (error) => {
        console.error('File read error:', error);
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Upload failed",
            description: "Failed to read the image file",
            variant: "destructive",
          });
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  return (
    <Layout>
      <GoalsOnboarding run={showOnboarding && activeTab === 'growth-goals'} onComplete={completeOnboarding} />
      <div className="w-full h-full mx-auto px-8 py-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Strategy & Goals</h1>
            <p className="text-sm text-gray-600">
              Define your brand positioning and track your growth goals
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
              <TabsTrigger
                value="brand-identity"
                className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
              >
                <PenTool className="w-4 h-4 mr-2 inline-block" />
                Positioning
              </TabsTrigger>
              <TabsTrigger
                value="growth-goals"
                className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
              >
                <TrendingUp className="w-4 h-4 mr-2 inline-block" />
                Growth Goals
              </TabsTrigger>
            </TabsList>

            {/* Positioning Tab */}
            <TabsContent value="brand-identity" className="space-y-4 mt-0">
              {/* Mission Statement */}
              <Card className="rounded-lg border border-indigo-100 shadow-sm bg-white hover:shadow-md transition-all">
                <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-sm">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Mission Statement</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Why you create content and who you help
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-4">
                  <div className="relative">
                    <Textarea
                      value={missionStatement}
                      onChange={(e) => setMissionStatement(e.target.value)}
                      className="min-h-[160px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-4 pb-12 text-sm leading-relaxed"
                      placeholder={missionStatementFocused ? "" : "Write a short sentence that explains who your content is for and what you want it to do for them..."}
                      onFocus={() => setMissionStatementFocused(true)}
                      onBlur={() => setMissionStatementFocused(false)}
                    />
                    {showMissionExamples && (
                      <Button
                        onClick={() => setShowMissionExamples(false)}
                        size="sm"
                        className="absolute bottom-3 left-3 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        Done
                      </Button>
                    )}
                  </div>
                  {showMissionExamples && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Examples</p>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 bg-indigo-50/50 rounded-md px-3 py-2 border border-indigo-100/50">
                          "I create content to help busy people build healthy routines they can actually stick to"
                        </div>
                        <div className="text-sm text-gray-600 bg-indigo-50/50 rounded-md px-3 py-2 border border-indigo-100/50">
                          "I create content to inspire women to dress well without overthinking or overspending"
                        </div>
                        <div className="text-sm text-gray-600 bg-indigo-50/50 rounded-md px-3 py-2 border border-indigo-100/50">
                          "I create content to help small business founders scale their businesses without burning out"
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Core Values & Non-Negotiables */}
              <Card className="rounded-lg border border-rose-100 shadow-sm bg-white hover:shadow-md transition-all">
                <CardHeader className="border-b border-rose-50 bg-gradient-to-r from-rose-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-rose-500 text-white shadow-sm">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Core Values & Non-Negotiables</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Define the principles and values that guide your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-4">
                  <div className="relative">
                    <Textarea
                      value={contentValues}
                      onChange={(e) => setContentValues(e.target.value)}
                      className="min-h-[160px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent p-4 pb-12 text-sm leading-relaxed"
                      placeholder={contentValuesFocused ? "" : "What values and principles are non-negotiable in your content?"}
                      onFocus={() => setContentValuesFocused(true)}
                      onBlur={() => setContentValuesFocused(false)}
                    />
                    {showValuesExamples && (
                      <Button
                        onClick={() => setShowValuesExamples(false)}
                        size="sm"
                        className="absolute bottom-3 left-3 text-xs bg-rose-500 hover:bg-rose-600 text-white"
                      >
                        Done
                      </Button>
                    )}
                  </div>
                  {showValuesExamples && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Examples</p>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 bg-rose-50/50 rounded-md px-3 py-2 border border-rose-100/50">
                          "My content will always be kind and never attack others"
                        </div>
                        <div className="text-sm text-gray-600 bg-rose-50/50 rounded-md px-3 py-2 border border-rose-100/50">
                          "I value honesty and transparency with my community"
                        </div>
                        <div className="text-sm text-gray-600 bg-rose-50/50 rounded-md px-3 py-2 border border-rose-100/50">
                          "I only promote brands I genuinely use and believe in - alignment over revenue"
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card className="rounded-lg border border-purple-100 shadow-sm bg-white hover:shadow-md transition-all">
                <CardHeader className="border-b border-purple-50 bg-gradient-to-r from-purple-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-purple-500 text-white shadow-sm">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Target Audience</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Define who your ideal audience is
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="space-y-3">
                    <Label htmlFor="age-range" className="text-sm font-semibold text-gray-800">Age Range</Label>
                    <div className="flex flex-wrap gap-2">
                      {["18-24", "25-34", "35-44", "45-54", "55+"].map((range) => (
                        <label
                          key={range}
                          htmlFor={`age-${range}`}
                          className={`px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 text-sm font-medium ${
                            audienceAgeRanges.includes(range)
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`age-${range}`}
                            checked={audienceAgeRanges.includes(range)}
                            onChange={() => {
                              if (audienceAgeRanges.includes(range)) {
                                setAudienceAgeRanges(audienceAgeRanges.filter(r => r !== range));
                              } else if (audienceAgeRanges.length < 3) {
                                setAudienceAgeRanges([...audienceAgeRanges, range]);
                              } else {
                                // Show toast notification when maximum selections reached
                                import("@/hooks/use-toast").then(({ showMaxAgeRangesSelectedToast }) => {
                                  showMaxAgeRangesSelectedToast();
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="struggles" className="text-sm font-semibold text-gray-800">Struggles</Label>
                      <Textarea
                        id="struggles"
                        value={audienceStruggles}
                        onChange={(e) => setAudienceStruggles(e.target.value)}
                        placeholder={strugglesFocused ? "" : "What pain points or challenges does your audience face? What problems are they trying to solve? Understanding their struggles helps you create content that truly resonates."}
                        onFocus={() => setStrugglesFocused(true)}
                        onBlur={() => setStrugglesFocused(false)}
                        className="min-h-[120px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent p-4 text-sm leading-relaxed"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="desires" className="text-sm font-semibold text-gray-800">Desires</Label>
                      <Textarea
                        id="desires"
                        value={audienceDesires}
                        onChange={(e) => setAudienceDesires(e.target.value)}
                        placeholder={desiresFocused ? "" : "What are your audience's goals and aspirations? What transformation are they seeking? What does success look like for them?"}
                        onFocus={() => setDesiresFocused(true)}
                        onBlur={() => setDesiresFocused(false)}
                        className="min-h-[120px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent p-4 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tone of Voice */}
              <Card className="rounded-lg border border-blue-100 shadow-sm bg-white hover:shadow-md transition-all">
                <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Tone of Voice</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Select one or more tones that reflect how you want to communicate with your community
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {["humorous", "aspirational", "educational/informative", "relatable", "motivational", "bold/opinionated", "cinematic/narrative", "comforting/calming"].map((tone) => (
                        <label
                          key={tone}
                          htmlFor={`tone-${tone}`}
                          className={`p-3.5 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                            selectedTones.includes(tone)
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`tone-${tone}`}
                            checked={selectedTones.includes(tone)}
                            onChange={() => {
                              if (selectedTones.includes(tone)) {
                                setSelectedTones(selectedTones.filter(t => t !== tone));
                              } else {
                                setSelectedTones([...selectedTones, tone]);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="font-medium capitalize text-sm">{tone}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vision Board */}
              <Card id="vision-board" className="rounded-lg border border-rose-100 shadow-sm bg-white hover:shadow-md transition-all scroll-mt-6">
                <CardHeader className="border-b border-rose-50 bg-gradient-to-r from-rose-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-rose-500 text-white shadow-sm">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Vision Board</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Upload images or link your Pinterest board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  {/* Images Display - Large */}
                  {visionBoardImages.length > 0 && (
                    <div className="grid grid-cols-1 gap-6">
                      {visionBoardImages.map((image, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                          <img
                            src={image}
                            alt={`Vision board ${index + 1}`}
                            className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                          />
                          <button
                            onClick={() => removeVisionBoardImage(index)}
                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Section - only show when no images */}
                  {visionBoardImages.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-rose-300 hover:bg-rose-50/30 transition-all">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-3 text-sm font-semibold text-gray-800">Upload images</h3>
                      <p className="mt-1.5 text-xs text-gray-500">Any image format up to 2MB each</p>
                      <p className="mt-0.5 text-xs text-gray-400">Accepts both landscape and portrait images</p>
                      <div className="mt-5">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-2 hover:bg-rose-50 hover:border-rose-300"
                          onClick={handleUploadClick}
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose Files</span>
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleVisionBoardUpload}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hidden file input for when images exist */}
                  {visionBoardImages.length > 0 && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleVisionBoardUpload}
                    />
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="pinterest" className="text-sm font-semibold text-gray-800">Pinterest Board URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pinterest"
                        placeholder="https://pinterest.com/username/board-name"
                        value={pinterestUrl}
                        onChange={(e) => updatePinterestUrl(e.target.value)}
                        className="border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      {pinterestUrl && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(pinterestUrl, '_blank')}
                          className="flex items-center gap-2 whitespace-nowrap border-2 hover:bg-rose-50 hover:border-rose-300"
                        >
                          <span>View Board</span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>


          {/* Growth Goals Tab */}
          <TabsContent value="growth-goals" className="space-y-6 mt-0">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: Monthly Goals */}
              <Card className="lg:col-span-1 rounded-lg border border-blue-100 shadow-sm bg-white hover:shadow-md transition-all">
                <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">Monthly Goals</span>
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Set and track goals for any month
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="flex gap-4 items-center justify-between flex-wrap bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                  <div className="flex gap-3 items-center">
                    <Label htmlFor="year-select" className="text-sm font-semibold text-gray-700">Year:</Label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = 2025 + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>

                  <div className="flex gap-3 items-center">
                    {!showAllMonths && (
                      <>
                        <Label htmlFor="month-select" className="text-sm font-semibold text-gray-700">Month:</Label>
                        <select
                          id="month-select"
                          value={focusedMonth}
                          onChange={(e) => {
                            setFocusedMonth(e.target.value);
                            setExpandedMonths([e.target.value]);
                          }}
                          className="px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllMonths(!showAllMonths)}
                      className="flex items-center gap-2 border-2 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                    >
                      {showAllMonths ? "Focus on One Month" : "Show All Months"}
                    </Button>
                  </div>
                </div>

                {/* Accordion for all months */}
                <Accordion type="multiple" value={expandedMonths} onValueChange={setExpandedMonths}>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                    .filter(month => showAllMonths ? true : month === focusedMonth)
                    .map((month) => {
                    const monthEmoji =
                      ["January", "February", "December"].includes(month) ? "❄️" :
                      ["March", "April", "May"].includes(month) ? "🌸" :
                      ["June", "July", "August"].includes(month) ? "☀️" : "🍂";
                    const goals = getMonthlyGoals(selectedYear, month);
                    const inputKey = `${selectedYear}-${month}`;

                    return (
                      <AccordionItem key={month} value={month}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span>{monthEmoji} {month}</span>
                            {goals.length > 0 && (
                              <Badge variant="secondary" className="ml-2">{goals.length}</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2 px-1">
                            {goals.map((goal) => (
                              <div key={goal.id} className="space-y-2">
                                <div className="flex items-start gap-3 group hover:bg-blue-50/30 p-3 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                  <button
                                    onClick={() => handleToggleMonthlyGoal(selectedYear, month, goal.id)}
                                    data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : goal.status === 'in-progress'
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {goal.status === 'completed' && <span className="text-white text-xs">✓</span>}
                        {goal.status === 'in-progress' && <span className="text-white text-xs">•</span>}
                      </button>
                                  {editingMonthlyId === goal.id ? (
                                    <Input
                                      value={editingMonthlyText}
                                      onChange={(e) => setEditingMonthlyText(e.target.value)}
                                      onBlur={() => handleSaveMonthlyGoal(selectedYear, month)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveMonthlyGoal(selectedYear, month);
                                        if (e.key === 'Escape') setEditingMonthlyId(null);
                                      }}
                                      autoFocus
                                      className="flex-1 h-8"
                                    />
                                  ) : (
                                    <span
                                      className={`flex-1 cursor-pointer ${
                                        goal.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                      }`}
                                      onClick={() => handleEditMonthlyGoal(goal.id, goal.text)}
                                      title="Click to edit"
                                    >
                                      {goal.text}
                                    </span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleDeleteMonthlyGoal(selectedYear, month, goal.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {goal.status === 'in-progress' && (
                                  <div className="ml-8 mr-8">
                                    <Input
                                      placeholder="Progress notes..."
                                      value={goal.progressNote || ''}
                                      onChange={(e) => handleUpdateProgressNote(selectedYear, month, goal.id, e.target.value)}
                                      className="text-xs bg-yellow-50/50 border-yellow-200/60 placeholder:text-yellow-600/60"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2 pt-3">
                              <Input
                                placeholder={`Add goal for ${month}...`}
                                value={newMonthlyGoalInputs[inputKey] || ''}
                                onChange={(e) => setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMonthlyGoal(selectedYear, month)}
                                className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                              />
                              <Button
                                onClick={() => handleAddMonthlyGoal(selectedYear, month)}
                                disabled={!(newMonthlyGoalInputs[inputKey] || '').trim()}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>

              {/* Right column: Short-Term and Long-Term Goals */}
              <div className="lg:col-span-1 space-y-6">
                {/* Short-Term Goals (1 Year) */}
                <Card className="rounded-lg border border-amber-100 shadow-sm bg-white hover:shadow-md transition-all">
                  <CardHeader className="border-b border-amber-50 bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900">Short-Term (1 Year)</span>
                    </CardTitle>
                    <CardDescription className="ml-11 text-sm text-gray-600">
                      Goals within the next year
                    </CardDescription>
                  </CardHeader>
              <CardContent className="space-y-4 pt-8">
                {shortTermGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-start gap-3 group hover:bg-amber-50/30 p-3 rounded-lg border border-transparent hover:border-amber-100 transition-all">
                      <button
                        onClick={() => handleToggleShortTermGoal(goal.id)}
                        data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : goal.status === 'in-progress'
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {goal.status === 'completed' && <span className="text-white text-xs">✓</span>}
                        {goal.status === 'in-progress' && <span className="text-white text-xs">•</span>}
                      </button>
                      {editingShortTermId === goal.id ? (
                        <Input
                          value={editingShortTermText}
                          onChange={(e) => setEditingShortTermText(e.target.value)}
                          onBlur={handleSaveShortTermGoal}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveShortTermGoal();
                            if (e.key === 'Escape') setEditingShortTermId(null);
                          }}
                          autoFocus
                          className="flex-1 h-8"
                        />
                      ) : (
                        <span
                          className={`flex-1 cursor-pointer ${
                            goal.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}
                          onClick={() => handleEditShortTermGoal(goal.id, goal.text)}
                          title="Click to edit"
                        >
                          {goal.text}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteShortTermGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {goal.status === 'in-progress' && (
                      <div className="ml-8 mr-8">
                        <Input
                          placeholder="Progress notes..."
                          value={goal.progressNote || ''}
                          onChange={(e) => {
                            setShortTermGoals(shortTermGoals.map(g =>
                              g.id === goal.id ? { ...g, progressNote: e.target.value } : g
                            ));
                          }}
                          className="text-xs bg-yellow-50/50 border-yellow-200/60 placeholder:text-yellow-600/60"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-3">
                  <Input
                    placeholder="Add a 1-year goal..."
                    value={newShortTermGoal}
                    onChange={(e) => setNewShortTermGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddShortTermGoal()}
                    className="border-2 border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                  <Button onClick={handleAddShortTermGoal} disabled={!newShortTermGoal.trim()} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                </CardContent>
              </Card>

                {/* Long-Term Goals (3 Years) */}
                <Card className="rounded-lg border border-emerald-100 shadow-sm bg-white hover:shadow-md transition-all">
                  <CardHeader className="border-b border-emerald-50 bg-gradient-to-r from-emerald-50/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900">Long-Term (3 Years)</span>
                    </CardTitle>
                    <CardDescription className="ml-11 text-sm text-gray-600">
                      Your 3-year vision
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-8">
                {longTermGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-start gap-3 group hover:bg-emerald-50/30 p-3 rounded-lg border border-transparent hover:border-emerald-100 transition-all">
                      <button
                        onClick={() => handleToggleLongTermGoal(goal.id)}
                        data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : goal.status === 'in-progress'
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {goal.status === 'completed' && <span className="text-white text-xs">✓</span>}
                        {goal.status === 'in-progress' && <span className="text-white text-xs">•</span>}
                      </button>
                      {editingLongTermId === goal.id ? (
                        <Input
                          value={editingLongTermText}
                          onChange={(e) => setEditingLongTermText(e.target.value)}
                          onBlur={handleSaveLongTermGoal}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLongTermGoal();
                            if (e.key === 'Escape') setEditingLongTermId(null);
                          }}
                          autoFocus
                          className="flex-1 h-8"
                        />
                      ) : (
                        <span
                          className={`flex-1 cursor-pointer ${
                            goal.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}
                          onClick={() => handleEditLongTermGoal(goal.id, goal.text)}
                          title="Click to edit"
                        >
                          {goal.text}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteLongTermGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {goal.status === 'in-progress' && (
                      <div className="ml-8 mr-8">
                        <Input
                          placeholder="Progress notes..."
                          value={goal.progressNote || ''}
                          onChange={(e) => {
                            setLongTermGoals(longTermGoals.map(g =>
                              g.id === goal.id ? { ...g, progressNote: e.target.value } : g
                            ));
                          }}
                          className="text-xs bg-yellow-50/50 border-yellow-200/60 placeholder:text-yellow-600/60"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-3">
                  <Input
                    placeholder="Add a 3-year goal..."
                    value={newLongTermGoal}
                    onChange={(e) => setNewLongTermGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLongTermGoal()}
                    className="border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                  <Button onClick={handleAddLongTermGoal} disabled={!newLongTermGoal.trim()} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;
