import { useState, useEffect } from "react";
import { Calendar, CalendarCheck, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageKeys, getString } from "@/lib/storage";
import { format, parseISO, isAfter, startOfDay, isEqual } from "date-fns";
import { EVENTS, on } from "@/lib/events";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { useNavigate } from "react-router-dom";

interface UpcomingItem {
  card: ProductionCard;
  date: string;
  type: 'scheduled' | 'planned';
}

interface ContentOverviewSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const ContentOverviewSidebar = ({
  isCollapsed,
  setIsCollapsed,
}: ContentOverviewSidebarProps) => {
  const navigate = useNavigate();
  const [upcomingContent, setUpcomingContent] = useState<UpcomingItem[]>([]);

  const loadUpcomingContent = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) {
      setUpcomingContent([]);
      return;
    }

    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const today = startOfDay(new Date());

      // Get all cards with a scheduled or planned date
      const allItems: UpcomingItem[] = [];
      columns.forEach(column => {
        column.cards.forEach(card => {
          if (card.scheduledDate) {
            allItems.push({ card, date: card.scheduledDate, type: 'scheduled' });
          } else if (card.plannedDate) {
            allItems.push({ card, date: card.plannedDate, type: 'planned' });
          }
        });
      });

      // Filter for upcoming content (today or later) and sort by date
      const upcoming = allItems
        .filter(item => {
          const itemDate = startOfDay(parseISO(item.date));
          return isAfter(itemDate, today) || isEqual(itemDate, today);
        })
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .slice(0, 6);

      setUpcomingContent(upcoming);
    } catch (err) {
      console.error('Error loading production content:', err);
    }
  };

  useEffect(() => {
    loadUpcomingContent();

    // Listen for updates
    const cleanup1 = on(window, EVENTS.scheduledContentUpdated, loadUpcomingContent);
    const cleanup2 = on(window, EVENTS.productionKanbanUpdated, loadUpcomingContent);
    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const scheduledCount = upcomingContent.filter(i => i.type === 'scheduled').length;
  const plannedCount = upcomingContent.filter(i => i.type === 'planned').length;

  return (
    <div
      className={cn(
        "h-full flex-shrink-0 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 transition-all duration-300 relative",
        isCollapsed ? "w-0 overflow-hidden" : "w-80"
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

      {!isCollapsed && (
        <div className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Content Overview</h2>
          </div>

          {/* Legend with sample cards */}
          <div className="space-y-4">
            {/* Planned sample card */}
            <div className="flex items-center gap-3">
              <div className="w-1/2 bg-purple-100 border border-dashed border-purple-300 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Sample content</span>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  <div className="w-4 h-1 rounded-full bg-purple-500" />
                  <div className="w-4 h-1 rounded-full bg-purple-300" />
                  <div className="w-4 h-1 rounded-full bg-purple-300" />
                  <div className="w-4 h-1 rounded-full bg-purple-300" />
                  <div className="w-4 h-1 rounded-full bg-purple-300" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">Planned</p>
                <p className="text-[11px] text-gray-400">Still developing</p>
              </div>
            </div>

            {/* Scheduled sample card */}
            <div className="flex items-center gap-3">
              <div className="w-1/2 bg-violet-100 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-xs font-medium text-violet-700">Sample content</span>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  <div className="w-4 h-1 rounded-full bg-violet-300" />
                  <div className="w-4 h-1 rounded-full bg-violet-300" />
                  <div className="w-4 h-1 rounded-full bg-violet-300" />
                  <div className="w-4 h-1 rounded-full bg-violet-300" />
                  <div className="w-4 h-1 rounded-full bg-violet-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">Scheduled</p>
                <p className="text-[11px] text-gray-400">Ready to publish</p>
              </div>
            </div>
          </div>

          {/* Content Hub guidance */}
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-800 mb-1">Ready to create?</p>
            <p className="text-xs text-gray-500">
              Head to{' '}
              <button
                onClick={() => navigate('/production')}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Content Hub →
              </button>
              {' '}to develop your ideas
            </p>
          </div>

          <div className="flex-1" />
        </div>
      )}
    </div>
  );
};
