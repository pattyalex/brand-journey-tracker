import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import {
  Lightbulb, PenLine, Brain, Camera, Scissors, CalendarDays, Plus, Sparkles, Zap, Send,
} from "lucide-react";
import { KanbanColumn as KanbanColumnType, ProductionCard } from "../types";
import { columnColors, columnAccentColors } from "../utils/productionConstants";
import { useProductionContext } from "@/contexts/ProductionContext";
import InlineCardInput from "./InlineCardInput";
import ProductionCardItem from "./ProductionCardItem";

// Icon component mapping for column headers
const columnHeaderIcons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  ideate: Lightbulb,
  "shape-ideas": PenLine,
  "to-film": Camera,
  "to-edit": Scissors,
  "ready-to-post": Send,
  "to-schedule": CalendarDays,
};

// Icon component mapping for empty states
const emptyStateIconComponents: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  ideate: Lightbulb,
  "shape-ideas": PenLine,
  "to-film": Camera,
  "to-edit": Scissors,
  "ready-to-post": Send,
  "to-schedule": CalendarDays,
};

export interface KanbanColumnProps {
  column: KanbanColumnType;
  index: number;
  // Highlight state (Production.tsx local)
  highlightedColumn: string | null;
  recentlyRepurposedCardId: string | null;
  highlightedUnscheduledCardId: string | null;
  planningCardId: string | null;
  // Inline editing state (Production.tsx local)
  editingCardId: string | null;
  addingToColumn: string | null;
  // Refs (Production.tsx local)
  columnRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  editInputRef: React.RefObject<HTMLInputElement>;
  clickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  textRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  // Card action handlers (Production.tsx local)
  handleOpenScriptEditor: (card: ProductionCard) => void;
  handleOpenStoryboard: (card: ProductionCard) => void;
  handleOpenIdeateCardEditor: (card: ProductionCard) => void;
  handleOpenEditChecklist: (card: ProductionCard) => void;
  handleOpenContentFlow: (card: ProductionCard, startStep?: number) => void;
  handleStartEditingCard: (cardId: string, columnId: string, trigger: 'click' | 'doubleclick', clickEvent?: React.MouseEvent) => void;
  handleSaveCardEdit: (cardId: string, newValue: string) => void;
  handleCreateInlineCard: (columnId: string, title: string) => void;
  handleStartAddingCard: (columnId: string) => void;
  handleCancelAddingCard: () => void;
  // State setters (Production.tsx local)
  setEditingCardId: (id: string | null) => void;
  setPlanningCardId: (id: string | null) => void;
  setSchedulingCard: (card: ProductionCard) => void;
  setIsScheduleColumnExpanded: (expanded: boolean) => void;
  setSelectedIdeateCard: (card: ProductionCard | null) => void;
  setIsIdeateDialogOpen: (open: boolean) => void;
  setAddingToColumn: (columnId: string | null) => void;
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  index,
  highlightedColumn,
  recentlyRepurposedCardId,
  highlightedUnscheduledCardId,
  planningCardId,
  editingCardId,
  addingToColumn,
  columnRefs,
  editInputRef,
  clickTimeoutRef,
  textRefs,
  handleOpenScriptEditor,
  handleOpenStoryboard,
  handleOpenIdeateCardEditor,
  handleOpenEditChecklist,
  handleOpenContentFlow,
  handleStartEditingCard,
  handleSaveCardEdit,
  handleCreateInlineCard,
  handleStartAddingCard,
  handleCancelAddingCard,
  setEditingCardId,
  setPlanningCardId,
  setSchedulingCard,
  setIsScheduleColumnExpanded,
  setSelectedIdeateCard,
  setIsIdeateDialogOpen,
  setAddingToColumn,
}) => {
  const navigate = useNavigate();
  // Board-level state from context (eliminates prop drilling)
  const {
    columns,
    setColumns,
    draggedCard,
    draggedOverColumn,
    dropPosition,
    isDraggingRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleCardDragOver,
    handleDeleteCard,
    handleSetPlannedDate,
  } = useProductionContext();
  const colors = columnColors[column.id];

  return (
    <div
      key={column.id}
      className="flex-shrink-0 w-[340px]"
      onDragOver={(e) => handleDragOver(e, column.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, column.id)}
    >
      <div
        ref={(el) => {
          if (el) columnRefs.current.set(column.id, el);
        }}
        className={cn(
          "flex flex-col transition-all duration-300 max-h-[calc(100vh-48px)] rounded-[20px]",
          draggedOverColumn === column.id && draggedCard
            ? column.id === "ideate" && columns.find(col => col.cards.some(c => c.id === draggedCard.id))?.id !== "ideate"
              ? "opacity-60"
              : ""
            : "",
          highlightedColumn === column.id ? "shadow-xl scale-[1.02]" : ""
        )}
        style={{
          ...(draggedOverColumn === column.id && draggedCard ? {
            background: 'rgba(139, 112, 130, 0.08)',
            boxShadow: '0 0 40px rgba(139, 112, 130, 0.2), inset 0 0 0 1px rgba(139, 112, 130, 0.15)',
          } : {}),
        }}
      >
        {/* Column Header */}
        <div className="flex-shrink-0 px-3 py-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Column Icon - same color as header text */}
            {column.id === 'ideate' && <Lightbulb className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            {column.id === 'shape-ideas' && <PenLine className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            {column.id === 'to-film' && <Camera className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            {column.id === 'to-edit' && <Scissors className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            {column.id === 'ready-to-post' && <Send className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            {column.id === 'to-schedule' && <CalendarDays className="w-5 h-5 text-[#612A4F]" style={{ strokeWidth: 1.5 }} />}
            <h2 className="text-[18px] tracking-[0.02em] text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              {column.title.includes('&')
                ? column.title.split('&').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <span style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontWeight: 400 }}>&amp;</span>}
                    </React.Fragment>
                  ))
                : column.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Cards Area - beige background */}
        {(() => {
          const hasCards = column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')).length > 0;
          return (
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-3 hide-scrollbar hover:hide-scrollbar relative rounded-[16px]" style={{ minHeight: 'calc(100vh - 120px)', border: hasCards ? '1.5px solid rgba(180, 168, 175, 0.2)' : '1.5px dashed rgba(180, 168, 175, 0.25)', backgroundColor: hasCards ? 'rgba(255, 252, 250, 0.7)' : 'rgba(255, 255, 255, 0.1)' }}>
              {/* Not Allowed Overlay for Ideate Column */}
              <AnimatePresence>
                {(() => {
                  // Compute filtered and sorted cards
                  const filteredSortedCards = column.cards.filter(card => {
                    // Basic filter: has id, has title, not empty, not add quick idea
                    const basicFilter = card.id && card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea');
                    // For Ideate column, also filter out calendar-only content (Stories, quick posts)
                    if (column.id === 'ideate' && card.calendarOnly) {
                      return false;
                    }
                    return basicFilter;
                  }).sort((a, b) => {
                    // Sort: pinned first, then unscheduled before scheduled
                    if (a.isPinned !== b.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
                    // Then sort scheduled cards to the bottom
                    if (column.id === 'to-schedule') {
                      const aScheduled = !!a.scheduledDate;
                      const bScheduled = !!b.scheduledDate;
                      if (aScheduled !== bScheduled) return aScheduled ? 1 : -1;
                    }
                    return 0;
                  });

                  // Show empty state if no cards
                  if (filteredSortedCards.length === 0 && !draggedCard) {
                    const IconComponent = emptyStateIconComponents[column.id] || Lightbulb;

                    return (
                      <div className="flex flex-col items-center justify-start pt-3 px-4 h-full min-h-[380px]">
                        {/* Icon and text - hidden for ideate when input is showing */}
                        {!(column.id === 'ideate' && addingToColumn === 'ideate') && (
                          <>
                            {/* Minimal empty state — icon + styled text */}
                            <div className="flex flex-col items-center text-center px-3 mb-4">
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                style={{
                                  backgroundColor: columnAccentColors[column.id]?.accentBg || 'rgba(139, 112, 130, 0.08)',
                                }}
                              >
                                <IconComponent
                                  className="w-5 h-5"
                                  style={{ color: columnAccentColors[column.id]?.accent || '#8B7082', strokeWidth: 1.5 }}
                                />
                              </div>

                              <p className="text-[13px] leading-[1.9]" style={{ color: '#9B8F94' }}>
                                {column.id === 'ideate' ? <>Your starting point <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>Add ideas</span> or let <span className="font-bold text-[15px]" style={{ color: columnAccentColors[column.id]?.accent, fontFamily: "'Playfair Display', serif" }}>MegAI brainstorm</span> for you</> :
                                 column.id === 'shape-ideas' ? <>Drag ideas here when<br />they need a <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>script</span> or <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>concept</span></> :
                                 column.id === 'to-film' ? <>Drag content here when it's scripted and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>ready to film</span> or <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>photograph</span></> :
                                 column.id === 'to-edit' ? <>Drag content here once it's been filmed and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>needs editing</span></> :
                                 column.id === 'to-schedule' ? <>Drag finished content here to <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>pick a posting date</span></> :
                                 column.id === 'ready-to-post' ? <>Content that's fully done and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>ready to be scheduled</span> and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>go live</span></> :
                                 'Drag content here when ready.'}
                              </p>
                            </div>
                          </>
                        )}

                        {/* Ready to Post — Go to Calendar button */}
                        {column.id === 'ready-to-post' && (
                          <button
                            onClick={() => navigate('/task-board?view=month&mode=content')}
                            className="group/btn w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                            style={{
                              backgroundColor: '#8B7082',
                              color: 'white',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#7A6272';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#8B7082';
                            }}
                          >
                            <CalendarDays className="w-4 h-4" />
                            Schedule on Calendar
                          </button>
                        )}

                        {/* Ideate buttons - Add idea and Brainstorm with MegAI */}
                        {column.id === 'ideate' && (
                          <>
                            {/* Inline input when adding - above buttons */}
                            {addingToColumn === 'ideate' && (
                              <div className="w-full mb-2">
                                <InlineCardInput
                                  onSave={(title) => handleCreateInlineCard('ideate', title)}
                                  onCancel={handleCancelAddingCard}
                                />
                              </div>
                            )}
                            <button
                              onClick={() => setAddingToColumn('ideate')}
                              className="group/btn w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                              style={{
                                backgroundColor: '#8B7082',
                                color: 'white',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#7A6272';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#8B7082';
                              }}
                            >
                              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-200" />
                              Add idea
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIdeateCard(null);
                                setIsIdeateDialogOpen(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13px] font-medium transition-all duration-200 mt-2"
                              style={{
                                color: '#8B7082',
                                backgroundColor: 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(139, 112, 130, 0.1)';
                                e.currentTarget.style.color = '#5A3D52';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6B4F63';
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5" style={{ strokeWidth: 2 }} />
                              Brainstorm with MegAI
                            </button>
                          </>
                        )}

                        {/* Batch Schedule button - only for to-schedule column */}
                        {column.id === 'to-schedule' && (
                          <button
                            onClick={() => setIsScheduleColumnExpanded(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13px] font-medium transition-all duration-200 mt-3"
                            style={{
                              backgroundColor: '#8B7082',
                              color: 'white',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#7A6272';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#8B7082';
                            }}
                          >
                            <CalendarDays className="w-3.5 h-3.5" style={{ strokeWidth: 2 }} />
                            Batch Schedule
                          </button>
                        )}
                      </div>
                    );
                  }

                  // Render cards
                  return filteredSortedCards.map((card, cardIndex) => {
                    const isEditing = editingCardId === card.id;

                    // Find dragged card's current index in this column
                    const filteredCards = column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea'));
                    const draggedCardIndex = draggedCard ? filteredCards.findIndex(c => c.id === draggedCard.id) : -1;

                    // Don't show indicator at or adjacent to the dragged card's original position in the same column
                    const isNearOriginalPosition = draggedCardIndex !== -1 &&
                                                   dropPosition?.columnId === column.id &&
                                                   (dropPosition?.index === draggedCardIndex ||
                                                    dropPosition?.index === draggedCardIndex + 1);

                    const showDropIndicatorBefore = dropPosition?.columnId === column.id &&
                                                     dropPosition?.index === cardIndex &&
                                                     !isNearOriginalPosition;

                    const isDragging = draggedCard !== null;
                    const isThisCardDragged = draggedCard?.id === card.id;

                    return (
                      <ProductionCardItem
                        key={card.id || `fallback-${cardIndex}`}
                        card={card}
                        cardIndex={cardIndex}
                        columnId={column.id}
                        isEditing={isEditing}
                        isThisCardDragged={isThisCardDragged}
                        isDragging={isDragging}
                        showDropIndicatorBefore={showDropIndicatorBefore}
                        recentlyRepurposedCardId={recentlyRepurposedCardId}
                        highlightedUnscheduledCardId={highlightedUnscheduledCardId}
                        planningCardId={planningCardId}
                        editInputRef={editInputRef}
                        clickTimeoutRef={clickTimeoutRef}
                        textRefs={textRefs}
                        handleOpenScriptEditor={handleOpenScriptEditor}
                        handleOpenStoryboard={handleOpenStoryboard}
                        handleOpenIdeateCardEditor={handleOpenIdeateCardEditor}
                        handleOpenEditChecklist={handleOpenEditChecklist}
                        handleOpenContentFlow={handleOpenContentFlow}
                        handleStartEditingCard={handleStartEditingCard}
                        handleSaveCardEdit={handleSaveCardEdit}
                        setEditingCardId={setEditingCardId}
                        setPlanningCardId={setPlanningCardId}
                        setSchedulingCard={setSchedulingCard}
                        setIsScheduleColumnExpanded={setIsScheduleColumnExpanded}
                      />
                    );
                  });
                })()}

                {/* Drop indicator at the end of the column - only show during active drag */}
                {draggedCard && isDraggingRef.current && (() => {
                  const filteredCards = column.cards.filter(card => card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea'));
                  const draggedCardIndex = filteredCards.findIndex(c => c.id === draggedCard.id);
                  const isLastCard = draggedCardIndex !== -1 && draggedCardIndex === filteredCards.length - 1;
                  const shouldShow = dropPosition?.columnId === column.id &&
                                   dropPosition?.index === filteredCards.length &&
                                   !isLastCard;

                  if (!shouldShow) return null;

                  return (
                    <div className="relative h-0">
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-[#A890B8]" />
                    </div>
                  );
                })()}
              </AnimatePresence>

              {/* Buttons Area - right below cards */}
              {column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')).length > 0 && (
                <div className="px-1 pt-2 space-y-2">
                  {addingToColumn === column.id ? (
                    <div key={`inline-input-${column.id}`}>
                      <InlineCardInput
                        onSave={(title) => handleCreateInlineCard(column.id, title)}
                        onCancel={handleCancelAddingCard}
                      />
                    </div>
                  ) : column.id === 'ideate' ? (
                    <button
                      key={`add-button-${column.id}`}
                      onClick={() => setAddingToColumn('ideate')}
                      className="group/btn w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{
                        backgroundColor: '#8B7082',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7A6272';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8B7082';
                      }}
                    >
                      <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-200" />
                      Add idea
                    </button>
                  ) : null}

                  {/* Batch Schedule button - only for to-schedule column */}
                  {column.id === 'to-schedule' && (
                    <div
                      className="group/btn px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer w-full hover:-translate-y-0.5 active:scale-[0.98] bg-[#8B7082] hover:bg-[#7A6272] shadow-sm hover:shadow-md"
                      onClick={() => setIsScheduleColumnExpanded(true)}
                    >
                      <div className="flex items-center justify-center gap-2 text-white">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm font-semibold">Batch Schedule</span>
                      </div>
                    </div>
                  )}

                  {/* Brainstorm with MegAI button - only for ideate column */}
                  {column.id === 'ideate' && (
                    <button
                      onClick={() => {
                        setSelectedIdeateCard(null);
                        setIsIdeateDialogOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[13px] font-medium transition-all duration-200"
                      style={{
                        color: '#8B7082',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 112, 130, 0.1)';
                        e.currentTarget.style.color = '#5A3D52';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#8B7082';
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" style={{ strokeWidth: 2 }} />
                      Brainstorm with MegAI
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default KanbanColumnComponent;
