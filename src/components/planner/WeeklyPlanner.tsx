
import { useState } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, AlarmClock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlannerDay, PlannerItem } from "@/types/planner";
import PlannerTaskDialog from "./PlannerTaskDialog";
import { v4 as uuidv4 } from "uuid";

interface WeeklyPlannerProps {
  plannerData: PlannerDay[];
  onUpdatePlannerData?: (updatedData: PlannerDay[]) => void;
}

// Time slots for the agenda in American format (12-hour with AM/PM)
const TIME_SLOTS = [
  "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", 
  "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", 
  "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"
];

// Convert 12-hour format to 24-hour format for internal use
const TIME_SLOTS_24H = [
  "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", 
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", 
  "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"
];

export const WeeklyPlanner = ({ plannerData, onUpdatePlannerData }: WeeklyPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();
  
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

  // Get hour from time string for positioning
  const getHourFromTimeString = (timeString: string | undefined): number => {
    if (!timeString) return 0;
    const [hours] = timeString.split(':').map(Number);
    return hours || 0;
  };

  // Handle clicking on a time slot
  const handleTimeSlotClick = (day: Date, timeIndex: number) => {
    const dateString = format(day, "yyyy-MM-dd");
    setSelectedDate(dateString);
    setSelectedTime(TIME_SLOTS_24H[timeIndex]);
    setIsDialogOpen(true);
  };

  // Handle saving a new task
  const handleSaveTask = (task: Omit<PlannerItem, "id">) => {
    if (!onUpdatePlannerData) {
      toast({
        title: "Cannot save task",
        description: "The planner is in read-only mode",
        variant: "destructive",
      });
      return;
    }

    const newTask: PlannerItem = {
      ...task,
      id: uuidv4(),
    };

    const dateString = task.date;
    const existingDayIndex = plannerData.findIndex(day => day.date === dateString);

    let updatedPlannerData: PlannerDay[];

    if (existingDayIndex >= 0) {
      // Day exists, add task to existing day
      updatedPlannerData = [...plannerData];
      updatedPlannerData[existingDayIndex] = {
        ...updatedPlannerData[existingDayIndex],
        items: [...updatedPlannerData[existingDayIndex].items, newTask],
      };
    } else {
      // Day doesn't exist, create new day with task
      updatedPlannerData = [
        ...plannerData,
        {
          date: dateString,
          items: [newTask],
        },
      ];
    }

    onUpdatePlannerData(updatedPlannerData);
    
    toast({
      title: "Task added",
      description: "Your task has been added to the planner",
    });
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
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative" style={{ height: '700px' }}>
          {/* Time column for agenda view */}
          <div className="absolute left-0 top-0 w-16 h-full z-10 bg-white">
            <div className="h-12 border-b"></div> {/* Empty cell for the day headers */}
            {TIME_SLOTS.map((time, index) => (
              <div key={`agenda-time-${index}`} className="h-[28px] relative border-b border-gray-200 text-xs text-gray-500">
                <span className="absolute -top-2.5 left-2">{time}</span>
              </div>
            ))}
          </div>

          <div className="ml-16 grid grid-cols-7 h-full">
            {/* Day headers for agenda view */}
            <div className="col-span-7 grid grid-cols-7 h-12 border-b">
              {weekDays.map((day, index) => (
                <div key={`header-agenda-${index}`} className="text-center p-2 font-medium">
                  <div className="text-sm">{format(day, "EEE")}</div>
                  <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
                </div>
              ))}
            </div>
            
            {/* Calendar cells */}
            <div className="col-span-7 grid grid-cols-7 h-[688px]">
              {weekDays.map((day, dayIndex) => {
                const items = getDayItems(day);
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <div 
                    key={`day-agenda-${dayIndex}`} 
                    className={`border-r overflow-y-auto relative ${isToday ? "bg-primary/5" : ""}`}
                  >
                    {/* Time grid lines for agenda view */}
                    {TIME_SLOTS.map((_, timeIndex) => (
                      <div 
                        key={`agenda-grid-${dayIndex}-${timeIndex}`} 
                        className="h-[28px] border-b border-gray-200 relative group"
                        onClick={() => handleTimeSlotClick(day, timeIndex)}
                      >
                        {onUpdatePlannerData && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-primary/5 cursor-pointer transition-opacity">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="absolute w-full">
                      {items.map((item) => {
                        // Calculate position based on 24-hour clock
                        // For 1 AM (01:00) to midnight (00:00)
                        let positionTop = 0;
                        if (item.startTime) {
                          const [hours, minutes] = item.startTime.split(':').map(Number);
                          // Adjust for midnight (00:00) which should be at the bottom
                          const adjustedHour = hours === 0 ? 24 : hours;
                          // 1 AM is position 0, so subtract 1 from hour
                          positionTop = (adjustedHour - 1) * 28 + (minutes / 60) * 28;
                        }
                          
                        return (
                          <div 
                            key={item.id}
                            className={`
                              text-xs p-1.5 rounded border mx-1 my-1
                              ${item.isCompleted ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-200"}
                              ${item.section === "morning" ? "border-l-4 border-l-blue-500" : ""}
                              ${item.section === "midday" ? "border-l-4 border-l-amber-500" : ""}
                              ${item.section === "afternoon" ? "border-l-4 border-l-orange-500" : ""}
                              ${item.section === "evening" ? "border-l-4 border-l-purple-500" : ""}
                            `}
                            style={item.startTime ? {
                              position: 'absolute',
                              top: `${positionTop}px`,
                              width: 'calc(100% - 0.5rem)',
                              zIndex: 5
                            } : {}}
                          >
                            {item.startTime && (
                              <div className="font-semibold text-xs text-muted-foreground flex items-center">
                                <AlarmClock className="h-3 w-3 mr-1" />
                                {formatTime(item.startTime)}
                                {item.endTime && ` - ${formatTime(item.endTime)}`}
                              </div>
                            )}
                            <div className={`${item.isCompleted ? "line-through opacity-70" : ""}`}>
                              {item.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Task dialog for adding new tasks */}
      <PlannerTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </Card>
  );
};

export default WeeklyPlanner;
