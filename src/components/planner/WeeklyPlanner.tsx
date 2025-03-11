
import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, parseISO, getHours, getMinutes, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { PlannerDay, PlannerItem } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const WeeklyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday as start of week
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("plannerData");
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
  }, []);

  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set to the start of the week containing the selected date
      setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
      setCalendarOpen(false);
    }
  };

  // Get items for a specific date
  const getItemsForDate = (date: Date): PlannerItem[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = plannerData.find(day => day.date === dateString);
    return dayData?.items || [];
  };

  // Get the background color for an item based on section
  const getItemColor = (section: PlannerItem["section"]) => {
    switch (section) {
      case "morning":
        return "bg-cyan-100 border-cyan-200";
      case "midday":
        return "bg-blue-100 border-blue-200";
      case "afternoon":
        return "bg-amber-100 border-amber-200";
      case "evening":
        return "bg-rose-100 border-rose-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  // Function to get slot appointments for a given date and hour
  const getAppointmentsForSlot = (date: Date, hour: number): PlannerItem[] => {
    const dateItems = getItemsForDate(date);
    
    return dateItems.filter(item => {
      if (!item.startTime) return false;
      
      const [itemHour] = item.startTime.split(":").map(Number);
      return itemHour === hour;
    });
  };

  // Function to determine if an item spans multiple hours
  const getItemTimeSpan = (item: PlannerItem): number => {
    if (!item.startTime || !item.endTime) return 1;
    
    const [startHour, startMinute] = item.startTime.split(":").map(Number);
    const [endHour, endMinute] = item.endTime.split(":").map(Number);
    
    let hourDiff = endHour - startHour;
    if (hourDiff <= 0 && (endHour !== startHour || endMinute > startMinute)) {
      hourDiff = 1;
    }
    
    return Math.max(1, hourDiff);
  };

  // Function to format time (12-hour format with AM/PM)
  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const allDaysWithItems = plannerData
    .filter(day => day.items.length > 0)
    .map(day => {
      const [year, month, day_num] = day.date.split('-').map(Number);
      return new Date(year, month - 1, day_num);
    });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mx-2 min-w-[240px] justify-start text-left font-medium"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 6), "MMMM d, yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiers={{
                    booked: allDaysWithItems,
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
            
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 divide-x divide-gray-200 border-b">
          {weekDates.map((date, index) => (
            <div key={index} className="p-2 text-center">
              <div className="text-sm font-medium uppercase">
                {format(date, "EEE")}
              </div>
              <div className={`text-2xl font-bold ${isSameDay(date, new Date()) ? 'text-primary' : ''}`}>
                {format(date, "d")}
              </div>
              <div className="text-xs text-gray-500">
                {format(date, "MMM")}
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative">
          {/* Time indicators on the left */}
          <div className="grid grid-cols-[4rem_1fr] divide-x divide-gray-200">
            <div className="divide-y divide-gray-200">
              {TIME_SLOTS.map(hour => (
                <div key={hour} className="h-24 relative">
                  <div className="absolute -top-3 left-3 text-xs text-gray-500">
                    {formatTime(hour)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Main calendar grid */}
            <div className="grid grid-cols-7 divide-x divide-gray-200">
              {weekDates.map((date, dateIndex) => (
                <div key={dateIndex} className="divide-y divide-gray-200">
                  {TIME_SLOTS.map(hour => {
                    const appointments = getAppointmentsForSlot(date, hour);
                    
                    return (
                      <div key={hour} className="h-24 p-1 relative">
                        {appointments.map((item, i) => {
                          const timeSpan = getItemTimeSpan(item);
                          const heightClass = `h-${timeSpan * 24 - 2}`;
                          const colorClass = getItemColor(item.section);
                          
                          return (
                            <div 
                              key={item.id}
                              className={`absolute left-1 right-1 p-1 rounded-md border ${colorClass} overflow-hidden`}
                              style={{ 
                                height: `${timeSpan * 6 - 0.5}rem`,
                                top: item.startTime ? `${(parseInt(item.startTime.split(':')[1]) / 60) * 6}rem` : '0'
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-full w-full overflow-hidden cursor-pointer">
                                    <div className="text-xs font-medium">
                                      {item.startTime && (
                                        <span>{item.startTime}{item.endTime && ` - ${item.endTime}`}</span>
                                      )}
                                    </div>
                                    <div className="text-sm font-medium line-clamp-2">
                                      {item.text}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="font-medium">{item.text}</div>
                                  {item.startTime && (
                                    <div className="text-sm text-gray-500">
                                      {item.startTime}{item.endTime && ` - ${item.endTime}`}
                                    </div>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyPlanner;
