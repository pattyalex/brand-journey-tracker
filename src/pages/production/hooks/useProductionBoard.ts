import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import { getUserProductionCards, upsertProductionCard, deleteProductionCard } from "@/services/productionService";
import { KanbanColumn, ProductionCard, StageCompletions } from "../types";
import { defaultColumns, DEFAULT_STAGE_COMPLETIONS, COLUMN_ORDER } from "../utils/productionConstants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UseProductionBoardParams {
  userId: string | undefined;
}

export interface UseProductionBoardCallbacks {
  /** Called when repurpose highlights a card (state lives in Production.tsx) */
  onRepurposedCardHighlight?: (cardId: string) => void;
  /** Called to scroll to and highlight a column (state lives in Production.tsx) */
  scrollToAndHighlightColumn?: (columnId: string) => void;
  /** Called when planning card should be cleared */
  onPlanningCardClear?: () => void;
  /** Navigate function from react-router */
  navigate?: (path: string) => void;
  /** Called when schedule column expanded state should change */
  onScheduleColumnExpandedChange?: (expanded: boolean) => void;
  /** Called when scheduling card should be cleared */
  onSchedulingCardClear?: () => void;
}

// ─── Backfill stage completions for existing cards ─────────────────────

const backfillStageCompletions = (card: ProductionCard): ProductionCard => {
  if (card.stageCompletions) return card;
  const colIdx = COLUMN_ORDER.indexOf(card.columnId);
  return {
    ...card,
    stageCompletions: {
      ideate: true,
      scriptAndConcept: colIdx >= 1,
      toFilm: colIdx >= 2,
      toEdit: colIdx >= 3,
      toSchedule: colIdx >= 4 || !!card.scheduledDate,
    },
  };
};

// ─── getInitialColumns (runs before hook, at module level) ─────────────

