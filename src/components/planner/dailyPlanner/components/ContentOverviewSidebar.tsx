import { useState, useEffect } from "react";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Lightbulb, Clapperboard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageKeys, getString } from "@/lib/storage";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { EVENTS, on } from "@/lib/events";
import { KanbanColumn } from "@/pages/production/types";
import { useNavigate } from "react-router-dom";

interface ContentCounts {
  inIdeation: number;
  inProduction: number;
  scheduledToPublish: number;
  publishedThisMonth: number;
}

interface ContentOverviewSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  /** When true, renders just the content without outer wrapper (for combined sidebar) */
  embedded?: boolean;
}

export const ContentOverviewSidebar = ({
  isCollapsed,
  setIsCollapsed,
  embedded = false,
}: ContentOverviewSidebarProps) => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<ContentCounts>({
    inIdeation: 0,
    inProduction: 0,
    scheduledToPublish: 0,
    publishedThisMonth: 0,
  });

  const loadContentCounts = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) {
      setCounts({ inIdeation: 0, inProduction: 0, scheduledToPublish: 0, publishedThisMonth: 0 });
      return;
    }

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      let inIdeation = 0;
      let inProduction = 0;
      let scheduledToPublish = 0;
      let publishedThisMonth = 0;

      columns.forEach(column => {
        column.cards.forEach(card => {
          // In Ideation: cards in 'ideate' column OR cards with plannedDate (from content calendar)
          if (column.id === 'ideate') {
            inIdeation++;
          } else if (card.plannedDate && column.id !== 'ideate') {
            // Cards with planned date that are not in ideate column are still counted as ideation
            // Actually, let's count planned content separately
          }

          // In Production: cards in 'script-ideas', 'to-film', 'to-edit', or unscheduled cards in 'to-schedule'
          if (column.id === 'script-ideas' || column.id === 'to-film' || column.id === 'to-edit') {
            inProduction++;
          } else if (column.id === 'to-schedule' && !card.scheduledDate) {
            inProduction++;
          }

          // Scheduled to Publish: cards in 'to-schedule' that HAVE been scheduled (have scheduledDate)
          // but NOT yet marked as completed/posted
          if (column.id === 'to-schedule' && card.scheduledDate && !card.isCompleted) {
            scheduledToPublish++;
          }

          // Published this month:
          // 1. Cards in 'posted' column with postedAt in current month
          // 2. Cards marked as completed (isCompleted) with scheduledDate in current month
          if (column.id === 'posted' && (card as any).postedAt) {
            try {
              const postedDate = parseISO((card as any).postedAt);
              if (isWithinInterval(postedDate, { start: monthStart, end: monthEnd })) {
                publishedThisMonth++;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          } else if (card.isCompleted && card.scheduledDate) {
            // Cards marked as posted via checkbox but still on calendar
            try {
              const schedDate = parseISO(card.scheduledDate);
              if (isWithinInterval(schedDate, { start: monthStart, end: monthEnd })) {
                publishedThisMonth++;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      });

      // Also count cards with plannedDate as ideation (from content calendar)
      columns.forEach(column => {
        column.cards.forEach(card => {
          if (card.plannedDate && column.id === 'ideate') {
            // Already counted above, don't double count
          }
        });
      });

      setCounts({ inIdeation, inProduction, scheduledToPublish, publishedThisMonth });
    } catch (err) {
      console.error('Error loading content counts:', err);
    }
  };

  useEffect(() => {
    loadContentCounts();

    // Listen for updates
    const cleanup1 = on(window, EVENTS.scheduledContentUpdated, loadContentCounts);
    const cleanup2 = on(window, EVENTS.productionKanbanUpdated, loadContentCounts);
    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  // Embedded mode - render just the content for combined sidebar
  if (embedded) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <CalendarDays className="w-5 h-5 text-black" />
          <h2 className="text-base font-semibold text-black">Content Overview</h2>
        </div>

        {/* Content Overview Stats */}
        <div className="space-y-4">
          {/* In Ideation */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-[#8B7082]" />
              <span className="text-sm text-gray-700">In Ideation</span>
            </div>
            <span className="text-sm font-semibold text-[#8B7082]">{counts.inIdeation}</span>
          </div>

          {/* In Production */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <Clapperboard className="w-4 h-4 text-[#8B7082]" />
              <span className="text-sm text-gray-700">In Production</span>
            </div>
            <span className="text-sm font-semibold text-[#8B7082]">{counts.inProduction}</span>
          </div>

          {/* Scheduled to Publish */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#8B7082]" />
              <span className="text-sm text-gray-700">Scheduled to Publish</span>
            </div>
            <span className="text-sm font-semibold text-[#8B7082]">{counts.scheduledToPublish}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Published this month */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8B7082]" />
              <span className="text-sm text-gray-500">Published this month</span>
            </div>
            <span className="text-sm font-semibold text-[#8B7082]">{counts.publishedThisMonth}</span>
          </div>
        </div>

        {/* Content Hub guidance */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-800 mb-1">Ready to create?</p>
          <p className="text-xs text-gray-500">
            Head to{' '}
            <button
              onClick={() => navigate('/production')}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#612a4f] bg-[#8B7082]/10 hover:bg-[#8B7082]/20 rounded-md transition-colors"
            >
              Content Hub →
            </button>
            {' '}to develop your ideas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex-shrink-0 bg-[#FDFAFC] transition-all duration-300 relative",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content wrapper with overflow-hidden to prevent text reflow during transition */}
      <div className="h-full overflow-hidden">
        <div className={cn(
          "p-5 h-full flex flex-col w-80 transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <CalendarDays className="w-5 h-5 text-black" />
            <h2 className="text-base font-semibold text-black">Content Overview</h2>
          </div>

          {/* Content Overview Stats */}
          <div className="space-y-4">
            {/* In Ideation */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-[#8B7082]" />
                <span className="text-sm text-gray-700">In Ideation</span>
              </div>
              <span className="text-sm font-semibold text-[#8B7082]">{counts.inIdeation}</span>
            </div>

            {/* In Production */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Clapperboard className="w-4 h-4 text-[#8B7082]" />
                <span className="text-sm text-gray-700">In Production</span>
              </div>
              <span className="text-sm font-semibold text-[#8B7082]">{counts.inProduction}</span>
            </div>

            {/* Scheduled to Publish */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#8B7082]" />
                <span className="text-sm text-gray-700">Scheduled to Publish</span>
              </div>
              <span className="text-sm font-semibold text-[#8B7082]">{counts.scheduledToPublish}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* Published this month */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B7082]" />
                <span className="text-sm text-gray-500">Published this month</span>
              </div>
              <span className="text-sm font-semibold text-[#8B7082]">{counts.publishedThisMonth}</span>
            </div>
          </div>

          {/* Content Hub guidance */}
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-800 mb-1">Ready to create?</p>
            <p className="text-xs text-gray-500">
              Head to{' '}
              <button
                onClick={() => navigate('/production')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#612a4f] bg-[#8B7082]/10 hover:bg-[#8B7082]/20 rounded-md transition-colors"
              >
                Content Hub →
              </button>
              {' '}to develop your ideas
            </p>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};
