import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Plus, Trash2, ArrowLeft, Sparkles, GraduationCap, PartyPopper, Megaphone, Target, PenTool, ShieldOff, Heart } from "lucide-react";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { HOOK_DATA } from "@/data/hookLibrary";

interface TitleHookSuggestionsProps {
  onSelectHook: (hook: string) => void;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const TitleHookSuggestions = ({
  onSelectHook,
  externalOpen,
  onExternalOpenChange,
}: TitleHookSuggestionsProps) => {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [hookSelectionDialogOpen, setHookSelectionDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customHook, setCustomHook] = useState("");
  const [customHooks, setCustomHooks] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState(0);

  // Use external control if provided, otherwise use internal state
  const dialogOpen = externalOpen !== undefined ? externalOpen : internalDialogOpen;
  const setDialogOpen = onExternalOpenChange || setInternalDialogOpen;

  useEffect(() => {
    const savedHooks = getString(StorageKeys.customHooks);
    if (savedHooks) {
      setCustomHooks(JSON.parse(savedHooks));
    }
  }, []);

  useEffect(() => {
    setString(StorageKeys.customHooks, JSON.stringify(customHooks));
  }, [customHooks]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setDialogOpen(false);
    setHookSelectionDialogOpen(true);
  };

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setHookSelectionDialogOpen(false);
    setDialogOpen(false);
  };

  const handleBackToCategories = () => {
    setHookSelectionDialogOpen(false);
    setDialogOpen(true);
    setSelectedIndustry(0);
    setSelectedEmotion(0);
  };

  const handleDeleteCustomHook = (hookToDelete: string) => {
    setCustomHooks(prev => prev.filter(hook => hook !== hookToDelete));
  };

