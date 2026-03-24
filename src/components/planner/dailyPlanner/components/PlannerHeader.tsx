import { useState } from "react";
import { addMonths, addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlannerView } from "../types";
import { TimezoneOption } from "../utils/plannerUtils";
import { cn } from "@/lib/utils";
import { getWeekStartsOn } from "@/lib/storage";
import { ContentDisplayMode } from "../hooks/usePlannerState";

interface PlannerHeaderProps {
  currentView: PlannerView;
  setCurrentView: (view: PlannerView) => void;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleDateSelect: (date: Date | undefined) => void;
  daysWithItems: Date[];
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  // Timezone props for Monthly view
  getTimezoneDisplay?: () => string;
  handleTimezoneChange?: (timezone: string) => void;
  selectedTimezone?: string;
  timezones?: TimezoneOption[];
  // Content display mode
  contentDisplayMode: ContentDisplayMode;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
}

export const PlannerHeader = ({
  currentView,
  setCurrentView,
  selectedDate,
  setSelectedDate,
  calendarOpen,
  setCalendarOpen,
  handleDateSelect,
  daysWithItems,
  handlePreviousDay,
  handleNextDay,
  getTimezoneDisplay,
  handleTimezoneChange,
  selectedTimezone,
  timezones,
  contentDisplayMode,
  setContentDisplayMode,
}: PlannerHeaderProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div className="pt-4 pb-2">
      {/* Top Row: Date Navigation (centered) */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          {currentView === 'today' ? (
            <>
              <Button variant="ghost" size="icon" onClick={handlePreviousDay} className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                    <CalendarIcon className="h-4 w-4" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{ today: [new Date()] }}
                    modifiersStyles={{ today: { backgroundColor: "#f3f4f6", fontWeight: "600", color: "#000000" } }}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : currentView === 'week' ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => subWeeks(prev, 1))} className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(startOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() }), "MMMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() }), "MMMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{ today: [new Date()] }}
                    modifiersStyles={{ today: { backgroundColor: "#f3f4f6", fontWeight: "600", color: "#000000" } }}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addWeeks(prev, 1))} className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addMonths(prev, -1))} className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(selectedDate, "MMMM yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{ today: [new Date()] }}
                    modifiersStyles={{ today: { backgroundColor: "#f3f4f6", fontWeight: "600", color: "#000000" } }}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addMonths(prev, 1))} className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: View Tabs + Filter */}
      <div className="flex items-center justify-between pr-8">
        <div className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-0.5">
          <button
            onClick={() => setCurrentView('today')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border-2",
              currentView === 'today'
                ? "bg-white text-[#612a4f] border-[#612a4f]/60 shadow-[0_2px_8px_rgba(139,112,130,0.4)]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border-2",
              currentView === 'week'
                ? "bg-white text-[#612a4f] border-[#612a4f]/60 shadow-[0_2px_8px_rgba(139,112,130,0.4)]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border-2",
              currentView === 'calendar'
                ? "bg-white text-[#612a4f] border-[#612a4f]/60 shadow-[0_2px_8px_rgba(139,112,130,0.4)]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
            )}
          >
            Monthly
          </button>
        </div>

        {/* Right: Filter */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm text-gray-700 shadow-sm">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {contentDisplayMode === 'both' ? 'All' : contentDisplayMode === 'tasks' ? 'Tasks only' : 'Content only'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1 bg-white" align="end">
            <button
              onClick={() => { setContentDisplayMode('both'); setFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                contentDisplayMode === 'both' ? "bg-[#612a4f]/10 text-[#612a4f] font-medium" : "text-gray-700 hover:bg-gray-100"
              )}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              See all
            </button>
            <button
              onClick={() => { setContentDisplayMode('tasks'); setFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                contentDisplayMode === 'tasks' ? "bg-[#612a4f]/10 text-[#612a4f] font-medium" : "text-gray-700 hover:bg-gray-100"
              )}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              See tasks only
            </button>
            <button
              onClick={() => { setContentDisplayMode('content'); setFilterOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                contentDisplayMode === 'content' ? "bg-[#612a4f]/10 text-[#612a4f] font-medium" : "text-gray-700 hover:bg-gray-100"
              )}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              See content only
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
