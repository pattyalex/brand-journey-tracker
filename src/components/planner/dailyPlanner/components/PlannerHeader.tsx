import { addMonths, addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, ListTodo, Video, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlannerView } from "../types";
import { TimezoneOption } from "../utils/plannerUtils";
import { cn } from "@/lib/utils";
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
  return (
    <div className="pt-4 pb-2">
      {/* Top Row: Focus Mode Selector */}
      <div className="flex items-center justify-center mb-4">
        <div className="inline-flex items-center gap-1 p-1 bg-gray-100/80 rounded-full">
          <button
            onClick={() => setContentDisplayMode('tasks')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              contentDisplayMode === 'tasks'
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ListTodo className="w-4 h-4" />
            Tasks Calendar
          </button>
          <button
            onClick={() => setContentDisplayMode('content')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              contentDisplayMode === 'content'
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Video className="w-4 h-4" />
            Content Calendar
          </button>
          <button
            onClick={() => setContentDisplayMode('both')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              contentDisplayMode === 'both'
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Both
          </button>
        </div>
      </div>

      {/* Bottom Row: View Tabs + Date Navigation */}
      <div className="flex items-center justify-between">
        {/* Left: View Tabs */}
        <div className="inline-flex items-center gap-0 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setCurrentView('today')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              currentView === 'today'
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              currentView === 'week'
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              currentView === 'calendar'
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Monthly
          </button>
        </div>

        {/* Right: Date Navigation */}
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
                    <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      today: [new Date()],
                    }}
                    modifiersStyles={{
                      today: {
                        backgroundColor: "#f3f4f6",
                        fontWeight: "600",
                        color: "#000000",
                      },
                    }}
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
                    <span>{format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      today: [new Date()],
                    }}
                    modifiersStyles={{
                      today: {
                        backgroundColor: "#f3f4f6",
                        fontWeight: "600",
                        color: "#000000",
                      },
                    }}
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
                <PopoverContent className="w-auto p-0 z-[300]" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      today: [new Date()],
                    }}
                    modifiersStyles={{
                      today: {
                        backgroundColor: "#f3f4f6",
                        fontWeight: "600",
                        color: "#000000",
                      },
                    }}
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
    </div>
  );
};
