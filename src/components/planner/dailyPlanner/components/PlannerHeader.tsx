import { addMonths, addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlannerView } from "../types";
import { TimezoneOption } from "../utils/plannerUtils";

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
}: PlannerHeaderProps) => {
  return (
    <div className="mb-3 pt-[15px]">
      <div className="flex items-center justify-between">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setCurrentView('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'today'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'week'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'calendar'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
          </div>
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
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      booked: daysWithItems,
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        fontWeight: "bold",
                        borderRadius: "0",
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
              <span className="text-sm font-medium text-gray-800">
                {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d")} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addWeeks(prev, 1))} className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Timezone selector for Monthly view */}
              {getTimezoneDisplay && handleTimezoneChange && timezones && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 mr-2">
                      <span className="font-medium">{getTimezoneDisplay()}</span>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 bg-white" align="end">
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-700">Select Timezone</div>
                      <button
                        onClick={() => handleTimezoneChange('auto')}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors ${selectedTimezone === 'auto' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      >
                        Auto (detect)
                      </button>
                      <div className="h-px bg-gray-200 my-1"></div>
                      {timezones.map((tz) => (
                        <button
                          key={tz.value}
                          onClick={() => handleTimezoneChange(tz.value)}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors ${selectedTimezone === tz.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span>{tz.label}</span>
                              <span className="text-[10px] text-gray-400">{tz.name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{tz.offset}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(prev => addMonths(prev, -1))} className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-800">
                {format(selectedDate, "MMMM yyyy")}
              </span>
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