export const getInitialColumns = (): KanbanColumn[] => {
  const savedData = getString(StorageKeys.productionKanban);
  if (savedData) {
    try {
      const savedColumns = JSON.parse(savedData);
      return defaultColumns.map(defaultCol => {
        const savedCol = savedColumns.find((sc: KanbanColumn) => sc.id === defaultCol.id);
        return {
          ...defaultCol,
          cards: (savedCol?.cards || []).map(backfillStageCompletions),
        };
      });
    } catch (error) {
      console.error("Failed to load production data:", error);
    }
  }
  return defaultColumns;
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useProductionBoard(
  { userId }: UseProductionBoardParams,
  callbacks: UseProductionBoardCallbacks = {},
) {
  // ── Column state & persistence ────────────────────────────────────────
  const [columns, setColumns] = useState<KanbanColumn[]>(getInitialColumns);
  const prevColumnsRef = useRef<KanbanColumn[] | null>(null);
  const supabaseReadyRef = useRef(false);

  // ── Archive state ─────────────────────────────────────────────────────
  const [archivedCards, setArchivedCards] = useState<ProductionCard[]>(() => {
    const saved = getString(StorageKeys.archivedContent);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [lastArchivedCard, setLastArchivedCard] = useState<{ card: ProductionCard; sourceColumnId: string } | null>(null);

  // ── Drag-drop state ───────────────────────────────────────────────────
  const [draggedCard, setDraggedCard] = useState<ProductionCard | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ columnId: string; index: number } | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [draggedOverCardId, setDraggedOverCardId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ columnId: string; index: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // ── Planned → Scheduled dialog (used by drag-drop) ────────────────────
  const [showPlannedToScheduledDialog, setShowPlannedToScheduledDialog] = useState(false);
  const [pendingScheduleMove, setPendingScheduleMove] = useState<{
    card: ProductionCard;
    dropPosition: { columnId: string; index: number };
    sourceColumnId: string;
  } | null>(null);

  // ── Skip-column nudge dialog (used by drag-drop) ─────────────────────
  const [showSkipColumnDialog, setShowSkipColumnDialog] = useState(false);
  const [pendingSkipMove, setPendingSkipMove] = useState<{
    card: ProductionCard;
    sourceColumnId: string;
    targetColumnId: string;
    dropPosition: { columnId: string; index: number };
    skippedColumnIds: string[];
  } | null>(null);

  // ── Basic Card CRUD refs ──────────────────────────────────────────────
  const deletedCardRef = useRef<{ card: ProductionCard; columnId: string; index: number } | null>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS — Column persistence
  // ═══════════════════════════════════════════════════════════════════════

  // Load production cards from Supabase on mount (with localStorage migration)
  useEffect(() => {
    if (!userId) return;
    getUserProductionCards(userId)
      .then((cards) => {
        if (cards.length === 0) {
          // Supabase is empty — migrate any existing localStorage cards up
          const localData = getString(StorageKeys.productionKanban);
          if (localData) {
            try {
              const localColumns: KanbanColumn[] = JSON.parse(localData);
              const allLocalCards = localColumns.flatMap(col => col.cards);
              if (allLocalCards.length > 0) {
                console.log(`Migrating ${allLocalCards.length} cards from localStorage to Supabase`);
                allLocalCards.forEach(card => {
                  upsertProductionCard(userId!, card).catch(err =>
                    console.error('Migration upsert failed:', err)
                  );
                });
                prevColumnsRef.current = localColumns;
                supabaseReadyRef.current = true;
                return; // keep existing local state
              }
            } catch (e) {
              console.error('Failed to parse localStorage for migration:', e);
            }
          }
        }

        const columnsFromSupabase = defaultColumns.map(col => ({
          ...col,
          cards: cards
            .filter(c => c.columnId === col.id)
            .sort((a, b) => (a as any).displayOrder - (b as any).displayOrder)
            .map(backfillStageCompletions),
        }));
        setString(StorageKeys.productionKanban, JSON.stringify(columnsFromSupabase));
        prevColumnsRef.current = columnsFromSupabase;
        supabaseReadyRef.current = true;
        setColumns(columnsFromSupabase);
      })
      .catch((err) => {
        console.error('Failed to load from Supabase, using localStorage fallback:', err);
        supabaseReadyRef.current = true;
      });
  }, [userId]);

  // Save data to localStorage and sync to Supabase whenever columns change
  useEffect(() => {
    setString(StorageKeys.productionKanban, JSON.stringify(columns));
    emit(window, EVENTS.productionKanbanUpdated, columns);

    if (!userId || !supabaseReadyRef.current) {
      prevColumnsRef.current = columns;
      return;
    }

    const prev = prevColumnsRef.current;
    prevColumnsRef.current = columns;

    if (!prev) return;

    const prevCards = new Map(prev.flatMap(col => col.cards).map(c => [c.id, c]));
    const newCards = new Map(columns.flatMap(col => col.cards).map(c => [c.id, c]));

    // Upsert created or updated cards
    for (const [id, newCard] of newCards) {
      const prevCard = prevCards.get(id);
      if (!prevCard || JSON.stringify(newCard) !== JSON.stringify(prevCard)) {
        upsertProductionCard(userId, newCard).catch(err =>
          console.error('Failed to upsert card in Supabase:', err)
        );
      }
    }

    // Delete removed cards
    for (const [id] of prevCards) {
      if (!newCards.has(id)) {
        deleteProductionCard(id).catch(err =>
          console.error('Failed to delete card from Supabase:', err)
        );
      }
    }
  }, [columns, userId]);

  // Listen for column updates from other components (like ExpandedScheduleView calendar)
  useEffect(() => {
    const cleanup = on(window, EVENTS.productionKanbanUpdated, (event) => {
      // Only reload if the event came from a different source (like calendar)
      if (event.detail?.source === 'calendar') {
        const savedData = getString(StorageKeys.productionKanban);
        if (savedData) {
          try {
            const savedColumns = JSON.parse(savedData);
            setColumns(defaultColumns.map(defaultCol => {
              const savedCol = savedColumns.find((sc: KanbanColumn) => sc.id === defaultCol.id);
              return {
                ...defaultCol,
                cards: savedCol?.cards || [],
              };
            }));
          } catch (error) {
            console.error("Failed to reload production data:", error);
          }
        }
      }
    });
    return cleanup;
  }, []);

  // Clean up any cards with empty titles or missing IDs
  useEffect(() => {
    const hasInvalidCards = columns.some(col =>
      col.cards.some(card => !card.id || !card.title || !card.title.trim())
    );

    if (hasInvalidCards) {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          cards: col.cards.filter(card => card.id && card.title && card.title.trim()),
        }))
      );
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS — Archive
  // ═══════════════════════════════════════════════════════════════════════

  // Save archived cards to localStorage when they change
  useEffect(() => {
    setString(StorageKeys.archivedContent, JSON.stringify(archivedCards));
  }, [archivedCards]);

  // Auto-hide undo archive button after 8 seconds
  useEffect(() => {
    if (lastArchivedCard) {
      const timer = setTimeout(() => {
        setLastArchivedCard(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastArchivedCard]);

  // Listen for openArchiveDialog event from toast notifications
  useEffect(() => {
    const cleanup = on(window, EVENTS.openArchiveDialog, () => {
      setIsArchiveDialogOpen(true);
    });
    return cleanup;
  }, []);

  // Listen for contentArchived event from calendar views
  useEffect(() => {
    const cleanup = on(window, EVENTS.contentArchived, (event) => {
      const { card } = event.detail || {};
      if (card) {
        setArchivedCards((prev) => [card, ...prev]);
      }
    });
    return cleanup;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS — Drag-drop
  // ═══════════════════════════════════════════════════════════════════════

  // Initialize drag states to null
  useEffect(() => {
    setDraggedCard(null);
    setDropPosition(null);
    setDraggedOverColumn(null);
  }, []);

  // Clear drop indicators when drag ends
  useEffect(() => {
    if (!draggedCard) {
      setDropPosition(null);
      setDraggedOverColumn(null);
      isDraggingRef.current = false;
    }
  }, [draggedCard]);

  // Global dragend and mouseup listeners as safety net
  useEffect(() => {
    const clearDragState = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setDraggedCard(null);
        setDropPosition(null);
        setDraggedOverColumn(null);
      }
    };

    document.addEventListener('dragend', clearDragState);
    document.addEventListener('mouseup', clearDragState);
    document.addEventListener('drop', clearDragState);

    return () => {
      document.removeEventListener('dragend', clearDragState);
      document.removeEventListener('mouseup', clearDragState);
      document.removeEventListener('drop', clearDragState);
    };
  }, []);

  // Clear drop position when drag ends (safety net)
  useEffect(() => {
    if (!draggedCard && dropPosition) {
      setDropPosition(null);
      setDraggedOverColumn(null);
    }
  }, [draggedCard, dropPosition]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS — Card CRUD
  // ═══════════════════════════════════════════════════════════════════════

  const handleAddCard = useCallback((newCardTitle: string, newCardDescription: string, selectedColumnId: string) => {
    if (!newCardTitle.trim() || !selectedColumnId) return;

    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle,
      description: newCardDescription,
      columnId: selectedColumnId,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColumnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
  }, []);

  const handleUpdateCard = useCallback((editingCard: ProductionCard, newCardTitle: string, newCardDescription: string) => {
    if (!editingCard || !newCardTitle.trim()) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingCard.id
            ? { ...card, title: newCardTitle, description: newCardDescription }
            : card
        ),
      }))
    );
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    // Find the card and its position before deleting
    let deletedCard: ProductionCard | null = null;
    let deletedColumnId: string | null = null;
    let deletedIndex: number = -1;

    columns.forEach((col) => {
      const index = col.cards.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        deletedCard = col.cards[index];
        deletedColumnId = col.id;
        deletedIndex = index;
      }
    });

    if (deletedCard && deletedColumnId !== null) {
      // Store the deleted card info for potential undo
      deletedCardRef.current = {
        card: deletedCard,
        columnId: deletedColumnId,
        index: deletedIndex,
      };

      // Remove the card
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        }))
      );
    }
  }, [columns]);

  const handleToggleComplete = useCallback((cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, isCompleted: !card.isCompleted } : card
        ),
      }))
    );
  }, []);

  const handleTogglePin = useCallback((cardId: string) => {
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
            const newPinnedState = !card.isPinned;

            // Check if trying to pin and already at max
            if (newPinnedState) {
              const currentPinnedCount = prev.reduce((count, c) =>
                count + c.cards.filter(card => card.isPinned).length, 0
              );

              if (currentPinnedCount >= 5) {
                toast.error("Maximum reached", {
                  description: "You can only pin up to 5 content cards"
                });
                return card;
              }

              toast.success("Pinned to dashboard", {
                description: "This content will appear in 'Next to Work On'",
                action: {
                  label: "Go to Dashboard",
                  onClick: () => callbacks.navigate?.("/")
                }
              });
            } else {
              toast.success("Unpinned", {
                description: "Content removed from dashboard"
              });
            }

            return { ...card, isPinned: newPinnedState };
          }
          return card;
        }),
      }));

      return newColumns;
    });
  }, [callbacks.navigate]);

  const handleSetPlannedDate = useCallback((cardId: string, date: Date | undefined) => {
    if (!date) {
      // Clear the planned date
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? { ...card, plannedDate: undefined, plannedColor: undefined }
              : card
          ),
        }))
      );
      toast.success("Planning removed");
    } else {
      // Set the planned date
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? { ...card, plannedDate: date.toISOString(), plannedColor: 'violet' as const }
              : card
          ),
        }))
      );
      toast.success("Idea planned", {
        description: `Planned for ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }
    callbacks.onPlanningCardClear?.();
  }, [callbacks.onPlanningCardClear]);

  const handleScheduleContent = useCallback((cardId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Extract time from the date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Calculate end time (1 hour later)
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                schedulingStatus: 'scheduled' as const,
                scheduledDate: dateString,
                scheduledStartTime: startTime,
                scheduledEndTime: endTime,
                stageCompletions: { ...(card.stageCompletions || DEFAULT_STAGE_COMPLETIONS), toSchedule: true },
              }
            : card
        ),
      }))
    );
  }, []);

  const handleUnscheduleContent = useCallback((cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                schedulingStatus: 'to-schedule' as const,
                scheduledDate: undefined,
                scheduledStartTime: undefined,
                scheduledEndTime: undefined,
                stageCompletions: { ...(card.stageCompletions || DEFAULT_STAGE_COMPLETIONS), toSchedule: false },
              }
            : card
        ),
      }))
    );
  }, []);

  const handleUpdateScheduledColor = useCallback((cardId: string, color: 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage') => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? { ...card, scheduledColor: color }
            : card
        ),
      }))
    );
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS — Archive
  // ═══════════════════════════════════════════════════════════════════════

  const handleDeleteArchivedContent = useCallback((card: ProductionCard) => {
    setArchivedCards((prev) => prev.filter((c) => c.id !== card.id));
  }, []);

  const handleRepurposeContent = useCallback((card: ProductionCard) => {
    const newCardId = `card-${Date.now()}`;
    const repurposedCard: ProductionCard = {
      id: newCardId,
      title: card.title,
      hook: card.hook,
      script: card.script,
      platforms: card.platforms,
      formats: card.formats,
      customVideoFormats: card.customVideoFormats,
      customPhotoFormats: card.customPhotoFormats,
      columnId: 'ideate',
      status: 'to-start' as const,
      isCompleted: false,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate'
          ? { ...col, cards: [repurposedCard, ...col.cards] }
          : col
      )
    );

    // Highlight the newly repurposed card (via callback — state lives in Production.tsx)
    callbacks.onRepurposedCardHighlight?.(newCardId);

    toast.success("Content repurposed!", {
      description: "A copy has been added to Bank of Ideas"
    });
  }, [callbacks.onRepurposedCardHighlight]);

  const handleRestoreContent = useCallback((card: ProductionCard) => {
    // Remove from archived cards
    setArchivedCards((prev) => prev.filter((c) => c.id !== card.id));

    // Create restored card for to-schedule column
    // Clear scheduling properties so it shows as unscheduled in the column
    const restoredCard: ProductionCard = {
      ...card,
      columnId: 'to-schedule',
      scheduledDate: undefined,
      schedulingStatus: 'to-schedule',
    };
    // Remove archivedAt which is a dynamic property
    delete (restoredCard as any).archivedAt;

    // Add to to-schedule column
    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'to-schedule'
          ? { ...col, cards: [restoredCard, ...col.cards] }
          : col
      )
    );

    // Clear the last archived card state if it matches
    if (lastArchivedCard?.card.id === card.id) {
      setLastArchivedCard(null);
    }

    toast.success("Content restored!", {
      description: "Moved back to To Schedule"
    });
  }, [lastArchivedCard]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS — Drag-drop
  // ═══════════════════════════════════════════════════════════════════════

  const handleDragStart = useCallback((e: React.DragEvent, card: ProductionCard) => {
    isDraggingRef.current = true;
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setDraggedCard(null);
    setDraggedOverColumn(null);
    setDropPosition(null);
    setDropIndicator(null);
  }, []);

  const handleCardDragOver = useCallback((e: React.DragEvent, columnId: string, cardIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Check ref first (synchronous) to prevent late events after drop
    if (!isDraggingRef.current || !draggedCard) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertIndex = e.clientY < midpoint ? cardIndex : cardIndex + 1;

    // Only update state if position actually changed
    if (dropPosition?.columnId !== columnId || dropPosition?.index !== insertIndex) {
      setDropPosition({ columnId, index: insertIndex });
      setDraggedOverColumn(columnId);
    }
  }, [draggedCard, dropPosition]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Check ref first (synchronous) to prevent late events after drop
    if (!isDraggingRef.current || !draggedCard) return;

    setDraggedOverColumn(columnId);

    // Handle archive zone specially (not a real column)
    if (columnId === "posted") {
      setDropPosition({ columnId: "posted", index: 0 });
      return;
    }

    // If dragging over empty space in column, set position to end
    const column = columns.find(col => col.id === columnId);
    if (column) {
      const validCards = column.cards.filter(c => c.title && c.title.trim());
      setDropPosition({ columnId, index: validCards.length });
    }
  }, [draggedCard, columns]);

  const handleDragLeave = useCallback(() => {
    setDraggedOverColumn(null);
    setDropPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    // Immediately mark drag as ended (synchronous)
    isDraggingRef.current = false;

    // Always clear drop indicators immediately
    setDropPosition(null);
    setDraggedOverColumn(null);

    if (!draggedCard || !dropPosition) {
      setDraggedCard(null);
      return;
    }

    // Save the drop position before clearing state
    const savedDropPosition = { ...dropPosition };
    const actualTargetColumnId = savedDropPosition.columnId;

    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === draggedCard.id)
    );
    const sourceColumnId = sourceColumn?.id;

    if (!sourceColumn) {
      setDraggedCard(null);
      return;
    }

    // Prevent moving cards back to Ideate from other columns
    if (actualTargetColumnId === "ideate" && sourceColumnId !== "ideate") {
      toast.error("Content cannot be moved back to Ideation", {
        description: "Once content moves forward in your workflow, it stays on that path. Start fresh with a new idea instead.",
      });
      setDraggedCard(null);
      return;
    }

    // Check if moving a card with planned date to "to-schedule" column
    if (actualTargetColumnId === "to-schedule" && draggedCard.plannedDate && sourceColumnId !== "to-schedule") {
      // Store the pending move and show the dialog
      setPendingScheduleMove({
        card: draggedCard,
        dropPosition: savedDropPosition,
        sourceColumnId: sourceColumnId!,
      });
      setShowPlannedToScheduledDialog(true);
      setDraggedCard(null);
      return;
    }

    // Handle archiving when dropped on Posted column
    if (actualTargetColumnId === "posted") {
      const cardToArchive = {
        ...draggedCard,
        columnId: "posted",
        isPinned: false,
        archivedAt: new Date().toISOString()
      };

      // Store for undo
      const undoInfo = { card: draggedCard, sourceColumnId: sourceColumnId! };
      setLastArchivedCard(undoInfo);

      // Remove from source column
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== draggedCard.id),
        }))
      );

      // Add to archived cards
      setArchivedCards((prev) => [cardToArchive, ...prev]);
      setDraggedCard(null);
      return;
    }

    // Detect column skipping (only for forward moves across >1 column)
    const sourceIdx = COLUMN_ORDER.indexOf(sourceColumnId!);
    const targetIdx = COLUMN_ORDER.indexOf(actualTargetColumnId);
    if (sourceIdx >= 0 && targetIdx >= 0 && targetIdx - sourceIdx > 1) {
      const skippedColumnIds = COLUMN_ORDER.slice(sourceIdx + 1, targetIdx);
      setPendingSkipMove({
        card: draggedCard,
        sourceColumnId: sourceColumnId!,
        targetColumnId: actualTargetColumnId,
        dropPosition: savedDropPosition,
        skippedColumnIds,
      });
      setShowSkipColumnDialog(true);
      setDraggedCard(null);
      return;
    }

    executeColumnMove(draggedCard, sourceColumnId!, actualTargetColumnId, savedDropPosition);
    setDraggedCard(null);
  }, [draggedCard, dropPosition, columns]);

  // Reusable column move logic (used by handleDrop and skip-column confirmation)
  const executeColumnMove = useCallback((
    card: ProductionCard,
    sourceColId: string,
    targetColId: string,
    pos: { columnId: string; index: number },
  ) => {
    const isSameColumn = sourceColId === targetColId;

    const updatedColumns = columns.map((column) => {
      const filterCard = (c: ProductionCard) =>
        c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea');

      if (column.id === sourceColId && isSameColumn) {
        const filtered = column.cards.filter(filterCard);
        const draggedIndex = filtered.findIndex((c) => c.id === card.id);
        if (draggedIndex === -1) return column;
        const withoutDragged = filtered.filter((c) => c.id !== card.id);
        let actualDropIndex = pos.index;
        if (actualDropIndex > draggedIndex) actualDropIndex--;
        withoutDragged.splice(actualDropIndex, 0, { ...card, columnId: column.id, lastUpdated: new Date().toISOString() });
        return { ...column, cards: withoutDragged };
      } else if (column.id === sourceColId) {
        return { ...column, cards: column.cards.filter((c) => c.id !== card.id) };
      } else if (column.id === targetColId) {
        const filtered = column.cards.filter(filterCard);
        let cardToAdd = { ...card, columnId: column.id, lastUpdated: new Date().toISOString() };

        if (column.id === 'shape-ideas' && !card.status) {
          cardToAdd = { ...cardToAdd, status: 'to-start' as const };
        }
        if (column.id === 'to-film') {
          cardToAdd = { ...cardToAdd, status: 'to-start' as const };
        }
        if (column.id === 'posted' && card.isPinned) {
          cardToAdd = { ...cardToAdd, isPinned: false };
          toast.info("Auto-unpinned", { description: "Posted content is removed from your dashboard" });
        }
        if (column.id === 'to-edit') {
          cardToAdd = {
            ...cardToAdd,
            editingChecklist: {
              ...cardToAdd.editingChecklist,
              items: cardToAdd.editingChecklist?.items || [],
              notes: cardToAdd.editingChecklist?.notes || '',
              externalLinks: cardToAdd.editingChecklist?.externalLinks || [],
              status: 'to-start-editing' as const,
            },
          };
        }
        if (column.id === 'to-schedule') {
          cardToAdd = { ...cardToAdd, schedulingStatus: 'to-schedule' as const };
        }
        filtered.splice(pos.index, 0, cardToAdd);
        return { ...column, cards: filtered };
      }
      return column;
    });

    setColumns(updatedColumns);
  }, [columns]);

  // Handle skip-column confirmation
  const handleSkipColumnChoice = useCallback((confirmed: boolean) => {
    setShowSkipColumnDialog(false);
    if (!confirmed || !pendingSkipMove) {
      setPendingSkipMove(null);
      return;
    }
    executeColumnMove(
      pendingSkipMove.card,
      pendingSkipMove.sourceColumnId,
      pendingSkipMove.targetColumnId,
      pendingSkipMove.dropPosition,
    );
    setPendingSkipMove(null);
  }, [pendingSkipMove, executeColumnMove]);

  // Handle the planned-to-scheduled conversion dialog choice
  const handlePlannedToScheduledChoice = useCallback((useAsScheduled: boolean) => {
    if (!pendingScheduleMove) return;

    const { card, dropPosition, sourceColumnId } = pendingScheduleMove;

    setColumns((prev) => {
      return prev.map((column) => {
        if (column.id === sourceColumnId) {
          // Remove from source column
          return {
            ...column,
            cards: column.cards.filter((c) => c.id !== card.id),
          };
        } else if (column.id === "to-schedule") {
          // Add to target column with appropriate scheduling
          const filtered = column.cards.filter(
            (c) => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')
          );

          let cardToAdd: ProductionCard = {
            ...card,
            columnId: "to-schedule",
            schedulingStatus: 'to-schedule' as const,
          };

          if (useAsScheduled && card.plannedDate) {
            // Use the planned date as the scheduled date
            cardToAdd = {
              ...cardToAdd,
              scheduledDate: card.plannedDate,
              schedulingStatus: 'scheduled' as const,
              plannedDate: undefined,
              plannedColor: undefined,
              stageCompletions: { ...(cardToAdd.stageCompletions || DEFAULT_STAGE_COMPLETIONS), toSchedule: true },
            };
          } else {
            // Clear the planned date, let them schedule manually
            cardToAdd = {
              ...cardToAdd,
              plannedDate: undefined,
              plannedColor: undefined,
            };
          }

          filtered.splice(dropPosition.index, 0, cardToAdd);
          return { ...column, cards: filtered };
        }
        return column;
      });
    });

    if (useAsScheduled && card.plannedDate) {
      toast.success("Scheduled!", {
        description: `Scheduled for ${new Date(card.plannedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }

    setShowPlannedToScheduledDialog(false);
    setPendingScheduleMove(null);
  }, [pendingScheduleMove]);

  // ═══════════════════════════════════════════════════════════════════════
  // Return
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // Column state
    columns,
    setColumns,

    // Archive state
    archivedCards,
    setArchivedCards,
    lastArchivedCard,
    setLastArchivedCard,
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,

    // Drag-drop state
    draggedCard,
    setDraggedCard,
    dropIndicator,
    setDropIndicator,
    draggedOverColumn,
    setDraggedOverColumn,
    draggedOverCardId,
    setDraggedOverCardId,
    dropPosition,
    setDropPosition,
    isDraggingRef,

    // Planned → Scheduled dialog
    showPlannedToScheduledDialog,
    setShowPlannedToScheduledDialog,
    pendingScheduleMove,
    setPendingScheduleMove,

    // Refs
    deletedCardRef,
    prevColumnsRef,
    supabaseReadyRef,

    // Card CRUD handlers
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleToggleComplete,
    handleTogglePin,
    handleSetPlannedDate,
    handleScheduleContent,
    handleUnscheduleContent,
    handleUpdateScheduledColor,

    // Archive handlers
    handleDeleteArchivedContent,
    handleRepurposeContent,
    handleRestoreContent,

    // Drag-drop handlers
    handleDragStart,
    handleDragEnd,
    handleCardDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePlannedToScheduledChoice,

    // Skip-column nudge
    showSkipColumnDialog,
    setShowSkipColumnDialog,
    pendingSkipMove,
    handleSkipColumnChoice,
  };
}
