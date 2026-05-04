import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api-base";
import { StorageKeys, getString, setString, getJSON, setJSON } from "@/lib/storage";
import { getUserPreferences, updateUserPreferences } from "@/services/preferencesService";

interface ThemeBrainstormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ThemeBrainstormDialog({ open, onOpenChange }: ThemeBrainstormDialogProps) {
  const { user } = useAuth();
  const pillarSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pillar state
  const [userPillars, setUserPillars] = useState<string[]>(() => getJSON<string[]>(StorageKeys.pillarThemes, []));
  const [hasSeenPillarsExample, setHasSeenPillarsExample] = useState(false);
  const [selectedUserPillar, setSelectedUserPillar] = useState<string>(() => getString(StorageKeys.pillarSelectedTheme) || "");
  const [pillarSubCategories, setPillarSubCategories] = useState<Record<string, string[]>>(() => getJSON<Record<string, string[]>>(StorageKeys.pillarSubCategories, {}));
  const [isGeneratingSubCategories, setIsGeneratingSubCategories] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => getString(StorageKeys.pillarSelectedSubCategory) || "");
  const [cascadeIdeas, setCascadeIdeas] = useState<string[]>(() => getJSON<string[]>(StorageKeys.pillarCascadeIdeas, []));
  const [pillarIdeasMap, setPillarIdeasMap] = useState<Record<string, string[]>>(() => getJSON<Record<string, string[]>>(StorageKeys.pillarIdeasMap, {}));
  const [pillarLastSubCategoryMap, setPillarLastSubCategoryMap] = useState<Record<string, string>>(() => getJSON<Record<string, string>>(StorageKeys.pillarLastSubCategoryMap, {}));
  const [isGeneratingCascadeIdeas, setIsGeneratingCascadeIdeas] = useState(false);
  const [newPillarIndex, setNewPillarIndex] = useState<number | null>(null);
  const [newSubCategoryIndex, setNewSubCategoryIndex] = useState<number | null>(null);
  const [generateMoreCount, setGenerateMoreCount] = useState<Record<string, number>>({});
  const [editingIdeaIndex, setEditingIdeaIndex] = useState<number | null>(null);
  const [isGeneratingMoreIdeas, setIsGeneratingMoreIdeas] = useState(false);
  const [addedIdeaText, setAddedIdeaText] = useState<string | null>(null);
  const [ideaDirection, setIdeaDirection] = useState<string>("");
  const [ideaCustomPrompt, setIdeaCustomPrompt] = useState<string>("");

  // Save to Supabase
  const savePillarsToSupabase = useCallback(() => {
    if (!user?.id) return;
    if (pillarSaveTimerRef.current) clearTimeout(pillarSaveTimerRef.current);
    pillarSaveTimerRef.current = setTimeout(() => {
      updateUserPreferences(user.id, {
        pillarThemes: userPillars,
        pillarSubCategories,
        pillarCascadeIdeas: cascadeIdeas,
        pillarSelectedTheme: selectedUserPillar || '',
        pillarSelectedSubCategory: selectedSubCategory || '',
        pillarIdeasMap: pillarIdeasMap,
      }).catch(() => {});
    }, 1000);
  }, [user?.id, userPillars, pillarSubCategories, cascadeIdeas, selectedUserPillar, selectedSubCategory, pillarIdeasMap]);

  // Persist to localStorage + Supabase
  useEffect(() => { setJSON(StorageKeys.pillarThemes, userPillars); savePillarsToSupabase(); }, [userPillars]);
  useEffect(() => { setJSON(StorageKeys.pillarSubCategories, pillarSubCategories); savePillarsToSupabase(); }, [pillarSubCategories]);
  useEffect(() => { setJSON(StorageKeys.pillarCascadeIdeas, cascadeIdeas); savePillarsToSupabase(); }, [cascadeIdeas]);
  useEffect(() => { setJSON(StorageKeys.pillarIdeasMap, pillarIdeasMap); }, [pillarIdeasMap]);
  useEffect(() => { setJSON(StorageKeys.pillarLastSubCategoryMap, pillarLastSubCategoryMap); }, [pillarLastSubCategoryMap]);
  useEffect(() => { setString(StorageKeys.pillarSelectedTheme, selectedUserPillar || ""); savePillarsToSupabase(); }, [selectedUserPillar]);
  useEffect(() => { setString(StorageKeys.pillarSelectedSubCategory, selectedSubCategory || ""); savePillarsToSupabase(); }, [selectedSubCategory]);

  // Restore cascadeIdeas from cache on mount
  useEffect(() => {
    if (cascadeIdeas.length === 0 && selectedUserPillar && selectedSubCategory) {
      const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
      const cached = pillarIdeasMap[cacheKey];
      if (cached && cached.length > 0) {
        setCascadeIdeas(cached);
      }
    }
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    getUserPreferences(user.id).then((prefs) => {
      if (prefs.pillarThemes && prefs.pillarThemes.length > 0) {
        setUserPillars(prefs.pillarThemes);
        setPillarSubCategories(prefs.pillarSubCategories || {});
        setCascadeIdeas(prefs.pillarCascadeIdeas || []);
        if (prefs.pillarIdeasMap) setPillarIdeasMap(prefs.pillarIdeasMap);
        setSelectedUserPillar(prefs.pillarSelectedTheme || '');
        setSelectedSubCategory(prefs.pillarSelectedSubCategory || '');
      }
    }).catch(() => {});
  }, [user?.id]);

  // AI helpers
  const generateSubCategoriesWithAI = async (pillarName: string, existingCategories?: string[]): Promise<string[]> => {
    try {
      const { data: { session: aiSession } } = await supabase.auth.getSession();
      const aiHeaders = {
        'Content-Type': 'application/json',
        ...(aiSession?.access_token ? { 'Authorization': `Bearer ${aiSession.access_token}` } : {}),
      };
      const response = await fetch(`${API_BASE}/api/generate-subcategories`, {
        method: 'POST',
        headers: aiHeaders,
        body: JSON.stringify({ pillarName, existingCategories }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.subCategories || [];
    } catch (error) {
      console.error('Error generating subcategories:', error);
      return [];
    }
  };

  const generateContentIdeasWithAI = async (pillarName: string, subCategory: string, count?: number, direction?: string): Promise<string[]> => {
    try {
      const { data: { session: ideasSession } } = await supabase.auth.getSession();
      const ideasHeaders = {
        'Content-Type': 'application/json',
        ...(ideasSession?.access_token ? { 'Authorization': `Bearer ${ideasSession.access_token}` } : {}),
      };
      const response = await fetch(`${API_BASE}/api/generate-content-ideas`, {
        method: 'POST',
        headers: ideasHeaders,
        body: JSON.stringify({
          pillarName,
          subCategory,
          count,
          direction,
          allThemes: userPillars,
          previousIdeas: cascadeIdeas,
        }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.ideas || [];
    } catch (error) {
      console.error('Error generating content ideas:', error);
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl overflow-hidden flex flex-col bg-gradient-to-br from-[#F0F7F4] via-[#F7FAF8] to-[#E8F3EE]">
        <DialogHeader className="flex-shrink-0 px-8 pt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#7BA393] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="mb-2">
            <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What are the core themes your content revolves around?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            Choose 3-5 themes for a focused content strategy
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-8 py-6">
          {/* Step 1: Pillars */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => {
                  const newPillarName = "";
                  const newIndex = userPillars.length;
                  setUserPillars([...userPillars, newPillarName]);
                  setSelectedUserPillar(newPillarName);
                  setSelectedSubCategory("");
                  setCascadeIdeas([]);
                  setNewPillarIndex(newIndex);
                  setHasSeenPillarsExample(true);
                }}
                className="px-6 py-3 rounded-xl font-medium bg-white/60 text-[#5D8A7A] hover:bg-white/80 hover:shadow-sm transition-all border-2 border-dashed border-[#B8D4CA] hover:border-[#7BA393]"
              >
                + Add Theme
              </button>
              {userPillars.length === 0 && !selectedUserPillar && cascadeIdeas.length === 0 && (
                <>
                  {["Wellness", "Travel", "Productivity"].map((example) => (
                    <div
                      key={example}
                      className="px-5 py-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-gray-400 italic text-sm"
                    >
                      e.g. {example}
                    </div>
                  ))}
                </>
              )}
              {userPillars.map((pillar, index) => (
                <div key={index} className="relative group">
                  <div
                    onClick={async () => {
                      if (selectedUserPillar !== pillar) {
                        if (selectedUserPillar && selectedSubCategory) {
                          setPillarLastSubCategoryMap(prev => ({ ...prev, [selectedUserPillar]: selectedSubCategory }));
                        }
                        setSelectedUserPillar(pillar);
                        const lastSub = pillarLastSubCategoryMap[pillar] || "";
                        const cacheKey = `${pillar}::${lastSub}`;
                        const cached = lastSub ? pillarIdeasMap[cacheKey] : null;
                        setSelectedSubCategory(lastSub);
                        setCascadeIdeas(cached && cached.length > 0 ? cached : []);
                        if (!pillarSubCategories[pillar] || pillarSubCategories[pillar].length === 0) {
                          setIsGeneratingSubCategories(true);
                          try {
                            const subCats = await generateSubCategoriesWithAI(pillar);
                            setPillarSubCategories(prev => ({ ...prev, [pillar]: subCats }));
                          } catch (error) {
                            console.error('Error generating subcategories:', error);
                          } finally {
                            setIsGeneratingSubCategories(false);
                          }
                        }
                      }
                    }}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium transition-all cursor-pointer shadow-sm",
                      selectedUserPillar === pillar
                        ? "bg-gradient-to-r from-[#7BA393] to-[#5A8A78] text-white shadow-md"
                        : "bg-white/80 border border-[#D4E5DE] text-gray-700 hover:border-[#7BA393] hover:shadow-md hover:bg-white"
                    )}
                  >
                    <input
                      type="text"
                      value={pillar}
                      onChange={(e) => {
                        const newPillars = [...userPillars];
                        newPillars[index] = e.target.value;
                        setUserPillars(newPillars);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={async (e) => {
                        const currentPillarValue = e.currentTarget.value;
                        if (newPillarIndex === index) {
                          setNewPillarIndex(null);
                        }
                        if (currentPillarValue.trim() && currentPillarValue.trim().length >= 2) {
                          if (selectedUserPillar && selectedSubCategory && selectedUserPillar !== currentPillarValue) {
                            setPillarLastSubCategoryMap(prev => ({ ...prev, [selectedUserPillar]: selectedSubCategory }));
                          }
                          setSelectedUserPillar(currentPillarValue);
                          const lastSub = pillarLastSubCategoryMap[currentPillarValue] || "";
                          const cacheKey = `${currentPillarValue}::${lastSub}`;
                          const cached = lastSub ? pillarIdeasMap[cacheKey] : null;
                          setSelectedSubCategory(lastSub);
                          setCascadeIdeas(cached && cached.length > 0 ? cached : []);
                          if (!pillarSubCategories[currentPillarValue] || pillarSubCategories[currentPillarValue].length === 0) {
                            setIsGeneratingSubCategories(true);
                            try {
                              const subCats = await generateSubCategoriesWithAI(currentPillarValue);
                              setPillarSubCategories(prev => ({ ...prev, [currentPillarValue]: subCats }));
                            } catch (error) {
                              console.error('Error generating subcategories:', error);
                            } finally {
                              setIsGeneratingSubCategories(false);
                            }
                          }
                        }
                      }}
                      onMouseDown={(e) => {
                        if (document.activeElement === e.currentTarget) {
                          e.stopPropagation();
                        }
                      }}
                      autoFocus={newPillarIndex === index}
                      className={cn(
                        "bg-transparent border-none outline-none text-center min-w-[80px] max-w-[200px] cursor-pointer uppercase",
                        selectedUserPillar === pillar ? "text-white placeholder:text-white/70" : "text-gray-800 placeholder:text-gray-400"
                      )}
                      placeholder=""
                      size={pillar.length || 10}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedUserPillar === pillar) {
                        setSelectedUserPillar("");
                        setSelectedSubCategory("");
                        setCascadeIdeas([]);
                      }
                      setPillarSubCategories(prev => {
                        const updated = { ...prev };
                        delete updated[pillar];
                        return updated;
                      });
                      setPillarIdeasMap(prev => {
                        const updated = { ...prev };
                        Object.keys(updated).forEach(key => {
                          if (key.startsWith(`${pillar}::`)) {
                            delete updated[key];
                          }
                        });
                        return updated;
                      });
                      setPillarLastSubCategoryMap(prev => {
                        const updated = { ...prev };
                        delete updated[pillar];
                        return updated;
                      });
                      setUserPillars(userPillars.filter((_, i) => i !== index));
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-gray-400 hover:border-gray-600 text-gray-500 hover:text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Sub-categories */}
          {selectedUserPillar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase">
                  {selectedUserPillar} Topics
                </h4>
                {(pillarSubCategories[selectedUserPillar]?.length > 0) && (generateMoreCount[selectedUserPillar] || 0) < 3 && (
                  <button
                    onClick={async () => {
                      setIsGeneratingSubCategories(true);
                      try {
                        const existing = pillarSubCategories[selectedUserPillar] || [];
                        const newSubCats = await generateSubCategoriesWithAI(selectedUserPillar, existing);
                        const merged = [...existing, ...newSubCats.filter(s => !existing.some(e => e.toLowerCase() === s.toLowerCase()))];
                        setPillarSubCategories(prev => ({ ...prev, [selectedUserPillar]: merged }));
                        setGenerateMoreCount(prev => ({ ...prev, [selectedUserPillar]: (prev[selectedUserPillar] || 0) + 1 }));
                      } catch (error) {
                        console.error('Error generating more subcategories:', error);
                      } finally {
                        setIsGeneratingSubCategories(false);
                      }
                    }}
                    disabled={isGeneratingSubCategories}
                    className="text-xs text-[#7BA393] hover:text-[#5D8A7A] font-medium disabled:opacity-50"
                  >
                    + Generate more
                  </button>
                )}
              </div>
              {isGeneratingSubCategories && (pillarSubCategories[selectedUserPillar] || []).length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#C8DED5] border-t-[#7BA393]"></div>
                  <span className="ml-3 text-gray-600">Generating categories...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(pillarSubCategories[selectedUserPillar] || []).map((subCat, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={async () => {
                          if (newSubCategoryIndex === index) return;
                          if (!subCat.trim()) return;
                          if (selectedSubCategory === subCat) return;

                          setSelectedSubCategory(subCat);
                          setPillarLastSubCategoryMap(prev => ({ ...prev, [selectedUserPillar]: subCat }));
                          const cacheKey = `${selectedUserPillar}::${subCat}`;
                          const cached = pillarIdeasMap[cacheKey];
                          if (cached && cached.length > 0) {
                            setCascadeIdeas(cached);
                          } else {
                            setCascadeIdeas([]);
                            setIsGeneratingCascadeIdeas(true);
                            try {
                              const ideas = await generateContentIdeasWithAI(selectedUserPillar, subCat);
                              setCascadeIdeas(ideas);
                              setPillarIdeasMap(prev => ({ ...prev, [cacheKey]: ideas }));
                            } catch (error) {
                              console.error('Error generating content ideas:', error);
                              setCascadeIdeas([]);
                            } finally {
                              setIsGeneratingCascadeIdeas(false);
                            }
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center whitespace-nowrap",
                          selectedSubCategory === subCat
                            ? "bg-[#7BA393] text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-[#9AC0B3] hover:bg-[#F0F7F4]"
                        )}
                      >
                        {newSubCategoryIndex === index ? (
                          <input
                            type="text"
                            value={subCat}
                            onChange={(e) => {
                              const currentSubCats = [...(pillarSubCategories[selectedUserPillar] || [])];
                              currentSubCats[index] = e.target.value;
                              setPillarSubCategories(prev => ({
                                ...prev,
                                [selectedUserPillar]: currentSubCats
                              }));
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            onBlur={async () => {
                              setNewSubCategoryIndex(null);
                              const name = subCat.trim();
                              if (!name) {
                                const currentSubCats = (pillarSubCategories[selectedUserPillar] || []).filter((_, i) => i !== index);
                                setPillarSubCategories(prev => ({
                                  ...prev,
                                  [selectedUserPillar]: currentSubCats
                                }));
                                return;
                              }
                              setSelectedSubCategory(name);
                              setPillarLastSubCategoryMap(prev => ({ ...prev, [selectedUserPillar]: name }));
                              const cacheKey = `${selectedUserPillar}::${name}`;
                              const cached = pillarIdeasMap[cacheKey];
                              if (cached && cached.length > 0) {
                                setCascadeIdeas(cached);
                              } else {
                                setCascadeIdeas([]);
                                setIsGeneratingCascadeIdeas(true);
                                try {
                                  const ideas = await generateContentIdeasWithAI(selectedUserPillar, name);
                                  setCascadeIdeas(ideas);
                                  setPillarIdeasMap(prev => ({ ...prev, [cacheKey]: ideas }));
                                } catch (error) {
                                  console.error('Error generating content ideas:', error);
                                  setCascadeIdeas([]);
                                } finally {
                                  setIsGeneratingCascadeIdeas(false);
                                }
                              }
                            }}
                            autoFocus
                            className="bg-transparent border-none outline-none text-center min-w-[60px] max-w-[150px] text-white placeholder:text-white/70"
                            placeholder=""
                            size={subCat.length || 6}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          subCat
                        )}
                      </button>
                      {(pillarSubCategories[selectedUserPillar]?.length || 0) > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentSubCats = pillarSubCategories[selectedUserPillar] || [];
                            setPillarSubCategories(prev => ({
                              ...prev,
                              [selectedUserPillar]: currentSubCats.filter((_, i) => i !== index)
                            }));
                            if (selectedSubCategory === subCat) {
                              setSelectedSubCategory("");
                              setCascadeIdeas([]);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-gray-400 hover:border-gray-600 text-gray-500 hover:text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const currentSubCats = pillarSubCategories[selectedUserPillar] || [];
                      const newIndex = currentSubCats.length;
                      setPillarSubCategories(prev => ({
                        ...prev,
                        [selectedUserPillar]: [...currentSubCats, ""]
                      }));
                      setNewSubCategoryIndex(newIndex);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#E8F3EF] text-[#5D8A7A] hover:bg-[#D8EBE4] transition-all border-2 border-dashed border-[#B8D4CA]"
                  >
                    + Add
                  </button>
                  {isGeneratingSubCategories && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#C8DED5] border-t-[#7BA393]"></div>
                      <span className="text-xs text-gray-500">Generating more...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Content Ideas */}
          {selectedSubCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                Content Ideas for {selectedSubCategory}
              </h4>
              {isGeneratingCascadeIdeas ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C8DED5] border-t-[#7BA393]"></div>
                  <span className="ml-3 text-gray-600 font-medium">Generating content ideas...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {cascadeIdeas.map((idea, index) => (
                      <motion.div
                        key={`idea-${index}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: addedIdeaText === idea ? 1.02 : 1
                        }}
                        exit={{
                          opacity: 0,
                          x: 400,
                          scale: 0.8,
                          rotate: 5,
                          transition: { duration: 0.6, ease: "easeOut" }
                        }}
                        transition={{
                          duration: 0.3,
                          layout: { duration: 0.4, ease: "easeInOut" }
                        }}
                        className={cn(
                          "relative w-full flex items-center justify-between gap-3 p-4 rounded-lg border-2 group",
                          addedIdeaText === idea
                            ? "bg-[#E8F3EF] border-[#7BA393] shadow-lg"
                            : "bg-white border-gray-200 hover:border-[#9AC0B3] hover:shadow-md"
                        )}
                      >
                        <input
                          type="text"
                          value={idea}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setCascadeIdeas((prev) => {
                              const updated = prev.map((i, idx) => idx === index ? newValue : i);
                              const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
                              setPillarIdeasMap(p => ({ ...p, [cacheKey]: updated }));
                              return updated;
                            });
                            setEditingIdeaIndex(index);
                          }}
                          onFocus={() => setEditingIdeaIndex(index)}
                          onBlur={() => setTimeout(() => setEditingIdeaIndex(null), 150)}
                          className="text-sm text-gray-800 font-medium flex-1 bg-transparent border-none outline-none cursor-text hover:bg-[#F0F7F4] rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        />
                        {editingIdeaIndex === index && (
                          <button
                            onClick={() => {
                              setEditingIdeaIndex(null);
                              toast.success("Idea saved!");
                            }}
                            className="p-1.5 rounded-lg bg-[#7BA393] hover:bg-[#6B9080] text-white transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.success("Idea saved!");
                            setAddedIdeaText(idea);
                            setTimeout(() => {
                              setCascadeIdeas((prev) => {
                                const updated = prev.filter((i) => i !== idea);
                                const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
                                setPillarIdeasMap(p => ({ ...p, [cacheKey]: updated }));
                                return updated;
                              });
                              setAddedIdeaText(null);
                            }, 500);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#B8D4CA] hover:bg-[#7BA393] text-white text-xs px-3 py-1.5 h-auto whitespace-nowrap"
                        >
                          Save Idea
                        </Button>
                        <button
                          onClick={() => {
                            setCascadeIdeas((prev) => {
                              const updated = prev.filter((i) => i !== idea);
                              const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
                              setPillarIdeasMap(p => ({ ...p, [cacheKey]: updated }));
                              return updated;
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded border border-transparent hover:border-gray-300 text-gray-300 hover:text-gray-500 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Direction selector + Generate More */}
                  {cascadeIdeas.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#D8EDE4] space-y-4">
                      <div className="rounded-xl bg-gradient-to-br from-[#F0F7F4] to-[#E8F3EE] p-5 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#5D8A7A]" />
                          <span className="text-sm font-bold text-gray-900">What direction would you like MegAI to explore?</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["More fun & playful", "More storytelling", "More vulnerable", "More educational", "More controversial"].map((dir) => (
                            <button
                              key={dir}
                              onClick={() => setIdeaDirection(ideaDirection === dir ? "" : dir)}
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm",
                                ideaDirection === dir
                                  ? "bg-[#7BA393] text-white border-[#6B9080] shadow-md"
                                  : "bg-white/80 text-gray-600 border-[#D0E0D8] hover:border-[#9AC0B3] hover:bg-white hover:shadow-md"
                              )}
                            >
                              {dir}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={ideaCustomPrompt}
                          onChange={(e) => setIdeaCustomPrompt(e.target.value)}
                          placeholder="Describe how you'd like MegAI to adjust the ideas..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#D0E0D8] bg-white/70 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#7BA393] focus:bg-white focus:shadow-sm transition-all resize-none shadow-inner"
                        />
                        {ideaCustomPrompt.trim() && (
                          <button
                            onClick={async () => {
                              setIsGeneratingMoreIdeas(true);
                              try {
                                const parts = [ideaDirection, ideaCustomPrompt.trim()].filter(Boolean);
                                const directionText = parts.length > 0 ? parts.join(". Also: ") : undefined;
                                const newIdeas = await generateContentIdeasWithAI(selectedUserPillar, selectedSubCategory, 5, directionText);
                                const filteredIdeas = newIdeas.filter(idea => !cascadeIdeas.includes(idea));
                                const merged = [...cascadeIdeas, ...filteredIdeas];
                                setCascadeIdeas(merged);
                                const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
                                setPillarIdeasMap(prev => ({ ...prev, [cacheKey]: merged }));
                              } catch (error) {
                                console.error('Error generating more ideas:', error);
                              } finally {
                                setIsGeneratingMoreIdeas(false);
                              }
                            }}
                            disabled={isGeneratingMoreIdeas}
                            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#7BA393] text-white hover:bg-[#6B9080] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingMoreIdeas ? (
                              <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/40 border-t-white"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Apply direction
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          setIsGeneratingMoreIdeas(true);
                          try {
                            const parts = [ideaDirection, ideaCustomPrompt.trim()].filter(Boolean);
                            const directionText = parts.length > 0 ? parts.join(". Also: ") : undefined;
                            const newIdeas = await generateContentIdeasWithAI(selectedUserPillar, selectedSubCategory, 5, directionText);
                            const filteredIdeas = newIdeas.filter(idea => !cascadeIdeas.includes(idea));
                            const merged = [...cascadeIdeas, ...filteredIdeas];
                            setCascadeIdeas(merged);
                            const cacheKey = `${selectedUserPillar}::${selectedSubCategory}`;
                            setPillarIdeasMap(prev => ({ ...prev, [cacheKey]: merged }));
                          } catch (error) {
                            console.error('Error generating more ideas:', error);
                          } finally {
                            setIsGeneratingMoreIdeas(false);
                          }
                        }}
                        disabled={isGeneratingMoreIdeas}
                        className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#7BA393] text-white hover:bg-[#6B9080] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingMoreIdeas ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#C8DED5] border-t-[#7BA393] mr-2"></div>
                            Generating...
                          </span>
                        ) : (
                          "+ Generate more ideas"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
