
import { useState } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlannerDay } from "@/types/planner";

interface WeeklyPlannerProps {
  plannerData: PlannerDay[];
}

export const WeeklyPlanner = ({ plannerData }: WeeklyPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date()));
  
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
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayData = plannerData.find(day => day.date === dateString);
    return dayData?.items || [];
  };

  // Format time for display
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "";
    return timeString;
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
          <div>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
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
                        <div className="font-semibold text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
};
