import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, ChevronLeft, ChevronRight, Video, Camera, Check, X, Pin, PartyPopper, Lightbulb, Send, Plus, ArrowRight, TrendingUp, Clock, Sparkles, Archive, Trash2 } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";
import { ProductionCard, KanbanColumn } from "../types";
import ContentFlowProgress from "./ContentFlowProgress";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import { toast } from "sonner";

// Helper to get platform icon
const getPlatformIcon = (platform: string, size: string = "w-5 h-5"): React.ReactNode => {
  const lowercased = platform.toLowerCase();

  if (lowercased.includes("youtube")) return <SiYoutube className={size} />;
  if (lowercased.includes("tiktok") || lowercased === "tt") return <SiTiktok className={size} />;
  if (lowercased.includes("instagram") || lowercased === "ig") return <SiInstagram className={size} />;
  if (lowercased.includes("facebook")) return <SiFacebook className={size} />;
  if (lowercased.includes("linkedin")) return <SiLinkedin className={size} />;
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) return <RiTwitterXLine className={size} />;
  if (lowercased.includes("threads")) return <RiThreadsLine className={size} />;
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
  'photo post',
  'carousel',
  'text post'
];

const isStaticFormat = (format: string): boolean => {
  return staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
};

// Color options for scheduled content - using hex values for inline styles
const scheduleColors = {
  indigo: { bg: '#e0e7ff', text: '#4338ca', dot: 'bg-indigo-300' },
  rose: { bg: '#ffe4e6', text: '#be123c', dot: 'bg-rose-300' },
  amber: { bg: '#fef3c7', text: '#b45309', dot: 'bg-amber-300' },
  emerald: { bg: '#d1fae5', text: '#047857', dot: 'bg-emerald-300' },
  sky: { bg: '#e0f2fe', text: '#0369a1', dot: 'bg-sky-300' },
  violet: { bg: '#ede9fe', text: '#6d28d9', dot: 'bg-violet-300' },
  orange: { bg: '#ffedd5', text: '#c2410c', dot: 'bg-orange-300' },
  cyan: { bg: '#cffafe', text: '#0e7490', dot: 'bg-cyan-300' },
  sage: { bg: '#DCE5D4', text: '#5F6B52', dot: 'bg-[#A8B89E]' },
};

// Default color for all scheduled content cards
const defaultScheduledColor = { bg: '#8B7082', text: '#ffffff', dot: 'bg-[#8B7082]' };

type ScheduleColorKey = keyof typeof scheduleColors;

interface ExpandedScheduleViewProps {
  /** When true, renders inline without modal wrapper and loads data from localStorage */
  embedded?: boolean;
  /** Cards to display - required when not embedded */
  cards?: ProductionCard[];
  /** Single card to schedule (when navigating from stepper) */
  singleCard?: ProductionCard | null;
  /** Close handler - required when not embedded */
  onClose?: () => void;
  onSchedule?: (cardId: string, date: Date) => void;
  onUnschedule?: (cardId: string) => void;
  onUpdateColor?: (cardId: string, color: ScheduleColorKey) => void;
  /** Optional header component to render above the calendar in the right panel */
  headerComponent?: React.ReactNode;
  /** When true, shows a compact calendar-only view for planning an idea */
  planningMode?: boolean;
  /** The card being planned (required when planningMode is true) */
  planningCard?: ProductionCard | null;
  /** Callback when a date is selected for planning */
  onPlanDate?: (cardId: string, date: Date) => void;
  /** Callback to navigate to a different step in the stepper */
  onNavigateToStep?: (step: number) => void;
  /** Callback when "Stop Here, Finish Later" is clicked - moves card to schedule column */
  onMoveToScheduleColumn?: (card: ProductionCard) => void;
}

