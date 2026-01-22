import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ContentFlowProgress from "./ContentFlowProgress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  Circle,
  PlayCircle,
  Wrench,
  Check,
  Video,
  Camera,
  Film,
  Scissors,
  MapPin,
  Shirt,
  Boxes,
  NotebookPen,
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
  onSave: (checklist: EditingChecklist, title?: string, script?: string) => void;
  onNavigateToStep?: (step: number) => void;
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
}) => {
  // Global checklist items (shared across all cards)
  const [globalItems, setGlobalItems] = useState<EditingChecklistItem[]>(loadGlobalChecklist);
  // Per-card notes and status
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EditingStatus | null>(null);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize content from card data when dialog opens
  useEffect(() => {
    // Load global checklist items
    setGlobalItems(loadGlobalChecklist());
    // Load per-card notes and status
    setNotes(card?.editingChecklist?.notes || "");
    setStatus(card?.editingChecklist?.status || null);
    setTitle(card?.title || "");
    setScript(card?.script || "");
  }, [card, isOpen]);

  // Save global checklist whenever it changes
  useEffect(() => {
    saveGlobalChecklist(globalItems);
  }, [globalItems]);

  // Auto-resize script textarea on initial load
  useEffect(() => {
    if (scriptTextareaRef.current && script) {
      scriptTextareaRef.current.style.height = 'auto';
      scriptTextareaRef.current.style.height = `${scriptTextareaRef.current.scrollHeight}px`;
    }
  }, [script, isOpen]);

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
    onSave(checklist, title, script);
    onOpenChange(false);
  };

  const statusOptions: { value: EditingStatus; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: "to-start-editing",
      label: "To Start Editing",
      icon: <Scissors className="w-4 h-4" />,
      description: "Haven't started yet"
    },
    {
      value: "needs-more-editing",
      label: "Needs More Work",
      icon: <Wrench className="w-4 h-4" />,
      description: "In progress, needs refinement"
    },
    {
      value: "ready-to-schedule",
      label: "Edited",
      icon: <Check className="w-4 h-4" />,
      description: "Ready to move to scheduling"
    },
  ];

  const completedItems = globalItems.filter(item => item.checked).length;
  const totalItems = globalItems.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[950px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-b from-pink-50/50 via-white to-white">
        {/* Step Progress Indicator */}
        <ContentFlowProgress
          currentStep={4}
          className="flex-shrink-0 pt-4 pb-2"
          onStepClick={onNavigateToStep}
        />

        {/* Header */}
        <div className="px-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Edit Checklist</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Two Column Layout */}
          <div className="flex gap-6 h-full">
            {/* Left Column - Content Overview */}
            <div className="w-[340px] flex-shrink-0 bg-gradient-to-b from-pink-50/80 to-pink-50/30 rounded-2xl p-5">
              <div className="space-y-5">
                {/* Hook */}
                <div>
                  <p className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-1">Hook</p>
                  <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your hook..."
                    className="w-full text-sm text-gray-800 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 resize-none placeholder:text-gray-400"
                    rows={1}
                  />
                </div>

                {/* Script */}
                <div>
                  <p className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-2">Script</p>
                  <Textarea
                    ref={scriptTextareaRef}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter your script or talking points..."
                    className="min-h-[100px] text-sm text-gray-700 leading-relaxed border-0 bg-white/60 rounded-lg px-3 py-2 focus:ring-1 focus:ring-pink-300 resize-none placeholder:text-gray-400"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                </div>

                {/* How It's Shot */}
                {card?.formats && card.formats.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-2">How It's Shot</p>
                    <div className="space-y-1.5">
                      {card.formats.map((format, idx) => {
                        const isPhoto = ['photo post', 'carousel', 'text post', 'photo', 'static'].some(
                          p => format.toLowerCase().includes(p)
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            {isPhoto ? (
                              <Camera className="w-4 h-4 text-pink-300" />
                            ) : (
                              <Video className="w-4 h-4 text-pink-300" />
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
                  <div>
                    <p className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-2">Platforms</p>
                    <div className="flex items-center gap-3">
                      {card.platforms.map((platform, idx) => {
                        const icon = getPlatformIcon(platform);
                        return icon ? (
                          <span key={idx} className="text-gray-500" title={platform}>
                            {icon}
                          </span>
                        ) : (
                          <span key={idx} className="text-sm text-gray-500">{platform}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filming Plan */}
                {(card?.locationText || card?.outfitText || card?.propsText || card?.filmingNotes) && (
                  <div>
                    <p className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-2">Filming Plan</p>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      {card?.locationText && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-300 flex-shrink-0" />
                          <span>{card.locationText}</span>
                        </div>
                      )}
                      {card?.outfitText && (
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-pink-300 flex-shrink-0" />
                          <span>{card.outfitText}</span>
                        </div>
                      )}
                      {card?.propsText && (
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-pink-300 flex-shrink-0" />
                          <span>{card.propsText}</span>
                        </div>
                      )}
                      {card?.filmingNotes && (
                        <div className="flex items-center gap-2">
                          <NotebookPen className="w-4 h-4 text-pink-300 flex-shrink-0" />
                          <span>{card.filmingNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Checklist & Notes */}
            <div className="flex-1 space-y-5">
              {/* Editor's Checklist Section */}
              <div>
                <h3 className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-3">Editor's Checklist</h3>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {globalItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 group bg-white rounded-xl px-3 py-2.5 shadow-sm"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400 border-gray-300"
                        />
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
                              ? "text-gray-400 line-through"
                              : item.isExample
                                ? "text-gray-400 italic"
                                : "text-gray-700"
                          )}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent text-gray-300 hover:text-red-500"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add new item */}
                  <button
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
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink-500 transition-colors px-3 py-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add item</span>
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-3">Notes & Instructions</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about pacing, music choices, transitions, text overlays..."
                  className="min-h-[120px] border-0 bg-gray-50/80 rounded-2xl focus:ring-1 focus:ring-pink-300 resize-none placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Editing Status */}
              <div>
                <h4 className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-3">Editing Status</h4>
                <div className="flex gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatus(option.value)}
                      className={cn(
                        "px-3 py-2 rounded-xl transition-all text-left flex items-center gap-2",
                        status === option.value
                          ? "bg-pink-50"
                          : "bg-gray-100 hover:bg-gray-150"
                      )}
                    >
                      {React.cloneElement(option.icon as React.ReactElement, {
                        className: cn(
                          "w-4 h-4 flex-shrink-0",
                          status === option.value ? "text-pink-500" : "text-gray-400"
                        )
                      })}
                      <div>
                        <span className={cn(
                          "font-semibold text-xs block whitespace-nowrap",
                          status === option.value ? "text-pink-700" : "text-gray-700"
                        )}>{option.label}</span>
                        <span className={cn(
                          "text-[10px] whitespace-nowrap",
                          status === option.value ? "text-pink-500" : "text-gray-400"
                        )}>{option.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditChecklistDialog;
