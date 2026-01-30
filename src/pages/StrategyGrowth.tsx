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
  const [showPinterestInput, setShowPinterestInput] = useState(false);
  const { images: visionBoardImages, pinterestUrl, addImage: addVisionBoardImage, removeImage: removeVisionBoardImage, updatePinterestUrl } = useVisionBoard();

  // Growth Goals states with progress tracking
  type GoalStatus = 'not-started' | 'in-progress' | 'completed';
  interface Goal {
    id: number;
    text: string;
    status: GoalStatus;
    progressNote?: string;
    progress?: { current: number; target: number };
    linkedGoalId?: number; // For monthly goals to link to annual goals
  }

  // 3-Year Vision state
  const [threeYearVision, setThreeYearVision] = useState<string>(() => {
    const saved = getString('threeYearVision');
    return saved || '';
  });

  // Save 3-year vision
  useEffect(() => {
    setString('threeYearVision', threeYearVision);
  }, [threeYearVision]);

  // Selected month for pill selector (short form)
  const [selectedMonthPill, setSelectedMonthPill] = useState<string>(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });

  // Map short month to full month name
  const monthShortToFull: { [key: string]: string } = {
    "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
    "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
    "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
  };
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
      <div className="w-full h-full mx-auto px-8 py-6 bg-gradient-to-br from-[#F7F4F5] via-[#FAFAFA] to-[#FFFDF9] overflow-auto">
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
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                                ? "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-lg"
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
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {/* Open Pinterest Board Button */}
                        {showPinterestInput ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Paste Pinterest board URL..."
                              autoFocus
                              className="px-4 py-2.5 text-sm border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 w-64"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                  updatePinterestUrl((e.target as HTMLInputElement).value);
                                  setShowPinterestInput(false);
                                }
                                if (e.key === 'Escape') {
                                  setShowPinterestInput(false);
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value) {
                                  updatePinterestUrl(e.target.value);
                                }
                                setShowPinterestInput(false);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <button
                              onClick={() => {
                                if (pinterestUrl) {
                                  window.open(pinterestUrl, '_blank');
                                } else {
                                  setShowPinterestInput(true);
                                }
                              }}
                              className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
                            >
                              <ArrowUpRight className="w-4 h-4 text-[#8B7082]" />
                              <span className="text-sm font-medium text-[#4A4A4A]">{pinterestUrl ? 'Open Pinterest Board' : 'Link Pinterest Board'}</span>
                            </button>
                            {pinterestUrl && (
                              <button
                                onClick={() => updatePinterestUrl('')}
                                className="p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove Pinterest link"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}

                        <span className="text-sm text-[#8B7082]">or</span>

                        {/* Upload Image Button */}
                        <button
                          onClick={handleUploadClick}
                          className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
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

                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
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
                    <div className="w-72 flex-shrink-0 bg-gradient-to-b from-[#FAF8F9] to-[#F0E8ED] rounded-xl p-4 space-y-4 border-l-4 border-[#612A4F]/30">
                      {/* Links */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-[#8B7082] font-medium flex items-center gap-1.5">
                          <ArrowUpRight className="w-3 h-3" /> Links
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {noteLinks.map((link, index) => (
                            <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                              <button
                                onClick={() => window.open(link.url, '_blank')}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-[#612A4F] hover:text-[#4A1F3D] transition-colors"
                              >
                                <ArrowUpRight className="w-3 h-3" />
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
                              className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#D5CDD2] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors"
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
                          <FileText className="w-3 h-3" /> Files
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {noteFiles.map((file, index) => (
                            <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                              <FileText className="w-3 h-3 text-[#612A4F] flex-shrink-0" />
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
                            className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#D5CDD2] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors"
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
          <TabsContent value="growth-goals" className="space-y-8 mt-0">

            {/* SECTION 1: 3-Year Vision Hero Banner */}
            <div
              className="relative overflow-hidden p-10 shadow-[0_8px_32px_rgba(97,42,79,0.25)]"
              style={{
                background: 'linear-gradient(135deg, #4a3442 0%, #6b4a5e 50%, #8b6a7e 100%)',
                borderRadius: '24px'
              }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full -translate-y-1/3 translate-x-1/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/3" style={{ background: 'rgba(255,255,255,0.03)' }} />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
              <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-1">
                  <div
                    className="flex items-center justify-center backdrop-blur-sm"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.15)'
                    }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Your North Star
                    </p>
                    <h2 className="text-[32px] font-semibold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      3-Year Vision
                    </h2>
                  </div>
                </div>
                <p className="text-sm mb-6 ml-[60px]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>
                  Where do you see yourself and your brand in 3 years? Dream big.
                </p>

                <div
                  className="backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '4px'
                  }}
                >
                  <textarea
                    value={threeYearVision}
                    onChange={(e) => setThreeYearVision(e.target.value)}
                    placeholder="In 3 years, I want to..."
                    className="w-full min-h-[160px] bg-transparent border-0 rounded-xl p-5 text-white placeholder:text-white/40 text-base leading-relaxed resize-none focus:outline-none transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: 1-Year Goals */}
            <div
              className="bg-white p-6"
              style={{
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center text-white"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(145deg, #7a9a7a 0%, #5a8a5a 100%)'
                    }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif" }}>1-Year Goals</h3>
                    {shortTermGoals.length > 0 && (
                      <span className="text-xs text-[#7a9a7a]">
                        {shortTermGoals.filter(g => g.status === 'completed').length}/{shortTermGoals.length} completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new annual goal..."
                    value={newShortTermGoal}
                    onChange={(e) => setNewShortTermGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddShortTermGoal()}
                    className="w-64 h-10 text-sm border border-[#E8E4E6] focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
                    style={{ borderRadius: '14px' }}
                  />
                  <button
                    onClick={handleAddShortTermGoal}
                    disabled={!newShortTermGoal.trim()}
                    className="px-5 h-10 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                      borderRadius: '14px'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </div>
              </div>

              {/* Goal Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortTermGoals.map((goal, index) => {
                  const colorSchemes = [
                    { bg: 'rgba(107, 74, 94, 0.08)', accent: '#6b4a5e', accentRgb: '107, 74, 94' },
                    { bg: 'rgba(122, 154, 122, 0.08)', accent: '#5a8a5a', accentRgb: '90, 138, 90' },
                    { bg: 'rgba(166, 138, 100, 0.08)', accent: '#a68a64', accentRgb: '166, 138, 100' },
                  ];
                  const scheme = colorSchemes[index % 3];
                  const progressPercent = goal.status === 'completed' ? 100 : goal.status === 'in-progress' ? 50 : 0;

                  return (
                    <div
                      key={goal.id}
                      className="relative group transition-all duration-200 hover:shadow-md"
                      style={{
                        background: scheme.bg,
                        borderRadius: '16px',
                        padding: '20px 24px'
                      }}
                    >
                      {/* Goal Number */}
                      <span
                        className="absolute top-4 right-5"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '32px',
                          fontWeight: 600,
                          color: scheme.accent,
                          opacity: 0.6
                        }}
                      >
                        {index + 1}
                      </span>

                      {/* Goal Content */}
                      <div className="pr-10">
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
                            className="mb-4 text-sm"
                          />
                        ) : (
                          <p
                            className={`text-sm font-medium mb-5 cursor-pointer transition-colors ${goal.status === 'completed' ? 'line-through' : ''}`}
                            style={{ color: goal.status === 'completed' ? '#8b7a85' : '#3d3a38' }}
                            onClick={() => handleEditShortTermGoal(goal.id, goal.text)}
                          >
                            {goal.text}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div
                            className="overflow-hidden"
                            style={{
                              height: '8px',
                              borderRadius: '10px',
                              background: 'rgba(139, 115, 130, 0.1)'
                            }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${progressPercent}%`,
                                borderRadius: '10px',
                                background: `linear-gradient(90deg, ${scheme.accent} 0%, ${scheme.accent}cc 100%)`
                              }}
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[13px] font-bold" style={{ color: scheme.accent }}>{progressPercent}%</span>
                          </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => handleToggleShortTermGoal(goal.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                            style={{
                              background: goal.status === 'completed'
                                ? 'linear-gradient(145deg, #8aae8a 0%, #6a9a6a 100%)'
                                : goal.status === 'in-progress'
                                ? 'linear-gradient(145deg, #f0c040 0%, #daa520 100%)'
                                : 'white',
                              color: goal.status !== 'not-started' ? 'white' : '#6b5b63',
                              border: goal.status === 'not-started' ? '1px solid #e8e4e6' : 'none'
                            }}
                          >
                            {goal.status === 'completed' ? '✓ Complete' : goal.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                          </button>
                          <button
                            onClick={() => handleDeleteShortTermGoal(goal.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {shortTermGoals.length === 0 && (
                  <div
                    className="col-span-full text-center py-12 border border-dashed"
                    style={{
                      background: 'linear-gradient(145deg, rgba(122, 154, 122, 0.05) 0%, rgba(122, 154, 122, 0.1) 100%)',
                      borderRadius: '16px',
                      borderColor: 'rgba(122, 154, 122, 0.2)'
                    }}
                  >
                    <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(122, 154, 122, 0.4)' }} />
                    <p className="text-sm" style={{ color: '#7a9a7a' }}>No annual goals yet</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(122, 154, 122, 0.6)' }}>Add your first 1-year goal above</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: Monthly Goals */}
            <div
              className="bg-white p-6"
              style={{
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center text-white"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)'
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif" }}>Monthly Goals</h3>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 text-sm border border-[#E8E4E6] bg-white text-[#612A4F] font-medium focus:outline-none focus:border-[#612a4f]"
                  style={{ borderRadius: '12px' }}
                >
                  {[...Array(5)].map((_, i) => {
                    const year = 2025 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>

              {/* Month Pill Selector */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
                  const fullMonth = monthShortToFull[month];
                  const goals = getMonthlyGoals(selectedYear, fullMonth);
                  const isSelected = selectedMonthPill === month;

                  return (
                    <button
                      key={month}
                      onClick={() => setSelectedMonthPill(month)}
                      className="relative px-5 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                      style={{
                        borderRadius: '12px',
                        background: isSelected
                          ? 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)'
                          : 'white',
                        color: isSelected ? 'white' : '#8B7082',
                        border: isSelected ? 'none' : '1px solid #E8E4E6',
                        boxShadow: isSelected
                          ? '0 4px 12px rgba(97, 42, 79, 0.25)'
                          : '0 2px 4px rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      {month}
                      {goals.length > 0 && (
                        <span
                          className="absolute flex items-center justify-center text-[10px] font-bold"
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            top: '-6px',
                            right: '-6px',
                            background: isSelected
                              ? 'white'
                              : 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                            color: isSelected ? '#612A4F' : 'white'
                          }}
                        >
                          {goals.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expanded Month View */}
              {(() => {
                const fullMonth = monthShortToFull[selectedMonthPill];
                const goals = getMonthlyGoals(selectedYear, fullMonth);
                const inputKey = `${selectedYear}-${fullMonth}`;
                const completedCount = goals.filter(g => g.status === 'completed').length;

                return (
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(139, 115, 130, 0.03) 0%, rgba(139, 115, 130, 0.06) 100%)',
                      borderRadius: '18px',
                      padding: '24px',
                      border: '1px solid rgba(139, 115, 130, 0.08)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#612A4F]" />
                        <h4 className="text-xl text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                          {fullMonth} {selectedYear}
                        </h4>
                      </div>
                      {goals.length > 0 && (
                        <span className="text-sm font-medium" style={{ color: '#7a9a7a' }}>
                          {completedCount}/{goals.length} completed
                        </span>
                      )}
                    </div>

                    {goals.length === 0 ? (
                      <div
                        className="text-center py-10 border border-dashed"
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '14px',
                          borderColor: 'rgba(139, 115, 130, 0.15)'
                        }}
                      >
                        <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(139, 115, 130, 0.3)' }} />
                        <p className="text-sm" style={{ color: '#8B7082' }}>No goals for {fullMonth}</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(139, 115, 130, 0.6)' }}>Add a goal below to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-start gap-3 group bg-white transition-all duration-200 hover:shadow-md"
                            style={{
                              padding: '14px 16px',
                              borderRadius: '14px',
                              border: '1px solid rgba(139, 115, 130, 0.1)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                            }}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleMonthlyGoal(selectedYear, fullMonth, goal.id)}
                              className="flex-shrink-0 flex items-center justify-center transition-all duration-200"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '8px',
                                background: goal.status === 'completed'
                                  ? 'linear-gradient(145deg, #8aae8a 0%, #6a9a6a 100%)'
                                  : goal.status === 'in-progress'
                                  ? 'linear-gradient(145deg, #f0c040 0%, #daa520 100%)'
                                  : 'transparent',
                                border: goal.status === 'not-started' ? '2px solid rgba(139, 115, 130, 0.2)' : 'none',
                                boxShadow: goal.status !== 'not-started' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                              }}
                            >
                              {goal.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
                              {goal.status === 'in-progress' && <span className="w-2 h-2 bg-white rounded-full" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              {editingMonthlyId === goal.id ? (
                                <Input
                                  value={editingMonthlyText}
                                  onChange={(e) => setEditingMonthlyText(e.target.value)}
                                  onBlur={() => handleSaveMonthlyGoal(selectedYear, fullMonth)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveMonthlyGoal(selectedYear, fullMonth);
                                    if (e.key === 'Escape') setEditingMonthlyId(null);
                                  }}
                                  autoFocus
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="text-sm cursor-pointer hover:text-[#612A4F] transition-colors"
                                    style={{
                                      color: goal.status === 'completed' ? '#8b7a85' : '#3d3a38',
                                      textDecoration: goal.status === 'completed' ? 'line-through' : 'none'
                                    }}
                                    onClick={() => handleEditMonthlyGoal(goal.id, goal.text)}
                                  >
                                    {goal.text}
                                  </span>
                                  {goal.linkedGoalId && (
                                    <span
                                      className="px-2 py-0.5 text-[10px] font-medium"
                                      style={{
                                        background: 'rgba(107, 74, 94, 0.1)',
                                        color: '#6b4a5e',
                                        borderRadius: '6px'
                                      }}
                                    >
                                      ↗ Goal {shortTermGoals.findIndex(g => g.id === goal.linkedGoalId) + 1}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteMonthlyGoal(selectedYear, fullMonth, goal.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Goal Input */}
                    <div className="flex gap-3 mt-5">
                      <Input
                        placeholder={`Add a goal for ${fullMonth}...`}
                        value={newMonthlyGoalInputs[inputKey] || ''}
                        onChange={(e) => setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMonthlyGoal(selectedYear, fullMonth)}
                        className="flex-1 h-12 text-sm bg-white border border-[#E8E4E6] focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
                        style={{ borderRadius: '14px' }}
                      />
                      <button
                        onClick={() => handleAddMonthlyGoal(selectedYear, fullMonth)}
                        disabled={!(newMonthlyGoalInputs[inputKey] || '').trim()}
                        className="flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)'
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </TabsContent>
        </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;
