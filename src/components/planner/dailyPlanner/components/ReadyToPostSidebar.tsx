import { useState, useEffect } from "react";
import { Send, Calendar, Video, Image as ImageIcon, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { StorageKeys, getString, setString } from "@/lib/storage";

import { EVENTS, emit, on } from "@/lib/events";
import { KanbanColumn, ProductionCard } from "@/pages/production/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ContentSummaryPanel } from "./ContentSummaryPanel";

const getPlatformIcon = (platform: string, size: string = "w-3.5 h-3.5"): React.ReactNode => {
  const p = platform.toLowerCase();
  if (p.includes("youtube")) return <SiYoutube className={size} />;
  if (p.includes("tiktok") || p === "tt") return <SiTiktok className={size} />;
  if (p.includes("instagram") || p === "ig") return <SiInstagram className={size} />;
  if (p.includes("facebook")) return <SiFacebook className={size} />;
  if (p.includes("linkedin")) return <SiLinkedin className={size} />;
  if (p.includes("twitter") || p.includes("x.com")) return <RiTwitterXLine className={size} />;
  if (p.includes("threads")) return <RiThreadsLine className={size} />;
  return null;
};

interface ReadyToPostSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  embedded?: boolean;
  hideHeader?: boolean;
}

export const ReadyToPostSidebar = ({
  isCollapsed,
  setIsCollapsed,
  embedded = false,
  hideHeader = false,
}: ReadyToPostSidebarProps) => {
  const { state: sidebarState } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [readyCards, setReadyCards] = useState<ProductionCard[]>([]);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ProductionCard | null>(null);

  const loadReadyCards = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) {
      console.log('[ReadyToPost] No kanban data found in storage');
      setReadyCards([]);
      return;
    }

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const readyToPostColumn = columns.find(col => col.id === 'ready-to-post');
      console.log('[ReadyToPost] Column found:', !!readyToPostColumn, 'Total cards:', readyToPostColumn?.cards?.length || 0);
      if (readyToPostColumn?.cards) {
        readyToPostColumn.cards.forEach(c => {
          console.log('[ReadyToPost] Card:', c.id, 'title:', c.title || c.hook, 'isCompleted:', c.isCompleted, 'scheduledDate:', c.scheduledDate);
        });
      }
      const cards = readyToPostColumn?.cards.filter(
        c => !c.isCompleted
      ) || [];

      // Sort: unscheduled first, then scheduled; within each group, most recent first
      cards.sort((a, b) => {
        const aScheduled = !!a.scheduledDate;
        const bScheduled = !!b.scheduledDate;
        if (aScheduled !== bScheduled) return aScheduled ? 1 : -1;
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateB - dateA;
      });

      setReadyCards(cards);
    } catch (err) {
      console.error('Error loading ready to post cards:', err);
      setReadyCards([]);
    }
  };

  useEffect(() => {
    loadReadyCards();
    const cleanup1 = on(window, EVENTS.scheduledContentUpdated, () => {
      setIsDragOver(false);
      setDraggingCardId(null);
      loadReadyCards();
    });
    const cleanup2 = on(window, EVENTS.productionKanbanUpdated, () => {
      setIsDragOver(false);
      setDraggingCardId(null);
      loadReadyCards();
    });
    return () => { cleanup1(); cleanup2(); };
  }, [user?.id]);

  // Handle dropping a scheduled card back to unschedule it
  const handleUnscheduleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const contentId = e.dataTransfer.getData('contentId');
    const contentType = e.dataTransfer.getData('contentType');

    if (!contentId || contentType !== 'scheduled') return;

    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      let cardTitle = '';
      columns.forEach(column => {
        const card = column.cards.find(c => c.id === contentId);
        if (card) {
          cardTitle = card.title || card.hook || '';
          card.scheduledDate = undefined;
          card.schedulingStatus = undefined;
          card.scheduledStartTime = undefined;
          card.scheduledEndTime = undefined;
        }
      });

      setString(StorageKeys.productionKanban, JSON.stringify(columns));
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);
      loadReadyCards();
      toast.success('Unscheduled', { description: cardTitle || 'Content removed from calendar' });
    } catch (err) {
      console.error('Error unscheduling content:', err);
    }
  };

  const renderContent = () => (
    <div
      className="flex flex-col h-full"
      onDragOver={(e) => {
        const contentType = e.dataTransfer.types.includes('contenttype') ? '' : '';
        // Allow drop for scheduled content being dragged back
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        // Only clear if leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={handleUnscheduleDrop}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-2.5 mb-5 ml-2">
          <Send className="w-5 h-5 text-gray-900" />
          <h2 className="text-xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Ready to Post
          </h2>
          {readyCards.filter(c => !c.scheduledDate).length > 0 && (
            <span className="ml-auto text-xs font-semibold text-[#612a4f] bg-[#612a4f]/10 px-2 py-0.5 rounded-full">
              {readyCards.filter(c => !c.scheduledDate).length}
            </span>
          )}
        </div>
      )}

      {/* Drop zone highlight when dragging scheduled content over */}
      {isDragOver && (
        <div className="mx-1 mb-3 p-4 rounded-xl border-2 border-dashed border-[#612a4f]/30 bg-[#612a4f]/5 flex flex-col items-center gap-1.5 transition-all">
          <Calendar className="w-5 h-5 text-[#612a4f]/50" />
          <p className="text-[11px] font-medium text-[#612a4f]/60 text-center">Drop here to unschedule</p>
        </div>
      )}

      {/* Cards list */}
      {readyCards.filter(c => !c.scheduledDate).length === 0 && !isDragOver ? (
        <div className="pt-[22vh]">
          <div className="flex flex-col items-center text-center px-4 pt-4 pb-6 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(97,42,79,0.07)' }}>
              <Send className="w-5 h-5 text-[#612a4f]" />
            </div>
            <p className="text-[13px] font-medium text-gray-700 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Produce content in the Content Hub.
            </p>
            <p className="text-[13px] font-medium text-gray-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Move content to "Ready to Post" in the Content Hub and it'll appear here
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/production')}
              className="text-xs font-semibold text-[#612a4f] bg-[#612a4f]/10 hover:bg-[#612a4f]/15 px-3 py-1.5 rounded-lg transition-colors"
            >
              Go to Content Hub →
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
          {readyCards.filter(c => !c.scheduledDate).map(card => {
            const isDragged = draggingCardId === card.id;

            return (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => {
                  setDraggingCardId(card.id);
                  e.dataTransfer.setData('text/plain', card.id);
                  e.dataTransfer.setData('contentId', card.id);
                  e.dataTransfer.setData('contentType', 'ready-to-post');
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDraggingCardId(null)}
                onClick={() => setSelectedCard(card)}
                className={cn(
                  "rounded-xl border p-3 hover:shadow-sm cursor-pointer",
                  "border-gray-200 bg-white",
                  isDragged && "opacity-40 scale-[0.98]",
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Grip handle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-shrink-0 flex items-center">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1">
                      Drag to a date to schedule
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                      {card.title || card.hook || "Untitled content"}
                    </p>
                  </div>

                  {/* Content type icon */}
                  <div className="flex-shrink-0 flex items-center">
                    {card.contentType === 'image' ? (
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary panel overlay */}
      {selectedCard && (
        <div className="mt-3">
          <ContentSummaryPanel
            content={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        </div>
      )}
    </div>
  );

  if (embedded) {
    return renderContent();
  }

  return (
    <div
      className={cn(
        "h-full flex-shrink-0 transition-all duration-300 relative",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      {/* Collapse/Expand Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {isCollapsed ? "Expand panel" : "Collapse panel"}
        </TooltipContent>
      </Tooltip>

      <div className="h-full overflow-hidden">
        <div className={cn(
          "p-5 h-full flex flex-col w-80 transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
