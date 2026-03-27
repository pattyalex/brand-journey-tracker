import { useState, useEffect } from "react";
import { Send, Calendar, Video, Image as ImageIcon, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { StorageKeys, getString } from "@/lib/storage";
import { format, parseISO } from "date-fns";
import { EVENTS, on } from "@/lib/events";
import { KanbanColumn, ProductionCard } from "@/pages/production/types";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [readyCards, setReadyCards] = useState<ProductionCard[]>([]);

  const loadReadyCards = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) {
      setReadyCards([]);
      return;
    }

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const readyToPostColumn = columns.find(col => col.id === 'ready-to-post');
      const cards = readyToPostColumn?.cards.filter(
        c => !c.isCompleted
      ) || [];

      // Sort by last updated (most recent first)
      cards.sort((a, b) => {
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
    const cleanup1 = on(window, EVENTS.scheduledContentUpdated, loadReadyCards);
    const cleanup2 = on(window, EVENTS.productionKanbanUpdated, loadReadyCards);
    return () => { cleanup1(); cleanup2(); };
  }, []);

  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-2.5 mb-5 ml-2">
          <Send className="w-5 h-5 text-gray-900" />
          <h2 className="text-xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Ready to Post
          </h2>
          {readyCards.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-[#612a4f] bg-[#612a4f]/10 px-2 py-0.5 rounded-full">
              {readyCards.length}
            </span>
          )}
        </div>
      )}

      {/* Cards list */}
      {readyCards.length === 0 ? (
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
          {readyCards.map(card => {
            const plannedDate = card.plannedDate ? parseISO(card.plannedDate) : null;

            return (
              <Tooltip key={card.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "rounded-xl border p-3 transition-all hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2",
                      "border-gray-200 bg-white"
                    )}
                  >
                    {/* Grip handle */}
                    <div className="flex-shrink-0 flex items-center">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                    </div>

                    {/* Title */}
                    <p className="flex-1 min-w-0 text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                      {card.title || card.hook || "Untitled content"}
                    </p>

                    {/* Content type icon */}
                    <div className="flex-shrink-0 flex items-center">
                      {card.contentType === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  className="bg-[#2D2D2D] text-white border-0 px-3 py-2 rounded-lg shadow-lg max-w-[200px]"
                >
                  <p className="text-[11px] leading-relaxed">
                    Drag and drop onto a date in your calendar to schedule this content
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
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
        "h-full flex-shrink-0 bg-gradient-to-br from-[#F0EAED] via-[#F8F6F6] to-[#FAFAFA] transition-all duration-300 relative",
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
