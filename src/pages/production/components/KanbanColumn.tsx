import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb, PenLine, Brain, Camera, Scissors, CalendarDays, Plus, Sparkles, Zap, Send,
} from "lucide-react";
import { KanbanColumn as KanbanColumnType, ProductionCard } from "../types";
import { columnColors, columnAccentColors } from "../utils/productionConstants";
import { useProductionContext } from "@/contexts/ProductionContext";
import { GripVertical, Video, Maximize2 } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";

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
  isTourActive?: boolean;
  tourStepIndex?: number;
}

// Demo cards shown inside the ideate column when the tour is active
const TOUR_DEMO_CARDS = [
  { title: "The one wellness thing nobody talks about", filled: 1 },
  { title: "3 books that changed how I think about money", filled: 1 },
  { title: "What I eat in a day as a creator", filled: 1 },
];

// Demo cards for all other columns during the "big picture" step
const TOUR_TOFILM_CARDS = [
  { title: "Morning routine as a creator", format: "Talking head", platforms: ["youtube", "instagram"], filled: 3 },
];

const TOUR_TOEDIT_CARDS = [
  { title: "My top 5 productivity apps", format: "Screen recording", platforms: ["youtube", "tiktok"], filled: 4 },
];

const TOUR_READYTOPOST_CARDS = [
  { title: "How I plan my content for the week", format: "Voice-over", platforms: ["instagram", "tiktok"], filled: 5 },
  { title: "Unpopular opinions about social media", format: "Talking head", platforms: ["tiktok"], filled: 5 },
];

// Demo cards for shape-ideas column — first 2 ideas with format & platforms
const TOUR_SHAPE_CARDS = [
  { title: "5 mistakes I made when I started posting", format: "Voice-over", platforms: ["instagram", "tiktok"], filled: 2 },
  { title: "How I recover after a long day of work", format: "Talking head", platforms: ["youtube", "instagram"], filled: 2 },
];

const getPlatformIcon = (platform: string) => {
  const cls = "w-3.5 h-3.5 text-[#8B7082]";
  if (platform === "instagram") return <SiInstagram key={platform} className={cls} />;
  if (platform === "tiktok") return <SiTiktok key={platform} className={cls} />;
  if (platform === "youtube") return <SiYoutube key={platform} className={cls} />;
  return null;
};

const TourDemoCard: React.FC<{
  title: string;
  filled: number;
  format?: string;
  platforms?: string[];
}> = ({ title, filled, format, platforms }) => (
  <div className="rounded-[14px] bg-white border border-[rgba(93,63,90,0.06)] py-4 px-3 shadow-[0_2px_8px_rgba(93,63,90,0.05)]">
    <div className="flex items-center gap-2">
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <h3 className="font-medium text-[15px] text-gray-800 leading-[1.4] tracking-[-0.01em]">
        {title}
      </h3>
    </div>
    {format && (
      <div className="flex items-center justify-between mt-2">
        <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
          <Video className="w-3 h-3" />
          {format}
        </span>
        {platforms && platforms.length > 0 && (
          <div className="flex gap-1.5 items-center">
            {platforms.map(getPlatformIcon)}
          </div>
        )}
      </div>
    )}
    <div className="mt-2 pt-2 border-t border-[#E8E2E5]">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 6 }).map((_, j) => (
          <div
            key={j}
            className="w-[6px] h-[6px] rounded-full"
            style={
              j < filled
                ? { backgroundColor: "#612A4F" }
                : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }
            }
          />
        ))}
      </div>
    </div>
  </div>
);

