import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ContentFlowProgress from "./ContentFlowProgress";
import StepCompleteFooter from "./StepCompleteFooter";
import StageTimeline from "./StageTimeline";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  ArrowLeft,
  ArrowRight,
  X,
  Image as ImageIcon,
  ChevronDown,
  Link,
  PenLine,
  ExternalLink,
  Laptop,
  Scissors,
  Layers,
} from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { ProductionCard, EditingChecklist, EditingChecklistItem, EditingStatus, ContentType } from "../types";

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
  onSave: (checklist: EditingChecklist, title?: string, hook?: string, script?: string, cardId?: string) => void;
  onNavigateToStep?: (step: number, savedCardData?: Partial<ProductionCard>) => void;
  slideDirection?: 'left' | 'right';
  embedded?: boolean;
  completedSteps?: number[];
  contentType?: ContentType;
  onContentTypeChange?: (type: 'video' | 'image') => void;
  onToggleStage?: (stage: keyof import("../types").StageCompletions) => void;
  onToggleComplete?: (step: number) => void;
}

// Default example items for the global checklist (video)
const defaultVideoExampleItems: EditingChecklistItem[] = [
  { id: 'example-1', text: 'Add visual hook in the first 3 seconds', checked: false, isExample: true },
  { id: 'example-2', text: 'Cut out pauses and filler words', checked: false, isExample: true },
  { id: 'example-3', text: 'Add captions for talking videos', checked: false, isExample: true },
];

// Default example items for the global checklist (image)
const defaultImageExampleItems: EditingChecklistItem[] = [
  { id: 'img-example-1', text: 'Consistent visual style across all slides', checked: false, isExample: true },
  { id: 'img-example-2', text: 'Text is legible on all backgrounds', checked: false, isExample: true },
  { id: 'img-example-3', text: 'Branding or watermark added', checked: false, isExample: true },
  { id: 'img-example-4', text: 'Slide order tells a clear story', checked: false, isExample: true },
];

const VIDEO_CHECKLIST_KEY = 'editor-checklist-items';
const IMAGE_CHECKLIST_KEY = 'editor-checklist-items-image';

// Load global checklist from localStorage
const loadGlobalChecklist = (contentType: ContentType = 'video'): EditingChecklistItem[] => {
  const key = contentType === 'image' ? IMAGE_CHECKLIST_KEY : VIDEO_CHECKLIST_KEY;
  const defaults = contentType === 'image' ? defaultImageExampleItems : defaultVideoExampleItems;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load global checklist:', e);
  }
  return defaults;
};

