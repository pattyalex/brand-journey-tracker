import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ProductionCard, KanbanColumn } from "../types";
import { StorageKeys, getString, setString, getWeekStartsOn, getDayNames } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import { toast } from "sonner";

// Helper to parse time string to minutes for sorting
export const parseTimeToMinutes = (timeStr: string | undefined): number => {
  if (!timeStr) return 9999;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Color options for scheduled content
export const scheduleColors = {
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

export const defaultScheduledColor = { bg: '#8B7082', text: '#ffffff', dot: 'bg-[#8B7082]' };

export type ScheduleColorKey = keyof typeof scheduleColors;

// Static formats that should show camera icon
const staticFormats = [
  'single photo post', 'curated photo carousel', 'casual photo dump',
  'text-only post', 'carousel with text slides', 'notes-app style screenshot',
  'tweet-style slide', 'photo post', 'carousel', 'text post'
];

export const isStaticFormat = (format: string): boolean => {
  return staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
};

export interface ExpandedScheduleViewProps {
  embedded?: boolean;
  cards?: ProductionCard[];
  singleCard?: ProductionCard | null;
  onClose?: () => void;
  onSchedule?: (cardId: string, date: Date) => void;
  onUnschedule?: (cardId: string) => void;
  onUpdateColor?: (cardId: string, color: ScheduleColorKey) => void;
  headerComponent?: React.ReactNode;
  planningMode?: boolean;
  planningCard?: ProductionCard | null;
  onPlanDate?: (cardId: string, date: Date) => void;
  onNavigateToStep?: (step: number) => void;
  onMoveToScheduleColumn?: (card: ProductionCard) => void;
  completedSteps?: number[];
  onOpenContentFlow?: (card: ProductionCard) => void;
  onToggleComplete?: (step: number) => void;
}

export function useScheduleState(props: ExpandedScheduleViewProps) {
  const {
    embedded = false,
    cards: propCards,
    singleCard,
    onClose,
    onSchedule: propOnSchedule,
    onUnschedule: propOnUnschedule,
    onUpdateColor: propOnUpdateColor,
    planningMode = false,
    planningCard,
    onPlanDate,
    completedSteps = [],
  } = props;

  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
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
  const [pendingPlanDate, setPendingPlanDate] = useState<Date | null>(null);
  const [isDraggingPlanCard, setIsDraggingPlanCard] = useState(false);
  const [planDragOverDate, setPlanDragOverDate] = useState<string | null>(null);

  // Time picker state
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pendingScheduleDate, setPendingScheduleDate] = useState<Date | null>(null);
  const [pendingScheduleCardId, setPendingScheduleCardId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("9:00");
  const [endTime, setEndTime] = useState("10:00");
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("AM");

  // Incomplete content warning state
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [incompleteWarningMissingSteps, setIncompleteWarningMissingSteps] = useState<string[]>([]);

  // Single card scheduled state
  const [singleCardScheduled, setSingleCardScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Delete confirmation
  const [deleteConfirmCard, setDeleteConfirmCard] = useState<{ id: string; element: HTMLElement | null } | null>(null);

  // Left panel state
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Initialize singleCardScheduled
  useEffect(() => {
    if (singleCard?.scheduledDate) {
      setSingleCardScheduled(true);
      const datePart = singleCard.scheduledDate.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      setScheduledDate(new Date(year, month - 1, day, 12, 0, 0));
      setShowCelebration(false);
    } else {
      setSingleCardScheduled(false);
      setScheduledDate(null);
      setShowCelebration(false);
    }
  }, [singleCard?.id, singleCard?.scheduledDate]);

  // Initialize pending date with card's existing planned date
  useEffect(() => {
    if (planningCard?.plannedDate) {
      setPendingPlanDate(new Date(planningCard.plannedDate));
    } else {
      setPendingPlanDate(null);
    }
  }, [planningCard?.id, planningCard?.plannedDate]);

  // Scroll to today
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (todayRef.current && calendarScrollRef.current) {
        todayRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [embedded]);

  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 450, height: 500 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, width: planningSize.width, height: planningSize.height };

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

  const handleResizeStartTopRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, width: planningSize.width, height: planningSize.height };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      setPlanningSize({
        width: Math.max(350, Math.min(800, resizeStart.current.width + deltaX)),
        height: Math.max(400, Math.min(700, resizeStart.current.height - deltaY)),
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

  // Columns state for embedded mode
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

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
    loadColumnsFromStorage();
  }, [loadColumnsFromStorage]);

  useEffect(() => {
    const cleanup = on(window, EVENTS.productionKanbanUpdated, () => {
      loadColumnsFromStorage();
    });
    return cleanup;
  }, [loadColumnsFromStorage]);

  const saveColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    setString(StorageKeys.productionKanban, JSON.stringify(newColumns));
    emit(window, EVENTS.productionKanbanUpdated, { source: 'calendar' });
  };

  // Get cards
  const toScheduleCards = useMemo(() => {
    if (embedded || planningMode) {
      const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
      return toScheduleColumn?.cards || [];
    }
    return propCards || [];
  }, [embedded, planningMode, columns, propCards]);

  const plannedIdeateCards = useMemo(() => {
    if (embedded || planningMode) {
      const ideateColumn = columns.find(col => col.id === 'ideate');
      return ideateColumn?.cards.filter(c => c.plannedDate) || [];
    }
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

  // Internal handlers
  const handleScheduleInternal = (cardId: string, date: Date) => {
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              return { ...card, schedulingStatus: 'scheduled' as const, scheduledDate: date.toISOString() };
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
              return { ...card, schedulingStatus: 'to-schedule' as const, scheduledDate: undefined };
            }
            return card;
          }),
        };
      }
      return col;
    });
    saveColumns(newColumns);
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);
  };

  const handleRemovePlannedContent = (cardId: string) => {
    const newColumns = columns.map(col => {
      if (col.id === 'ideate') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) {
              return { ...card, plannedDate: undefined, plannedStartTime: undefined, plannedEndTime: undefined, plannedColor: undefined };
            }
            return card;
          }),
        };
      }
      return col;
    });
    saveColumns(newColumns);
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);
  };

  // Track posted IDs
  const [markedAsPostedIds, setMarkedAsPostedIds] = useState<Set<string>>(() => {
    const completedIds = new Set<string>();
    columns.forEach(col => {
      col.cards.forEach(card => {
        if (card.isCompleted) completedIds.add(card.id);
      });
    });
    return completedIds;
  });

  useEffect(() => {
    const completedIds = new Set<string>();
    columns.forEach(col => {
      col.cards.forEach(card => {
        if (card.isCompleted) completedIds.add(card.id);
      });
    });
    setMarkedAsPostedIds(completedIds);
  }, [columns]);

  const handleArchiveContent = (cardId: string, e: React.MouseEvent) => {
    const toScheduleCol = columns.find(col => col.id === 'to-schedule');
    const card = toScheduleCol?.cards.find(c => c.id === cardId);
    if (!card) return;

    const button = e.currentTarget as HTMLElement;
    const cardElement = button.closest('[data-card-id]') as HTMLElement;

    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      const ghost = cardElement.cloneNode(true) as HTMLElement;
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

    const archivedCopy: ProductionCard = {
      ...card,
      id: `archived-${card.id}-${Date.now()}`,
      columnId: 'posted',
      schedulingStatus: undefined,
      archivedAt: new Date().toISOString(),
    } as ProductionCard & { archivedAt: string };

    emit(window, EVENTS.contentArchived, { card: archivedCopy });
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);

    toast.success("Archived!", {
      description: "A copy has been saved to your archive",
      action: { label: "View Archive", onClick: () => emit(window, EVENTS.openArchiveDialog) }
    });
  };

  const handleDeleteClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    const cardElement = button.closest('[data-card-id]') as HTMLElement;
    setDeleteConfirmCard({ id: cardId, element: cardElement });
  };

  const handleMarkAsPosted = (cardId: string) => {
    const newMarkedIds = new Set(markedAsPostedIds);
    const isCurrentlyMarked = newMarkedIds.has(cardId);

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const storedColumns: KanbanColumn[] = JSON.parse(savedData);
        const toScheduleColumn = storedColumns.find(c => c.id === 'to-schedule');
        if (toScheduleColumn) {
          const card = toScheduleColumn.cards.find(c => c.id === cardId);
          if (card) {
            card.isCompleted = !isCurrentlyMarked;
            setString(StorageKeys.productionKanban, JSON.stringify(storedColumns));
            emit(window, EVENTS.productionKanbanUpdated);
            emit(window, EVENTS.scheduledContentUpdated);
          }
        }
      } catch (err) {
        console.error('Error toggling completion:', err);
      }
    }

    if (isCurrentlyMarked) {
      newMarkedIds.delete(cardId);
      setMarkedAsPostedIds(newMarkedIds);
      return;
    }

    newMarkedIds.add(cardId);
    setMarkedAsPostedIds(newMarkedIds);

    const toScheduleCol = columns.find(col => col.id === 'to-schedule');
    let card = toScheduleCol?.cards.find(c => c.id === cardId);
    if (!card && singleCard && singleCard.id === cardId) {
      card = {
        ...singleCard,
        schedulingStatus: 'scheduled' as const,
        scheduledDate: scheduledDate?.toISOString().split('T')[0],
      };
    }
    if (!card) return;

    const archivedCopy: ProductionCard = {
      ...card,
      id: `archived-${card.id}-${Date.now()}`,
      columnId: 'posted',
      schedulingStatus: undefined,
      archivedAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
    } as ProductionCard & { archivedAt: string; postedAt: string };

    emit(window, EVENTS.contentArchived, { card: archivedCopy });
    toast.success("Posted! \ud83c\udf89");
  };

  const handleArchiveAndRemove = () => {
    if (!deleteConfirmCard) return;
    const toScheduleCol = columns.find(col => col.id === 'to-schedule');
    const card = toScheduleCol?.cards.find(c => c.id === deleteConfirmCard.id);
    if (!card) { setDeleteConfirmCard(null); return; }

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

    const archivedCopy: ProductionCard = {
      ...card,
      id: `archived-${card.id}-${Date.now()}`,
      columnId: 'posted',
      schedulingStatus: undefined,
      archivedAt: new Date().toISOString(),
    } as ProductionCard & { archivedAt: string };

    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return { ...col, cards: col.cards.filter(c => c.id !== deleteConfirmCard.id) };
      }
      return col;
    });

    saveColumns(newColumns);
    emit(window, EVENTS.contentArchived, { card: archivedCopy });
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);

    toast.success("Archived & Removed", {
      description: "Content saved to archive and removed from calendar",
      action: { label: "View Archive", onClick: () => emit(window, EVENTS.openArchiveDialog) }
    });

    setDeleteConfirmCard(null);
  };

  const handleDeletePermanently = () => {
    if (!deleteConfirmCard) return;

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

    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return { ...col, cards: col.cards.filter(c => c.id !== deleteConfirmCard.id) };
      }
      return col;
    });

    saveColumns(newColumns);
    emit(window, EVENTS.productionKanbanUpdated);
    emit(window, EVENTS.scheduledContentUpdated);
    toast.success("Deleted", { description: "Content has been permanently removed" });
    setDeleteConfirmCard(null);
  };

  const handleUpdateColorInternal = (cardId: string, color: ScheduleColorKey) => {
    const newColumns = columns.map(col => {
      if (col.id === 'to-schedule') {
        return {
          ...col,
          cards: col.cards.map(card => {
            if (card.id === cardId) return { ...card, scheduledColor: color };
            return card;
          }),
        };
      }
      return col;
    });

    flushSync(() => {
      saveColumns(newColumns);
      setColorUpdateVersion(v => v + 1);
    });
  };

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
          card.id === cardId ? { ...card, hook: newHook, title: newHook, description: newNotes } : card
        )
      };
      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));
      setColumns(currentColumns);
    } catch (e) {
      console.error("Error updating scheduled card:", e);
    }
  };

  const handleSendScheduledToScriptIdeas = (card: ProductionCard) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const scriptIdeasIndex = currentColumns.findIndex(col => col.id === 'shape-ideas');
      if (scriptIdeasIndex < 0) return;

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
      navigate('/production');
    } catch (e) {
      console.error("Error sending to Script Ideas:", e);
    }
  };

  const onSchedule = propOnSchedule || (embedded ? handleScheduleInternal : undefined);
  const onUnschedule = propOnUnschedule || (embedded ? handleUnscheduleInternal : undefined);
  const onUpdateColor = propOnUpdateColor || (embedded ? handleUpdateColorInternal : undefined);

  const handleSaveToCalendar = () => {
    if (!newIdeaHook.trim() || !addIdeaPopoverDate) return;
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const toScheduleIndex = currentColumns.findIndex(col => col.id === 'to-schedule');
      if (toScheduleIndex < 0) return;

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

      currentColumns[toScheduleIndex] = {
        ...currentColumns[toScheduleIndex],
        cards: [newCard, ...currentColumns[toScheduleIndex].cards]
      };

      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));
      setColumns(currentColumns);
      setNewIdeaHook("");
      setNewIdeaNotes("");
      setNewIdeaColor("indigo");
      setAddIdeaPopoverDate(null);
    } catch (e) {
      console.error("Error saving idea to calendar:", e);
    }
  };

  const handleSendToScriptIdeas = () => {
    if (!newIdeaHook.trim() || !addIdeaPopoverDate) return;
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const scriptIdeasIndex = currentColumns.findIndex(col => col.id === 'shape-ideas');
      if (scriptIdeasIndex < 0) return;

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

      currentColumns[scriptIdeasIndex] = {
        ...currentColumns[scriptIdeasIndex],
        cards: [newCard, ...currentColumns[scriptIdeasIndex].cards]
      };

      setString(StorageKeys.productionKanban, JSON.stringify(currentColumns));
      setColumns(currentColumns);
      setNewIdeaHook("");
      setNewIdeaNotes("");
      setNewIdeaColor("indigo");
      setAddIdeaPopoverDate(null);
      navigate('/production');
    } catch (e) {
      console.error("Error saving idea:", e);
    }
  };

  const cards = toScheduleCards;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unscheduledCards = cards.filter(c => c.schedulingStatus !== 'scheduled');

  const scheduledCardsByDate = useMemo(() => {
    const map: Record<string, ProductionCard[]> = {};
    cards.forEach(c => {
      if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
        const dateKey = c.scheduledDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(c);
      }
    });
    if (singleCardScheduled && singleCard && scheduledDate) {
      const dateKey = scheduledDate.toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      if (!map[dateKey].find(c => c.id === singleCard.id)) {
        map[dateKey].push({ ...singleCard, schedulingStatus: 'scheduled', scheduledDate: dateKey });
      }
    }
    Object.keys(map).forEach(dateKey => {
      map[dateKey].sort((a, b) => parseTimeToMinutes(a.scheduledStartTime) - parseTimeToMinutes(b.scheduledStartTime));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, colorUpdateVersion, singleCardScheduled, singleCard, scheduledDate]);

  // Auto-archive past content
  useEffect(() => {
    const now = new Date();
    const cardsToAutoArchive: ProductionCard[] = [];
    Object.entries(scheduledCardsByDate).forEach(([dateKey, scheduledCards]) => {
      const sd = new Date(dateKey);
      sd.setHours(23, 59, 59, 999);
      if (sd < now) cardsToAutoArchive.push(...scheduledCards);
    });

    if (cardsToAutoArchive.length > 0) {
      cardsToAutoArchive.forEach(card => {
        const archivedCopy: ProductionCard = {
          ...card,
          id: `archived-${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          columnId: 'posted',
          schedulingStatus: undefined,
          archivedAt: new Date().toISOString(),
          postedAt: card.scheduledDate || new Date().toISOString(),
        } as ProductionCard & { archivedAt: string; postedAt: string };
        emit(window, EVENTS.contentArchived, { card: archivedCopy });
      });

      const cardIdsToRemove = new Set(cardsToAutoArchive.map(c => c.id));
      const newColumns = columns.map(col => {
        if (col.id === 'to-schedule') {
          return { ...col, cards: col.cards.filter(c => !cardIdsToRemove.has(c.id)) };
        }
        return col;
      });

      saveColumns(newColumns);
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);

      if (cardsToAutoArchive.length === 1) {
        toast.success(`"${cardsToAutoArchive[0].hook || cardsToAutoArchive[0].title}" was posted and archived \ud83c\udf89`);
      } else {
        toast.success(`${cardsToAutoArchive.length} items were posted and archived \ud83c\udf89`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plannedCardsByDate = useMemo(() => {
    const map: Record<string, ProductionCard[]> = {};
    plannedIdeateCards.forEach(c => {
      if (c.plannedDate) {
        const dateKey = c.plannedDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(c);
      }
    });
    Object.keys(map).forEach(dateKey => {
      map[dateKey].sort((a, b) => parseTimeToMinutes(a.plannedStartTime) - parseTimeToMinutes(b.plannedStartTime));
    });
    return map;
  }, [plannedIdeateCards]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = getDayNames('short');

  const monthlyStats = useMemo(() => {
    if (!embedded) return { scheduled: 0, posted: 0, planned: 0 };
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    let scheduled = 0, posted = 0, planned = 0;

    cards.forEach(c => {
      if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
        const schedDate = new Date(c.scheduledDate);
        if (schedDate >= startOfMonth && schedDate <= endOfMonth) {
          if (schedDate < today) posted++;
          else scheduled++;
        }
      }
    });

    plannedIdeateCards.forEach(c => {
      if (c.plannedDate) {
        const planDate = new Date(c.plannedDate);
        if (planDate >= startOfMonth && planDate <= endOfMonth) planned++;
      }
    });

    return { scheduled, posted, planned };
  }, [embedded, currentMonth, currentYear, cards, plannedIdeateCards, today]);

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

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const weekStartsOn = getWeekStartsOn();
    const startingDayOfWeek = weekStartsOn === 1
      ? (firstDayOfMonth.getDay() + 6) % 7
      : firstDayOfMonth.getDay();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; monthLabel?: string }[] = [];

    const prevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }

    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const month = currentMonth + monthOffset;
      const year = currentYear + Math.floor(month / 12);
      const normalizedMonth = ((month % 12) + 12) % 12;
      const daysInMonth = new Date(year, normalizedMonth + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, normalizedMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const isFirstDay = day === 1 && monthOffset > 0;
        days.push({
          date,
          isCurrentMonth: monthOffset === 0,
          isToday,
          monthLabel: isFirstDay ? monthNames[normalizedMonth] : undefined,
        });
      }
    }

    const totalDaysNeeded = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalDaysNeeded - days.length;
    const lastDate = days[days.length - 1].date;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, day);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setDisplayedMonth(currentMonth - 1 < 0 ? 11 : currentMonth - 1);
    setDisplayedYear(currentMonth - 1 < 0 ? currentYear - 1 : currentYear);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setDisplayedMonth((currentMonth + 1) % 12);
    setDisplayedYear(currentMonth + 1 > 11 ? currentYear + 1 : currentYear);
  };

  // Scroll handler to update displayed month
  useEffect(() => {
    const scrollContainer = calendarScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const headerHeight = 60;
      const checkY = containerRect.top + headerHeight + 50;

      const dayCells = scrollContainer.querySelectorAll('[data-calendar-date]');
      for (const cell of dayCells) {
        const rect = cell.getBoundingClientRect();
        if (rect.top <= checkY && rect.bottom > checkY) {
          const dateStr = cell.getAttribute('data-calendar-date');
          if (dateStr) {
            const date = new Date(dateStr);
            if (date.getMonth() !== displayedMonth || date.getFullYear() !== displayedYear) {
              setDisplayedMonth(date.getMonth());
              setDisplayedYear(date.getFullYear());
            }
          }
          break;
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [displayedMonth, displayedYear]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';

    const draggedCard = singleCard?.id === cardId ? singleCard : cards?.find(c => c.id === cardId);

    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute; top: -1000px; left: -1000px; padding: 6px 10px;
      background: white; border: 2px solid #8B7082; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 11px; font-weight: 600;
      color: #333; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    `;
    dragPreview.textContent = draggedCard?.hook || draggedCard?.title || "Content";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 60, 15);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDraggedPlannedCardId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCardId || draggedPlannedCardId) setDragOverDate(dateStr);
  };

  const handleDragLeave = () => { setDragOverDate(null); };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedCardId && onSchedule) {
      const cardToDrop = cards.find(c => c.id === draggedCardId) || (singleCard?.id === draggedCardId ? singleCard : null);
      const missingSteps: string[] = [];
      if (cardToDrop) {
        if (!cardToDrop.hook?.trim() && !cardToDrop.title?.trim()) missingSteps.push("Title/Hook (Bank of Ideas)");
        if (!cardToDrop.script?.trim()) missingSteps.push("Script");
      }

      setPendingScheduleDate(date);
      setPendingScheduleCardId(draggedCardId);
      setStartTime("9:00");
      setEndTime("10:00");
      setTimePeriod("AM");

      if (missingSteps.length > 0) {
        setIncompleteWarningMissingSteps(missingSteps);
        setShowIncompleteWarning(true);
      } else {
        setTimePickerOpen(true);
      }
    }
    if (draggedPlannedCardId) {
      handleUpdatePlannedCardDate(draggedPlannedCardId, date);
    }
    setDraggedCardId(null);
    setDraggedPlannedCardId(null);
    setDragOverDate(null);
  };

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
      if (singleCard && pendingScheduleCardId === singleCard.id) {
        setSingleCardScheduled(true);
        setScheduledDate(dateWithTime);
        setShowCelebration(true);
      }
    }
    setTimePickerOpen(false);
    setPendingScheduleDate(null);
    setPendingScheduleCardId(null);
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
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

  const handleUpdatePlannedCardDate = (cardId: string, newDate: Date) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const currentColumns: KanbanColumn[] = JSON.parse(savedData);
      const updatedColumns = currentColumns.map(col => ({
        ...col,
        cards: col.cards.map(card =>
          card.id === cardId ? { ...card, plannedDate: newDate.toISOString() } : card
        )
      }));
      setString(StorageKeys.productionKanban, JSON.stringify(updatedColumns));
      emit(window, EVENTS.productionKanbanUpdated, { source: 'calendar' });
      if (embedded || planningMode) loadColumnsFromStorage();
    } catch (e) {
      console.error("Error updating planned card date:", e);
    }
  };

  return {
    // Props passthrough
    embedded, singleCard, onClose, planningMode, planningCard, onPlanDate,
    completedSteps,
    onNavigateToStep: props.onNavigateToStep,
    onMoveToScheduleColumn: props.onMoveToScheduleColumn,
    headerComponent: props.headerComponent,
    onOpenContentFlow: props.onOpenContentFlow,

    // Navigation
    navigate,

    // Refs
    calendarScrollRef, todayRef,

    // State
    currentDate, setCurrentDate,
    displayedMonth, setDisplayedMonth,
    displayedYear, setDisplayedYear,
    draggedCardId, setDraggedCardId,
    draggedPlannedCardId, setDraggedPlannedCardId,
    dragOverDate, setDragOverDate,
    dragOverUnschedule, setDragOverUnschedule,
    popoverCardId, setPopoverCardId,
    selectedCard, setSelectedCard,
    addIdeaPopoverDate, setAddIdeaPopoverDate,
    newIdeaHook, setNewIdeaHook,
    newIdeaNotes, setNewIdeaNotes,
    newIdeaColor, setNewIdeaColor,
    editingScheduledHook, setEditingScheduledHook,
    editingScheduledNotes, setEditingScheduledNotes,
    editingScheduledColor, setEditingScheduledColor,
    colorUpdateVersion,
    planningSize, setPlanningSize,
    pendingPlanDate, setPendingPlanDate,
    isDraggingPlanCard, setIsDraggingPlanCard,
    planDragOverDate, setPlanDragOverDate,
    timePickerOpen, setTimePickerOpen,
    pendingScheduleDate, setPendingScheduleDate,
    pendingScheduleCardId, setPendingScheduleCardId,
    startTime, setStartTime,
    endTime, setEndTime,
    timePeriod, setTimePeriod,
    showIncompleteWarning, setShowIncompleteWarning,
    incompleteWarningMissingSteps,
    singleCardScheduled, setSingleCardScheduled,
    scheduledDate, setScheduledDate,
    showCelebration, setShowCelebration,
    deleteConfirmCard, setDeleteConfirmCard,
    isLeftPanelCollapsed, setIsLeftPanelCollapsed,
    columns,

    // Computed
    cards, today, unscheduledCards,
    scheduledCardsByDate, plannedCardsByDate, plannedIdeateCards,
    currentMonth, currentYear,
    monthNames, daysOfWeek,
    monthlyStats, upcomingContent, calendarDays,
    markedAsPostedIds,

    // Handlers
    handleResizeStart, handleResizeStartTopRight,
    goToPreviousMonth, goToNextMonth,
    handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop,
    handleConfirmSchedule, handleStartTimeChange,
    handleRemovePlannedContent,
    handleArchiveContent, handleDeleteClick,
    handleMarkAsPosted,
    handleArchiveAndRemove, handleDeletePermanently,
    handleUpdateScheduledCard,
    handleSendScheduledToScriptIdeas,
    handleSaveToCalendar, handleSendToScriptIdeas,
    handleUpdatePlannedCardDate,

    // Resolved handlers
    onSchedule, onUnschedule, onUpdateColor,
  };
}

export type UseScheduleStateReturn = ReturnType<typeof useScheduleState>;
