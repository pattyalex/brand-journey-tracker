import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays, X, Trash2, PenLine, Clapperboard, Scissors,
  Video, Camera, Sparkles, Check, PartyPopper, Layers, Image as ImageIcon, GripVertical,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { ProductionCard } from "../types";
import { useProductionContext } from "@/contexts/ProductionContext";
import ExpandedScheduleView from "./ExpandedScheduleView";
import ProgressDots from "./ProgressDots";

// Platform icon helper - returns icon component for each platform
const getPlatformIcon = (platform: string): React.ReactNode => {
  const lowercased = platform.toLowerCase();
  const iconClass = "w-3.5 h-3.5 text-[#8B7082]";

  if (lowercased.includes("youtube")) return <SiYoutube className={iconClass} />;
  if (lowercased.includes("tiktok") || lowercased === "tt") return <SiTiktok className={iconClass} />;
  if (lowercased.includes("instagram") || lowercased === "ig") return <SiInstagram className={iconClass} />;
  if (lowercased.includes("facebook")) return <SiFacebook className={iconClass} />;
  if (lowercased.includes("linkedin")) return <SiLinkedin className={iconClass} />;
  if (lowercased === "x" || lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) return <RiTwitterXLine className={iconClass} />;
  if (lowercased.includes("threads")) return <RiThreadsLine className={iconClass} />;
  return null;
};

export interface ProductionCardItemProps {
  card: ProductionCard;
  cardIndex: number;
  columnId: string;
  isEditing: boolean;
  isThisCardDragged: boolean;
  isDragging: boolean;
  showDropIndicatorBefore: boolean;
  recentlyRepurposedCardId: string | null;
  highlightedUnscheduledCardId: string | null;
  planningCardId: string | null;
  editInputRef: React.RefObject<HTMLInputElement>;
  clickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  textRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  // Handlers (Production.tsx local)
  handleOpenScriptEditor: (card: ProductionCard) => void;
  handleOpenStoryboard: (card: ProductionCard) => void;
  handleOpenIdeateCardEditor: (card: ProductionCard) => void;
  handleOpenEditChecklist: (card: ProductionCard) => void;
  handleStartEditingCard: (cardId: string, columnId: string, trigger: 'click' | 'doubleclick', clickEvent?: React.MouseEvent) => void;
  handleSaveCardEdit: (cardId: string, newValue: string) => void;
  setEditingCardId: (id: string | null) => void;
  setPlanningCardId: (id: string | null) => void;
  setSchedulingCard: (card: ProductionCard) => void;
  setIsScheduleColumnExpanded: (expanded: boolean) => void;
}