// Annotation label for anatomy step
const AnatomyLabel: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
  <span
    className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${className}`}
    style={{ backgroundColor: "#EDE3E8", color: "#612A4F", border: "1px solid #C4B5C9" }}
  >
    {text}
  </span>
);

// Anatomy card with labels — rendered on the actual card in the column
const TourAnatomyCard: React.FC = () => (
  <div className="relative overflow-visible" style={{ zIndex: 10 }}>
    {/* The card itself */}
    <div className="rounded-[14px] bg-white border border-[rgba(93,63,90,0.06)] p-3 shadow-[0_4px_20px_rgba(93,63,90,0.12)] overflow-visible">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
        <h3 className="font-medium text-[15px] text-gray-800 leading-[1.4] tracking-[-0.01em] flex-1">
          How I recover after a long day of work
        </h3>
        <Maximize2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
          <Video className="w-3 h-3" />
          Talking head
        </span>
        <div className="flex gap-1.5 items-center">
          <SiInstagram className="w-3.5 h-3.5 text-[#8B7082]" />
          <SiTiktok className="w-3.5 h-3.5 text-[#8B7082]" />
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-[#E8E2E5]">
        <div className="flex items-center gap-1.5">
          {[true, true, false, false, false, false].map((filled, i) => (
            <div
              key={i}
              className="w-[6px] h-[6px] rounded-full"
              style={filled ? { backgroundColor: "#612A4F" } : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Labels */}
    {/* Drag — left */}
    <div className="absolute flex items-center gap-0" style={{ top: 9, left: -90 }}>
      <AnatomyLabel text="Drag" />
      <div style={{ width: 50 }} className="h-px bg-[#C4B5C9]" />
      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-[#C4B5C9]" />
    </div>

    {/* Click to open — right side */}
    <div className="absolute flex items-center gap-0" style={{ top: 13, right: -214 }}>
      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[6px] border-r-[#C4B5C9]" />
      <div style={{ width: 65 }} className="h-px bg-[#C4B5C9]" />
      <AnatomyLabel text="Click and open the card" className="max-w-[220px]" />
    </div>

    {/* Content format — left */}
    <div className="absolute flex items-center gap-0" style={{ bottom: 33, left: -160 }}>
      <AnatomyLabel text="Content format" />
      <div style={{ width: 60 }} className="h-px bg-[#C4B5C9]" />
      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-[#C4B5C9]" />
    </div>

    {/* Platforms — below right */}
    <div className="absolute flex flex-col items-center gap-0" style={{ bottom: -93, right: -45 }}>
      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#C4B5C9]" />
      <div className="w-px bg-[#C4B5C9]" style={{ height: 60 }} />
      <AnatomyLabel text="Platforms where you'll post the content" className="max-w-[150px] text-center" />
    </div>

    {/* Steps completed — below left */}
    <div className="absolute flex flex-col items-center gap-0" style={{ bottom: -95, left: -15 }}>
      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#C4B5C9]" />
      <div className="w-px bg-[#C4B5C9]" style={{ height: 38 }} />
      <AnatomyLabel text="Steps completed in the creation process" className="max-w-[120px] text-center" />
    </div>
  </div>
);

const TourIdeateDemoCards: React.FC = () => (
  <>
    {TOUR_DEMO_CARDS.map((card, i) => (
      <TourDemoCard key={i} title={card.title} filled={card.filled} />
    ))}
  </>
);

const TourShapeDemoCards: React.FC<{ isActive: boolean; showStatic: boolean }> = ({ isActive, showStatic }) => (
  <div className="overflow-visible">
    {/* First card — fully inside the column */}
    <TourDemoCard
      title={TOUR_SHAPE_CARDS[0].title}
      filled={TOUR_SHAPE_CARDS[0].filled}
      format={TOUR_SHAPE_CARDS[0].format}
      platforms={TOUR_SHAPE_CARDS[0].platforms}
    />
    {/* Second card */}
    {showStatic ? (
      /* Static version — visible for the "open card" step */
      <div className="mt-3" data-tour="shape-card-2">
        <TourDemoCard
          title={TOUR_SHAPE_CARDS[1].title}
          filled={TOUR_SHAPE_CARDS[1].filled}
          format={TOUR_SHAPE_CARDS[1].format}
          platforms={TOUR_SHAPE_CARDS[1].platforms}
        />
      </div>
    ) : (
      /* Animated version — loops sliding in from the left */
      <motion.div
        className="relative mt-3"
        animate={isActive ? {
          x: [-180, -60, -60, -180],
          opacity: [0, 1, 1, 0],
        } : { x: -180, opacity: 0 }}
        transition={isActive ? {
          duration: 3,
          times: [0, 0.3, 0.7, 1],
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
        } : { duration: 0 }}
      >
        <TourDemoCard
          title={TOUR_SHAPE_CARDS[1].title}
          filled={TOUR_SHAPE_CARDS[1].filled}
          format={TOUR_SHAPE_CARDS[1].format}
          platforms={TOUR_SHAPE_CARDS[1].platforms}
        />
      </motion.div>
    )}
  </div>
);

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
  isTourActive = false,
  tourStepIndex = -1,
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
      className={`flex-shrink-0 w-[340px] ${isTourActive && (column.id === 'shape-ideas' || tourStepIndex === 3) ? 'overflow-visible' : ''}`}
      data-tour={`column-${column.id}`}
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
          isTourActive && tourStepIndex === 3 && "overflow-visible",
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
          ...(isTourActive ? {
            background: 'linear-gradient(180deg, #FAF7F5 0%, #F3EEEB 100%)',
            borderRadius: 20,
            ...(tourStepIndex === 1 ? {
              border: '2px solid rgba(97, 42, 79, 0.35)',
            } : {}),
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
          const realCards = column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')).length > 0;
          const hasCards = realCards || (isTourActive && (tourStepIndex === 1 || tourStepIndex === 2 || tourStepIndex === 3 || column.id === 'ideate' || column.id === 'shape-ideas'));
          return (
            <div className={`flex-1 ${isTourActive && (column.id === 'shape-ideas' || tourStepIndex === 3) ? 'overflow-visible' : 'overflow-y-auto'} px-3 pt-3 pb-3 space-y-3 hide-scrollbar hover:hide-scrollbar relative rounded-[16px]`} style={{ minHeight: 'calc(100vh - 120px)', border: hasCards ? '1.5px solid rgba(180, 168, 175, 0.2)' : '1.5px dashed rgba(180, 168, 175, 0.25)', backgroundColor: hasCards ? 'rgba(255, 252, 250, 0.7)' : 'rgba(255, 255, 255, 0.1)' }}>
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

                  // Anatomy inline step (step 3) — show anatomy card on shape-ideas, faded cards elsewhere
                  if (isTourActive && tourStepIndex === 3) {
                    if (column.id === 'shape-ideas') {
                      return (
                        <div className="overflow-visible">
                          <div style={{ opacity: 0.35 }}>
                            <TourDemoCard title={TOUR_SHAPE_CARDS[0].title} filled={TOUR_SHAPE_CARDS[0].filled} format={TOUR_SHAPE_CARDS[0].format} platforms={TOUR_SHAPE_CARDS[0].platforms} />
                          </div>
                          <div className="mt-3">
                            <TourAnatomyCard />
                          </div>
                        </div>
                      );
                    }
                    const cards =
                      column.id === 'ideate' ? TOUR_DEMO_CARDS :
                      column.id === 'to-film' ? TOUR_TOFILM_CARDS :
                      column.id === 'to-edit' ? TOUR_TOEDIT_CARDS :
                      column.id === 'ready-to-post' ? TOUR_READYTOPOST_CARDS : [];
                    return (
                      <div style={{ opacity: 0.35 }}>
                        {cards.map((card, i) => (
                          <div key={i} className={i > 0 ? "mt-3" : ""}>
                            <TourDemoCard title={card.title} filled={card.filled} format={(card as any).format} platforms={(card as any).platforms} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  // Big picture step (step 1) & opening card step (step 2) — show faded demo cards in ALL columns
                  if (isTourActive && (tourStepIndex === 1 || tourStepIndex === 2)) {
                    const cards =
                      column.id === 'ideate' ? TOUR_DEMO_CARDS :
                      column.id === 'shape-ideas' ? TOUR_SHAPE_CARDS :
                      column.id === 'to-film' ? TOUR_TOFILM_CARDS :
                      column.id === 'to-edit' ? TOUR_TOEDIT_CARDS :
                      column.id === 'ready-to-post' ? TOUR_READYTOPOST_CARDS : [];

                    // On step 2, the second ideate card gets purple outline + full opacity
                    if (tourStepIndex === 2 && column.id === 'ideate') {
                      return (
                        <>
                          {cards.map((card, i) => (
                            <div
                              key={i}
                              className={i > 0 ? "mt-3" : ""}
                              style={{ opacity: i === 1 ? 1 : 0.55 }}
                              {...(i === 1 ? { 'data-tour': 'ideate-card-2' } : {})}
                            >
                              <div style={i === 1 ? { border: '2px solid rgba(97, 42, 79, 0.5)', borderRadius: 14 } : {}}>
                                <TourDemoCard title={card.title} filled={card.filled} format={(card as any).format} platforms={(card as any).platforms} />
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    }

                    return (
                      <div style={{ opacity: 0.55 }}>
                        {cards.map((card, i) => (
                          <div key={i} className={i > 0 ? "mt-3" : ""}>
                            <TourDemoCard title={card.title} filled={card.filled} format={(card as any).format} platforms={(card as any).platforms} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (isTourActive && column.id === 'ideate') {
                    return <TourIdeateDemoCards />;
                  }
                  if (isTourActive && column.id === 'shape-ideas') {
                    return <TourShapeDemoCards isActive={tourStepIndex === 5} showStatic={tourStepIndex === 2} />;
                  }

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
                                {column.id === 'ideate' ? <>Your starting point.<br /><span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>Add ideas</span> or <span className="font-bold text-[15px]" style={{ color: columnAccentColors[column.id]?.accent, fontFamily: "'Playfair Display', serif" }}>let MegAI help</span></> :
                                 column.id === 'shape-ideas' ? <>Drag ideas here when<br />they need a <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>script</span> or <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>concept</span></> :
                                 column.id === 'to-film' ? <>Drag content here when it's scripted and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>ready to film</span> or <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>photograph</span></> :
                                 column.id === 'to-edit' ? <>Drag content here once it's been filmed and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>needs editing</span></> :
                                 column.id === 'to-schedule' ? <>Drag finished content here to <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>pick a posting date</span></> :
                                 column.id === 'ready-to-post' ? <>Content that's fully done and<br /><span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>ready to be scheduled</span> and <span className="font-bold text-[15px]" style={{ color: '#4A3D45', fontFamily: "'Playfair Display', serif" }}>go live</span></> :
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

              {/* Buttons Area - right below cards (hidden on anatomy step) */}
              {!(isTourActive && (tourStepIndex === 1 || tourStepIndex === 2 || tourStepIndex === 3)) && column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')).length > 0 && (
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
