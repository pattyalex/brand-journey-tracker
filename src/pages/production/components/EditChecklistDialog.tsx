import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ContentFlowProgress from "./ContentFlowProgress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  Video,
  Camera,
  MapPin,
  Shirt,
  Boxes,
  NotebookPen,
  SquarePen,
  Check,
  Sparkles,
  MessageSquare,
  ArrowRight,
  X,
} from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { ProductionCard, EditingChecklist, EditingChecklistItem, EditingStatus } from "../types";

// Helper to get platform icon
const getPlatformIcon = (platform: string): React.ReactNode => {
  const lowercased = platform.toLowerCase();
  const iconClass = "w-4 h-4";

  if (lowercased.includes("youtube")) return <SiYoutube className={iconClass} />;
  if (lowercased.includes("tiktok") || lowercased === "tt") return <SiTiktok className={iconClass} />;
  if (lowercased.includes("instagram") || lowercased === "ig") return <SiInstagram className={iconClass} />;
  if (lowercased.includes("facebook")) return <SiFacebook className={iconClass} />;
  if (lowercased.includes("linkedin")) return <SiLinkedin className={iconClass} />;
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) return <RiTwitterXLine className={iconClass} />;
  if (lowercased.includes("threads")) return <RiThreadsLine className={iconClass} />;
  return null;
};

// Static formats that should show camera icon
const staticFormats = [
  'single photo post',
  'curated photo carousel',
  'casual photo dump',
  'text-only post',
  'carousel with text slides',
  'notes-app style screenshot',
  'tweet-style slide',
  'static'
];

const isStaticFormat = (format: string): boolean => {
  return staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
};

interface EditChecklistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  card: ProductionCard | null;
  onSave: (checklist: EditingChecklist, title?: string, hook?: string, script?: string) => void;
  onNavigateToStep?: (step: number, savedCardData?: Partial<ProductionCard>) => void;
  slideDirection?: 'left' | 'right';
  embedded?: boolean;
}

// Default example items for the global checklist
const defaultExampleItems: EditingChecklistItem[] = [
  { id: 'example-1', text: 'Add visual hook in the first 3 seconds', checked: false, isExample: true },
  { id: 'example-2', text: 'Cut out pauses and filler words', checked: false, isExample: true },
  { id: 'example-3', text: 'Add captions for talking videos', checked: false, isExample: true },
];

const GLOBAL_CHECKLIST_KEY = 'editor-checklist-items';