const ProductionCardItem: React.FC<ProductionCardItemProps> = ({
  card,
  cardIndex,
  columnId,
  isEditing,
  isThisCardDragged,
  isDragging,
  showDropIndicatorBefore,
  recentlyRepurposedCardId,
  highlightedUnscheduledCardId,
  planningCardId,
  editInputRef,
  clickTimeoutRef,
  textRefs,
  handleOpenScriptEditor,
  handleOpenStoryboard,
  handleOpenIdeateCardEditor,
  handleOpenEditChecklist,
  handleStartEditingCard,
  handleSaveCardEdit,
  setEditingCardId,
  setPlanningCardId,
  setSchedulingCard,
  setIsScheduleColumnExpanded,
}) => {
  // Board-level state from context (eliminates prop drilling)
  const {
    isDraggingRef,
    draggedCard,
    handleDragStart,
    handleDragEnd,
    handleCardDragOver,
    handleDeleteCard,
    handleSetPlannedDate,
  } = useProductionContext();
  return (
    <React.Fragment key={card.id || `fallback-${cardIndex}`}>
      {/* Drop indicator - only render during active drag */}
      {showDropIndicatorBefore && draggedCard && isDraggingRef.current && (
        <div className="relative h-0">
          <div
            className="absolute inset-x-0 -top-1 h-0.5 rounded-full bg-[#A890B8]"
          />
        </div>
      )}

      <motion.div
        layout={false}
        initial={{ opacity: 1 }}
        animate={{
          opacity: 1,
        }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
        transition={{
          opacity: { duration: 0.05 },
        }}
        draggable={!isEditing}
        onDragStart={(e) => !isEditing && handleDragStart(e, card)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleCardDragOver(e, columnId, cardIndex)}
        onClick={(e) => {
          // Open edit modal for Shape Ideas, Ideate, To Film, To Edit, and To Schedule cards on single click (with delay to detect double-click)
          if ((columnId === "shape-ideas" || columnId === "ideate" || columnId === "to-film" || columnId === "to-edit" || columnId === "to-schedule") && !isEditing) {
            e.stopPropagation();
            // Clear any existing timeout
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
            }
            // Set timeout to open modal after 250ms (if no double-click happens)
            clickTimeoutRef.current = setTimeout(() => {
              if (columnId === "shape-ideas") {
                handleOpenScriptEditor(card);
              } else if (columnId === "to-film") {
                handleOpenStoryboard(card);
              } else if (columnId === "ideate") {
                handleOpenIdeateCardEditor(card);
              } else if (columnId === "to-edit") {
                handleOpenEditChecklist(card);
              } else if (columnId === "to-schedule") {
                setSchedulingCard(card);
                setIsScheduleColumnExpanded(true);
              }
            }, 250);
          }
        }}
        className={cn(
          "group relative",
          "rounded-[14px] bg-white",
          "shadow-[0_2px_8px_rgba(93,63,90,0.05)]",
          "hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)]",
          "border border-[rgba(93,63,90,0.06)]",
          "hover:-translate-y-[3px]",
          "transition-all duration-200",
          columnId === "ideate" ? "py-4 px-3" : "p-3",
          (columnId === "shape-ideas" || columnId === "ideate" || columnId === "to-film" || columnId === "to-edit" || columnId === "to-schedule") && !isEditing ? "cursor-pointer" : (!isEditing && "cursor-grab active:cursor-grabbing"),
          isThisCardDragged ? "opacity-40 scale-[0.98]" : "",
          card.isCompleted && "opacity-60",
          recentlyRepurposedCardId === card.id && "ring-2 ring-emerald-500 ring-offset-2",
          highlightedUnscheduledCardId === card.id && "ring-2 ring-indigo-500 ring-offset-2",
          card.isNew && "ring-1 ring-[#8B7082]"
        )}
      >
        {highlightedUnscheduledCardId === card.id && (
          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
            UNSCHEDULED
          </div>
        )}
        {recentlyRepurposedCardId === card.id && (
          <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
            REPURPOSED
          </div>
        )}
        {/* Scheduled date indicator for to-schedule column */}
        {columnId === 'to-schedule' && card.scheduledDate && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(139, 112, 130, 0.08)', border: '1px solid rgba(139, 112, 130, 0.12)' }}>
              <CalendarDays className="w-3 h-3" style={{ color: '#8B7082', strokeWidth: 1.5 }} />
              <span className="text-[11px] font-medium" style={{ color: '#6B5A63' }}>
                Scheduled: {new Date(card.scheduledDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        )}
        {/* Calendar origin indicator */}
        {card.fromCalendar && !card.scheduledDate && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(155, 107, 158, 0.08)', border: '1px solid rgba(155, 107, 158, 0.12)' }}>
              <CalendarDays className="w-3 h-3" style={{ color: '#9B6B9E', strokeWidth: 1.5 }} />
              <span className="text-[11px] font-normal" style={{ color: '#7A5A7D' }}>
                {card.plannedDate ? `Planned: ${new Date(card.plannedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'From Calendar'}
              </span>
            </div>
          </div>
        )}
        {/* Planned date indicator - clickable to edit */}
        {columnId !== "posted" && columnId !== "to-schedule" && !card.fromCalendar && card.plannedDate && (
          <div className="flex items-center gap-1 mb-2">
            <Popover
              open={planningCardId === card.id}
              onOpenChange={(open) => {
                if (open) {
                  setPlanningCardId(card.id);
                } else {
                  setPlanningCardId(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(155, 107, 158, 0.08)',
                    border: '1px solid rgba(155, 107, 158, 0.12)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(155, 107, 158, 0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(155, 107, 158, 0.08)';
                  }}
                >
                  <CalendarDays className="w-3 h-3" style={{ color: '#9B6B9E', strokeWidth: 1.5 }} />
                  <span className="text-[11px] font-normal" style={{ color: '#7A5A7D' }}>
                    Planned: {new Date(card.plannedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-0 shadow-2xl"
                align="center"
                side="right"
                sideOffset={8}
                collisionPadding={16}
                onClick={(e) => e.stopPropagation()}
              >
                <ExpandedScheduleView
                  planningMode={true}
                  planningCard={card}
                  onPlanDate={(cardId, date) => {
                    handleSetPlannedDate(cardId, date);
                  }}
                  onClose={() => setPlanningCardId(null)}
                />
              </PopoverContent>
            </Popover>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSetPlannedDate(card.id, undefined);
              }}
              className="hover:bg-violet-100 rounded p-0.5"
              title="Remove from calendar"
            >
              <X className="w-2.5 h-2.5 text-[#A99BA3] hover:text-[#8B7082]" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          {!isEditing && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={6}>
                  <p>Drag to move between columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              defaultValue={card.hook || card.title}
              autoFocus
              onBlur={(e) => handleSaveCardEdit(card.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveCardEdit(card.id, e.currentTarget.value);
                } else if (e.key === "Escape") {
                  setEditingCardId(null);
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              ref={(el) => {
                if (el) textRefs.current.set(card.id, el);
              }}
              className="font-medium text-[15px] text-gray-800 break-words leading-[1.4] tracking-[-0.01em] flex-1 cursor-pointer"
              onDoubleClick={(e) => {
                e.stopPropagation();
                // Clear the single-click timeout to prevent modal from opening
                if (clickTimeoutRef.current) {
                  clearTimeout(clickTimeoutRef.current);
                  clickTimeoutRef.current = null;
                }
                handleStartEditingCard(card.id, columnId, 'doubleclick');
              }}
            >
              {card.hook || card.title}
            </h3>
          )}
          <div className="flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {columnId !== "posted" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-3.5 w-3.5 p-0 rounded hover:bg-[#612A4F]/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (columnId === "shape-ideas") handleOpenScriptEditor(card);
                  else if (columnId === "to-film") handleOpenStoryboard(card);
                  else if (columnId === "ideate") handleOpenIdeateCardEditor(card);
                  else if (columnId === "to-edit") handleOpenEditChecklist(card);
                  else if (columnId === "to-schedule") {
                    setSchedulingCard(card);
                    setIsScheduleColumnExpanded(true);
                  }
                }}
              >
                <PenLine className="h-2.5 w-2.5 text-gray-400 hover:text-[#612A4F]" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-3.5 w-3.5 p-0 rounded hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCard(card.id);
              }}
            >
              <Trash2 className="h-2.5 w-2.5 text-gray-400 hover:text-red-600" />
            </Button>
          </div>
        </div>
        {/* Tags for cards with metadata */}
        {columnId !== "ideate" && ((card.formats && card.formats.length > 0) || card.contentType === 'image' || card.schedulingStatus || (card.platforms && card.platforms.length > 0)) && (() => {
          const formats = card.formats || [];
          const hasStatus = false; // Status now shown via badge at top of card
          const schedulingStatus = card.schedulingStatus;
          const platforms = card.platforms || [];
          const hasPlatforms = platforms.length > 0;

          // Determine which is the last tag row
          const lastFormatIndex = hasStatus ? -1 : formats.length - 1;

          const staticFormats = [
            'single photo post',
            'curated photo carousel',
            'casual photo dump',
            'text-only post',
            'carousel with text slides',
            'notes-app style screenshot',
            'tweet-style slide'
          ];

          const renderPlatformIcons = () => (
            <div className="flex gap-1.5 items-center flex-wrap flex-shrink-0">
              {platforms.map((platform, idx) => {
                const icon = getPlatformIcon(platform);
                return icon ? (
                  <span key={`platform-${idx}`} title={platform}>
                    {icon}
                  </span>
                ) : null;
              })}
            </div>
          );

          return (
            <div className="flex flex-col gap-1 mt-2">
              {/* Format tags - all except last if no status */}
              {formats.map((format, idx) => {
                const isStatic = staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
                const isLastRow = !hasStatus && idx === formats.length - 1;

                if (isLastRow && hasPlatforms) {
                  return (
                    <div key={`format-${idx}`} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                        {isStatic ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {format}
                      </span>
                      {renderPlatformIcons()}
                    </div>
                  );
                }

                return (
                  <span key={`format-${idx}`} className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                    {isStatic ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {format}
                  </span>
                );
              })}
              {/* Image/Carousel content type label when no format tags */}
              {card.contentType === 'image' && formats.length === 0 && (() => {
                const isCardCarousel = card.imageMode === 'carousel';
                const label = isCardCarousel ? 'Carousel' : 'Image';
                const icon = isCardCarousel ? <Layers className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />;
                return hasPlatforms ? (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                      {icon}
                      {label}
                    </span>
                    {renderPlatformIcons()}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                    {icon}
                    {label}
                  </span>
                );
              })()}
              {/* Status tag - only for scheduling column */}
              {hasStatus && (
                <div className={hasPlatforms ? "flex items-center justify-between" : ""}>
                  <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                    {(() => {
                      const isPublished = schedulingStatus === 'scheduled' && card.scheduledDate && new Date(card.scheduledDate) < new Date(new Date().toDateString());
                      return (
                        <>
                          {schedulingStatus === 'to-schedule' && <CalendarDays className="w-2.5 h-2.5" />}
                          {schedulingStatus === 'scheduled' && !isPublished && <Check className="w-2.5 h-2.5" />}
                          {isPublished && <PartyPopper className="w-2.5 h-2.5" />}
                          {schedulingStatus === 'to-schedule' ? 'To schedule' :
                           isPublished ? 'Published' :
                           schedulingStatus === 'scheduled' ? 'Scheduled' : ''}
                        </>
                      );
                    })()}
                  </span>
                  {hasPlatforms && renderPlatformIcons()}
                </div>
              )}
              {/* If only platforms, no formats or status (and not image type, which is handled above) */}
              {!hasStatus && formats.length === 0 && card.contentType !== 'image' && hasPlatforms && (
                <div className="flex items-center justify-end">
                  {renderPlatformIcons()}
                </div>
              )}
            </div>
          );
        })()}
        {/* Stage completion progress dots */}
        <div className="mt-2 pt-2 border-t border-[#E8E2E5]">
          <ProgressDots stageCompletions={card.stageCompletions} hasContentType={!!card.contentType} />
        </div>
        {/* Just added message at bottom */}
        {card.isNew && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#E8E2E5]"
          >
            <span className="text-[11px] text-[#9B8AB8] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Just added{card.addedFrom === 'calendar' ? ' from Content Calendar' :
                card.addedFrom === 'quick-idea' ? '' :
                card.addedFrom === 'ai-generated' ? ' via MegAI' :
                card.addedFrom === 'bank-of-ideas' ? ' from Hook Library' :
                card.addedFrom === 'idea-expander' ? ' via Idea Expander' :
                card.addedFrom === 'repurposed' ? ' (repurposed)' : ''}
            </span>
          </motion.div>
        )}
      </motion.div>
    </React.Fragment>
  );
};

export default ProductionCardItem;