const ExpandedScheduleView: React.FC<ExpandedScheduleViewProps> = ({
  embedded = false,
  cards: propCards,
  singleCard,
  onClose,
  onSchedule: propOnSchedule,
  onUnschedule: propOnUnschedule,
  onUpdateColor: propOnUpdateColor,
  headerComponent,
  planningMode = false,
  planningCard,
  onPlanDate,
  onNavigateToStep,
  onMoveToScheduleColumn,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedPlannedCardId, setDraggedPlannedCardId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragOverUnschedule, setDragOverUnschedule] = useState(false);
  const [popoverCardId, setPopoverCardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ProductionCard | null>(null);

  // State for adding new content idea (embedded mode only)
  const [addIdeaPopoverDate, setAddIdeaPopoverDate] = useState<string | null>(null);
  const [newIdeaHook, setNewIdeaHook] = useState("");
  const [newIdeaNotes, setNewIdeaNotes] = useState("");
  const [newIdeaColor, setNewIdeaColor] = useState<string>("indigo");

  // State for editing scheduled card in popover
  const [editingScheduledHook, setEditingScheduledHook] = useState<string>("");
  const [editingScheduledNotes, setEditingScheduledNotes] = useState<string>("");
  const [editingScheduledColor, setEditingScheduledColor] = useState<ScheduleColorKey>("indigo");

  // Render version counter to force re-renders when colors change
  const [colorUpdateVersion, setColorUpdateVersion] = useState(0);

  // Resize state for planning mode
  const [planningSize, setPlanningSize] = useState({ width: 450, height: 500 });
  // Pending planned date (before user confirms with Save)
  const [pendingPlanDate, setPendingPlanDate] = useState<Date | null>(null);
  // Drag state for planning mode
  const [isDraggingPlanCard, setIsDraggingPlanCard] = useState(false);
  const [planDragOverDate, setPlanDragOverDate] = useState<string | null>(null);

  // Time picker state for scheduling
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pendingScheduleDate, setPendingScheduleDate] = useState<Date | null>(null);
  const [pendingScheduleCardId, setPendingScheduleCardId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("9:00");
  const [endTime, setEndTime] = useState("10:00");
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("AM");

  // Track when single card has been scheduled (for congratulation state)
  const [singleCardScheduled, setSingleCardScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  // Initialize pending date with card's existing planned date when planning card changes
  useEffect(() => {
    if (planningCard?.plannedDate) {
      setPendingPlanDate(new Date(planningCard.plannedDate));
    } else {
      setPendingPlanDate(null);
    }
  }, [planningCard?.id, planningCard?.plannedDate]);

  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 450, height: 500 });

  // Handle resize from bottom-right corner (expand right and down)
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: planningSize.width,
      height: planningSize.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      setPlanningSize({
        width: Math.max(350, Math.min(800, resizeStart.current.width + deltaX)),
        height: Math.max(400, Math.min(700, resizeStart.current.height + deltaY)),
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [planningSize]);

  // Handle resize from top-right corner (expand right and up)
  const handleResizeStartTopRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: planningSize.width,
      height: planningSize.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      setPlanningSize({
        width: Math.max(350, Math.min(800, resizeStart.current.width + deltaX)),
        height: Math.max(400, Math.min(700, resizeStart.current.height - deltaY)), // Subtract deltaY for upward expansion
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [planningSize]);

  // For embedded mode: manage columns state internally
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  // Load production data from localStorage when embedded or in planning mode
  const loadColumnsFromStorage = useCallback(() => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setColumns(parsed);
      } catch (e) {
        console.error("Error parsing production data:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Always load columns from storage for archive functionality to work
    loadColumnsFromStorage();
  }, [loadColumnsFromStorage]);

  // Listen for updates from other calendar instances for real-time sync
  useEffect(() => {
    const cleanup = on(window, EVENTS.productionKanbanUpdated, () => {
      loadColumnsFromStorage();
    });
    return cleanup;
  }, [loadColumnsFromStorage]);

  // Save columns to localStorage and emit event for real-time sync
  const saveColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    setString(StorageKeys.productionKanban, JSON.stringify(newColumns));
    // Emit event so other calendar instances can sync
    emit(window, EVENTS.productionKanbanUpdated, { source: 'calendar' });
  };

  // Get cards from localStorage when embedded or planningMode, otherwise use props
  const toScheduleCards = useMemo(() => {
    if (embedded || planningMode) {
      const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
      return toScheduleColumn?.cards || [];
    }
    return propCards || [];
  }, [embedded, planningMode, columns, propCards]);

  // Get planned cards from Ideate column (cards with plannedDate but not yet in production)
  // For modal mode, we need to load from localStorage since we don't have columns in state
  const plannedIdeateCards = useMemo(() => {
    if (embedded || planningMode) {
      const ideateColumn = columns.find(col => col.id === 'ideate');
      return ideateColumn?.cards.filter(c => c.plannedDate) || [];
    }
    // For modal mode, load from localStorage to get planned items
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const parsed: KanbanColumn[] = JSON.parse(savedData);
        const ideateColumn = parsed.find(col => col.id === 'ideate');
        return ideateColumn?.cards.filter(c => c.plannedDate) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [embedded, planningMode, columns]);

  // Internal handlers for embedded mode
  const handleScheduleInternal = (cardId: string, date: Date) => {
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              return {
                ...card,
                schedulingStatus: 'scheduled' as const,
                scheduledDate: date.toISOString(),
              };
            }
            return card;
          }),
        };
      }
      return col;
    });
    saveColumns(newColumns);
  };

  const handleUnscheduleInternal = (cardId: string) => {
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              return {
                ...card,
                schedulingStatus: 'to-schedule' as const,
                scheduledDate: undefined,
              };
            }
            return card;
          }),
        };
      }
      return col;
    });
    saveColumns(newColumns);
    // Emit events for sync with content calendar
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);
  };

  // Handler for removing planned content from calendar (clears plannedDate)
  const handleRemovePlannedContent = (cardId: string) => {
    const newColumns = columns.map(col => {
      if (col.id === 'ideate') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              return {
                ...card,
                plannedDate: undefined,
                plannedStartTime: undefined,
                plannedEndTime: undefined,
                plannedColor: undefined,
              };
            }
            return card;
          }),
        };
      }
      return col;
    });
    saveColumns(newColumns);
    // Emit events for sync with content calendar
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);
  };

  // Handler for marking content as posted and archiving it
  // State for delete confirmation dialog
  const [deleteConfirmCard, setDeleteConfirmCard] = useState<{ id: string; element: HTMLElement | null } | null>(null);

  // Archive button handler - creates a copy in archive but KEEPS original in calendar
  const handleArchiveContent = (cardId: string, e: React.MouseEvent) => {
    // Find the card in to-schedule column
    const toScheduleCol = columns.find(col => col.id === 'to-schedule');
    const card = toScheduleCol?.cards.find(c => c.id === cardId);

    if (!card) return;

    // Get the card element for ghost animation
    const button = e.currentTarget as HTMLElement;
    const cardElement = button.closest('[data-card-id]') as HTMLElement;

    if (cardElement) {
      // Create ghost element
      const rect = cardElement.getBoundingClientRect();
      const ghost = cardElement.cloneNode(true) as HTMLElement;

      // Style the ghost with ethereal appearance
      ghost.style.position = 'fixed';
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '1';
      ghost.style.filter = 'brightness(1.1)';
      ghost.style.boxShadow = '0 0 15px rgba(139, 112, 130, 0.6)';
      ghost.style.borderRadius = '8px';
      ghost.style.transition = 'transform 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.5s ease-out, filter 0.5s ease-out';

      document.body.appendChild(ghost);

      // Trigger whoop to the right animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ghost.style.transform = 'translateX(calc(100vw - ' + rect.left + 'px + 100px)) translateY(-30px) rotate(15deg) scale(0.7)';
          ghost.style.opacity = '0';
          ghost.style.filter = 'brightness(1.3) blur(4px)';
        });
      });

      // Remove ghost after animation
      setTimeout(() => {
        ghost.remove();
      }, 550);
    }

    // Create a copy for the archive with archivedAt timestamp
    const archivedCopy: ProductionCard = {
      ...card,
      id: `archived-${card.id}-${Date.now()}`,
      columnId: 'posted',
      schedulingStatus: undefined,
      archivedAt: new Date().toISOString(),
    } as ProductionCard & { archivedAt: string };

    // Emit event to add to archive in Production.tsx
    emit(window, EVENTS.contentArchived, { card: archivedCopy });

    // Emit events for sync with content calendar
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);

    // Show toast notification
    toast.success("Archived!", {
      description: "A copy has been saved to your archive",
      action: {
        label: "View Archive",
        onClick: () => emit(window, EVENTS.openArchiveDialog)
      }
    });
  };

  // Show delete confirmation dialog for past date cards
  const handleDeleteClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    const cardElement = button.closest('[data-card-id]') as HTMLElement;
    setDeleteConfirmCard({ id: cardId, element: cardElement });
  };

  // Archive & Remove - creates archive copy then removes from calendar
  const handleArchiveAndRemove = () => {
    if (!deleteConfirmCard) return;

    const toScheduleCol = columns.find(col => col.id === 'to-schedule');
    const card = toScheduleCol?.cards.find(c => c.id === deleteConfirmCard.id);

    if (!card) {
      setDeleteConfirmCard(null);
      return;
    }

    // Animate the card whooshing away
    if (deleteConfirmCard.element) {
      const rect = deleteConfirmCard.element.getBoundingClientRect();
      const ghost = deleteConfirmCard.element.cloneNode(true) as HTMLElement;

      ghost.style.position = 'fixed';
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '1';
      ghost.style.filter = 'brightness(1.1)';
      ghost.style.boxShadow = '0 0 15px rgba(139, 112, 130, 0.6)';
      ghost.style.borderRadius = '8px';
      ghost.style.transition = 'transform 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.5s ease-out, filter 0.5s ease-out';

      document.body.appendChild(ghost);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ghost.style.transform = 'translateX(calc(100vw - ' + rect.left + 'px + 100px)) translateY(-30px) rotate(15deg) scale(0.7)';
          ghost.style.opacity = '0';
          ghost.style.filter = 'brightness(1.3) blur(4px)';
        });
      });

      setTimeout(() => ghost.remove(), 550);
    }

    // Create archive copy
    const archivedCopy: ProductionCard = {
      ...card,
      id: `archived-${card.id}-${Date.now()}`,
      columnId: 'posted',
      schedulingStatus: undefined,
      archivedAt: new Date().toISOString(),
    } as ProductionCard & { archivedAt: string };

    // Remove from calendar
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== deleteConfirmCard.id),
        };
      }
      return col;
    });

    saveColumns(newColumns);

    // Emit event to add to archive in Production.tsx
    emit(window, EVENTS.contentArchived, { card: archivedCopy });
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);

    toast.success("Archived & Removed", {
      description: "Content saved to archive and removed from calendar",
      action: {
        label: "View Archive",
        onClick: () => emit(window, EVENTS.openArchiveDialog)
      }
    });

    setDeleteConfirmCard(null);
  };

  // Delete Permanently - removes without archiving
  const handleDeletePermanently = () => {
    if (!deleteConfirmCard) return;

    // Animate with a red/destructive feel - shrink and fade
    if (deleteConfirmCard.element) {
      const rect = deleteConfirmCard.element.getBoundingClientRect();
      const ghost = deleteConfirmCard.element.cloneNode(true) as HTMLElement;

      ghost.style.position = 'fixed';
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '1';
      ghost.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
      ghost.style.borderRadius = '8px';
      ghost.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease-in, filter 0.4s ease-in';

      document.body.appendChild(ghost);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ghost.style.transform = 'scale(0) rotate(10deg)';
          ghost.style.opacity = '0';
          ghost.style.filter = 'grayscale(1) blur(4px)';
        });
      });

      setTimeout(() => ghost.remove(), 450);
    }

    // Remove from calendar without archiving
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== deleteConfirmCard.id),
        };
      }
      return col;
    });

    saveColumns(newColumns);
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);

    toast.success("Deleted", {
      description: "Content has been permanently removed"
    });

    setDeleteConfirmCard(null);
  };

  const handleUpdateColorInternal = (cardId: string, color: ScheduleColorKey) => {
    console.log("🎨 handleUpdateColorInternal called:", cardId, color);

    // Update columns state directly - this is the single source of truth
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              console.log("🎨 Updating card color:", cardId, "->", color);
              return {
                ...card,
                scheduledColor: color,
              };
            }
            return card;
          }),
        };
      }
      return col;
    });

    // Use flushSync to force synchronous state updates
    // This ensures the DOM updates immediately, even inside a Popover
    flushSync(() => {
      saveColumns(newColumns);
      setColorUpdateVersion(v => v + 1);
    });
    console.log("🎨 Color updated and saved, forced sync re-render");
  };

  // Function to update a scheduled card's hook and notes
  const handleUpdateScheduledCard = (cardId: string, newHook: string, newNotes: string) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const toScheduleIndex = currentColumns.findIndex(col => col.id === 'to-schedule');
      if (toScheduleIndex < 0) return;

      currentColumns[toScheduleIndex] = {
        ...currentColumns[toScheduleIndex],
        cards: currentColumns[toScheduleIndex].cards.map(card =>
          card.id === cardId
            ? { ...card, hook: newHook, title: newHook, description: newNotes }
            : card
        )
      };

      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));
      setColumns(currentColumns);
    } catch (e) {
      console.error("Error updating scheduled card:", e);
    }
  };

  // Function to send a scheduled card to Script Ideas column for development
  const handleSendScheduledToScriptIdeas = (card: ProductionCard) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      // Column ID is 'shape-ideas' but displays as "Script Ideas"
      const scriptIdeasIndex = currentColumns.findIndex(col => col.id === 'shape-ideas');
      if (scriptIdeasIndex < 0) return;

      // Create new card for Script Ideas column with calendar origin tracking
      const newCard: ProductionCard = {
        id: `idea-${Date.now()}`,
        title: editingScheduledHook || card.hook || card.title,
        hook: editingScheduledHook || card.hook || card.title,
        description: editingScheduledNotes || card.description,
        columnId: 'shape-ideas',
        isNew: true,
        fromCalendar: true,
        plannedDate: card.scheduledDate,
      };

      currentColumns[scriptIdeasIndex] = {
        ...currentColumns[scriptIdeasIndex],
        cards: [newCard, ...currentColumns[scriptIdeasIndex].cards]
      };

      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));
      setColumns(currentColumns);
      setPopoverCardId(null);

      // Navigate to Content Hub
      navigate('/production');
    } catch (e) {
      console.error("Error sending to Script Ideas:", e);
    }
  };

  // Use internal or prop handlers based on mode
  const onSchedule = embedded ? handleScheduleInternal : propOnSchedule;
  const onUnschedule = embedded ? handleUnscheduleInternal : propOnUnschedule;
  const onUpdateColor = embedded ? handleUpdateColorInternal : propOnUpdateColor;

  // Function to save idea directly to calendar (scheduled on the selected date)
  const handleSaveToCalendar = () => {
    if (!newIdeaHook.trim() || !addIdeaPopoverDate) return;

    // Load current columns from localStorage
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);

      // Find the to-schedule column
      const toScheduleIndex = currentColumns.findIndex(col => col.id === 'to-schedule');
      if (toScheduleIndex < 0) return;

      // Create new card - scheduled on the selected date
      const newCard: ProductionCard = {
        id: `calendar-idea-${Date.now()}`,
        title: newIdeaHook,
        hook: newIdeaHook,
        description: newIdeaNotes,
        columnId: 'to-schedule',
        schedulingStatus: 'scheduled',
        scheduledDate: addIdeaPopoverDate,
        scheduledColor: newIdeaColor as ProductionCard['scheduledColor'],
        fromCalendar: true,
        plannedDate: addIdeaPopoverDate,
      };

      // Add to to-schedule column
      currentColumns[toScheduleIndex] = {
        ...currentColumns[toScheduleIndex],
        cards: [newCard, ...currentColumns[toScheduleIndex].cards]
      };

      // Save back to localStorage
      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));

      // Also update local state
      setColumns(currentColumns);

      // Reset form and close popover
      setNewIdeaHook("");
      setNewIdeaNotes("");
      setNewIdeaColor("indigo");
      setAddIdeaPopoverDate(null);
    } catch (e) {
      console.error("Error saving idea to calendar:", e);
    }
  };

  // Function to send new idea to Script Ideas column in Content Hub (for development)
  const handleSendToScriptIdeas = () => {
    if (!newIdeaHook.trim() || !addIdeaPopoverDate) return;

    // Load current columns from localStorage
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);

      // Find the script-ideas column (ID is 'shape-ideas' but displays as "Script Ideas")
      const scriptIdeasIndex = currentColumns.findIndex(col => col.id === 'shape-ideas');
      if (scriptIdeasIndex < 0) return;

      // Create new card with calendar origin tracking
      const newCard: ProductionCard = {
        id: `idea-${Date.now()}`,
        title: newIdeaHook,
        hook: newIdeaHook,
        description: newIdeaNotes,
        columnId: 'shape-ideas',
        isNew: true,
        fromCalendar: true,
        plannedDate: addIdeaPopoverDate,
      };

      // Add to script-ideas column
      currentColumns[scriptIdeasIndex] = {
        ...currentColumns[scriptIdeasIndex],
        cards: [newCard, ...currentColumns[scriptIdeasIndex].cards]
      };

      // Save back to localStorage
      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));

      // Also update local state if needed
      setColumns(currentColumns);

      // Reset form and close popover
      setNewIdeaHook("");
      setNewIdeaNotes("");
      setNewIdeaColor("indigo");
      setAddIdeaPopoverDate(null);

      // Navigate to Content Hub
      navigate('/production');
    } catch (e) {
      console.error("Error saving idea:", e);
    }
  };

  // Use toScheduleCards instead of cards
  const cards = toScheduleCards;
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter unscheduled cards
  const unscheduledCards = cards.filter(c => c.schedulingStatus !== 'scheduled');

  // Create a map of scheduled cards by date
  const scheduledCardsByDate = useMemo(() => {
    const map: Record<string, ProductionCard[]> = {};
    cards.forEach(c => {
      if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
        const dateKey = c.scheduledDate.split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(c);
      }
    });
    // Also include the singleCard if it was just scheduled (might not be in cards array)
    if (singleCardScheduled && singleCard && scheduledDate) {
      const dateKey = scheduledDate.toISOString().split('T')[0];
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      // Only add if not already in the map
      if (!map[dateKey].find(c => c.id === singleCard.id)) {
        map[dateKey].push({
          ...singleCard,
          schedulingStatus: 'scheduled',
          scheduledDate: dateKey,
        });
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, colorUpdateVersion, singleCardScheduled, singleCard, scheduledDate]);

  // Create a map of planned (tentative) cards from Ideate by date
  const plannedCardsByDate = useMemo(() => {
    const map: Record<string, ProductionCard[]> = {};
    plannedIdeateCards.forEach(c => {
      if (c.plannedDate) {
        const dateKey = c.plannedDate.split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(c);
      }
    });
    return map;
  }, [plannedIdeateCards]);

  // Calendar calculations
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Stats for the current month (embedded mode)
  const monthlyStats = useMemo(() => {
    if (!embedded) return { scheduled: 0, posted: 0, planned: 0 };

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    let scheduled = 0;
    let posted = 0;
    let planned = 0;

    // Count scheduled content
    cards.forEach(c => {
      if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
        const schedDate = new Date(c.scheduledDate);
        if (schedDate >= startOfMonth && schedDate <= endOfMonth) {
          if (schedDate < today) {
            posted++;
          } else {
            scheduled++;
          }
        }
      }
    });

    // Count planned content
    plannedIdeateCards.forEach(c => {
      if (c.plannedDate) {
        const planDate = new Date(c.plannedDate);
        if (planDate >= startOfMonth && planDate <= endOfMonth) {
          planned++;
        }
      }
    });

    return { scheduled, posted, planned };
  }, [embedded, currentMonth, currentYear, cards, plannedIdeateCards, today]);

  // Upcoming content for the next 7 days (embedded mode)
  const upcomingContent = useMemo(() => {
    if (!embedded) return [];

    const next7Days: { date: Date; scheduled: ProductionCard[]; planned: ProductionCard[] }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const scheduledForDay = scheduledCardsByDate[dateStr] || [];
      const plannedForDay = plannedCardsByDate[dateStr] || [];

      if (scheduledForDay.length > 0 || plannedForDay.length > 0) {
        next7Days.push({ date, scheduled: scheduledForDay, planned: plannedForDay });
      }
    }

    return next7Days;
  }, [embedded, today, scheduledCardsByDate, plannedCardsByDate]);

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    // Adjust so Monday = 0, Sunday = 6
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month days - only fill to complete the last week that contains current month days
    const totalDaysNeeded = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalDaysNeeded - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';

    // Create a compact drag image for single card mode
    if (singleCard && cardId === singleCard.id) {
      const dragPreview = document.createElement('div');
      dragPreview.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        padding: 8px 12px;
        background: white;
        border: 2px solid #8B7082;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 12px;
        font-weight: 600;
        color: #333;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      dragPreview.textContent = singleCard.hook || singleCard.title || "Content";
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 75, 20);

      // Clean up after drag starts
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDraggedPlannedCardId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Show drag feedback for both scheduled and planned cards
    if (draggedCardId || draggedPlannedCardId) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    // Handle dropping a scheduled card - show time picker
    if (draggedCardId && onSchedule) {
      setPendingScheduleDate(date);
      setPendingScheduleCardId(draggedCardId);
      setStartTime("9:00");
      setEndTime("10:00");
      setTimePeriod("AM");
      setTimePickerOpen(true);
    }
    // Handle dropping a planned card (update its planned date)
    if (draggedPlannedCardId) {
      handleUpdatePlannedCardDate(draggedPlannedCardId, date);
    }
    setDraggedCardId(null);
    setDraggedPlannedCardId(null);
    setDragOverDate(null);
  };

  // Handle confirming the schedule with time
  const handleConfirmSchedule = () => {
    if (pendingScheduleCardId && pendingScheduleDate && onSchedule) {
      const dateWithTime = new Date(pendingScheduleDate);
      const timeParts = startTime.match(/(\d{1,2}):(\d{2})/);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);

        if (timePeriod === 'PM' && hours !== 12) hours += 12;
        if (timePeriod === 'AM' && hours === 12) hours = 0;

        dateWithTime.setHours(hours, minutes, 0, 0);
      }
      onSchedule(pendingScheduleCardId, dateWithTime);

      // If this was the single card, show congratulation state
      if (singleCard && pendingScheduleCardId === singleCard.id) {
        setSingleCardScheduled(true);
        setScheduledDate(dateWithTime);
      }
    }
    setTimePickerOpen(false);
    setPendingScheduleDate(null);
    setPendingScheduleCardId(null);
  };

  // Update end time when start time changes (keep 1 hour duration)
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    // Auto-update end time to be 1 hour later
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      hours = hours + 1;
      if (hours > 12) hours = hours - 12;
      if (hours === 0) hours = 12;
      setEndTime(`${hours}:${minutes}`);
    }
  };

  // Handler for updating a planned card's date via drag and drop
  const handleUpdatePlannedCardDate = (cardId: string, newDate: Date) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const updatedColumns = currentColumns.map(col => ({
        ...col,
        cards: col.cards.map(card =>
          card.id === cardId
            ? { ...card, plannedDate: newDate.toISOString() }
            : card
        )
      }));

      setString(StorageKeys.productionKanban, JSON.stringify(updatedColumns));
      emit(window, EVENTS.productionKanbanUpdated, { source: 'calendar' });

      // Reload columns to reflect the change
      if (embedded || planningMode) {
        loadColumnsFromStorage();
      }
    } catch (e) {
      console.error("Error updating planned card date:", e);
    }
  };

  // Render content details for popover
  const renderContentDetails = (cardToShow: ProductionCard) => {
    const allFormats = [
      ...(cardToShow.formats || []),
      ...(cardToShow.customVideoFormats || []),
      ...(cardToShow.customPhotoFormats || [])
    ];
    const hasFormats = allFormats.length > 0;
    const hasPlatforms = cardToShow.platforms && cardToShow.platforms.length > 0;

    return (
      <div className="space-y-4">
        {(cardToShow.title || cardToShow.hook) && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Hook
            </h3>
            <p className="text-[15px] font-medium text-gray-900">
              {cardToShow.hook || cardToShow.title}
            </p>
          </div>
        )}

        {cardToShow.script && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Script
            </h3>
            <div className="text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
              {cardToShow.script}
            </div>
          </div>
        )}

        {hasFormats && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              How It's Shot
            </h3>
            <div className="space-y-1">
              {allFormats.map((format, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[14px] text-gray-700">
                  {isStaticFormat(format) ? (
                    <Camera className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Video className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{format}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasPlatforms && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Platform
            </h3>
            <div className="flex items-center gap-2.5">
              {cardToShow.platforms!.map((platform, idx) => (
                <span key={idx} className="text-gray-700" title={platform}>
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Content component - shared between modal and embedded modes
  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Collapsed single card mode - card on left, stepper in middle, button on right */}
      {!embedded && !planningMode && singleCard && isLeftPanelCollapsed && !singleCardScheduled && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          {/* Compact card preview */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, singleCard.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "px-4 py-2 rounded-xl bg-white border border-[#8B7082]/20 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md flex items-center gap-3 flex-shrink-0",
              draggedCardId === singleCard.id && "opacity-40"
            )}
          >
            <CalendarDays className="w-5 h-5 text-[#8B7082] flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">
              {singleCard.hook || singleCard.title || "Untitled content"}
            </span>
            <span className="text-xs text-[#8B7082] flex-shrink-0">Drag to schedule →</span>
          </div>
          {/* Stepper in middle */}
          <div className="flex-1 flex justify-center">
            <ContentFlowProgress
              currentStep={5}
              onStepClick={onNavigateToStep ? (step) => {
                if (step < 5) {
                  onNavigateToStep(step);
                }
              } : undefined}
              className="w-[400px]"
            />
          </div>
          {/* Stop button on right */}
          {onClose && (
            <button
              onClick={() => {
                // Move card to schedule column if not yet scheduled
                if (singleCard && !singleCardScheduled && onMoveToScheduleColumn) {
                  onMoveToScheduleColumn(singleCard);
                }
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium bg-[#612A4F] hover:bg-[#4E2240] text-white rounded-lg shadow-[0_2px_8px_rgba(97,42,79,0.3)] transition-colors flex-shrink-0"
            >
              Stop Here, Finish Later
            </button>
          )}
        </div>
      )}
      {/* Collapsed single card mode AFTER scheduling - compact confirmation in top bar */}
      {!embedded && !planningMode && singleCard && isLeftPanelCollapsed && singleCardScheduled && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          {/* Compact confirmation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 flex-shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">You're all set!</span>
              <span className="text-xs text-gray-600">
                Scheduled for {scheduledDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </motion.div>
          {/* Stepper in middle */}
          <div className="flex-1 flex justify-center">
            <ContentFlowProgress
              currentStep={5}
              onStepClick={onNavigateToStep ? (step) => {
                if (step < 5) {
                  onNavigateToStep(step);
                }
              } : undefined}
              className="w-[400px]"
            />
          </div>
          {/* Done button on right */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-[#8B7082] to-[#612A4F] hover:from-[#7A6073] hover:to-[#4E2240] text-white rounded-lg shadow-[0_2px_8px_rgba(97,42,79,0.3)] transition-all flex-shrink-0"
            >
              Done
            </button>
          )}
        </div>
      )}
      {/* Main content - split panels with step progress integrated */}
      <div className={cn(
        "flex-1 overflow-y-auto grid transition-all duration-300 min-h-0",
        isLeftPanelCollapsed && singleCard ? "grid-cols-[1fr]" : isLeftPanelCollapsed ? "grid-cols-[48px_1fr]" : "grid-cols-[320px_1fr]"
      )} style={{ gridTemplateRows: '1fr' }}>
        {/* Step Progress Indicator - centered across full width (hide when collapsed in single card mode - both scheduled and unscheduled) */}
        {!embedded && !planningMode && !(singleCard && isLeftPanelCollapsed) && (
          <div className="col-span-2 flex-shrink-0 pt-3 pb-2">
            <ContentFlowProgress
              currentStep={5}
              onStepClick={onNavigateToStep ? (step) => {
                // Only allow navigation to previous steps (before Schedule)
                if (step < 5) {
                  onNavigateToStep(step);
                }
              } : undefined}
            />
          </div>
        )}
        {/* Left Panel - Content to Schedule / Your Week (hidden when collapsed in single card mode) */}
        {!(singleCard && isLeftPanelCollapsed) && (
        <div
          className={cn(
            "border-r flex flex-col min-h-0 transition-all duration-300 relative",
            embedded ? "border-violet-100 bg-violet-50/40" : "border-transparent",
            !embedded && dragOverUnschedule && singleCardScheduled && "bg-gradient-to-br from-amber-50 to-amber-100",
            !embedded && dragOverUnschedule && !singleCardScheduled && "bg-indigo-200 ring-2 ring-inset ring-indigo-400"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverUnschedule(true);
          }}
          onDragLeave={() => setDragOverUnschedule(false)}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedCardId && onUnschedule) {
              onUnschedule(draggedCardId);
              // If this was the single card, reset the scheduled state
              if (singleCard && draggedCardId === singleCard.id) {
                setSingleCardScheduled(false);
                setScheduledDate(null);
              }
            }
            setDraggedCardId(null);
            setDragOverUnschedule(false);
          }}
        >
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className={cn(
              "w-6 h-6 text-gray-500 transition-transform duration-300",
              isLeftPanelCollapsed && "rotate-180"
            )} strokeWidth={2.5} />
          </button>

          {/* Header - only show in embedded mode since modal mode has it in the step progress row */}
          {embedded && (
            <div className={cn(
              "flex items-center gap-3 px-6 py-4 border-b flex-shrink-0 transition-all duration-300",
              "border-violet-100",
              isLeftPanelCollapsed && "px-2 justify-center"
            )}>
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              {!isLeftPanelCollapsed && (
                <h2 className="text-lg font-bold text-gray-900">Your Week</h2>
              )}
            </div>
          )}

          {/* Body - scrollable */}
          <div className={cn(
            "flex-1 min-h-0 overflow-y-auto transition-all duration-300",
            isLeftPanelCollapsed ? "p-0 opacity-0 overflow-hidden" : "px-4 -mt-2 pb-4 opacity-100"
          )}>
            {/* Embedded mode: Show hybrid panel with stats and upcoming */}
            {embedded ? (
              <div className="space-y-5">
                {/* Monthly Stats */}
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {monthNames[currentMonth]} Overview
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{monthlyStats.posted}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Posted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{monthlyStats.scheduled}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Scheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">{monthlyStats.planned}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Planned</div>
                    </div>
                  </div>
                </div>

                {/* This Week Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Coming Up</h3>
                  </div>

                  {upcomingContent.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                      <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No content scheduled this week</p>
                      <p className="text-xs text-gray-400 mt-1">Time to plan ahead!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {upcomingContent.map(({ date, scheduled, planned }) => {
                        const isToday = date.toDateString() === today.toDateString();
                        const isPastDate = date < today;
                        const dayLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                        return (
                          <div key={date.toISOString()} className="bg-white rounded-lg border border-gray-100 p-3 hover:border-violet-200 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className={cn(
                                "text-xs font-medium",
                                isToday ? "text-violet-600" : isPastDate ? "text-gray-400" : "text-gray-600"
                              )}>
                                {dayLabel}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {scheduled.length + planned.length} item{scheduled.length + planned.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {scheduled.map(card => (
                                <div
                                  key={card.id}
                                  data-card-id={card.id}
                                  className={cn(
                                    "text-xs px-2 py-1.5 rounded-md truncate group/sidecard",
                                    isPastDate && "opacity-70"
                                  )}
                                  style={{
                                    backgroundColor: isPastDate ? '#e5e7eb' : defaultScheduledColor.bg,
                                    color: isPastDate ? '#6b7280' : defaultScheduledColor.text
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {!isPastDate && (
                                      <Check className="w-3 h-3 flex-shrink-0" />
                                    )}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="truncate flex-1 cursor-default">{card.hook || card.title}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" variant="light">{card.hook || card.title}</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    {/* Posted button - only for past dates */}
                                    {isPastDate && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleArchiveContent(card.id, e);
                                              }}
                                              className="opacity-0 group-hover/sidecard:opacity-100 hover:bg-gray-300/50 rounded p-0.5 transition-opacity flex-shrink-0"
                                            >
                                              <Archive className="w-3 h-3" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">Save a copy to archive</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (isPastDate) {
                                                handleDeleteClick(card.id, e);
                                              } else if (onUnschedule) {
                                                onUnschedule(card.id);
                                              }
                                            }}
                                            className="opacity-0 group-hover/sidecard:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity flex-shrink-0"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">{isPastDate ? "Remove from calendar" : "Unschedule content"}</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                              {planned.map(card => (
                                <div
                                  key={card.id}
                                  className="text-xs px-2 py-1.5 rounded-md truncate bg-[#F5F2F4] border border-dashed border-[#D4C9CF] text-[#8B7082] group/sideplan"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Lightbulb className="w-3 h-3 flex-shrink-0 text-[#8B7082]" />
                                    <span className="truncate flex-1">{card.hook || card.title}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemovePlannedContent(card.id);
                                            }}
                                            className="opacity-0 group-hover/sideplan:opacity-100 hover:bg-[#8B7082]/10 rounded p-0.5 transition-opacity flex-shrink-0"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Remove from calendar</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CTA to Content Hub */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/production')}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl p-4 text-left transition-all hover:shadow-lg hover:shadow-indigo-200/50"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Ready to create?</h4>
                          <p className="text-xs text-indigo-100 mt-0.5">Head to Content Hub to develop your ideas</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            ) : singleCard ? (
              // Single card mode - show impressive single card view or congratulation
              singleCardScheduled ? (
                // Congratulation state after scheduling - parent handles drop zone
                <div className="flex flex-col items-center justify-center h-full pb-8 px-4">
                  {dragOverUnschedule ? (
                    // Show drop indicator when dragging over
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center mb-4 mx-auto shadow-lg border-2 border-dashed border-amber-400"
                      >
                        <CalendarDays className="w-10 h-10 text-amber-700" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-amber-700">Drop to unschedule</h3>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4 shadow-lg"
                      >
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-gray-900 mb-2"
                      >
                        You're all set!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-[#8B7082] text-center"
                      >
                        Scheduled for{" "}
                        <span className="font-semibold">
                          {scheduledDate?.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </motion.p>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={onClose}
                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#612A4F] to-[#8B7082] text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow"
                      >
                        Done
                      </motion.button>
                    </>
                  )}
                </div>
              ) : (
                // Card to schedule
                <div className="space-y-4 pt-4">
                  {/* Header question */}
                  <div className="text-center px-2">
                    <p className="text-sm text-[#8B7082] font-medium mb-1">Almost there!</p>
                    <h3 className="text-lg font-bold text-gray-900">When do you want to post this?</h3>
                  </div>

                  {/* Single card preview */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, singleCard.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "p-5 rounded-2xl bg-white border-2 border-[#8B7082]/30 shadow-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:border-[#8B7082]/50",
                      draggedCardId === singleCard.id && "opacity-40 scale-[0.98]"
                    )}
                  >
                    {/* Hook/Title */}
                    <h4 className="text-base font-bold text-gray-900 mb-3">
                      {singleCard.hook || singleCard.title || "Untitled content"}
                    </h4>

                    {/* Script preview */}
                    {singleCard.script && (
                      <div className="mb-3">
                        <p className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-1">Script</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{singleCard.script}</p>
                      </div>
                    )}

                    {/* Formats & Platforms */}
                    <div className="flex items-center justify-between">
                      {singleCard.formats && singleCard.formats.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {isStaticFormat(singleCard.formats[0]) ? (
                            <Camera className="w-4 h-4 text-[#8B7082]" />
                          ) : (
                            <Video className="w-4 h-4 text-[#8B7082]" />
                          )}
                          <span className="text-xs text-gray-600">{singleCard.formats[0]}</span>
                        </div>
                      )}
                      {singleCard.platforms && singleCard.platforms.length > 0 && (
                        <div className="flex items-center gap-2">
                          {singleCard.platforms.map((platform, idx) => (
                            <span key={idx} className="text-[#8B7082]">
                              {getPlatformIcon(platform, "w-4 h-4")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drag hint */}
                  <div className="flex items-center justify-center gap-2 text-sm text-[#8B7082]">
                    <CalendarDays className="w-4 h-4" />
                    <span className="italic">Drag to a date on the calendar</span>
                  </div>
                </div>
              )
            ) : (
            <div className="space-y-2">
              {unscheduledCards.length === 0 && !dragOverUnschedule ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No content to schedule</p>
                  <p className="text-xs mt-1 leading-relaxed px-2">
                    Drag cards into the "To Schedule" column<br />to add content here
                  </p>
                </div>
              ) : unscheduledCards.length === 0 && dragOverUnschedule ? (
                <div className="text-center py-8 text-indigo-500">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm font-medium">Drop here to unschedule</p>
                </div>
              ) : (
                unscheduledCards.map((c) => {
                  const formats = c.formats || [];
                  const platforms = c.platforms || [];
                  const hasPlatforms = platforms.length > 0;

                  const renderPlatformIcons = () => (
                    <div className="flex gap-1.5 items-center">
                      {platforms.map((platform, idx) => {
                        const icon = getPlatformIcon(platform, "w-3 h-3 text-gray-400");
                        return icon ? (
                          <span key={`platform-${idx}`} title={platform}>
                            {icon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  );

                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedCard(selectedCard?.id === c.id ? null : c)}
                      className={cn(
                        "p-2 rounded-xl border cursor-pointer transition-all shadow-[2px_3px_0px_rgba(0,0,0,0.06)]",
                        "hover:border-indigo-300 hover:shadow-md",
                        draggedCardId === c.id && "opacity-40 scale-[0.98]",
                        selectedCard?.id === c.id
                          ? "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300"
                          : "border-gray-200 bg-white/90"
                      )}
                    >
                      {/* Title row with pin */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-800 break-words leading-tight flex-1">
                          {c.hook || c.title || "Untitled content"}
                        </h3>
                        {c.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 flex-shrink-0 fill-amber-500" />
                        )}
                      </div>

                      {/* Format Tags */}
                      {(formats.length > 0 || hasPlatforms) && (
                        <div className="flex flex-col gap-1 mt-2">
                          {formats.map((format, idx) => {
                            const isStatic = isStaticFormat(format);
                            const isLastRow = idx === formats.length - 1;

                            if (isLastRow && hasPlatforms) {
                              return (
                                <div key={`format-${idx}`} className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                    {isStatic ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                                    {format}
                                  </span>
                                  {renderPlatformIcons()}
                                </div>
                              );
                            }

                            return (
                              <span key={`format-${idx}`} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                {isStatic ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                                {format}
                              </span>
                            );
                          })}

                          {formats.length === 0 && hasPlatforms && (
                            <div className="flex items-center justify-end">
                              {renderPlatformIcons()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Drag hint */}
              {unscheduledCards.length > 0 && !selectedCard && (
                <p className="text-center text-xs text-gray-400 mt-4 italic">
                  Drag to calendar to schedule
                </p>
              )}

              {/* Selected Card Details */}
              {selectedCard && (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  {/* Hook */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                      Hook
                    </h4>
                    <p className="text-base font-medium text-gray-900">
                      {selectedCard.hook || selectedCard.title || "No hook"}
                    </p>
                  </div>

                  {/* Script */}
                  {selectedCard.script && (
                    <div className="mb-4">
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        Script
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedCard.script}
                      </p>
                    </div>
                  )}

                  {/* How It's Shot */}
                  {selectedCard.formats && selectedCard.formats.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        How It's Shot
                      </h4>
                      <div className="space-y-1">
                        {selectedCard.formats.map((format, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            {isStaticFormat(format) ? (
                              <Camera className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{format}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform */}
                  {selectedCard.platforms && selectedCard.platforms.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        Platform
                      </h4>
                      <div className="flex items-center gap-2.5">
                        {selectedCard.platforms.map((platform, idx) => (
                          <span key={idx} className="text-gray-700" title={platform}>
                            {getPlatformIcon(platform, "w-5 h-5")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
        )}

        {/* Right Panel - Calendar */}
        <div className={cn(
          "flex flex-col h-full overflow-y-auto relative",
          singleCard && isLeftPanelCollapsed && "pl-9"
        )}>
          {/* Expand button - show on left edge when collapsed in single card mode */}
          {singleCard && isLeftPanelCollapsed && (
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-500" strokeWidth={2.5} />
            </button>
          )}
          {/* Calendar Header - only show in modal mode */}
          {!embedded && (
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#8B7082]" />
                  <span className="text-sm font-bold text-gray-900">Content Calendar</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              {onClose && !(singleCard && isLeftPanelCollapsed) && !singleCardScheduled && (
                <button
                  onClick={() => {
                    // Move card to schedule column if not yet scheduled
                    if (singleCard && onMoveToScheduleColumn) {
                      onMoveToScheduleColumn(singleCard);
                    }
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium bg-[#612A4F] hover:bg-[#4E2240] text-white rounded-lg shadow-[0_2px_8px_rgba(97,42,79,0.3)] transition-colors"
                >
                  Stop Here, Finish Later
                </button>
              )}
            </div>
          )}

          {/* External header component when embedded */}
          {embedded && headerComponent && (
            <div className="flex-shrink-0 px-6 bg-white">
              {headerComponent}
            </div>
          )}

          {/* Calendar Grid */}
          <CardContent className="pl-6 pr-4 flex flex-col">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days grid */}
            <div className="pb-4">
              <div className="grid grid-cols-7 gap-1.5" style={{ gridAutoRows: 'minmax(120px, 1fr)' }}>
              {calendarDays.map((day, idx) => {
                const dateStr = day.date.toISOString().split('T')[0];
                const isDragOver = dragOverDate === dateStr;
                const scheduledForDay = scheduledCardsByDate[dateStr] || [];
                const plannedForDay = plannedCardsByDate[dateStr] || [];
                const hasContent = scheduledForDay.length > 0 || plannedForDay.length > 0;

                return (
                  <Popover
                    key={idx}
                    open={embedded && addIdeaPopoverDate === dateStr}
                    onOpenChange={(open) => {
                      if (embedded) {
                        setAddIdeaPopoverDate(open ? dateStr : null);
                        if (!open) {
                          setNewIdeaHook("");
                          setNewIdeaNotes("");
                          setNewIdeaColor("indigo");
                        }
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        onDragOver={(e) => handleDragOver(e, dateStr)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day.date)}
                        onClick={(e) => {
                          // In planning mode, clicking a date sets the planned date
                          if (planningMode && planningCard && onPlanDate && day.isCurrentMonth) {
                            e.stopPropagation();
                            onPlanDate(planningCard.id, day.date);
                            return;
                          }
                          // Only open add idea popover in embedded mode when clicking empty area
                          if (embedded && e.target === e.currentTarget) {
                            setAddIdeaPopoverDate(dateStr);
                          }
                        }}
                        className={cn(
                          "group",
                          isLeftPanelCollapsed ? "rounded-lg border min-h-[120px] relative p-2" : "rounded-lg border min-h-[120px] relative p-1.5",
                          day.isCurrentMonth && !day.isToday && day.date < today
                            ? "bg-gray-50 border-gray-100 text-gray-400"
                            : day.isCurrentMonth
                              ? "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                              : "bg-gray-50 border-gray-100 text-gray-400",
                          isDragOver && "bg-indigo-100 border-indigo-400 border-2 scale-105",
                          (embedded || planningMode) && "cursor-pointer",
                          planningMode && day.isCurrentMonth && "hover:bg-violet-50 hover:border-violet-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1.5 left-2 text-sm font-medium",
                          day.isToday && "text-indigo-600 font-bold"
                        )}>
                          {day.date.getDate()}
                        </span>

                        {/* Add button for embedded mode */}
                        {embedded && day.isCurrentMonth && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddIdeaPopoverDate(dateStr);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
                            style={{ opacity: addIdeaPopoverDate === dateStr ? 1 : undefined }}
                          >
                            <Plus className="w-3 h-3 text-indigo-600" />
                          </button>
                        )}

                        {/* Content indicators - scrollable (both scheduled and planned) */}
                        {hasContent && (
                      <div className="absolute top-7 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto">
                        {/* Scheduled content (from To Schedule column) */}
                        {scheduledForDay.map((scheduledCard) => {
                          const isPublished = day.date < today;
                          return (
                          <Popover
                            key={scheduledCard.id}
                            open={popoverCardId === scheduledCard.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setEditingScheduledHook(scheduledCard.hook || scheduledCard.title || "");
                                setEditingScheduledNotes(scheduledCard.description || "");
                                setEditingScheduledColor(scheduledCard.scheduledColor || "indigo");
                              }
                              setPopoverCardId(open ? scheduledCard.id : null);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <div
                                data-card-id={scheduledCard.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  setDraggedCardId(scheduledCard.id);
                                  setPopoverCardId(null);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragEnd={() => {
                                  setDraggedCardId(null);
                                  setDragOverDate(null);
                                  setDragOverUnschedule(false);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopoverCardId(popoverCardId === scheduledCard.id ? null : scheduledCard.id);
                                }}
                                className={cn(
                                  "text-[11px] px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing transition-colors group/schedcard",
                                  isPublished && "bg-gray-100 text-gray-500",
                                  draggedCardId === scheduledCard.id && "opacity-50"
                                )}
                                style={!isPublished ? {
                                  backgroundColor: defaultScheduledColor.bg,
                                  color: defaultScheduledColor.text
                                } : undefined}
                              >
                                {/* Title row */}
                                <div className="flex items-start gap-1.5">
                                  {!scheduledCard.fromCalendar && !isPublished && (
                                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="leading-tight truncate flex-1 cursor-default">{scheduledCard.hook || scheduledCard.title || "Scheduled"}</span>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" variant="light">{scheduledCard.hook || scheduledCard.title || "Scheduled"}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {/* Posted button - only for past dates */}
                                  {isPublished && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleArchiveContent(scheduledCard.id, e);
                                            }}
                                            className="opacity-0 group-hover/schedcard:opacity-100 hover:bg-white/30 rounded p-0.5 transition-opacity flex-shrink-0"
                                          >
                                            <Archive className="w-3 h-3" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Save a copy to archive</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isPublished) {
                                              handleDeleteClick(scheduledCard.id, e);
                                            } else if (onUnschedule) {
                                              onUnschedule(scheduledCard.id);
                                              // If this was the single card, reset the scheduled state
                                              if (singleCard && scheduledCard.id === singleCard.id) {
                                                setSingleCardScheduled(false);
                                                setScheduledDate(null);
                                              }
                                            }
                                          }}
                                          className="opacity-0 group-hover/schedcard:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity flex-shrink-0"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">{isPublished ? "Remove from calendar" : "Unschedule content"}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 p-0 shadow-xl border-0"
                              side="right"
                              align="start"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <div
                                className="bg-white rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                      {scheduledCard.fromCalendar ? (
                                        <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                                      ) : (
                                        <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-indigo-900">
                                        {scheduledCard.fromCalendar ? "Add Quick Idea" : "Content Overview"}
                                      </span>
                                      {scheduledCard.fromCalendar && (
                                        <span className="text-[10px] text-indigo-500">Develop in Content Hub later</span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPopoverCardId(null);
                                    }}
                                    className="p-1 hover:bg-indigo-100 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4 text-indigo-400" />
                                  </button>
                                </div>
                                <div className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                  {/* Cards from Calendar - Simple editable form */}
                                  {scheduledCard.fromCalendar ? (
                                    <div className="space-y-4">
                                      {/* Editable Hook */}
                                      <div>
                                        <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">
                                          Hook
                                        </label>
                                        <input
                                          type="text"
                                          value={editingScheduledHook}
                                          onChange={(e) => setEditingScheduledHook(e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                          placeholder="What's the hook?"
                                        />
                                      </div>

                                      {/* Editable Notes */}
                                      <div>
                                        <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">
                                          Notes
                                        </label>
                                        <textarea
                                          value={editingScheduledNotes}
                                          onChange={(e) => setEditingScheduledNotes(e.target.value)}
                                          placeholder="Any additional notes..."
                                          rows={3}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        />
                                      </div>

                                      {/* Color Picker - Modern Elevated Design */}
                                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <h4 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                          Choose a color
                                        </h4>
                                        <div className="grid grid-cols-5 gap-2.5">
                                          {(Object.keys(scheduleColors) as ScheduleColorKey[]).map((colorKey) => {
                                            const isSelected = editingScheduledColor === colorKey;
                                            return (
                                              <button
                                                type="button"
                                                key={colorKey}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  console.log("🎨 Color button clicked:", colorKey);
                                                  setEditingScheduledColor(colorKey);
                                                  onUpdateColor?.(scheduledCard.id, colorKey);
                                                }}
                                                className={cn(
                                                  "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm border-2",
                                                  isSelected
                                                    ? "scale-105 shadow-md border-white ring-2 ring-offset-1"
                                                    : "border-transparent hover:scale-110 hover:shadow-md"
                                                )}
                                                style={{
                                                  backgroundColor: scheduleColors[colorKey].bg,
                                                  ...(isSelected && { ringColor: scheduleColors[colorKey].text })
                                                }}
                                                title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                              >
                                                {isSelected && (
                                                  <Check
                                                    className="w-4 h-4"
                                                    style={{ color: scheduleColors[colorKey].text }}
                                                  />
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="pt-3 border-t border-gray-100 space-y-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateScheduledCard(scheduledCard.id, editingScheduledHook, editingScheduledNotes);
                                            setPopoverCardId(null);
                                          }}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                                        >
                                          <Check className="w-4 h-4" />
                                          Save
                                        </button>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendScheduledToScriptIdeas(scheduledCard);
                                          }}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                          Develop Idea in Content Hub
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Cards from Content Hub - Show full details */
                                    <div>
                                      {renderContentDetails(scheduledCard)}

                                      {/* Color Picker for Content Hub cards too */}
                                      <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                                          Label Color
                                        </h4>
                                        <div className="flex gap-2">
                                          {(Object.keys(scheduleColors) as ScheduleColorKey[]).map((colorKey) => (
                                            <button
                                              type="button"
                                              key={colorKey}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingScheduledColor(colorKey);
                                                onUpdateColor?.(scheduledCard.id, colorKey);
                                              }}
                                              className={cn(
                                                "w-6 h-6 rounded-full transition-all",
                                                scheduleColors[colorKey].dot,
                                                editingScheduledColor === colorKey
                                                  ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                                  : "hover:scale-110"
                                              )}
                                              title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );})}

                        {/* Planned content from Ideate column - lighter/dashed styling */}
                        {plannedForDay.map((plannedCard) => (
                          <div
                            key={`planned-${plannedCard.id}`}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedPlannedCardId(plannedCard.id);
                              setPopoverCardId(null);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedPlannedCardId(null);
                              setDragOverDate(null);
                            }}
                            className={cn(
                              "text-[11px] px-2 py-1.5 rounded-md transition-colors cursor-grab active:cursor-grabbing group/plancard",
                              "bg-[#F5F2F4] border border-dashed border-[#D4C9CF] text-[#8B7082]",
                              draggedPlannedCardId === plannedCard.id && "opacity-50"
                            )}
                            title={`Planned: ${plannedCard.title}`}
                          >
                            {/* Title row */}
                            <div className="flex items-start gap-1.5">
                              <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#8B7082]" />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="leading-tight opacity-80 truncate flex-1 cursor-default">{plannedCard.hook || plannedCard.title || "Planned idea"}</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" variant="light">{plannedCard.hook || plannedCard.title || "Planned idea"}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePlannedContent(plannedCard.id);
                                      }}
                                      className="opacity-0 group-hover/plancard:opacity-100 hover:bg-[#8B7082]/10 rounded p-0.5 transition-opacity flex-shrink-0"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Remove from calendar</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {/* Progress indicator - 6 lines, first 1 colored for planned */}
                            <div className="flex gap-0.5 mt-1.5">
                              {[1, 2, 3, 4, 5, 6].map((step) => (
                                <div
                                  key={step}
                                  className={cn(
                                    "h-1 flex-1 rounded-full",
                                    step <= 1 ? "bg-[#8B7082]" : "bg-[#D4C9CF]"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                      </div>
                    </PopoverTrigger>

                    {/* Add Idea Popover Content - only for embedded mode */}
                    {embedded && (
                      <PopoverContent
                        className="w-80 p-0 shadow-xl border-0"
                        side="right"
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white rounded-lg">
                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                              </div>
                              <span className="text-sm font-semibold text-indigo-900">New Content Idea</span>
                            </div>
                            <button
                              onClick={() => {
                                setAddIdeaPopoverDate(null);
                                setNewIdeaHook("");
                                setNewIdeaNotes("");
                                setNewIdeaColor("indigo");
                              }}
                              className="p-1 hover:bg-indigo-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-indigo-400" />
                            </button>
                          </div>

                          {/* Form */}
                          <div className="p-4 space-y-4">
                            {/* Hook */}
                            <div>
                              <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">
                                Hook
                              </label>
                              <input
                                type="text"
                                value={newIdeaHook}
                                onChange={(e) => setNewIdeaHook(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newIdeaHook.trim()) {
                                    e.preventDefault();
                                    handleSaveToCalendar();
                                  }
                                }}
                                placeholder="What's the hook for this content?"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                autoFocus
                              />
                              <p className="text-[10px] text-gray-400 mt-1">Press Enter to save to calendar</p>
                            </div>

                            {/* Notes */}
                            <div>
                              <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">
                                Notes
                              </label>
                              <textarea
                                value={newIdeaNotes}
                                onChange={(e) => setNewIdeaNotes(e.target.value)}
                                placeholder="Any additional notes or ideas..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              />
                            </div>

                            {/* Color Palette */}
                            <div>
                              <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">
                                Color
                              </label>
                              <div className="flex gap-2">
                                {(Object.keys(scheduleColors) as Array<keyof typeof scheduleColors>).map((colorKey) => (
                                  <button
                                    key={colorKey}
                                    type="button"
                                    onClick={() => setNewIdeaColor(colorKey)}
                                    className={cn(
                                      "w-6 h-6 rounded-full transition-all",
                                      scheduleColors[colorKey].dot,
                                      newIdeaColor === colorKey
                                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                        : "hover:scale-110"
                                    )}
                                    title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 pt-3">
                              <button
                                onClick={handleSendToScriptIdeas}
                                disabled={!newIdeaHook.trim()}
                                className={cn(
                                  "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border",
                                  newIdeaHook.trim()
                                    ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                                    : "border-gray-100 text-gray-300 cursor-not-allowed"
                                )}
                              >
                                <Send className="w-3 h-3" />
                                Develop Idea in Content Hub
                              </button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
              </div>
            </div>

          </CardContent>
        </div>
      </div>
    </div>
  );

  // Planning mode content - compact calendar view for planning an idea
  const planningContent = (
    <div className="flex flex-col h-full">
      {/* Header showing what idea is being planned */}
      <div className="flex items-center justify-between px-4 py-3 bg-violet-50 border-b border-violet-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900">Plan this idea</h3>
            <p className="text-xs text-violet-600 truncate max-w-[300px]">
              {planningCard?.title || planningCard?.hook || "Select a date"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setPendingPlanDate(null);
              onClose();
            }}
            className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-violet-500" />
          </button>
        )}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const scheduledForDay = scheduledCardsByDate[dateStr] || [];
            const plannedForDay = plannedCardsByDate[dateStr] || [];
            // Check if this is the pending plan date
            const pendingDateStr = pendingPlanDate?.toISOString().split('T')[0];
            const isPendingDate = pendingDateStr === dateStr;
            const isDragOver = planDragOverDate === dateStr;
            const hasContent = scheduledForDay.length > 0 || plannedForDay.length > 0 || isPendingDate;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (planningCard && day.isCurrentMonth) {
                    setPendingPlanDate(day.date);
                  }
                }}
                onDragOver={(e) => {
                  if (isDraggingPlanCard && day.isCurrentMonth) {
                    e.preventDefault();
                    setPlanDragOverDate(dateStr);
                  }
                }}
                onDragLeave={() => {
                  setPlanDragOverDate(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isDraggingPlanCard && day.isCurrentMonth) {
                    setPendingPlanDate(day.date);
                    setPlanDragOverDate(null);
                    setIsDraggingPlanCard(false);
                  }
                }}
                className={cn(
                  "min-h-[70px] rounded-lg border p-1.5 transition-all",
                  day.isCurrentMonth
                    ? "bg-white border-gray-200 text-gray-900 cursor-pointer hover:bg-violet-50/50"
                    : "bg-gray-50 border-gray-100 text-gray-400",
                  isPendingDate && "bg-violet-50/70",
                  isDragOver && day.isCurrentMonth && "bg-violet-100"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  day.isToday && "text-violet-600 font-bold"
                )}>
                  {day.date.getDate()}
                </span>

                {/* Content indicators */}
                {hasContent && (
                  <div className="mt-1 space-y-0.5">
                    {/* Show pending planned card - draggable */}
                    {isPendingDate && planningCard && (
                      <div
                        draggable
                        onDragStart={(e) => {
                          setIsDraggingPlanCard(true);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setIsDraggingPlanCard(false);
                          setPlanDragOverDate(null);
                        }}
                        className={cn(
                          "text-[9px] px-1 py-0.5 rounded border border-dashed border-violet-300 bg-violet-50 text-violet-600 truncate cursor-grab active:cursor-grabbing",
                          isDraggingPlanCard && "opacity-50"
                        )}
                      >
                        {planningCard.hook || planningCard.title}
                      </div>
                    )}
                    {scheduledForDay.slice(0, isPendingDate ? 1 : 2).map((card) => (
                      <div
                        key={card.id}
                        className="text-[9px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 truncate"
                      >
                        {card.hook || card.title}
                      </div>
                    ))}
                    {plannedForDay.filter(c => c.id !== planningCard?.id).slice(0, isPendingDate ? 1 : 2).map((card) => (
                      <div
                        key={card.id}
                        className="text-[9px] px-1 py-0.5 rounded border border-dashed border-[#D4C9CF] bg-[#F5F2F4] text-[#8B7082] truncate"
                      >
                        {card.hook || card.title}
                      </div>
                    ))}
                    {(scheduledForDay.length + plannedForDay.filter(c => c.id !== planningCard?.id).length) > (isPendingDate ? 1 : 2) && (
                      <div className="text-[8px] text-gray-400 px-1">
                        +{scheduledForDay.length + plannedForDay.filter(c => c.id !== planningCard?.id).length - (isPendingDate ? 1 : 2)} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with Save/Cancel or instruction */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        {pendingPlanDate ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-violet-600 font-medium">
              {pendingPlanDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingPlanDate(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (planningCard && onPlanDate && pendingPlanDate) {
                    onPlanDate(planningCard.id, pendingPlanDate);
                    setPendingPlanDate(null);
                  }
                }}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            Click a date to plan your idea
          </p>
        )}
      </div>
    </div>
  );

  // Render based on mode
  if (planningMode) {
    return (
      <div
        className="bg-white flex flex-col overflow-hidden rounded-lg relative"
        style={{ width: planningSize.width, height: planningSize.height }}
      >
        {planningContent}
        {/* Top-right resize handle */}
        <div
          onMouseDown={handleResizeStartTopRight}
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize group"
          title="Drag to resize"
        >
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors rotate-90"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM18 14H16V12H18V14ZM14 18H12V16H14V18ZM10 22H8V20H10V22Z" />
          </svg>
        </div>
        {/* Bottom-right resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
          title="Drag to resize"
        >
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM18 14H16V12H18V14ZM14 18H12V16H14V18ZM10 22H8V20H10V22Z" />
          </svg>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <>
        <div
          className="bg-white flex flex-col h-full flex-1 overflow-hidden"
          onClick={() => {
            // Close any open popover when clicking on the content area
            if (popoverCardId) {
              setPopoverCardId(null);
            }
          }}
        >
          {content}
        </div>

        {/* Time Picker Modal */}
        {timePickerOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
            onClick={() => {
              setTimePickerOpen(false);
              setPendingScheduleDate(null);
              setPendingScheduleCardId(null);
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-[0_20px_70px_-15px_rgba(139,112,130,0.3)] p-5 w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EDE8F2] to-[#E0D6E6] flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-[#8B7082]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Schedule Content</h3>
                <p className="text-sm text-[#8B7082] font-medium mt-0.5">
                  {pendingScheduleDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Time Selection */}
              <div className="bg-[#F9F7FA] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      placeholder="9:00"
                      className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none"
                      autoFocus
                    />
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Start</p>
                  </div>
                  <div className="w-4 h-[2px] bg-[#D4CCD2] rounded-full mt-[-16px]" />
                  <div className="text-center">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="10:00"
                      className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">End</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-1">
                    <button
                      onClick={() => setTimePeriod("AM")}
                      className={cn(
                        "w-11 h-5 rounded-md text-[10px] font-semibold transition-all",
                        timePeriod === "AM"
                          ? "bg-[#8B7082] text-white shadow-sm"
                          : "bg-white text-gray-400 hover:text-gray-600 shadow-sm"
                      )}
                    >
                      AM
                    </button>
                    <button
                      onClick={() => setTimePeriod("PM")}
                      className={cn(
                        "w-11 h-5 rounded-md text-[10px] font-semibold transition-all",
                        timePeriod === "PM"
                          ? "bg-[#8B7082] text-white shadow-sm"
                          : "bg-white text-gray-400 hover:text-gray-600 shadow-sm"
                      )}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTimePickerOpen(false);
                    setPendingScheduleDate(null);
                    setPendingScheduleCardId(null);
                  }}
                  className="flex-1 h-10 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSchedule}
                  className="flex-1 h-10 text-sm font-medium text-white bg-[#8B7082] hover:bg-[#7A6272] rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Modal mode
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4] rounded-2xl shadow-2xl flex flex-col w-[1200px] max-w-[95vw] h-[calc(100vh-3rem)] max-h-[920px] overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            // Close any open popover when clicking on the modal content area
            if (popoverCardId) {
              setPopoverCardId(null);
            }
          }}
        >
          {content}
        </div>
      </div>

      {/* Time Picker Modal */}
      {timePickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
          onClick={() => {
            setTimePickerOpen(false);
            setPendingScheduleDate(null);
            setPendingScheduleCardId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-[0_20px_70px_-15px_rgba(139,112,130,0.3)] p-5 w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EDE8F2] to-[#E0D6E6] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-[#8B7082]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Schedule Content</h3>
              <p className="text-sm text-[#8B7082] font-medium mt-0.5">
                {pendingScheduleDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Time Selection */}
            <div className="bg-[#F9F7FA] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    placeholder="9:00"
                    className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Start</p>
                </div>
                <div className="w-4 h-[2px] bg-[#D4CCD2] rounded-full mt-[-16px]" />
                <div className="text-center">
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:00"
                    className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">End</p>
                </div>
                <div className="flex flex-col gap-1 ml-1">
                  <button
                    onClick={() => setTimePeriod("AM")}
                    className={cn(
                      "w-11 h-5 rounded-md text-[10px] font-semibold transition-all",
                      timePeriod === "AM"
                        ? "bg-[#8B7082] text-white shadow-sm"
                        : "bg-white text-gray-400 hover:text-gray-600 shadow-sm"
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setTimePeriod("PM")}
                    className={cn(
                      "w-11 h-5 rounded-md text-[10px] font-semibold transition-all",
                      timePeriod === "PM"
                        ? "bg-[#8B7082] text-white shadow-sm"
                        : "bg-white text-gray-400 hover:text-gray-600 shadow-sm"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTimePickerOpen(false);
                  setPendingScheduleDate(null);
                  setPendingScheduleCardId(null);
                }}
                className="flex-1 h-10 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="flex-1 h-10 text-sm font-medium text-white bg-[#8B7082] hover:bg-[#7A6272] rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmCard} onOpenChange={(open) => !open && setDeleteConfirmCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Remove from Calendar</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              What would you like to do with this content?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleArchiveAndRemove}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#F5F2F4] hover:bg-[#EBE6E9] border border-[#D4C9CF] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#8B7082] flex items-center justify-center flex-shrink-0">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Archive & Remove</p>
                <p className="text-xs text-gray-500">Save a copy to archive, then remove from calendar</p>
              </div>
              <span className="text-[10px] font-medium text-[#8B7082] bg-[#8B7082]/10 px-2 py-0.5 rounded-full">Recommended</span>
            </button>
            <button
              onClick={handleDeletePermanently}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-700">Delete Permanently</p>
                <p className="text-xs text-red-500">Remove without saving - cannot be undone</p>
              </div>
            </button>
            <button
              onClick={() => setDeleteConfirmCard(null)}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all mt-1"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandedScheduleView;
