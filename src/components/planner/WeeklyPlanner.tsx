import { useState } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlannerDay } from "@/types/planner";

interface WeeklyPlannerProps {
  plannerData: PlannerDay[];
}

// Time slots for the calendar (24 hours) in American format (12-hour with AM/PM)
const TIME_SLOTS = [
  "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", 
  "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", 
  "10 PM", "11 PM"
];

export const WeeklyPlanner = ({ plannerData }: WeeklyPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<"agenda" | "calendar">("agenda");
  
  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addWeeks(prevDate, 1));
  };

  // Generate the 7 days of the week
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  // Get planner items for a specific day
  const getDayItems = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayData = plannerData.find(day => day.date === dateString);
    return dayData?.items || [];
  };

  // Format time for display in American style (12-hour with AM/PM)
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "";
    
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    
    if (isNaN(hours)) return timeString;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hours12}:${minutesStr} ${period}`;
  };

  // Parse time string to get hour for positioning in calendar view
  const getHourFromTimeString = (timeString: string | undefined): number => {
    if (!timeString) return 0;
    const [hours] = timeString.split(':').map(Number);
    return hours || 0;
  };

  // Calculate position and height for calendar items
  const getEventPosition = (startTime?: string, endTime?: string) => {
    if (!startTime) return { top: 0, height: 30 };
    
    const startHour = getHourFromTimeString(startTime);
    let endHour = startHour + 1;
    
    if (endTime) {
      endHour = getHourFromTimeString(endTime);
      if (endHour <= startHour) endHour = startHour + 1;
    }
    
    // Each hour is 60px in height
    const top = startHour * 60; // Starting from 1 AM (index 0)
    const height = (endHour - startHour) * 60;
    
    return { top, height };
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium">
              {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "agenda" | "calendar")}>
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {viewMode === "agenda" ? (
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDays.map((day, index) => (
              <div key={`header-${index}`} className="text-center p-2 border-b font-medium">
                <div className="text-sm">{format(day, "EEE")}</div>
                <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
              </div>
            ))}
            
            {/* Calendar cells */}
            {weekDays.map((day, dayIndex) => {
              const items = getDayItems(day);
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              
              return (
                <div 
                  key={`day-${dayIndex}`} 
                  className={`h-[500px] border-r border-b overflow-y-auto p-1 ${isToday ? "bg-primary/5" : ""}`}
                >
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div 
                        key={item.id}
                        className={`
                          text-xs p-1.5 rounded border 
                          ${item.isCompleted ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-200"}
                          ${item.section === "morning" ? "border-l-4 border-l-blue-500" : ""}
                          ${item.section === "midday" ? "border-l-4 border-l-amber-500" : ""}
                          ${item.section === "afternoon" ? "border-l-4 border-l-orange-500" : ""}
                          ${item.section === "evening" ? "border-l-4 border-l-purple-500" : ""}
                        `}
                      >
                        {item.startTime && (
                          <div className="font-semibold text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(item.startTime)}
                            {item.endTime && ` - ${formatTime(item.endTime)}`}
                          </div>
                        )}
                        <div className={`${item.isCompleted ? "line-through opacity-70" : ""}`}>
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative" style={{ height: '840px' }}> {/* Adjusted height for visible hours */}
            {/* Time column */}
            <div className="absolute left-0 top-0 w-16 h-full border-r z-10 bg-background">
              {TIME_SLOTS.map((time, index) => (
                <div 
                  key={`time-${index}`} 
                  className="h-[60px] border-b border-gray-100 text-xs text-muted-foreground"
                >
                  <span className="absolute -top-2.5 left-2">{time}</span>
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            <div className="ml-16 grid grid-cols-7 h-full">
              {/* Day headers */}
              {weekDays.map((day, index) => (
                <div 
                  key={`header-cal-${index}`} 
                  className="text-center p-2 border-b border-gray-200 font-medium sticky top-0 bg-background z-10"
                >
                  <div className="text-xs uppercase text-muted-foreground">{format(day, "EEE")}</div>
                  <div className="text-xl">{format(day, "d")}</div>
                </div>
              ))}
              
              {/* Calendar grid */}
              {weekDays.map((day, dayIndex) => {
                const items = getDayItems(day);
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <div 
                    key={`day-cal-${dayIndex}`} 
                    className={`border-r relative ${isToday ? "bg-primary/5" : ""}`}
                  >
                    {/* Time grid lines */}
                    {TIME_SLOTS.map((_, timeIndex) => (
                      <div 
                        key={`grid-${dayIndex}-${timeIndex}`} 
                        className="h-[60px] border-b border-gray-100"
                      />
                    ))}
                    
                    {/* Events */}
                    {items.filter(item => item.startTime).map((item) => {
                      const { top, height } = getEventPosition(item.startTime, item.endTime);
                      
                      return (
                        <div 
                          key={item.id}
                          className={`
                            absolute text-xs p-1.5 rounded-md border left-1 right-1 overflow-hidden
                            ${item.isCompleted ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-200"}
                            ${item.section === "morning" ? "border-l-4 border-l-blue-500" : ""}
                            ${item.section === "midday" ? "border-l-4 border-l-amber-500" : ""}
                            ${item.section === "afternoon" ? "border-l-4 border-l-orange-500" : ""}
                            ${item.section === "evening" ? "border-l-4 border-l-purple-500" : ""}
                          `}
                          style={{ 
                            top: `${top}px`, 
                            height: `${Math.max(height, 30)}px`,
                          }}
                        >
                          <div className={`${item.isCompleted ? "line-through opacity-70" : ""}`}>
                            {item.text}
                          </div>
                          {item.startTime && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {formatTime(item.startTime)}
                              {item.endTime && ` - ${formatTime(item.endTime)}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyPlanner;