  const handleCustomHookSubmit = () => {
    if (customHook.trim()) {
      onSelectHook(customHook);
      if (!customHooks.includes(customHook)) {
        setCustomHooks(prev => [...prev, customHook]);
      }
      setCustomHook("");
      setDialogOpen(false);
      setHookSelectionDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] flex flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-[#FEF8F6] via-[#FFFCFB] to-[#FDF2EE]">
          <DialogHeader className="flex-shrink-0 px-8 pt-6">
            {/* Back Button */}
            <button
              onClick={() => setDialogOpen(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#E07A5F] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="mb-2">
              <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Hook Library</DialogTitle>
            </div>
            <p className="text-sm text-gray-500">Browse hundreds of proven hooks organized by category</p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-8 pb-6">
            <div className="grid grid-cols-1 gap-3">
              {/* Inspirational Hooks */}
              <button
                onClick={() => handleSelectCategory("Inspirational Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E9E0F5] to-[#D4C6EB] rounded-xl flex items-center justify-center group-hover:from-[#DED2F0] group-hover:to-[#C8B8E5] transition-all shadow-sm">
                    <Sparkles className="w-5 h-5 text-[#7B5BA0]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Inspirational Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Motivate and inspire your audience</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Educational Hooks */}
              <button
                onClick={() => handleSelectCategory("Educational Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4EBE0] to-[#B8DBC8] rounded-xl flex items-center justify-center group-hover:from-[#C6E4D6] group-hover:to-[#A8D0BA] transition-all shadow-sm">
                    <GraduationCap className="w-5 h-5 text-[#3D7A5C]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Educational Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Teach and share knowledge</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Entertaining Hooks */}
              <button
                onClick={() => handleSelectCategory("Entertaining Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FCE4E8] to-[#F5C6D0] rounded-xl flex items-center justify-center group-hover:from-[#F8D6DC] group-hover:to-[#F0B4C2] transition-all shadow-sm">
                    <PartyPopper className="w-5 h-5 text-[#C4607A]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Entertaining Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Captivate with stories and surprises</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Promotional Hooks */}
              <button
                onClick={() => handleSelectCategory("Promotional Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FEF0DC] to-[#FADDB4] rounded-xl flex items-center justify-center group-hover:from-[#FCE8CC] group-hover:to-[#F6D0A0] transition-all shadow-sm">
                    <Megaphone className="w-5 h-5 text-[#C4882A]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Promotional Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Drive sales and conversions</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Industry Specific Hooks */}
              <button
                onClick={() => handleSelectCategory("Industry Specific Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#DCEAF8] to-[#B8D4F0] rounded-xl flex items-center justify-center group-hover:from-[#CEE0F4] group-hover:to-[#A8C8EA] transition-all shadow-sm">
                    <Target className="w-5 h-5 text-[#4A7EB8]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Industry Specific Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tailored for your niche</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Reverse-Psychology Hooks */}
              <button
                onClick={() => handleSelectCategory("Reverse-Psychology Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E0E0] to-[#E8C4C4] rounded-xl flex items-center justify-center group-hover:from-[#F0D4D4] group-hover:to-[#E0B4B4] transition-all shadow-sm">
                    <ShieldOff className="w-5 h-5 text-[#A0525B]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Reverse-Psychology Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Challenge and provoke curiosity</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Emotion-Driven Hooks */}
              <button
                onClick={() => handleSelectCategory("Emotion-Driven Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E0F0] to-[#E8C4E0] rounded-xl flex items-center justify-center group-hover:from-[#F0D4EA] group-hover:to-[#E0B4D6] transition-all shadow-sm">
                    <Heart className="w-5 h-5 text-[#A0527B]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Emotion-Driven Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Relatable, vulnerable, controversial & urgent</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Create your own */}
              <button
                onClick={() => {
                  setSelectedCategory("Create your own");
                  setDialogOpen(false);
                  setHookSelectionDialogOpen(true);
                }}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F0EBE6] to-[#E0D6CC] rounded-xl flex items-center justify-center group-hover:from-[#E8E0D8] group-hover:to-[#D6C8BC] transition-all shadow-sm">
                    <PenTool className="w-5 h-5 text-[#8B7355]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Create your own</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Write and save custom hooks</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={hookSelectionDialogOpen} onOpenChange={setHookSelectionDialogOpen}>
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] flex flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-[#FEF8F6] via-[#FFFCFB] to-[#FDF2EE]">
          <DialogHeader className="flex-shrink-0 px-8 pt-6">
            {/* Back Button */}
            <button
              onClick={() => handleBackToCategories()}
              className="flex items-center gap-2 text-gray-400 hover:text-[#E07A5F] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="mb-2">
              <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedCategory}</DialogTitle>
            </div>
            <p className="text-sm text-gray-500">Click any hook to add it to your ideate column</p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-8 py-6">
            {selectedCategory && selectedCategory !== "Create your own" && selectedCategory !== "Industry Specific Hooks" && selectedCategory !== "Emotion-Driven Hooks" &&
              HOOK_DATA[selectedCategory as keyof typeof HOOK_DATA]?.subcategories.map((subcat, scIndex) => (
                <div key={scIndex} className="mb-8">
                  <h3 className="font-semibold text-base text-gray-700 mb-3">{subcat.name}</h3>
                  <div className="space-y-2">
                    {subcat.hooks.map((hook, hIndex) => (
                      <button
                        key={hIndex}
                        onClick={() => handleSelectHook(hook)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm group"
                      >
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          "{hook}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            }

            {selectedCategory === "Industry Specific Hooks" && (() => {
              const subcats = HOOK_DATA["Industry Specific Hooks"].subcategories;
              const active = subcats[selectedIndustry];
              return (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {subcats.map((subcat, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedIndustry(i)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          i === selectedIndustry
                            ? 'bg-[#612A4F] text-white border-[#612A4F] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {active.hooks.map((hook, hIndex) => (
                      <button
                        key={hIndex}
                        onClick={() => handleSelectHook(hook)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm group"
                      >
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          "{hook}"
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}

            {selectedCategory === "Emotion-Driven Hooks" && (() => {
              const subcats = HOOK_DATA["Emotion-Driven Hooks"].subcategories;
              const active = subcats[selectedEmotion];
              return (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {subcats.map((subcat, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedEmotion(i)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          i === selectedEmotion
                            ? 'bg-[#612A4F] text-white border-[#612A4F] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {active.hooks.map((hook, hIndex) => (
                      <button
                        key={hIndex}
                        onClick={() => handleSelectHook(hook)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm group"
                      >
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          "{hook}"
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}

            {selectedCategory === "Create your own" && (
              <div>
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-gray-700 mb-3">Your Custom Hooks</h3>

                  <div className="flex items-center gap-2 mb-6">
                    <Input
                      type="text"
                      value={customHook}
                      onChange={(e) => setCustomHook(e.target.value)}
                      className="flex-1 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                      placeholder="Type your own hook..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customHook.trim()) {
                            setCustomHooks(prev => [...prev, customHook]);
                            setCustomHook("");
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (customHook.trim()) {
                          setCustomHooks(prev => [...prev, customHook]);
                          setCustomHook("");
                        }
                      }}
                      disabled={!customHook.trim()}
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {customHooks.length > 0 ? (
                    <div className="space-y-2">
                      {customHooks.map((hook, index) => (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => handleSelectHook(hook)}
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm pr-12"
                          >
                            <p className="text-sm text-gray-700 group-hover:text-gray-900">
                              "{hook}"
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomHook(hook);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            aria-label={`Delete hook "${hook}"`}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No custom hooks added yet. Create your first one above!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TitleHookSuggestions;
