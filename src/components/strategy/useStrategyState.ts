import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, on } from "@/lib/events";
import {
  getUserStrategy,
  updateUserStrategy,
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  batchCreateGoals,
} from "@/services/strategyService";
import { Goal, GoalStatus, GoalProgressStatus, MonthlyGoalsData, monthShortToFull } from "./types";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { toast } from "sonner";

const newTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function useStrategyState() {
  const { user } = useAuth();
  const migrationRanRef = useRef(false);
  const strategyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goalIdMapRef = useRef<Map<string, string>>(new Map());

  // Debounced strategy text save
  const scheduleStrategySave = useCallback((updates: Parameters<typeof updateUserStrategy>[1]) => {
    if (!user?.id) return;
    if (strategyDebounceRef.current) clearTimeout(strategyDebounceRef.current);
    strategyDebounceRef.current = setTimeout(() => {
      updateUserStrategy(user.id!, updates).catch(console.error);
    }, 1000);
  }, [user?.id]);

  // Brand Identity states
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>(() => {
    const saved = getString("audienceAgeRanges");
    if (saved) { try { return JSON.parse(saved); } catch { return ["25-34"]; } }
    return ["25-34"];
  });
  const [audienceStruggles, setAudienceStruggles] = useState(() => getString("audienceStruggles") || "");
  const [audienceDesires, setAudienceDesires] = useState(() => getString("audienceDesires") || "");
  const [selectedTones, setSelectedTones] = useState<string[]>(() => {
    const saved = getString("selectedTones");
    if (saved) { try { return JSON.parse(saved); } catch { return ["relatable"]; } }
    return ["relatable"];
  });
  const [brandValues, setBrandValues] = useState<string[]>(() => {
    const saved = getString(StorageKeys.brandValues);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
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

  // Vision board state
  const [visionBoardImages, setVisionBoardImages] = useState<string[]>(() => {
    const saved = getString(StorageKeys.visionBoardData);
    if (saved) {
      try { return JSON.parse(saved).images || []; } catch { return []; }
    }
    return [];
  });
  const [pinterestUrl, setPinterestUrl] = useState<string>(() => {
    const saved = getString(StorageKeys.visionBoardData);
    if (saved) {
      try { return JSON.parse(saved).pinterestUrl || ''; } catch { return ''; }
    }
    return '';
  });

  const addVisionBoardImage = (imageUrl: string) => {
    setVisionBoardImages(prev => [...prev, imageUrl]);
    return true;
  };
  const removeVisionBoardImage = (index: number) => {
    setVisionBoardImages(prev => prev.filter((_, i) => i !== index));
  };
  const updatePinterestUrl = (url: string) => {
    setPinterestUrl(url);
  };

  // 3-Year Vision state
  const [threeYearVision, setThreeYearVision] = useState<string>(() => {
    const saved = getString('threeYearVision');
    return saved || '';
  });

  // Persist vision board changes to Supabase
  useEffect(() => {
    scheduleStrategySave({
      visionBoardData: {
        images: visionBoardImages.map(src => ({ type: 'image' as const, content: src })),
        pinterestUrl,
        threeYearVision,
      }
    });
  }, [visionBoardImages, pinterestUrl]);

  // Save 3-year vision
  useEffect(() => {
    setString('threeYearVision', threeYearVision);
    scheduleStrategySave({
      visionBoardData: {
        images: visionBoardImages.map(src => ({ type: 'image' as const, content: src })),
        pinterestUrl,
        threeYearVision,
      }
    });
  }, [threeYearVision]);

  // Selected month for pill selector
  const [selectedMonthPill, setSelectedMonthPill] = useState<string>(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });

  const [monthlyGoalsData, setMonthlyGoalsData] = useState<MonthlyGoalsData>(() => {
    const saved = getString(StorageKeys.monthlyGoalsData);
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>(() => {
    const saved = getString(StorageKeys.shortTermGoals);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [longTermGoals, setLongTermGoals] = useState<Goal[]>(() => {
    const saved = getString(StorageKeys.longTermGoals);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [newMonthlyGoalInputs, setNewMonthlyGoalInputs] = useState<{[key: string]: string}>({});
  const [newShortTermGoal, setNewShortTermGoal] = useState("");
  const [isAddingShortTermGoal, setIsAddingShortTermGoal] = useState(false);
  const [newLongTermGoal, setNewLongTermGoal] = useState("");

  const [selectedYear, setSelectedYear] = useState(2026);
  const [expandedMonths, setExpandedMonths] = useState<string[]>(["January"]);

  // Dismissed placeholder state
  const [dismissedGoalPlaceholders, setDismissedGoalPlaceholders] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!user?.id) return;
    try { setDismissedGoalPlaceholders(JSON.parse(localStorage.getItem(`dismissedGoalPlaceholders_${user.id}`) || '{}')); }
    catch { setDismissedGoalPlaceholders({}); }
  }, [user?.id]);
  const dismissGoalPlaceholder = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedGoalPlaceholders(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem(`dismissedGoalPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [focusedMonth, setFocusedMonth] = useState("January");

  const [editingMonthlyId, setEditingMonthlyId] = useState<string | null>(null);
  const [editingShortTermId, setEditingShortTermId] = useState<string | null>(null);
  const [editingLongTermId, setEditingLongTermId] = useState<string | null>(null);

  const [editingMonthlyText, setEditingMonthlyText] = useState("");
  const [editingShortTermText, setEditingShortTermText] = useState("");
  const [editingLongTermText, setEditingLongTermText] = useState("");

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#mission') {
      return 'brand-identity';
    }
    return "growth-goals";
  });
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Check URL params on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Scroll to section if hash is present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#vision-board') {
      setTimeout(() => {
        const element = document.getElementById('vision-board');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (hash === '#mission') {
      setActiveTab('brand-identity');
      setTimeout(() => {
        const element = document.getElementById('mission');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else if (hash === '#monthly-goals') {
      setTimeout(() => {
        const element = document.getElementById('monthly-goals');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Save goals to localStorage
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
      scheduleStrategySave({ missionStatement });
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
      scheduleStrategySave({ contentValues });
    }, 500);
    return () => clearTimeout(timer);
  }, [contentValues]);

  useEffect(() => {
    try {
      setString(StorageKeys.brandValues, JSON.stringify(brandValues));
    } catch (error) {
      console.error('Failed to save brand values:', error);
    }
    scheduleStrategySave({ brandValues });
  }, [brandValues]);

  // Save notes data
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setString("strategyNotes", additionalNotes);
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
      scheduleStrategySave({ strategyNotes: additionalNotes });
    }, 500);
    return () => clearTimeout(timer);
  }, [additionalNotes]);

  useEffect(() => {
    try {
      setString("strategyNoteLinks", JSON.stringify(noteLinks));
    } catch (error) {
      console.error('Failed to save note links:', error);
    }
    scheduleStrategySave({ strategyNoteLinks: noteLinks });
  }, [noteLinks]);

  useEffect(() => {
    try {
      setString("strategyNoteFiles", JSON.stringify(noteFiles));
    } catch (error) {
      console.error('Failed to save note files:', error);
    }
    scheduleStrategySave({ strategyNoteFiles: noteFiles });
  }, [noteFiles]);

  // Save selected tones
  useEffect(() => {
    try {
      setString("selectedTones", JSON.stringify(selectedTones));
    } catch (error) {
      console.error('Failed to save selected tones:', error);
    }
    scheduleStrategySave({ selectedTones });
  }, [selectedTones]);

  // Save audience age ranges
  useEffect(() => {
    try {
      setString("audienceAgeRanges", JSON.stringify(audienceAgeRanges));
    } catch (error) {
      console.error('Failed to save audience age ranges:', error);
    }
    scheduleStrategySave({ audienceAgeRanges });
  }, [audienceAgeRanges]);

  // Save audience struggles
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setString("audienceStruggles", audienceStruggles);
      } catch (error) {
        console.error('Failed to save audience struggles:', error);
      }
      scheduleStrategySave({ audienceStruggles });
    }, 500);
    return () => clearTimeout(timer);
  }, [audienceStruggles]);

  // Save audience desires
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setString("audienceDesires", audienceDesires);
      } catch (error) {
        console.error('Failed to save audience desires:', error);
      }
      scheduleStrategySave({ audienceDesires });
    }, 500);
    return () => clearTimeout(timer);
  }, [audienceDesires]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;

    Promise.all([getUserStrategy(user.id), getUserGoals(user.id)]).then(([strategy, goals]) => {
      migrationRanRef.current = true;

      const isEmptyStrategy =
        !strategy.missionStatement &&
        !strategy.contentValues &&
        strategy.brandValues.length === 0 &&
        !strategy.strategyNotes;

      if (isEmptyStrategy) {
        const localMission = getString(StorageKeys.missionStatement) || '';
        const localContentValues = getString(StorageKeys.contentValues) || '';
        const localBrandValues = (() => {
          try { return JSON.parse(getString(StorageKeys.brandValues) || '[]'); } catch { return []; }
        })();
        const localNotes = getString('strategyNotes') || '';
        const localNoteLinks = (() => {
          try { return JSON.parse(getString('strategyNoteLinks') || '[]'); } catch { return []; }
        })();
        const localNoteFiles = (() => {
          try { return JSON.parse(getString('strategyNoteFiles') || '[]'); } catch { return []; }
        })();
        const localThreeYearVision = getString('threeYearVision') || '';
        const localVisionImages = (() => {
          try { return JSON.parse(getString(StorageKeys.visionBoardData) || '{}').images || []; } catch { return []; }
        })();
        const localPinterestUrl = (() => {
          try { return JSON.parse(getString(StorageKeys.visionBoardData) || '{}').pinterestUrl || ''; } catch { return ''; }
        })();
        if (localMission || localBrandValues.length > 0 || localContentValues || localNotes) {
          updateUserStrategy(user.id!, {
            missionStatement: localMission,
            contentValues: localContentValues,
            brandValues: localBrandValues,
            strategyNotes: localNotes,
            strategyNoteLinks: localNoteLinks,
            strategyNoteFiles: localNoteFiles,
            visionBoardData: {
              images: localVisionImages.map((src: string) => ({ type: 'image' as const, content: src })),
              pinterestUrl: localPinterestUrl,
              threeYearVision: localThreeYearVision,
            },
          }).catch(console.error);
        }
      } else {
        if (strategy.missionStatement) setMissionStatement(strategy.missionStatement);
        if (strategy.contentValues) setContentValues(strategy.contentValues);
        if (strategy.brandValues.length > 0) setBrandValues(strategy.brandValues);
        if (strategy.strategyNotes) setAdditionalNotes(strategy.strategyNotes);
        if (strategy.strategyNoteLinks.length > 0) setNoteLinks(strategy.strategyNoteLinks);
        if (strategy.strategyNoteFiles.length > 0) setNoteFiles(strategy.strategyNoteFiles);
        if (strategy.selectedTones.length > 0) setSelectedTones(strategy.selectedTones);
        if (strategy.audienceAgeRanges.length > 0) setAudienceAgeRanges(strategy.audienceAgeRanges);
        if (strategy.audienceStruggles) setAudienceStruggles(strategy.audienceStruggles);
        if (strategy.audienceDesires) setAudienceDesires(strategy.audienceDesires);
        const vbd = strategy.visionBoardData;
        if (vbd) {
          const imgs = (vbd.images || []).map((img: { type: string; content: string }) => img.content);
          if (imgs.length > 0) setVisionBoardImages(imgs);
          if (vbd.pinterestUrl) setPinterestUrl(vbd.pinterestUrl);
          if (vbd.threeYearVision) setThreeYearVision(vbd.threeYearVision);
        }
      }

      if (goals.length === 0) {
        const localShort: Goal[] = (() => {
          try { return JSON.parse(getString(StorageKeys.shortTermGoals) || '[]'); } catch { return []; }
        })();
        const localLong: Goal[] = (() => {
          try { return JSON.parse(getString(StorageKeys.longTermGoals) || '[]'); } catch { return []; }
        })();
        const localMonthly: MonthlyGoalsData = (() => {
          try { return JSON.parse(getString(StorageKeys.monthlyGoalsData) || '{}'); } catch { return {}; }
        })();

        const batchGoals: Parameters<typeof batchCreateGoals>[1] = [];
        localShort.forEach((g, i) => batchGoals.push({ goalType: 'short-term', text: g.text, status: g.status as 'not-started', displayOrder: i }));
        localLong.forEach((g, i) => batchGoals.push({ goalType: 'long-term', text: g.text, status: g.status as 'not-started', displayOrder: i }));
        Object.entries(localMonthly).forEach(([year, months]) => {
          Object.entries(months as Record<string, Goal[]>).forEach(([month, monthGoals]) => {
            const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1;
            monthGoals.forEach((g, i) => batchGoals.push({
              goalType: 'monthly', text: g.text, status: g.status as 'not-started',
              year: parseInt(year), month: monthNum, displayOrder: i,
            }));
          });
        });
        if (batchGoals.length > 0) {
          batchCreateGoals(user.id!, batchGoals).then(created => {
            rebuildGoalState(created);
          }).catch(console.error);
        }
      } else {
        rebuildGoalState(goals);
      }
    }).catch(console.error);
  }, [user?.id]);

  const rebuildGoalState = useCallback((goals: Awaited<ReturnType<typeof getUserGoals>>) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const newShort: Goal[] = [];
    const newLong: Goal[] = [];
    const newMonthly: MonthlyGoalsData = {};

    goals.forEach(g => {
      const local: Goal = {
        id: g.id,
        text: g.text,
        status: g.status as GoalStatus,
        progressNote: g.progressNote,
      };
      goalIdMapRef.current.set(g.id, g.id);
      if (g.goalType === 'short-term') {
        newShort.push(local);
      } else if (g.goalType === 'long-term') {
        newLong.push(local);
      } else if (g.goalType === 'monthly' && g.year && g.month) {
        const monthName = months[g.month - 1];
        if (!newMonthly[g.year]) newMonthly[g.year] = {};
        if (!newMonthly[g.year][monthName]) newMonthly[g.year][monthName] = [];
        newMonthly[g.year][monthName].push(local);
      }
    });

    if (newShort.length > 0) setShortTermGoals(newShort);
    if (newLong.length > 0) setLongTermGoals(newLong);
    if (Object.keys(newMonthly).length > 0) setMonthlyGoalsData(newMonthly);
  }, []);

  const resolveGoalId = (id: string) => goalIdMapRef.current.get(id) ?? id;

  // Listen for storage events
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Helper to get goals for a specific month/year
  const getMonthlyGoals = (year: number, month: string): Goal[] => {
    return monthlyGoalsData[year]?.[month] || [];
  };

  const updateMonthlyGoals = (year: number, month: string, goals: Goal[]) => {
    setMonthlyGoalsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: goals
      }
    }));
  };

  // Monthly Goals handlers
  const handleAddMonthlyGoal = (year: number, month: string) => {
    const inputKey = `${year}-${month}`;
    const inputValue = newMonthlyGoalInputs[inputKey] || '';

    if (inputValue.trim()) {
      const currentGoals = getMonthlyGoals(year, month);
      const tempId = newTempId();
      const newGoal: Goal = {
        id: tempId,
        text: inputValue.trim(),
        status: 'not-started' as GoalStatus
      };
      updateMonthlyGoals(year, month, [...currentGoals, newGoal]);
      setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: "" }));
      if (user?.id) {
        const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1;
        createGoal(user.id, { goalType: 'monthly', text: newGoal.text, year, month: monthNum, displayOrder: currentGoals.length })
          .then(created => {
            goalIdMapRef.current.set(tempId, created.id);
            setMonthlyGoalsData(prev => {
              const monthGoals = prev[year]?.[month] || [];
              return { ...prev, [year]: { ...prev[year], [month]: monthGoals.map(g => g.id === tempId ? { ...g, id: created.id } : g) } };
            });
          }).catch(console.error);
      }
    }
  };

  const handleChangeMonthlyGoalStatus = (year: number, month: string, id: string, newStatus: GoalStatus) => {
    const currentGoals = getMonthlyGoals(year, month);
    const updatedGoals = currentGoals.map(g => g.id === id ? { ...g, status: newStatus } : g);
    updateMonthlyGoals(year, month, updatedGoals);
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      updateGoal(realId, { status: newStatus }).catch(console.error);
    }
  };

  const handleDeleteMonthlyGoal = (year: number, month: string, id: string) => {
    const currentGoals = getMonthlyGoals(year, month);
    updateMonthlyGoals(year, month, currentGoals.filter(g => g.id !== id));
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      deleteGoal(realId).catch(console.error);
    }
  };

  const handleEditMonthlyGoal = (id: string, text: string) => {
    setEditingMonthlyId(id);
    setEditingMonthlyText(text);
  };

  const handleSaveMonthlyGoal = (year: number, month: string) => {
    if (editingMonthlyId !== null && editingMonthlyText.trim()) {
      const currentGoals = getMonthlyGoals(year, month);
      updateMonthlyGoals(year, month, currentGoals.map(g =>
        g.id === editingMonthlyId ? { ...g, text: editingMonthlyText.trim() } : g
      ));
      const realId = resolveGoalId(editingMonthlyId);
      if (!realId.startsWith('temp_')) {
        updateGoal(realId, { text: editingMonthlyText.trim() }).catch(console.error);
      }
      setEditingMonthlyId(null);
      setEditingMonthlyText("");
    }
  };

  const handleUpdateProgressNote = (year: number, month: string, id: string, note: string) => {
    const currentGoals = getMonthlyGoals(year, month);
    updateMonthlyGoals(year, month, currentGoals.map(g =>
      g.id === id ? { ...g, progressNote: note } : g
    ));
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      updateGoal(realId, { progressNote: note }).catch(console.error);
    }
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  // Drag and drop state
  const [draggedGoal, setDraggedGoal] = useState<{ id: string; text: string; sourceMonth: string } | null>(null);
  const [dragOverMonth, setDragOverMonth] = useState<string | null>(null);

  const handleDragStart = useCallback((event: any) => {
    const { active } = event;
    const fullMonth = monthShortToFull[selectedMonthPill];
    const goals = getMonthlyGoals(selectedYear, fullMonth);
    const goal = goals.find(g => g.id === active.id);
    if (goal) {
      setDraggedGoal({ id: goal.id, text: goal.text, sourceMonth: fullMonth });
    }
  }, [selectedYear, selectedMonthPill, getMonthlyGoals, monthShortToFull]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over && typeof over.id === 'string' && over.id.startsWith('month-')) {
      const month = over.id.replace('month-', '');
      setDragOverMonth(month);
    } else {
      setDragOverMonth(null);
    }
  }, []);

  const handleDragEndMonthlyGoals = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const sourceMonth = draggedGoal?.sourceMonth || monthShortToFull[selectedMonthPill];

    setDraggedGoal(null);
    setDragOverMonth(null);

    if (!over) return;

    if (typeof over.id === 'string' && over.id.startsWith('month-')) {
      const targetMonth = over.id.replace('month-', '');
      if (targetMonth !== sourceMonth) {
        const sourceGoals = getMonthlyGoals(selectedYear, sourceMonth);
        const goalToMove = sourceGoals.find(g => g.id === active.id);
        if (goalToMove) {
          updateMonthlyGoals(selectedYear, sourceMonth, sourceGoals.filter(g => g.id !== active.id));
          const targetGoals = getMonthlyGoals(selectedYear, targetMonth);
          updateMonthlyGoals(selectedYear, targetMonth, [...targetGoals, goalToMove]);
          const realId = resolveGoalId(String(active.id));
          if (!realId.startsWith('temp_') && user?.id) {
            const targetMonthNum = new Date(`${targetMonth} 1, 2000`).getMonth() + 1;
            updateGoal(realId, { month: targetMonthNum, year: selectedYear, displayOrder: targetGoals.length }).catch(console.error);
          }
          toast.success(`Goal moved to ${targetMonth}`);
        }
      }
      return;
    }

    if (active.id !== over.id) {
      const currentGoals = getMonthlyGoals(selectedYear, sourceMonth);
      const oldIndex = currentGoals.findIndex(g => g.id === active.id);
      const newIndex = currentGoals.findIndex(g => g.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedGoals = arrayMove(currentGoals, oldIndex, newIndex);
        updateMonthlyGoals(selectedYear, sourceMonth, reorderedGoals);
        reorderedGoals.forEach((g, idx) => {
          const realId = resolveGoalId(g.id);
          if (!realId.startsWith('temp_')) {
            updateGoal(realId, { displayOrder: idx }).catch(console.error);
          }
        });
      }
    }
  }, [selectedYear, selectedMonthPill, draggedGoal, user?.id, getMonthlyGoals, updateMonthlyGoals, monthShortToFull, resolveGoalId]);

  const handleDragCancel = useCallback(() => {
    setDraggedGoal(null);
    setDragOverMonth(null);
  }, []);

  // Short-Term Goals handlers
  const handleAddShortTermGoal = () => {
    if (newShortTermGoal.trim()) {
      const tempId = newTempId();
      const newGoal: Goal = { id: tempId, text: newShortTermGoal.trim(), status: 'not-started' as GoalStatus };
      setShortTermGoals(prev => [...prev, newGoal]);
      setNewShortTermGoal("");
      if (user?.id) {
        createGoal(user.id, { goalType: 'short-term', text: newGoal.text, displayOrder: shortTermGoals.length })
          .then(created => {
            goalIdMapRef.current.set(tempId, created.id);
            setShortTermGoals(prev => prev.map(g => g.id === tempId ? { ...g, id: created.id } : g));
          }).catch(console.error);
      }
    }
  };

  const handleChangeShortTermGoalStatus = (id: string, newStatus: GoalStatus) => {
    setShortTermGoals(shortTermGoals.map(g => g.id === id ? { ...g, status: newStatus } : g));
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      updateGoal(realId, { status: newStatus }).catch(console.error);
    }
  };

  const handleDeleteShortTermGoal = (id: string) => {
    setShortTermGoals(shortTermGoals.filter(g => g.id !== id));
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      deleteGoal(realId).catch(console.error);
    }
  };

  const handleEditShortTermGoal = (id: string, text: string) => {
    setEditingShortTermId(id);
    setEditingShortTermText(text);
  };

  const handleSaveShortTermGoal = () => {
    if (editingShortTermId !== null && editingShortTermText.trim()) {
      setShortTermGoals(shortTermGoals.map(g =>
        g.id === editingShortTermId ? { ...g, text: editingShortTermText.trim() } : g
      ));
      const realId = resolveGoalId(editingShortTermId);
      if (!realId.startsWith('temp_')) {
        updateGoal(realId, { text: editingShortTermText.trim() }).catch(console.error);
      }
      setEditingShortTermId(null);
      setEditingShortTermText("");
    }
  };

  // Long-Term Goals handlers
  const handleAddLongTermGoal = () => {
    if (newLongTermGoal.trim()) {
      const tempId = newTempId();
      const newGoal: Goal = { id: tempId, text: newLongTermGoal.trim(), status: 'not-started' as GoalStatus };
      setLongTermGoals(prev => [...prev, newGoal]);
      setNewLongTermGoal("");
      if (user?.id) {
        createGoal(user.id, { goalType: 'long-term', text: newGoal.text, displayOrder: longTermGoals.length })
          .then(created => {
            goalIdMapRef.current.set(tempId, created.id);
            setLongTermGoals(prev => prev.map(g => g.id === tempId ? { ...g, id: created.id } : g));
          }).catch(console.error);
      }
    }
  };

  const handleToggleLongTermGoal = (id: string) => {
    setLongTermGoals(longTermGoals.map(g => {
      if (g.id === id) {
        const nextStatus: GoalStatus =
          g.status === 'not-started' ? 'somewhat-done' :
          g.status === 'somewhat-done' ? 'great-progress' :
          g.status === 'great-progress' ? 'completed' :
          'not-started';
        const realId = resolveGoalId(id);
        if (!realId.startsWith('temp_')) {
          updateGoal(realId, { status: nextStatus }).catch(console.error);
        }
        return { ...g, status: nextStatus };
      }
      return g;
    }));
  };

  const handleDeleteLongTermGoal = (id: string) => {
    setLongTermGoals(longTermGoals.filter(g => g.id !== id));
    const realId = resolveGoalId(id);
    if (!realId.startsWith('temp_')) {
      deleteGoal(realId).catch(console.error);
    }
  };

  const handleEditLongTermGoal = (id: string, text: string) => {
    setEditingLongTermId(id);
    setEditingLongTermText(text);
  };

  const handleSaveLongTermGoal = () => {
    if (editingLongTermId !== null && editingLongTermText.trim()) {
      setLongTermGoals(longTermGoals.map(g =>
        g.id === editingLongTermId ? { ...g, text: editingLongTermText.trim() } : g
      ));
      const realId = resolveGoalId(editingLongTermId);
      if (!realId.startsWith('temp_')) {
        updateGoal(realId, { text: editingLongTermText.trim() }).catch(console.error);
      }
      setEditingLongTermId(null);
      setEditingLongTermText("");
    }
  };

  // File input ref and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    e.target.value = '';
  };

  // Save All button handler
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const handleSaveAll = useCallback(() => {
    if (!user?.id) return;
    // Clear any pending debounce and save everything immediately
    if (strategyDebounceRef.current) clearTimeout(strategyDebounceRef.current);
    updateUserStrategy(user.id, {
      missionStatement,
      brandValues,
      contentValues,
      selectedTones,
      audienceAgeRanges,
      audienceStruggles,
      audienceDesires,
      strategyNotes: additionalNotes,
      strategyNoteLinks: noteLinks,
      strategyNoteFiles: noteFiles,
      visionBoardData: {
        images: visionBoardImages.map(src => ({ type: 'image' as const, content: src })),
        pinterestUrl,
        threeYearVision,
      },
    }).then(() => {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }).catch(console.error);
  }, [user?.id, missionStatement, brandValues, contentValues, selectedTones, audienceAgeRanges, audienceStruggles, audienceDesires, additionalNotes, noteLinks, noteFiles, visionBoardImages, pinterestUrl, threeYearVision]);

  return {
    // Auth
    user,
    // Tabs
    activeTab, handleTabChange,
    // Onboarding
    showOnboarding, completeOnboarding,
    // Brand Identity
    brandKeywords, setBrandKeywords, keywordInput, setKeywordInput,
    handleAddKeyword, handleRemoveKeyword,
    audienceAgeRanges, setAudienceAgeRanges,
    audienceStruggles, setAudienceStruggles,
    audienceDesires, setAudienceDesires,
    selectedTones, setSelectedTones,
    brandValues, setBrandValues,
    customValueInput, setCustomValueInput,
    editingValueIndex, setEditingValueIndex,
    editingValueText, setEditingValueText,
    missionStatement, setMissionStatement,
    missionStatementFocused, setMissionStatementFocused,
    showMissionExamples, setShowMissionExamples,
    contentValues, setContentValues,
    contentValuesFocused, setContentValuesFocused,
    showValuesExamples, setShowValuesExamples,
    showMissionSaved, showValuesSaved,
    additionalNotes, setAdditionalNotes,
    noteLinks, setNoteLinks,
    noteFiles, setNoteFiles,
    newLinkUrl, setNewLinkUrl,
    newLinkTitle, setNewLinkTitle,
    showAddLinkForm, setShowAddLinkForm,
    strugglesFocused, setStrugglesFocused,
    desiresFocused, setDesiresFocused,
    showPinterestInput, setShowPinterestInput,
    // Save All
    handleSaveAll, showSaveSuccess,
    // Vision Board
    visionBoardImages, addVisionBoardImage, removeVisionBoardImage,
    pinterestUrl, updatePinterestUrl,
    fileInputRef, handleUploadClick, handleVisionBoardUpload,
    // 3-Year Vision
    threeYearVision, setThreeYearVision,
    // Goals
    shortTermGoals, longTermGoals, monthlyGoalsData,
    newShortTermGoal, setNewShortTermGoal,
    isAddingShortTermGoal, setIsAddingShortTermGoal,
    newLongTermGoal, setNewLongTermGoal,
    newMonthlyGoalInputs, setNewMonthlyGoalInputs,
    selectedYear, setSelectedYear,
    selectedMonthPill, setSelectedMonthPill,
    expandedMonths, toggleMonth,
    dismissedGoalPlaceholders, dismissGoalPlaceholder,
    showAllMonths, setShowAllMonths,
    focusedMonth, setFocusedMonth,
    // Editing
    editingMonthlyId, editingMonthlyText, setEditingMonthlyText,
    editingShortTermId, editingShortTermText, setEditingShortTermText,
    editingLongTermId, editingLongTermText, setEditingLongTermText,
    // Goal handlers
    getMonthlyGoals,
    handleAddMonthlyGoal,
    handleChangeMonthlyGoalStatus,
    handleDeleteMonthlyGoal,
    handleEditMonthlyGoal,
    handleSaveMonthlyGoal,
    handleUpdateProgressNote,
    handleAddShortTermGoal,
    handleChangeShortTermGoalStatus,
    handleDeleteShortTermGoal,
    handleEditShortTermGoal,
    handleSaveShortTermGoal,
    handleAddLongTermGoal,
    handleToggleLongTermGoal,
    handleDeleteLongTermGoal,
    handleEditLongTermGoal,
    handleSaveLongTermGoal,
    // Drag and drop
    draggedGoal, dragOverMonth,
    handleDragStart, handleDragOver,
    handleDragEndMonthlyGoals, handleDragCancel,
    setEditingMonthlyId, setEditingShortTermId, setEditingLongTermId,
  };
}
