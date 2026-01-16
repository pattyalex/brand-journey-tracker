import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  CheckCircle2,
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
      icon: <PlayCircle className="w-4 h-4" />,
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
      icon: <CheckCircle2 className="w-4 h-4" />,
      description: "Ready to move to scheduling"
    },
  ];

  const completedItems = globalItems.filter(item => item.checked).length;
  const totalItems = globalItems.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-rose-50/30 via-white to-gray-50 h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Edit Checklist</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Motivational Banner */}
          <div className="mx-6 mt-2 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
            <div className="flex items-stretch gap-3">
              <div className="w-1 bg-rose-400 rounded-full flex-shrink-0" />
              <div>
                <p className="text-rose-800 font-medium">You've filmed your content!</p>
                <p className="text-rose-600 text-sm mt-1">
                  Open your favorite editing app and bring it to life. Use this checklist to stay organized.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Content Overview */}
              <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                <div className="px-4 py-3 bg-rose-50/40 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Film className="w-4 h-4 text-rose-500" /> Content Overview
                  </h3>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {/* Hook */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hook</p>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your hook..."
                      className="text-[13px] text-gray-800 border-0 bg-transparent px-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Script */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Script</p>
                    <Textarea
                      ref={scriptTextareaRef}
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Enter your script or talking points..."
                      className="min-h-[120px] text-[13px] text-gray-700 leading-relaxed border-0 focus:ring-0 resize-none bg-transparent overflow-hidden"
                      style={{ height: 'auto' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    {/* How It's Shot */}
                    {card?.formats && card.formats.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">How It's Shot</p>
                        <div className="space-y-1">
                          {card.formats.map((format, idx) => {
                            const isPhoto = ['photo post', 'carousel', 'text post', 'photo', 'static'].some(
                              p => format.toLowerCase().includes(p)
                            );
                            return (
                              <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-600">
                                {isPhoto ? (
                                  <Camera className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Video className="w-4 h-4 text-gray-400" />
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
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Platform</p>
                        <div className="flex items-center gap-3">
                          {card.platforms.map((platform, idx) => {
                            const icon = getPlatformIcon(platform);
                            return icon ? (
                              <span key={idx} className="text-gray-500" title={platform}>
                                {icon}
                              </span>
                            ) : (
                              <span key={idx} className="text-[13px] text-gray-500">{platform}</span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Filming Plan */}
                    {(card?.locationText || card?.outfitText || card?.propsText || card?.filmingNotes) && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Filming Plan</p>
                        <div className="space-y-1 text-[13px] text-gray-600">
                          {card?.locationText && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{card.locationText}</span>
                            </div>
                          )}
                          {card?.outfitText && (
                            <div className="flex items-center gap-2">
                              <Shirt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{card.outfitText}</span>
                            </div>
                          )}
                          {card?.propsText && (
                            <div className="flex items-center gap-2">
                              <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{card.propsText}</span>
                            </div>
                          )}
                          {card?.filmingNotes && (
                            <div className="flex items-center gap-2">
                              <NotebookPen className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
              <div className="space-y-6">
                {/* Editor's Checklist Section */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-rose-50/40 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-rose-500" /> Editor's Checklist
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Add reminders for your editing session</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {globalItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 group"
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => handleToggleItem(item.id)}
                            className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
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
                              // Only delete if clicking outside the checklist area (not when moving to another item)
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

                    {/* Add new item link */}
                    <div className="flex justify-end mt-2">
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
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-rose-50/40 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" /> Notes & Instructions
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Any additional details for the edit</p>
                  </div>
                  <div className="p-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about pacing, music choices, transitions, text overlays, or any other editing details..."
                      className="min-h-[160px] border-gray-200 focus:border-rose-400 focus:ring-rose-400 resize-none placeholder:italic placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section - Full Width */}
            <div className="mt-6">
            {/* Status Section */}
            <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-rose-50/40 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Circle className="w-4 h-4 text-rose-400" /> Editing Status
                </h3>
                <p className="text-xs text-gray-500 mt-1">Track where you are in the editing process</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatus(option.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        status === option.value
                          ? option.value === "ready-to-schedule"
                            ? "border-emerald-400 bg-emerald-50"
                            : option.value === "needs-more-editing"
                            ? "border-amber-400 bg-amber-50"
                            : "border-rose-400 bg-rose-50"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-2 mb-2",
                        status === option.value
                          ? option.value === "ready-to-schedule"
                            ? "text-emerald-600"
                            : option.value === "needs-more-editing"
                            ? "text-amber-600"
                            : "text-rose-600"
                          : "text-gray-500"
                      )}>
                        {option.icon}
                        <span className="font-semibold text-sm">{option.label}</span>
                      </div>
                      <p className={cn(
                        "text-xs",
                        status === option.value
                          ? option.value === "ready-to-schedule"
                            ? "text-emerald-600"
                            : option.value === "needs-more-editing"
                            ? "text-amber-600"
                            : "text-rose-600"
                          : "text-gray-400"
                      )}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditChecklistDialog;
