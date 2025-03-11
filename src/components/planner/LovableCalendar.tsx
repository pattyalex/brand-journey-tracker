
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlannerDay, PlannerItem } from "@/types/planner";
import { v4 as uuidv4 } from "uuid";
import PlannerTaskDialog from "./PlannerTaskDialog";

interface LovableCalendarProps {
  plannerData: PlannerDay[];
  onUpdatePlannerData?: (updatedData: PlannerDay[]) => void;
}

export const LovableCalendar = ({ plannerData, onUpdatePlannerData }: LovableCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const { toast } = useToast();

  const handlePreviousMonth = () => {
    setCurrentMonth(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevDate => addMonths(prevDate, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day of the month (0 is Sunday, 1 is Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Get planner items for a specific day
  const getDayItems = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayData = plannerData.find(day => day.date === dateString);
    return dayData?.items || [];
  };

  // Handle clicking on a day
  const handleDayClick = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    setSelectedDate(dateString);
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
      description: "Your task has been added to the calendar",
    });
  };

  // Helper function to get CSS classes for a task based on its section
  const getTaskClasses = (section: "morning" | "midday" | "afternoon" | "evening") => {
    switch (section) {
      case "morning":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "midday":
        return "bg-amber-100 border-amber-300 text-amber-800";
      case "afternoon":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "evening":
        return "bg-purple-100 border-purple-300 text-purple-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            Lovable Calendar <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium w-36 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={`header-${index}`} className="text-center p-2 font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Empty cells before the first day of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-start-${index}`} className="p-1 min-h-24 border rounded-md bg-gray-50" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day, index) => {
            const dateItems = getDayItems(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const hasItems = dateItems.length > 0;

            return (
              <div
                key={`day-${index}`}
                className={`p-1 min-h-24 border rounded-md relative ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                } ${isCurrentDay ? "ring-2 ring-primary ring-inset" : ""}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium p-1 ${isCurrentDay ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {onUpdatePlannerData && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1 mt-1 max-h-20 overflow-y-auto">
                  {dateItems.slice(0, 3).map((item) => (
                    <div 
                      key={item.id}
                      className={`text-xs p-1 rounded border truncate ${getTaskClasses(item.section)} ${
                        item.isCompleted ? "line-through opacity-70" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.text}
                    </div>
                  ))}
                  {dateItems.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dateItems.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty cells after the last day of the month */}
          {Array.from({ length: 6 - (daysInMonth.length + startDay - 1) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="p-1 min-h-24 border rounded-md bg-gray-50" />
          ))}
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

export default LovableCalendar;