// Save global checklist to localStorage
const saveGlobalChecklist = (items: EditingChecklistItem[], contentType: ContentType = 'video') => {
  const key = contentType === 'image' ? IMAGE_CHECKLIST_KEY : VIDEO_CHECKLIST_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(items));
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
  completedSteps = [],
  contentType = 'video',
  onContentTypeChange,
  onToggleStage,
  onToggleComplete,
}) => {
  const [shakeButton, setShakeButton] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

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

  // Global checklist items (shared across all cards of same content type)
  const [globalItems, setGlobalItems] = useState<EditingChecklistItem[]>(() => loadGlobalChecklist(contentType));
  // Per-card notes and status
  const [notes, setNotes] = useState("");
  const [externalLinks, setExternalLinks] = useState<Array<{ id: string; label: string; url: string }>>([]);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<EditingStatus | null>(null);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [script, setScript] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const isImage = contentType === 'image';
  // For image: Edit is step 3, next is Schedule (step 4); for video: Edit is step 4, next is Ready (step 5)
  const editStepNumber = isImage ? 3 : 4;
  const scheduleStepNumber = isImage ? 4 : 5;

  // Track latest data in a ref so unmount cleanup can access it
  const latestDataRef = useRef({ globalItems, notes, externalLinks, status, title, hook, script });
  useEffect(() => {
    latestDataRef.current = { globalItems, notes, externalLinks, status, title, hook, script };
  }, [globalItems, notes, externalLinks, status, title, hook, script]);

  // Save on unmount (when parent dialog closes via X button)
  const onSaveRef = useRef(onSave);
  const cardRef = useRef(card);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  // Only update cardRef when card is non-null — preserve the last valid card
  // so unmount cleanup can still save data when parent sets card to null before unmount
  useEffect(() => { if (card) cardRef.current = card; }, [card]);
  useEffect(() => {
    return () => {
      if (cardRef.current) {
        const d = latestDataRef.current;
        const checklist: EditingChecklist = {
          items: d.globalItems,
          notes: d.notes,
          externalLinks: d.externalLinks,
          status: d.status,
        };
        onSaveRef.current(checklist, d.title, d.hook, d.script, cardRef.current.id);
      }
    };
  }, []);

  // Initialize content from card data when dialog opens
  // Only re-initialize when a DIFFERENT card is opened (by tracking card ID),
  // not when the same card object is updated (e.g., by toggling step complete).
  // Skip re-initialization when card becomes null (dialog is closing) to
  // preserve local edits for the unmount cleanup save.
  const prevCardIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!card) return;
    if (card.id === prevCardIdRef.current) return;
    prevCardIdRef.current = card.id;
    // Load global checklist items for this content type
    setGlobalItems(loadGlobalChecklist(contentType));
    // Load per-card notes and status
    setNotes(card.editingChecklist?.notes || "");
    setShowNotesEditor(!!(card.editingChecklist?.notes));
    setExternalLinks(card.editingChecklist?.externalLinks || []);
    setStatus(card.editingChecklist?.status || null);
    setTitle(card.hook || card.title || "");
    setHook(card.hook || card.title || "");
    const slidesText = card.slides?.map(s => s.content).filter(Boolean).join('\n\n') || '';
    const scriptFromCard = card.script?.trim() || '';
    setScript(slidesText || scriptFromCard || "");
  }, [card, isOpen]);

  // Save global checklist whenever it changes
  useEffect(() => {
    saveGlobalChecklist(globalItems, contentType);
  }, [globalItems, contentType]);

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
      externalLinks,
      status,
    };
    onSave(checklist, title, hook, script, card?.id);
    onOpenChange(false);
  };

  // Auto-save and navigate to another step
  const handleNavigateWithSave = (step: number) => {
    const checklist: EditingChecklist = {
      items: globalItems,
      notes,
      externalLinks,
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
      {/* Top bar: Close button (right) */}
      <TooltipProvider delayDuration={0}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-7 right-4 p-1.5 rounded-full hover:bg-[#612A4F]/10 text-gray-400 hover:text-[#612A4F] transition-colors z-30 focus:outline-none"
              tabIndex={-1}
            >
              <X className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="bg-gray-500 text-white">
            <p>Save & Exit</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Step Progress Indicator */}
      <ContentFlowProgress
        currentStep={editStepNumber}
        contentType={contentType}
        className="flex-shrink-0 pt-4 pb-6"
        onStepClick={handleNavigateWithSave}
        completedSteps={completedSteps}
        onToggleComplete={onToggleComplete}
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
          <div className="flex-1 px-4 py-3 bg-transparent flex items-center">
            <h3 className="font-semibold text-[#612A4F] flex items-center gap-2 text-base">
              <Scissors className="w-5 h-5" />
              Editing Notes
            </h3>
          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Content Overview */}
          <div className="w-[320px] flex-shrink-0 bg-white/40 relative overflow-y-auto">
            <div className="absolute right-0 top-0 bottom-0 w-px bg-[#8B7082]/30"></div>
            <div className="h-full p-4">
              {/* Media type + edit button */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-1">Media Type</p>
                  <div className="flex items-center gap-1.5">
                    {contentType === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-[#8B7082]" />
                    ) : card?.imageMode === 'carousel' ? (
                      <Layers className="w-3.5 h-3.5 text-[#8B7082]" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-[#8B7082]" />
                    )}
                    <span className="text-[11px] text-[#8B7082] font-medium">
                      {contentType === 'video' ? 'Video' : card?.imageMode === 'carousel' ? 'Carousel' : 'Image'}
                    </span>
                  </div>
                </div>
                {!isEditing ? (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-[#8B7082] hover:text-[#612A4F] transition-all duration-200 hover:scale-110 hover:-rotate-12"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="bg-gray-500 text-white">
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-1.5 rounded-lg bg-[#A89098] hover:bg-[#8B7082] text-white transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="bg-gray-500 text-white">
                        <p>Save changes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Hook section */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-1">Hook</p>
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
                  <p className="text-[13px] text-gray-400 italic">No script added</p>
                )}
              </div>

              {/* Caption section */}
              <div className="mt-6">
                <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-1">Caption</p>
                {isEditing ? (
                  <textarea
                    value={card?.caption || ''}
                    className="w-full min-h-[80px] text-[13px] text-gray-700 leading-relaxed bg-transparent border-none p-0 resize-none focus:outline-none focus:ring-0"
                    placeholder="Write your caption here..."
                    readOnly
                  />
                ) : card?.caption ? (
                  <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{card.caption}</p>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">No caption added</p>
                )}
              </div>

              {/* Card details - Formats, Platform, Shooting Plan */}
              <div className="mt-4 pt-2 space-y-6">
                {/* Format section */}
                {contentType === 'video' && card?.formats && card.formats.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Filming Format</h4>
                    <div className="space-y-1">
                      {card.formats.map((format, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-600">
                          <Video className="w-4 h-4 text-[#8B7082]" />
                          <span>{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {contentType === 'image' && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Format</h4>
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                      {card?.imageMode === 'carousel' ? (
                        <>
                          <Layers className="w-4 h-4 text-[#8B7082]" />
                          <span>Carousel</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-[#8B7082]" />
                          <span>Single Image</span>
                        </>
                      )}
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

          {/* Right Column - Editing Notes */}
          <div className="flex-1 bg-white/30 py-4 pl-8 pr-4 flex flex-col">
            <p className="text-xs text-gray-400 mb-3">
              Write down reminders for your edit — pacing, music, transitions, text overlays, color grading, or anything else you want to remember.
            </p>

            {/* Notes textarea */}
            {showNotesEditor ? (
              <Textarea
                ref={notesRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isImage ? "Color grading notes, font choices, brand consistency, layout ideas..." : "Pacing, music choices, transitions, text overlays, color grading, sound effects..."}
                className="flex-1 min-h-[200px] border border-[#E8E2E5] bg-white rounded-xl shadow-sm focus:ring-1 focus:ring-[#8B7082]/30 focus:border-[#8B7082]/40 resize-none overflow-y-auto placeholder:text-gray-300 text-sm text-gray-700 p-4 leading-relaxed"
                autoFocus
              />
            ) : (
              <div
                className="flex-1 min-h-[200px] border border-dashed border-[#D4C8D0] bg-white/60 rounded-xl flex flex-col items-center justify-center cursor-text group hover:border-[#8B7082]/50 hover:bg-white/80 transition-all"
                onClick={() => setShowNotesEditor(true)}
              >
                <PenLine className="w-6 h-6 text-[#C4B5BE] group-hover:text-[#8B7082] transition-colors mb-2" />
                <p className="text-sm text-[#B0A3AA] group-hover:text-[#8B7082] transition-colors font-medium">Click to add notes</p>
                <p className="text-xs text-[#C4B5BE] mt-1">
                  {isImage ? "Color grading, fonts, layout..." : "Pacing, music, transitions..."}
                </p>
              </div>
            )}

            {/* External Links */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#8B7082]">Reference Links</span>
              </div>

              {externalLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 mb-2 group/link">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E8E2E5] shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5 text-[#8B7082] flex-shrink-0" />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        setExternalLinks(prev => prev.map(l =>
                          l.id === link.id ? { ...l, label: e.target.value } : l
                        ));
                      }}
                      placeholder="Label (optional)"
                      className="flex-1 text-xs text-gray-600 bg-transparent border-none outline-none placeholder:text-gray-300 min-w-0"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        setExternalLinks(prev => prev.map(l =>
                          l.id === link.id ? { ...l, url: e.target.value } : l
                        ));
                      }}
                      placeholder="Paste URL..."
                      className="flex-1 text-xs text-[#8B7082] bg-transparent border-none outline-none placeholder:text-gray-300 min-w-0"
                    />
                  </div>
                  <button
                    onClick={() => setExternalLinks(prev => prev.filter(l => l.id !== link.id))}
                    className="opacity-0 group-hover/link:opacity-100 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  setExternalLinks(prev => [...prev, {
                    id: crypto.randomUUID(),
                    label: "",
                    url: "",
                  }]);
                }}
                className="flex items-center gap-1.5 text-xs text-[#8B7082] hover:text-[#612A4F] transition-colors py-1.5 px-2 rounded-lg hover:bg-[#612A4F]/5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add link
              </button>
            </div>
          </div>
        </div>

      <StepCompleteFooter stepNumber={editStepNumber} completedSteps={completedSteps} onToggleComplete={onToggleComplete} showNextStep={!!onNavigateToStep} onNextStep={onNavigateToStep ? () => handleNavigateWithSave(editStepNumber + 1) : undefined} showPrevStep={!!onNavigateToStep} onPrevStep={onNavigateToStep ? () => handleNavigateWithSave(editStepNumber - 1) : undefined} />
    </>
  );

  if (embedded) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[950px] border-0 shadow-2xl p-0 overflow-hidden flex flex-row bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30">
        <div className="flex-1 flex flex-col overflow-hidden">
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
        </div>
        {card && onToggleStage && (
          <div className="w-[200px] flex-shrink-0 border-l border-[#E8E2E5] p-4 overflow-y-auto bg-[#FDFBFC]">
            <StageTimeline card={card} onToggleStage={onToggleStage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditChecklistDialog;
