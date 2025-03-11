import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks, parseISO, isBefore, isAfter, isSameDay, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, AlarmClock, Plus, Filter, Printer, Calendar as CalendarIcon, Move, Search, MoveVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CategoryDefinition, PlannerDay, PlannerItem, TaskFilter, CalendarIntegration } from "@/types/planner";
import PlannerTaskDialog from "./PlannerTaskDialog";
import TaskFilterComponent from "./TaskFilter";
import CalendarIntegrations from "./CalendarIntegrations";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { generateRecurringInstances } from "@/utils/recurringEvents";
import { Input } from "@/components/ui/input";

// Add this only if html2pdf.js is being used
import html2pdf from "html2pdf.js";

// Time slots for the agenda in American format (12-hour with AM/PM)
const TIME_SLOTS = [
  "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", 
  "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", 
  "10 PM", "11 PM"
];

// Convert 12-hour format to 24-hour format for internal use
const TIME_SLOTS_24H = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", 
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", 
  "22:00", "23:00"
];

interface WeeklyPlannerProps {
  plannerData: PlannerDay[];
  onUpdatePlannerData?: (updatedData: PlannerDay[]) => void;
}

export const WeeklyPlanner = ({ plannerData, onUpdatePlannerData }: WeeklyPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [filter, setFilter] = useState<TaskFilter>({});
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [draggedItem, setDraggedItem] = useState<PlannerItem | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragOverTime, setDragOverTime] = useState<number | null>(null);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    { type: "google", connected: false },
    { type: "outlook", connected: false },
    { type: "apple", connected: false },
    { type: "ical", connected: false },
  ]);
  const [searchText, setSearchText] = useState("");
  const weeklyPlannerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Generate the 7 days of the week
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));
  
  // Find all unique categories from planner data
  useEffect(() => {
    const allCategories = new Map<string, CategoryDefinition>();
    
    plannerData.forEach(day => {
      day.items.forEach(item => {
        if (item.category && item.categoryColor) {
          allCategories.set(item.category, {
            id: item.category,
            name: item.category,
            color: item.categoryColor
          });
        }
      });
    });
    
    setCategories(Array.from(allCategories.values()));
  }, [plannerData]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addWeeks(prevDate, 1));
  };

  // Get planner items for a specific day, including recurring instances
  const getDayItems = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const weekStart = format(weekDays[0], "yyyy-MM-dd");
    const weekEnd = format(weekDays[6], "yyyy-MM-dd");
    
    // Get the base items for this day
    const dayData = plannerData.find(day => day.date === dateString);
    const baseItems = dayData?.items || [];
    
    // Get all recurring items that might show up in this week
    const recurringSourceItems = plannerData
      .flatMap(day => day.items)
      .filter(item => item.recurrenceRule && item.recurrenceRule.pattern !== "none");
    
    // Generate recurring instances for this week
    const recurringInstances = recurringSourceItems.flatMap(item => 
      generateRecurringInstances(item, weekStart, weekEnd)
    );
    
    // Filter recurring instances to only include the ones for this day
    const dayRecurringInstances = recurringInstances.filter(item => item.date === dateString);
    
    // Combine base items with recurring instances
    let combinedItems = [...baseItems, ...dayRecurringInstances];
    
    // Apply filters if specified
    if (filter.category) {
      combinedItems = combinedItems.filter(item => item.category === filter.category);
    }
    
    if (filter.completed !== undefined) {
      combinedItems = combinedItems.filter(item => item.isCompleted === filter.completed);
    }
    
    if (filter.section) {
      combinedItems = combinedItems.filter(item => item.section === filter.section);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      combinedItems = combinedItems.filter(item => 
        item.text.toLowerCase().includes(searchLower) || 
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.location && item.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Also apply the global search bar filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      combinedItems = combinedItems.filter(item => 
        item.text.toLowerCase().includes(searchLower) || 
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.location && item.location.toLowerCase().includes(searchLower))
      );
    }
    
    return combinedItems;
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
  
  // Calculate height based on time duration
  const calculateItemHeight = (item: PlannerItem): number => {
    if (!item.startTime || !item.endTime) return 42; // Default height
    
    const startHour = getHourFromTimeString(item.startTime);
    const startMinute = parseInt(item.startTime.split(':')[1], 10) || 0;
    
    const endHour = getHourFromTimeString(item.endTime);
    const endMinute = parseInt(item.endTime.split(':')[1], 10) || 0;
    
    const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Each hour is 42px, so calculate height based on duration
    return Math.max(42, (durationInMinutes / 60) * 42);
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
  
  // Handle category selection in filters
  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilter({});
    setSearchText("");
  };
  
  // Add a new category
  const handleAddCategory = (category: Omit<CategoryDefinition, "id">) => {
    const newCategory: CategoryDefinition = {
      ...category,
      id: uuidv4(),
    };
    
    setCategories(prev => [...prev, newCategory]);
    
    toast({
      title: "Category added",
      description: `New category "${category.name}" has been added`,
    });
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: PlannerItem) => {
    setDraggedItem(item);
    // Set drag image
    if (e.dataTransfer && e.target instanceof HTMLElement) {
      try {
        const dragGhost = e.target.cloneNode(true) as HTMLElement;
        dragGhost.style.width = `${e.target.offsetWidth}px`;
        dragGhost.style.transform = 'translateX(-100%)';
        dragGhost.style.position = 'absolute';
        dragGhost.style.top = '-1000px';
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 0, 0);
        
        setTimeout(() => {
          document.body.removeChild(dragGhost);
        }, 0);
      } catch (error) {
        console.error("Error setting drag image:", error);
      }
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, day: Date, timeIndex?: number) => {
    e.preventDefault();
    const dateString = format(day, "yyyy-MM-dd");
    setDragOverDay(dateString);
    if (timeIndex !== undefined) {
      setDragOverTime(timeIndex);
    }
  };
  
  // Handle drag end/drop
  const handleDrop = (e: React.DragEvent, day: Date, timeIndex?: number) => {
    e.preventDefault();
    if (!draggedItem || !onUpdatePlannerData) return;
    
    const newDate = format(day, "yyyy-MM-dd");
    let newTime = draggedItem.startTime;
    
    // If dropping on a specific time slot, update the time
    if (timeIndex !== undefined) {
      newTime = TIME_SLOTS_24H[timeIndex];
      
      // If the item has a duration, calculate the new end time
      if (draggedItem.endTime && draggedItem.startTime) {
        const oldStartHour = getHourFromTimeString(draggedItem.startTime);
        const oldStartMinute = parseInt(draggedItem.startTime.split(':')[1], 10) || 0;
        const oldEndHour = getHourFromTimeString(draggedItem.endTime);
        const oldEndMinute = parseInt(draggedItem.endTime.split(':')[1], 10) || 0;
        
        const durationInMinutes = (oldEndHour * 60 + oldEndMinute) - (oldStartHour * 60 + oldStartMinute);
        
        const newStartHour = getHourFromTimeString(newTime);
        const newStartMinute = parseInt(newTime.split(':')[1], 10) || 0;
        
        const newEndHour = Math.floor((newStartHour * 60 + newStartMinute + durationInMinutes) / 60);
        const newEndMinute = (newStartHour * 60 + newStartMinute + durationInMinutes) % 60;
        
        const formattedNewEndHour = String(newEndHour).padStart(2, '0');
        const formattedNewEndMinute = String(newEndMinute).padStart(2, '0');
        
        // Update the draggedItem with the new end time
        draggedItem.endTime = `${formattedNewEndHour}:${formattedNewEndMinute}`;
      }
    }
    
    // Create a new updated item with the new date and time
    const updatedItem: PlannerItem = {
      ...draggedItem,
      date: newDate,
      startTime: newTime,
    };
    
    // If this is a recurring event instance, create a new exception
    if (updatedItem.isRecurringInstance && updatedItem.parentId) {
      updatedItem.id = uuidv4(); // Generate a new ID for the exception
      updatedItem.isRecurringInstance = false; // No longer a recurring instance
      delete updatedItem.parentId; // Remove the parent ID reference
    }
    
    // Update the source day (remove the item from its original date)
    const sourceDay = plannerData.find(day => day.date === draggedItem.date);
    const updatedPlannerData = [...plannerData];
    
    if (sourceDay) {
      const sourceDayIndex = plannerData.findIndex(day => day.date === draggedItem.date);
      const updatedItems = sourceDay.items.filter(item => item.id !== draggedItem.id);
      
      updatedPlannerData[sourceDayIndex] = {
        ...sourceDay,
        items: updatedItems,
      };
    }
    
    // Update the target day (add the item to its new date)
    const targetDay = plannerData.find(day => day.date === newDate);
    
    if (targetDay) {
      const targetDayIndex = plannerData.findIndex(day => day.date === newDate);
      updatedPlannerData[targetDayIndex] = {
        ...targetDay,
        items: [...targetDay.items, updatedItem],
      };
    } else {
      updatedPlannerData.push({
        date: newDate,
        items: [updatedItem],
      });
    }
    
    // Save the updated planner data
    onUpdatePlannerData(updatedPlannerData);
    
    // Reset the drag state
    setDraggedItem(null);
    setDragOverDay(null);
    setDragOverTime(null);
    
    toast({
      title: "Task moved",
      description: `Task moved to ${format(day, "EEEE, MMMM d")}${newTime ? ` at ${formatTime(newTime)}` : ""}`,
    });
  };
  
  // Handle connect/disconnect to calendar services
  const handleConnectCalendar = async (type: CalendarIntegration["type"]) => {
    // This would be implemented with actual API calls to calendar services
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.type === type 
              ? { ...integration, connected: true, lastSynced: new Date().toISOString() } 
              : integration
          )
        );
        resolve();
      }, 1500);
    });
  };
  
  const handleDisconnectCalendar = async (type: CalendarIntegration["type"]) => {
    // This would be implemented with actual API calls to calendar services
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.type === type 
              ? { ...integration, connected: false, lastSynced: undefined } 
              : integration
          )
        );
        resolve();
      }, 1000);
    });
  };
  
  // Handle export to PDF or iCal
  const handleExport = async (type: "pdf" | "ical") => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (type === "pdf" && weeklyPlannerRef.current) {
          const options = {
            margin: 10,
            filename: `weekly-planner-${format(currentWeekStart, "yyyy-MM-dd")}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
          };
          
          html2pdf().from(weeklyPlannerRef.current).set(options).save();
          resolve();
        } else if (type === "ical") {
          // Generate iCal file
          let icalContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Lovable//WeeklyPlanner//EN\r\n";
          
          // Add all events from the week
          weekDays.forEach(day => {
            const items = getDayItems(day);
            
            items.forEach(item => {
              if (item.startTime) {
                const dateStr = item.date.replace(/-/g, '');
                const startTimeStr = item.startTime.replace(':', '') + '00';
                const endTimeStr = item.endTime ? item.endTime.replace(':', '') + '00' : '';
                
                icalContent += "BEGIN:VEVENT\r\n";
                icalContent += `SUMMARY:${item.text}\r\n`;
                icalContent += `DTSTART:${dateStr}T${startTimeStr}\r\n`;
                
                if (endTimeStr) {
                  icalContent += `DTEND:${dateStr}T${endTimeStr}\r\n`;
                }
                
                if (item.description) {
                  icalContent += `DESCRIPTION:${item.description}\r\n`;
                }
                
                if (item.location) {
                  icalContent += `LOCATION:${item.location}\r\n`;
                }
                
                icalContent += `UID:${item.id}\r\n`;
                icalContent += "END:VEVENT\r\n";
              }
            });
          });
          
          icalContent += "END:VCALENDAR";
          
          // Create and download the file
          const blob = new Blob([icalContent], { type: 'text/calendar' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `weekly-planner-${format(currentWeekStart, "yyyy-MM-dd")}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve();
        } else {
          reject(new Error("Invalid export type"));
        }
      } catch (error) {
        console.error("Export error:", error);
        reject(error);
      }
    });
  };
  
  // Check if item spans multiple days
  const isMultiDayEvent = (item: PlannerItem) => {
    return item.isMultiDay && item.endDate && item.date !== item.endDate;
  };
  
  // Get all days that a multi-day event spans
  const getMultiDayEventRange = (item: PlannerItem) => {
    if (!isMultiDayEvent(item)) return [item.date];
    
    const startDate = parseISO(item.date);
    const endDate = parseISO(item.endDate!);
    const dates: string[] = [];
    
    let currentDate = startDate;
    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  };
  
  // Check if item occurs on this day (either as a single day or part of multi-day)
  const itemOccursOnDay = (item: PlannerItem, dateString: string) => {
    if (item.date === dateString) return true;
    
    if (isMultiDayEvent(item)) {
      const range = getMultiDayEventRange(item);
      return range.includes(dateString);
    }
    
    return false;
  };
  
  // Check if item should display on this day
  const shouldDisplayOnDay = (item: PlannerItem, dateString: string) => {
    // If it's a multi-day event, check if this is the first day
    if (isMultiDayEvent(item)) {
      return item.date === dateString;
    }
    
    // For regular events, always display if this is their day
    return item.date === dateString;
  };

  return (
    <Card className="border-none shadow-none" ref={weeklyPlannerRef}>
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
          
          <div className="flex items-center gap-2 flex-wrap">
            <TaskFilterComponent 
              filter={filter}
              onFilterChange={handleFilterChange}
              categories={categories}
              onClearFilters={handleClearFilters}
            />
            
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("pdf")}>
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
            
            <CalendarIntegrations 
              integrations={integrations}
              onConnect={handleConnectCalendar}
              onDisconnect={handleDisconnectCalendar}
              onExport={handleExport}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative" style={{ height: '600px' }}>
          {/* Time column for agenda view */}
          <div className="absolute left-0 top-0 w-16 h-full z-10 bg-white">
            <div className="h-12 border-b"></div> {/* Empty cell for the day headers */}
            {TIME_SLOTS.map((time, index) => (
              <div key={`agenda-time-${index}`} className="h-[42px] relative border-b border-gray-200 text-xs text-gray-500">
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
            <div className="col-span-7 grid grid-cols-7 h-[588px]">
              {weekDays.map((day, dayIndex) => {
                const dayString = format(day, "yyyy-MM-dd");
                const items = getDayItems(day);
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                // Find multi-day events that span this day
                const multiDayItems = items.filter(item => isMultiDayEvent(item));
                
                return (
                  <div 
                    key={`day-agenda-${dayIndex}`} 
                    className={cn(
                      "border-r overflow-y-auto relative",
                      isToday ? "bg-primary/5" : "",
                      dragOverDay === dayString ? "bg-primary/10" : ""
                    )}
                    onDragOver={(e) => handleDragOver(e, day)}
                    onDrop={(e) => handleDrop(e, day)}
                  >
                    {/* Time grid lines for agenda view */}
                    {TIME_SLOTS.map((_, timeIndex) => (
                      <div 
                        key={`agenda-grid-${dayIndex}-${timeIndex}`} 
                        className={cn(
                          "h-[42px] border-b border-gray-200 relative group",
                          dragOverDay === dayString && dragOverTime === timeIndex ? "bg-primary/15" : ""
                        )}
                        onClick={() => handleTimeSlotClick(day, timeIndex)}
                        onDragOver={(e) => handleDragOver(e, day, timeIndex)}
                        onDrop={(e) => handleDrop(e, day, timeIndex)}
                      >
                        {onUpdatePlannerData && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-primary/5 cursor-pointer transition-opacity">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="absolute w-full">
                      {/* Display regular tasks and events */}
                      {items
                        .filter(item => shouldDisplayOnDay(item, dayString))
                        .map((item) => {
                          const positionTop = item.startTime ? 
                            Math.max(0, (getHourFromTimeString(item.startTime) - 10) * 42) : 0;
                          
                          const itemHeight = item.startTime && item.endTime ? 
                            calculateItemHeight(item) : 42;
                          
                          // Determine if this is the first day of a multi-day event
                          const isFirstDayOfMultiDay = isMultiDayEvent(item) && item.date === dayString;
                          
                          return (
                            <div 
                              key={item.id}
                              className={cn(
                                "text-xs p-1.5 rounded border mx-1 my-1 cursor-grab active:cursor-grabbing",
                                item.isCompleted ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-200",
                                item.section === "morning" ? "border-l-4 border-l-blue-500" : "",
                                item.section === "midday" ? "border-l-4 border-l-amber-500" : "",
                                item.section === "afternoon" ? "border-l-4 border-l-orange-500" : "",
                                item.section === "evening" ? "border-l-4 border-l-purple-500" : "",
                                item.isTimeBlock ? "bg-secondary/20" : "",
                                isMultiDayEvent(item) ? "border-l-4 border-l-purple-700" : "",
                                (item.category && item.categoryColor) ? `border-l-4` : ""
                              )}
                              style={{
                                ...(item.startTime ? {
                                  position: 'absolute',
                                  top: `${positionTop}px`,
                                  height: `${itemHeight}px`,
                                  width: 'calc(100% - 0.5rem)',
                                  zIndex: 5
                                } : {}),
                                ...(item.category && item.categoryColor ? {
                                  borderLeftColor: item.categoryColor
                                } : {})
                              }}
                              draggable={!!onUpdatePlannerData}
                              onDragStart={(e) => handleDragStart(e, item)}
                            >
                              {/* Time display */}
                              {item.startTime && (
                                <div className="font-semibold text-xs text-muted-foreground flex items-center">
                                  <AlarmClock className="h-3 w-3 mr-1" />
                                  {formatTime(item.startTime)}
                                  {item.endTime && ` - ${formatTime(item.endTime)}`}
                                </div>
                              )}
                              
                              {/* Multi-day indicator */}
                              {isFirstDayOfMultiDay && (
                                <div className="text-xs font-medium bg-primary/10 text-primary rounded px-1 mb-1 inline-block">
                                  Multiple days
                                </div>
                              )}
                              
                              {/* Item text */}
                              <div className={cn(
                                item.isCompleted ? "line-through opacity-70" : "",
                                "font-medium"
                              )}>
                                {item.text}
                              </div>
                              
                              {/* Location */}
                              {item.location && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  {item.location}
                                </div>
                              )}
                              
                              {/* Category */}
                              {item.category && (
                                <div 
                                  className="text-xs mt-1 px-1.5 py-0.5 rounded-full inline-flex items-center bg-gray-100"
                                  style={{ color: item.categoryColor }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: item.categoryColor }}></span>
                                  {item.category}
                                </div>
                              )}
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
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </Card>
  );
};

export default WeeklyPlanner;
