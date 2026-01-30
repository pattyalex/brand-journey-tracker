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
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Heart,
  Compass,
  Check,
  Copy,
  Sparkles,
  X,
  Link2,
  Paperclip,
  StickyNote
} from "lucide-react";

const StrategyGrowth = () => {
  // Brand Identity states
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>(["25-34"]);
  const [audienceStruggles, setAudienceStruggles] = useState("");
  const [audienceDesires, setAudienceDesires] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(["relatable"]);
  const [brandValues, setBrandValues] = useState<string[]>(() => {
    const saved = getString(StorageKeys.brandValues);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [customValueInput, setCustomValueInput] = useState("");
  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(null);
  const [editingValueText, setEditingValueText] = useState("");
  const [missionStatement, setMissionStatement] = useState(() => getString(StorageKeys.missionStatement) || "");
  const [missionStatementFocused, setMissionStatementFocused] = useState(false);
  const [showMissionExamples, setShowMissionExamples] = useState(true);
  const [contentValues, setContentValues] = useState(() => getString(StorageKeys.contentValues) || "");
  const [contentValuesFocused, setContentValuesFocused] = useState(false);
  const [showValuesExamples, setShowValuesExamples] = useState(true);
  const [showMissionSaved, setShowMissionSaved] = useState(false);
  const [showValuesSaved, setShowValuesSaved] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(() => getString("strategyNotes") || "");
  const [noteLinks, setNoteLinks] = useState<{ url: string; title: string }[]>(() => {
    const saved = getString("strategyNoteLinks");
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });
  const [noteFiles, setNoteFiles] = useState<{ name: string; data: string }[]>(() => {
    const saved = getString("strategyNoteFiles");
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
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
    const timer = setTimeout(() => {
      try {
        setString(StorageKeys.missionStatement, missionStatement);
        if (missionStatement.trim()) {
          setShowMissionSaved(true);
          setTimeout(() => setShowMissionSaved(false), 1500);
        }
      } catch (error) {
        console.error('Failed to save mission statement:', error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [missionStatement]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setString(StorageKeys.contentValues, contentValues);
        if (contentValues.trim()) {
          setShowValuesSaved(true);
          setTimeout(() => setShowValuesSaved(false), 1500);
        }
      } catch (error) {
        console.error('Failed to save content values:', error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [contentValues]);

  useEffect(() => {
    try {
      setString(StorageKeys.brandValues, JSON.stringify(brandValues));
    } catch (error) {
      console.error('Failed to save brand values:', error);
    }
  }, [brandValues]);

  // Save notes data
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setString("strategyNotes", additionalNotes);
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [additionalNotes]);

  useEffect(() => {
    try {
      setString("strategyNoteLinks", JSON.stringify(noteLinks));
    } catch (error) {
      console.error('Failed to save note links:', error);
    }
  }, [noteLinks]);

  useEffect(() => {
    try {
      setString("strategyNoteFiles", JSON.stringify(noteFiles));
    } catch (error) {
      console.error('Failed to save note files:', error);
    }
  }, [noteFiles]);

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
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
              <TabsTrigger
                value="brand-identity"
                className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#612A4F] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#8B7082] data-[state=inactive]:hover:text-[#612A4F] data-[state=inactive]:hover:bg-[#F5F0F3]"
              >
                <PenTool className="w-4 h-4 mr-2 inline-block" />
                Positioning
              </TabsTrigger>
              <TabsTrigger
                value="growth-goals"
                className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#612A4F] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#8B7082] data-[state=inactive]:hover:text-[#612A4F] data-[state=inactive]:hover:bg-[#F5F0F3]"
              >
                <TrendingUp className="w-4 h-4 mr-2 inline-block" />
                Growth Goals
              </TabsTrigger>
            </TabsList>

            {/* Positioning Tab */}
            <TabsContent value="brand-identity" className="space-y-4 mt-0">
              {/* Mission Statement */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Mission Statement</span>
                    {missionStatement.trim() && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                    {showMissionSaved && (
                      <div className="flex items-center gap-1 px-2 py-0.5 text-[#8B7082] text-xs font-medium animate-in fade-in duration-200">
                        <Check className="w-3 h-3" />
                        Saved
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    Why you create content and who you help
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-6">
                    {/* Textarea */}
                    <div className="flex-1">
                      <Textarea
                        value={missionStatement}
                        onChange={(e) => setMissionStatement(e.target.value)}
                        className="min-h-[160px] h-full resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed bg-white"
                        placeholder={missionStatementFocused ? "" : "Write a short sentence that explains who your content is for and what you want it to do for them..."}
                        onFocus={() => setMissionStatementFocused(true)}
                        onBlur={() => setMissionStatementFocused(false)}
                      />
                    </div>

                    {/* Examples Panel */}
                    <div className="w-[420px] flex-shrink-0 bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-2xl p-4 border-l-4 border-[#8B7082]/30">
                      <p className="text-[11px] font-medium text-[#8B7082] mb-3">Examples</p>
                      <div className="space-y-2">
                        {[
                          "I create content to help busy people build healthy routines they can actually stick to",
                          "I create content to inspire women to dress well without overthinking or overspending",
                          "I create content to help small business founders scale their businesses without burning out"
                        ].map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => setMissionStatement(example)}
                            className="w-full text-left text-[13px] text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg px-3 py-2.5 transition-all"
                          >
                            <span className="leading-relaxed">"{example}"</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Values */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Brand Values</span>
                    {brandValues.length >= 3 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    Define 3–5 values that guide your content creation and personal brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-6">
                    {/* Input area */}
                    <div className="flex-1 space-y-4">
                      {/* Add value input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={customValueInput}
                          onChange={(e) => setCustomValueInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customValueInput.trim() && brandValues.length < 5) {
                              e.preventDefault();
                              if (!brandValues.includes(customValueInput.trim())) {
                                setBrandValues([...brandValues, customValueInput.trim()]);
                                setCustomValueInput("");
                              }
                            }
                          }}
                          placeholder="Add a value (e.g., 'I don't take myself too seriously online')..."
                          disabled={brandValues.length >= 5}
                          className="flex-1 px-4 py-3 text-sm border border-[#E8E4E6] rounded-xl focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                        <button
                          onClick={() => {
                            if (customValueInput.trim() && brandValues.length < 5 && !brandValues.includes(customValueInput.trim())) {
                              setBrandValues([...brandValues, customValueInput.trim()]);
                              setCustomValueInput("");
                            }
                          }}
                          disabled={!customValueInput.trim() || brandValues.length >= 5}
                          className="px-5 py-3 text-sm font-medium bg-[#8B7082] text-white rounded-lg hover:bg-[#7A6171] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {/* Selected values display - Quote style cards */}
                      {brandValues.length > 0 && (
                        <div>
                          <p className="text-[11px] text-gray-500 mb-3">Your values ({brandValues.length}/5)</p>
                          <div className="space-y-3">
                            {brandValues.map((value, index) => (
                              <div
                                key={index}
                                className="relative bg-white rounded-xl pl-5 pr-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
                              >
                                <span className="absolute top-3 left-4 text-[#612A4F] text-4xl font-serif leading-none">{index + 1}</span>
                                {editingValueIndex === index ? (
                                  <input
                                    type="text"
                                    value={editingValueText}
                                    onChange={(e) => setEditingValueText(e.target.value)}
                                    onBlur={() => {
                                      if (editingValueText.trim()) {
                                        const newValues = [...brandValues];
                                        newValues[index] = editingValueText.trim();
                                        setBrandValues(newValues);
                                      }
                                      setEditingValueIndex(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (editingValueText.trim()) {
                                          const newValues = [...brandValues];
                                          newValues[index] = editingValueText.trim();
                                          setBrandValues(newValues);
                                        }
                                        setEditingValueIndex(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingValueIndex(null);
                                      }
                                    }}
                                    autoFocus
                                    className="w-full text-sm text-gray-700 pl-8 pr-6 leading-relaxed bg-transparent border-none outline-none focus:ring-0"
                                  />
                                ) : (
                                  <p
                                    onClick={() => {
                                      setEditingValueIndex(index);
                                      setEditingValueText(value);
                                    }}
                                    className="text-sm text-gray-700 pl-8 pr-6 leading-relaxed cursor-text hover:text-gray-900"
                                  >
                                    "{value}"
                                  </p>
                                )}
                                <button
                                  onClick={() => setBrandValues(brandValues.filter((_, i) => i !== index))}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {brandValues.length < 3 && (
                        <p className="text-xs text-amber-600">Add at least {3 - brandValues.length} more value{3 - brandValues.length > 1 ? 's' : ''}</p>
                      )}
                    </div>

                    {/* Guidelines panel - 2x2 grid */}
                    <div className="w-[420px] flex-shrink-0">
                      <p className="text-[11px] text-[#8B7082] font-medium px-1 mb-3">Examples</p>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Truth values */}
                        <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                          <p className="text-[11px] font-medium text-gray-700 mb-1">Alignment</p>
                          <p className="text-[10px] text-gray-400 mb-2">Being true to yourself</p>
                          <div className="space-y-1">
                            {[
                              "I won't say things I'm not fully aligned with just because they perform well",
                              "I won't promote brands I don't believe in, even if the money is good"
                            ].map((example) => (
                              <button
                                key={example}
                                onClick={() => {
                                  if (brandValues.length < 5 && !brandValues.includes(example)) {
                                    setBrandValues([...brandValues, example]);
                                  }
                                }}
                                className="block w-full text-left text-[10px] px-2 py-1.5 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Boundary values */}
                        <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                          <p className="text-[11px] font-medium text-gray-700 mb-1">Boundaries</p>
                          <p className="text-[10px] text-gray-400 mb-2">Your non-negotiables</p>
                          <div className="space-y-1">
                            {[
                              "No content that puts others down",
                              "I share everything about my life and show up fully as myself",
                              "I keep certain parts of my life private"
                            ].map((example) => (
                              <button
                                key={example}
                                onClick={() => {
                                  if (brandValues.length < 5 && !brandValues.includes(example)) {
                                    setBrandValues([...brandValues, example]);
                                  }
                                }}
                                className="block w-full text-left text-[10px] px-2 py-1.5 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Craft values */}
                        <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                          <p className="text-[11px] font-medium text-gray-700 mb-1">Craft Values</p>
                          <p className="text-[10px] text-gray-400 mb-2">How you create</p>
                          <div className="flex flex-wrap gap-1">
                            {["Quality over quantity", "Taste over trends", "Post often without overthinking"].map((example) => (
                              <button
                                key={example}
                                onClick={() => {
                                  if (brandValues.length < 5 && !brandValues.includes(example)) {
                                    setBrandValues([...brandValues, example]);
                                  }
                                }}
                                className="text-[10px] px-2 py-1 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Power values */}
                        <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                          <p className="text-[11px] font-medium text-gray-700 mb-1">Presence</p>
                          <p className="text-[10px] text-gray-400 mb-2">The energy people feel from you</p>
                          <div className="flex flex-wrap gap-1">
                            {["Self-respect", "Elegance", "Calm authority", "Boldness", "Confidence"].map((example) => (
                              <button
                                key={example}
                                onClick={() => {
                                  if (brandValues.length < 5 && !brandValues.includes(example)) {
                                    setBrandValues([...brandValues, example]);
                                  }
                                }}
                                className="text-[10px] px-2 py-1 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Style */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Content Style</span>
                    {selectedTones.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    How you choose to deliver your message — select one or more
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-5 gap-3">
                    {["Humorous", "Aspirational", "Warm", "Educational", "Relatable", "Motivational", "Bold", "Cinematic", "Calming", "Inspirational"].map((tone) => {
                      const toneKey = tone.toLowerCase();
                      const isSelected = selectedTones.includes(toneKey);
                      return (
                        <button
                          key={tone}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTones(selectedTones.filter(t => t !== toneKey));
                            } else {
                              setSelectedTones([...selectedTones, toneKey]);
                            }
                          }}
                          className={`py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                            isSelected
                              ? "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white shadow-[0_2px_8px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                              : "bg-gradient-to-b from-white to-[#FAF7F8] text-[#6B5B63] hover:text-[#612A4F] hover:from-[#FAF7F8] hover:to-[#F5F0F3] border border-[#E8E4E6] hover:border-[#D5CDD2] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                          }`}
                        >
                          {tone}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Target Audience</span>
                    {(audienceAgeRanges.length > 0 || audienceDesires.trim()) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    Define who your ideal audience is
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4 pb-6">
                  <div className="space-y-3">
                    <Label htmlFor="age-range" className="text-sm font-semibold text-gray-800">Age Range</Label>
                    <div className="inline-flex rounded-xl border border-[#E8E4E6] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      {["18-24", "25-34", "35-44", "45-54", "55+"].map((range, index) => {
                        const isSelected = audienceAgeRanges.includes(range);
                        return (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setAudienceAgeRanges(audienceAgeRanges.filter(r => r !== range));
                              } else if (audienceAgeRanges.length < 3) {
                                setAudienceAgeRanges([...audienceAgeRanges, range]);
                              } else {
                                import("@/hooks/use-toast").then(({ showMaxAgeRangesSelectedToast }) => {
                                  showMaxAgeRangesSelectedToast();
                                });
                              }
                            }}
                            className={`px-5 py-2.5 text-[13px] font-medium transition-all ${
                              index > 0 ? "border-l border-[#E8E4E6]" : ""
                            } ${
                              isSelected
                                ? "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                : "bg-gradient-to-b from-white to-[#FAF7F8] text-[#6B5B63] hover:text-[#612A4F] hover:from-[#FAF7F8] hover:to-[#F5F0F3]"
                            }`}
                          >
                            {range}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="struggles" className="text-sm font-semibold text-gray-800">Struggles</Label>
                      <Textarea
                        id="struggles"
                        value={audienceStruggles}
                        onChange={(e) => setAudienceStruggles(e.target.value)}
                        placeholder={strugglesFocused ? "" : "What pain points or challenges does your audience face? What problems are they trying to solve?"}
                        onFocus={() => setStrugglesFocused(true)}
                        onBlur={() => setStrugglesFocused(false)}
                        className="h-[240px] resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="desires" className="text-sm font-semibold text-gray-800">Desires</Label>
                      <Textarea
                        id="desires"
                        value={audienceDesires}
                        onChange={(e) => setAudienceDesires(e.target.value)}
                        placeholder={desiresFocused ? "" : "What are your audience's goals and aspirations? What transformation are they seeking?"}
                        onFocus={() => setDesiresFocused(true)}
                        onBlur={() => setDesiresFocused(false)}
                        className="h-[240px] resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vision Board */}
              <Card id="vision-board" className="rounded-xl bg-white border-0 shadow-none scroll-mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Vision Board</span>
                    {(visionBoardImages.length > 0 || pinterestUrl) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    Keep your visual inspiration close — revisit it whenever you need creative direction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
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
                            className="absolute top-4 right-4 p-2 bg-gray-800/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-900/80"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Section - Two button layout */}
                  {visionBoardImages.length === 0 && (
                    <div className="flex items-center gap-4">
                      {/* Open Pinterest Board Button */}
                      <button
                        onClick={() => {
                          if (pinterestUrl) {
                            window.open(pinterestUrl, '_blank');
                          } else {
                            const url = prompt('Enter your Pinterest board URL:');
                            if (url) updatePinterestUrl(url);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
                      >
                        <ArrowUpRight className="w-4 h-4 text-[#8B7082]" />
                        <span className="text-sm font-medium text-[#4A4A4A]">Open Pinterest Board</span>
                      </button>

                      <span className="text-sm text-[#8B7082]">or</span>

                      {/* Upload Image Button */}
                      <button
                        onClick={handleUploadClick}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
                      >
                        <Upload className="w-4 h-4 text-[#8B7082]" />
                        <span className="text-sm font-medium text-[#4A4A4A]">Upload image instead</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleVisionBoardUpload}
                      />
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

                  {/* Pinterest Board - Button style */}
                  {pinterestUrl ? (
                    <div className="flex items-center gap-3 group">
                      <button
                        onClick={() => window.open(pinterestUrl, '_blank')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F5F0F4] to-[#EDE5EB] hover:from-[#EDE5EB] hover:to-[#E5DAE2] rounded-lg text-[13px] font-medium text-[#612A4F] transition-all shadow-sm hover:shadow"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Open Pinterest Board</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updatePinterestUrl("")}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[#8B7082]" />
                      <input
                        type="text"
                        placeholder="Add Pinterest board URL..."
                        value={pinterestUrl}
                        onChange={(e) => updatePinterestUrl(e.target.value)}
                        className="text-[13px] px-0 py-1 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-[#8B7082] text-gray-700 w-64"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Notes</span>
                    {(additionalNotes.trim() || noteLinks.length > 0 || noteFiles.length > 0) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-500">
                    Capture any additional thoughts, resources, or references
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-6">
                    {/* Textarea */}
                    <div className="flex-1">
                      <Textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Write any additional notes about your brand strategy..."
                        className="min-h-[180px] h-full resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
                      />
                    </div>

                    {/* Links & Attachments Panel */}
                    <div className="w-72 flex-shrink-0 bg-gradient-to-b from-[#FAF8F9] to-[#F0E8ED] rounded-xl p-4 space-y-4">
                      {/* Links */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-[#8B7082] font-medium flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" /> Links
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {noteLinks.map((link, index) => (
                            <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                              <button
                                onClick={() => window.open(link.url, '_blank')}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-[#612A4F] hover:text-[#4A1F3D] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {link.title}
                              </button>
                              <button
                                onClick={() => setNoteLinks(noteLinks.filter((_, i) => i !== index))}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {!showAddLinkForm && (
                            <button
                              onClick={() => setShowAddLinkForm(true)}
                              className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#E8E4E6] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors bg-white/50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {showAddLinkForm && (
                          <div className="space-y-1.5">
                            <input
                              value={newLinkTitle}
                              onChange={(e) => setNewLinkTitle(e.target.value)}
                              placeholder="Link name..."
                              autoFocus
                              className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-[#D8C8E0] focus:outline-none focus:ring-1 focus:ring-[#8B7082] bg-white/80"
                            />
                            <div className="flex gap-1.5">
                              <input
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                placeholder="URL..."
                                className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#D8C8E0] focus:outline-none focus:ring-1 focus:ring-[#8B7082] bg-white/80"
                              />
                              <button
                                onClick={() => {
                                  if (newLinkUrl.trim() && newLinkTitle.trim()) {
                                    setNoteLinks([...noteLinks, { url: newLinkUrl.trim(), title: newLinkTitle.trim() }]);
                                    setNewLinkUrl("");
                                    setNewLinkTitle("");
                                    setShowAddLinkForm(false);
                                  }
                                }}
                                disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                                className="text-[11px] px-3 py-1.5 bg-[#8B7082] text-white rounded-lg hover:bg-[#7A6171] disabled:bg-gray-300 disabled:text-gray-500"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddLinkForm(false);
                                  setNewLinkTitle("");
                                  setNewLinkUrl("");
                                }}
                                className="text-[11px] px-2 py-1.5 text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attachments */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-[#8B7082] font-medium flex items-center gap-1.5">
                          <Paperclip className="w-3 h-3" /> Files
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {noteFiles.map((file, index) => (
                            <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                              <FileText className="w-3 h-3 text-[#8B7082] flex-shrink-0" />
                              <span className="text-[11px] font-medium text-gray-600 max-w-[100px] truncate">{file.name}</span>
                              <button
                                onClick={() => setNoteFiles(noteFiles.filter((_, i) => i !== index))}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <input
                            type="file"
                            id="note-file-upload"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size <= 5 * 1024 * 1024) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setNoteFiles([...noteFiles, { name: file.name, data: reader.result as string }]);
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = "";
                            }}
                          />
                          <button
                            onClick={() => document.getElementById("note-file-upload")?.click()}
                            className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#E8E4E6] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors bg-white/50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
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
              <Card className="lg:col-span-1 rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="border-b border-[#E8E4E6]/50 bg-gradient-to-r from-[#F5F0F3]/50 to-transparent">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#8B7082] text-white shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#612A4F]">Monthly Goals</span>
                    {monthlyGoalsData[selectedYear] && Object.values(monthlyGoalsData[selectedYear]).some(goals => goals.length > 0) && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Complete
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="ml-11 text-sm text-gray-600">
                    Set and track goals for any month
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="flex gap-4 items-center justify-between flex-wrap bg-[#F5F0F3]/30 p-4 rounded-lg border border-[#E8E4E6]/50">
                  <div className="flex gap-3 items-center">
                    <Label htmlFor="year-select" className="text-sm font-semibold text-gray-700">Year:</Label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 border-2 border-[#E8E4E6] rounded-lg bg-white font-medium text-sm focus:ring-2 focus:ring-[#612A4F]/20 focus:border-[#612A4F]"
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
                          className="px-3 py-2 border-2 border-[#E8E4E6] rounded-lg bg-white font-medium text-sm focus:ring-2 focus:ring-[#612A4F]/20 focus:border-[#612A4F]"
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
                      className="flex items-center gap-2 border-2 hover:bg-[#F5F0F3] border-[#E8E4E6] hover:border-[#D5CDD2]"
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
                                <div className="flex items-start gap-3 group hover:bg-[#F5F0F3]/30 p-3 rounded-lg border border-transparent hover:border-[#E8E4E6] transition-all">
                                  <button
                                    onClick={() => handleToggleMonthlyGoal(selectedYear, month, goal.id)}
                                    data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-[#7a9a7a] border-[#7a9a7a]'
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
                                className="border-2 border-gray-200 focus:border-[#8B7082] focus:ring-2 focus:ring-[#8B7082]/20"
                              />
                              <Button
                                onClick={() => handleAddMonthlyGoal(selectedYear, month)}
                                disabled={!(newMonthlyGoalInputs[inputKey] || '').trim()}
                                className="bg-[#8B7082] hover:bg-[#7a6172]"
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
                <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <CardHeader className="border-b border-[#E8E4E6]/50 bg-gradient-to-r from-[#F5F0F3]/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-[#612A4F]">Short-Term (1 Year)</span>
                      {shortTermGoals.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Complete
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription className="ml-11 text-sm text-gray-600">
                      Goals within the next year
                    </CardDescription>
                  </CardHeader>
              <CardContent className="space-y-4 pt-8">
                {shortTermGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-start gap-3 group hover:bg-[#F5F0F3]/30 p-3 rounded-lg border border-transparent hover:border-[#E8E4E6] transition-all">
                      <button
                        onClick={() => handleToggleShortTermGoal(goal.id)}
                        data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-[#7a9a7a] border-[#7a9a7a]'
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
                    className="border-2 border-gray-200 focus:border-[#612A4F] focus:ring-2 focus:ring-[#612A4F]/20"
                  />
                  <Button onClick={handleAddShortTermGoal} disabled={!newShortTermGoal.trim()} className="bg-[#612A4F] hover:bg-[#4d2140]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                </CardContent>
              </Card>

                {/* Long-Term Goals (3 Years) */}
                <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <CardHeader className="border-b border-[#E8E4E6]/50 bg-gradient-to-r from-[#EDF3ED]/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="p-2 rounded-lg bg-[#7a9a7a] text-white shadow-sm">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-[#612A4F]">Long-Term (3 Years)</span>
                      {longTermGoals.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Complete
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription className="ml-11 text-sm text-gray-600">
                      Your 3-year vision
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-8">
                {longTermGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-start gap-3 group hover:bg-[#EDF3ED]/30 p-3 rounded-lg border border-transparent hover:border-[#D5E5D5] transition-all">
                      <button
                        onClick={() => handleToggleLongTermGoal(goal.id)}
                        data-onboarding="goal-status-box"
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          goal.status === 'completed'
                            ? 'bg-[#7a9a7a] border-[#7a9a7a]'
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
                    className="border-2 border-gray-200 focus:border-[#7a9a7a] focus:ring-2 focus:ring-[#7a9a7a]/20"
                  />
                  <Button onClick={handleAddLongTermGoal} disabled={!newLongTermGoal.trim()} className="bg-[#7a9a7a] hover:bg-[#6a8a6a]">
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