// Load global checklist from localStorage
const loadGlobalChecklist = (): EditingChecklistItem[] => {
  try {
    const saved = localStorage.getItem(GLOBAL_CHECKLIST_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load global checklist:', e);
  }
  return defaultExampleItems;
};

// Save global checklist to localStorage
const saveGlobalChecklist = (items: EditingChecklistItem[]) => {
  try {
    localStorage.setItem(GLOBAL_CHECKLIST_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save global checklist:', e);
  }
};

const EditChecklistDialog: React.FC<EditChecklistDialogProps> = ({
  isOpen,
  onOpenChange,
  card,
  onSave,
  onNavigateToStep,
  slideDirection = 'right',
  embedded = false,
}) => {
  const [shakeButton, setShakeButton] = useState(false);

  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
    setShakeButton(true);
    setTimeout(() => setShakeButton(false), 600);
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
    }),
  };

  // Global checklist items (shared across all cards)
  const [globalItems, setGlobalItems] = useState<EditingChecklistItem[]>(loadGlobalChecklist);
  // Per-card notes and status
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EditingStatus | null>(null);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [script, setScript] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Initialize content from card data when dialog opens
  useEffect(() => {
    // Load global checklist items
    setGlobalItems(loadGlobalChecklist());
    // Load per-card notes and status
    setNotes(card?.editingChecklist?.notes || "");
    setStatus(card?.editingChecklist?.status || null);
    setTitle(card?.title || "");
    setHook(card?.hook || "");
    setScript(card?.script || "");
  }, [card, isOpen]);

  // Save global checklist whenever it changes
  useEffect(() => {
    saveGlobalChecklist(globalItems);
  }, [globalItems]);

  const handleToggleItem = (id: string) => {
    setGlobalItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setGlobalItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItemText = (id: string, newText: string) => {
    setGlobalItems(prev => prev.map(item =>
      item.id === id ? { ...item, text: newText, isExample: false } : item
    ));
  };

  const handleSave = () => {
    const checklist: EditingChecklist = {
      items: globalItems,
      notes,
      externalLinks: [],
      status,
    };
    onSave(checklist, title, hook, script);
    onOpenChange(false);
  };

  // Auto-save and navigate to another step
  const handleNavigateWithSave = (step: number) => {
    const checklist: EditingChecklist = {
      items: globalItems,
      notes,
      externalLinks: [],
      status,
    };
    // Pass saved data directly to navigation handler to avoid async state timing issues
    const savedData: Partial<ProductionCard> = {
      editingChecklist: checklist,
      title,
      hook,
      script,
    };
    onNavigateToStep?.(step, savedData);
  };

  // Progress calculation
  const completedCount = globalItems.filter(item => item.checked).length;
  const totalCount = globalItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  // SVG circle progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const dialogContent = (
    <>
      {/* Close Button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Step Progress Indicator */}
      <ContentFlowProgress
        currentStep={4}
        className="flex-shrink-0 pt-4 pb-2"
        onStepClick={handleNavigateWithSave}
      />
        {/* Headers row */}
        <div className="flex border-b border-[#8B7082]/30">
          {/* Content Overview Header */}
          <div className="w-[320px] flex-shrink-0 px-4 py-3 bg-transparent flex items-center relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#8B7082]/30"></div>
            <h3 className="font-semibold text-[#612A4F] flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Content Overview
            </h3>
          </div>
          {/* Checklist Header */}
          <div className="flex-1 px-4 py-3 bg-transparent flex items-center justify-between">
            <h3 className="font-semibold text-[#612A4F] flex items-center gap-2 text-base">
              <CheckSquare className="w-5 h-5" />
              Editing Checklist
            </h3>
            <Button
              size="sm"
              onClick={() => handleNavigateWithSave(5)}
              className="bg-[#612A4F] hover:bg-[#4A1F3D] text-white text-xs"
            >
              Move to Schedule <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Content Overview */}
          <div className="w-[320px] flex-shrink-0 bg-white/40 relative overflow-y-auto">
            <div className="absolute right-0 top-0 bottom-0 w-px bg-[#8B7082]/30"></div>
            <div className="h-full p-4">
              {/* Hook section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider">Hook</p>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-[#8B7082] hover:text-[#612A4F] transition-all duration-200 hover:scale-110 hover:-rotate-12"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 rounded-lg bg-[#A89098] hover:bg-[#8B7082] text-white transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    className="w-full text-[13px] text-gray-700 leading-relaxed bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    placeholder="Enter your hook..."
                  />
                ) : (
                  <p className="text-[13px] leading-relaxed">
                    {hook ? (
                      <span className="text-gray-700">{hook}</span>
                    ) : (
                      <span className="text-gray-400 italic">No hook added</span>
                    )}
                  </p>
                )}
              </div>

              {/* Script section */}
              <div className="mt-6">
                <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-1">Script</p>
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full h-full min-h-[200px] text-[13px] text-gray-700 leading-relaxed bg-transparent border-none p-0 resize-none focus:outline-none focus:ring-0"
                    placeholder="Write your script here..."
                  />
                ) : script ? (
                  <div className="-mx-2 px-2">
                    <span className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{script}</span>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-4 py-4 text-center cursor-pointer hover:bg-pink-50/50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs text-gray-600 font-medium">Click to add script</h4>
                      <p className="text-xs text-gray-400">
                        Add a script to review while editing
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card details - Formats, Platform, Shooting Plan */}
              <div className="mt-4 pt-2 space-y-6">
                {/* Formats (How it's shot) */}
                {card?.formats && card.formats.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">How it's shot</h4>
                    <div className="space-y-1">
                      {card.formats.map((format, idx) => {
                        const isPhoto = ['photo post', 'carousel', 'text post', 'photo', 'static'].some(
                          p => format.toLowerCase().includes(p)
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-600">
                            {isPhoto ? (
                              <Camera className="w-4 h-4 text-[#8B7082]" />
                            ) : (
                              <Video className="w-4 h-4 text-[#8B7082]" />
                            )}
                            <span>{format}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {card?.platforms && card.platforms.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Platform</h4>
                    <div className="flex items-center gap-3">
                      {card.platforms.map((platform, idx) => {
                        const icon = getPlatformIcon(platform);
                        return icon ? (
                          <span key={idx} className="text-[#8B7082]" title={platform}>
                            {icon}
                          </span>
                        ) : (
                          <span key={idx} className="text-[13px] text-[#8B7082]">{platform}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shooting Plan */}
                {(card?.locationText || card?.outfitText || card?.propsText || card?.filmingNotes) && (
                  <div className="pt-2">
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Shooting Plan</h4>
                    <div className="space-y-1 text-[13px] text-gray-600">
                      {card?.locationText && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.locationText}</span>
                        </div>
                      )}
                      {card?.outfitText && (
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.outfitText}</span>
                        </div>
                      )}
                      {card?.propsText && (
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.propsText}</span>
                        </div>
                      )}
                      {card?.filmingNotes && (
                        <div className="flex items-center gap-2">
                          <NotebookPen className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.filmingNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Checklist & Notes */}
          <div className="flex-1 bg-white/30 py-4 pl-8 pr-4">
            {/* Progress Ring & Stats */}
            <div className="flex items-center gap-4 mb-5">
              {/* Circular Progress */}
              <div className="relative flex-shrink-0">
                <svg width="70" height="70" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="35"
                    cy="35"
                    r="28"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="35"
                    cy="35"
                    r="28"
                    fill="none"
                    stroke={isAllComplete ? "#4E9D5A" : "#8B7082"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 - (progressPercent / 100) * 2 * Math.PI * 28 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isAllComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Sparkles className="w-5 h-5 text-[#4E9D5A]" />
                    </motion.div>
                  ) : (
                    <span className="text-lg font-bold text-[#612A4F]">{progressPercent}%</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1">
                <motion.p
                  className={cn(
                    "text-base font-semibold",
                    isAllComplete ? "text-[#3D8A48]" : "text-[#612A4F]"
                  )}
                  key={isAllComplete ? "complete" : "progress"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isAllComplete ? "All done!" : `${completedCount} of ${totalCount} complete`}
                </motion.p>
                <p className="text-xs text-gray-500">
                  {isAllComplete
                    ? "Your edit is ready for scheduling"
                    : "Check off items as you edit in your editing app of choice"}
                </p>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5 mb-5">
              <AnimatePresence mode="popLayout">
                {globalItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      "flex items-center gap-3 group rounded-lg px-3 py-2 transition-all duration-200",
                      item.checked
                        ? "bg-[#EFF5F0]/80 border border-[#A5D4AE]"
                        : "bg-white border border-gray-100 hover:border-[#8B7082]/30 hover:shadow-sm"
                    )}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className={cn(
                          "h-4 w-4 rounded-full transition-colors",
                          item.checked
                            ? "data-[state=checked]:bg-[#4E9D5A] data-[state=checked]:border-[#4E9D5A]"
                            : "data-[state=checked]:bg-[#8B7082] data-[state=checked]:border-[#8B7082] border-gray-300"
                        )}
                      />
                    </motion.div>
                    <input
                      type="text"
                      data-checklist-item
                      value={item.text}
                      onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        const currentIndex = globalItems.findIndex(i => i.id === item.id);

                        if (e.key === "Enter") {
                          e.preventDefault();
                          const newItem: EditingChecklistItem = {
                            id: `item-${Date.now()}`,
                            text: "",
                            checked: false,
                            isExample: false,
                          };
                          setGlobalItems(prev => [
                            ...prev.slice(0, currentIndex + 1),
                            newItem,
                            ...prev.slice(currentIndex + 1)
                          ]);
                          setTimeout(() => {
                            const inputs = document.querySelectorAll<HTMLInputElement>('[data-checklist-item]');
                            inputs[currentIndex + 1]?.focus();
                          }, 50);
                        }

                        if (e.key === "Backspace" && !item.text && currentIndex > 0) {
                          e.preventDefault();
                          setGlobalItems(prev => prev.filter(i => i.id !== item.id));
                          setTimeout(() => {
                            const inputs = document.querySelectorAll<HTMLInputElement>('[data-checklist-item]');
                            inputs[currentIndex - 1]?.focus();
                          }, 50);
                        }
                      }}
                      onBlur={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!item.text.trim() && !relatedTarget?.hasAttribute('data-checklist-item')) {
                          setTimeout(() => {
                            setGlobalItems(prev => prev.filter(i => i.id !== item.id));
                          }, 100);
                        }
                      }}
                      className={cn(
                        "flex-1 text-sm transition-all bg-transparent border-none outline-none focus:ring-0 p-0",
                        item.checked
                          ? "text-[#3D8A48] line-through"
                          : item.isExample
                            ? "text-gray-400 italic"
                            : "text-gray-700"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add new item button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  const newItem: EditingChecklistItem = {
                    id: `item-${Date.now()}`,
                    text: "",
                    checked: false,
                    isExample: false,
                  };
                  setGlobalItems(prev => [...prev, newItem]);
                  setTimeout(() => {
                    const inputs = document.querySelectorAll<HTMLInputElement>('[data-checklist-item]');
                    const lastInput = inputs[inputs.length - 1];
                    lastInput?.focus();
                  }, 50);
                }}
                className="flex items-center gap-2 w-full text-xs text-[#8B7082] hover:text-[#612A4F] transition-colors px-3 py-2 rounded-lg border border-dashed border-[#8B7082]/30 hover:border-[#8B7082]/50 hover:bg-white/50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add item</span>
              </motion.button>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-br from-white to-[#F5EEF2]/50 rounded-xl p-4 border border-[#8B7082]/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#8B7082]" />
                <h3 className="text-xs font-medium text-[#612A4F]">Editor Notes</h3>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pacing, music, transitions, text overlays..."
                className="min-h-[120px] max-h-[200px] border-0 bg-transparent focus:ring-0 resize-none overflow-y-auto placeholder:text-gray-400 text-xs text-gray-700"
              />
            </div>
          </div>
        </div>
    </>
  );

  if (embedded) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[950px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key="edit-content"
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {dialogContent}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EditChecklistDialog;
