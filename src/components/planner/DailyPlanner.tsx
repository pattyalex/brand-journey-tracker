import { useState, useEffect } from "react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { Copy, Trash2, Heart, AlarmClock, CalendarIcon, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { PlannerDay, PlannerItem, GlobalPlannerData } from "@/types/planner";
import { PlannerSection } from "./PlannerSection";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

const CheckListIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-5 w-5 text-blue-500"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" className="text-blue-500" />
    <line x1="9" y1="9" x2="19" y2="9" className="text-blue-500" />
    <line x1="9" y1="15" x2="19" y2="15" className="text-blue-500" />
    <polyline points="5,9 6,10 8,7" className="text-blue-500" />
    <polyline points="5,15 6,16 8,13" className="text-blue-500" />
  </svg>
);

const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const DailyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
  
  const [globalTasks, setGlobalTasks] = useState<string>("");
  
  const [tasks, setTasks] = useState<string>("");
  const [greatDay, setGreatDay] = useState<string>("");
  const [grateful, setGrateful] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dateString = getDateString(selectedDate);

  useEffect(() => {
    const savedData = localStorage.getItem("plannerData");
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
    
    const savedGlobalData = localStorage.getItem("globalPlannerData");
    if (savedGlobalData) {
      const globalData: GlobalPlannerData = JSON.parse(savedGlobalData);
      setGlobalTasks(globalData.globalTasks || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);
  
  useEffect(() => {
    const globalData: GlobalPlannerData = { globalTasks };
    localStorage.setItem("globalPlannerData", JSON.stringify(globalData));
  }, [globalTasks]);

  useEffect(() => {
    const currentDay = plannerData.find(day => day.date === dateString);
    if (currentDay) {
      if (currentDay.tasks) {
        setTasks(currentDay.tasks);
      } else {
        setTasks("");
      }
      
      if (currentDay.greatDay) {
        setGreatDay(currentDay.greatDay);
      } else {
        setGreatDay("");
      }
      
      if (currentDay.grateful) {
        setGrateful(currentDay.grateful);
      } else {
        setGrateful("");
      }
    } else {
      setTasks("");
      setGreatDay("");
      setGrateful("");
    }
  }, [dateString, plannerData]);

  const currentDay = plannerData.find(day => day.date === dateString) || {
    date: dateString,
    items: [],
    tasks: "",
    greatDay: "",
    grateful: ""
  };

  const getSectionItems = (section: PlannerItem["section"]) => {
    return currentDay.items.filter(item => item.section === section);
  };

  const handleAddItem = (text: string, section: PlannerItem["section"], startTime?: string, endTime?: string) => {
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text,
      section,
      isCompleted: false,
      date: dateString,
      startTime,
      endTime
    };

    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    
    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items: [...updatedPlannerData[dayIndex].items, newItem]
      };
      setPlannerData(updatedPlannerData);
    } else {
      setPlannerData([...plannerData, { 
        date: dateString, 
        items: [newItem],
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      }]);
    }
  };

  const handleToggleItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);
    
    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        isCompleted: !updatedPlannerData[dayIndex].items[itemIndex].isCompleted
      };
      setPlannerData(updatedPlannerData);
    }
  };

  const handleDeleteItem = (id: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: updatedPlannerData[dayIndex].items.filter(item => item.id !== id)
    };
    setPlannerData(updatedPlannerData);
    toast.success("Item removed");
  };

  const handleEditItem = (id: string, newText: string, startTime?: string, endTime?: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);
    
    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText,
        startTime,
        endTime
      };
      setPlannerData(updatedPlannerData);
      toast.success("Item updated");
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const copyTemplate = () => {
    if (!copyToDate) return;
    
    const fromDateString = getDateString(selectedDate);
    const toDateString = getDateString(copyToDate);
    
    console.log("Copying from:", fromDateString, "to:", toDateString);
    
    if (fromDateString === toDateString) {
      toast.error("Cannot copy to the same day");
      return;
    }
    
    const newItems = currentDay.items.map(item => ({
      ...item,
      id: Date.now() + Math.random().toString(),
      date: toDateString,
      isCompleted: false
    }));
    
    const targetDayIndex = plannerData.findIndex(day => day.date === toDateString);
    let updatedPlannerData = [...plannerData];
    
    if (targetDayIndex >= 0) {
      updatedPlannerData[targetDayIndex] = {
        ...updatedPlannerData[targetDayIndex],
        items: [...updatedPlannerData[targetDayIndex].items, ...newItems]
      };

      if (currentDay.tasks) {
        updatedPlannerData[targetDayIndex].tasks = currentDay.tasks;
      }
    } else {
      updatedPlannerData = [...updatedPlannerData, {
        date: toDateString,
        items: newItems,
        tasks: currentDay.tasks || "",
      }];
    }
    
    if (deleteAfterCopy) {
      const currentDayIndex = updatedPlannerData.findIndex(day => day.date === fromDateString);
      if (currentDayIndex >= 0) {
        updatedPlannerData.splice(currentDayIndex, 1);
        toast.success(`Template copied to ${format(copyToDate, "MMMM do, yyyy")} and deleted from current day`);
      }
    } else {
      toast.success(`Template copied to ${format(copyToDate, "MMMM do, yyyy")}`);
    }
    
    setPlannerData(updatedPlannerData);
    setIsCopyDialogOpen(false);
    setCopyToDate(undefined);
    setDeleteAfterCopy(false);
  };

  const handleDeleteAllItems = () => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    
    if (dayIndex >= 0) {
      const updatedPlannerData = [...plannerData];
      updatedPlannerData.splice(dayIndex, 1);
      setPlannerData(updatedPlannerData);
      toast.success(`All items for ${format(selectedDate, "MMMM do, yyyy")} have been deleted`);
    } else {
      toast.info("No items to delete for this day");
    }
  };

  const handleGlobalTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGlobalTasks = e.target.value;
    setGlobalTasks(newGlobalTasks);
  };

  const handleTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTasks = e.target.value;
    setTasks(newTasks);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        tasks: newTasks
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: newTasks,
        greatDay: greatDay,
        grateful: grateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const handleGreatDayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGreatDay = e.target.value;
    setGreatDay(newGreatDay);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        greatDay: newGreatDay
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: tasks,
        greatDay: newGreatDay,
        grateful: grateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const handleGratefulChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newGrateful = e.target.value;
    setGrateful(newGrateful);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        grateful: newGrateful
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        tasks: tasks,
        greatDay: greatDay,
        grateful: newGrateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const hasItems = currentDay.items.length > 0;

  const daysWithItems = plannerData
    .filter(day => day.items.length > 0)
    .map(day => {
      const [year, month, day_num] = day.date.split('-').map(Number);
      return new Date(year, month - 1, day_num);
    });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    const sourceSection = source.droppableId as PlannerItem["section"];
    const destSection = destination.droppableId as PlannerItem["section"];
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;
    
    const updatedPlannerData = [...plannerData];
    const sourceItems = getSectionItems(sourceSection);
    const destItems = sourceSection === destSection 
      ? sourceItems 
      : getSectionItems(destSection);
    
    const itemToMove = sourceItems[source.index];
    
    if (!itemToMove) return;
    
    const newSourceItems = updatedPlannerData[dayIndex].items.filter(
      item => !(item.id === itemToMove.id && item.section === sourceSection)
    );
    
    const updatedItem = {
      ...itemToMove,
      section: destSection
    };
    
    const newItems = [...newSourceItems];
    
    const insertIndex = newItems.filter(i => i.section === destSection).length <= destination.index
      ? newItems.length
      : newItems.findIndex((item, idx) => {
          const sectionItems = newItems.filter(i => i.section === destSection);
          return item.section === destSection && idx === destination.index;
        });
    
    if (insertIndex >= 0) {
      newItems.splice(insertIndex, 0, updatedItem);
    } else {
      newItems.push(updatedItem);
    }
    
    updatedPlannerData[dayIndex] = {
      ...updatedPlannerData[dayIndex],
      items: newItems
    };
    
    setPlannerData(updatedPlannerData);
    toast.success(`Task moved to ${destSection}`);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Card className="border-none shadow-none">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <AlarmClock className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">To Do Later</h3>
          </div>
          <div className="border rounded-lg p-1">
            <Textarea
              value={globalTasks}
              onChange={handleGlobalTasksChange}
              placeholder="Write the tasks you plan to complete later but haven't scheduled yet..."
              className="min-h-[120px] resize-none"
              onTextSelect={(selectedText) => {
                if (selectedText) {
                  const newItem: PlannerItem = {
                    id: Date.now().toString(),
                    text: selectedText,
                    section: "morning",
                    isCompleted: false,
                    date: dateString
                  };
                  
                  const dayIndex = plannerData.findIndex(day => day.date === dateString);
                  
                  if (dayIndex >= 0) {
                    const updatedPlannerData = [...plannerData];
                    updatedPlannerData[dayIndex] = {
                      ...updatedPlannerData[dayIndex],
                      items: [...updatedPlannerData[dayIndex].items, newItem]
                    };
                    setPlannerData(updatedPlannerData);
                    toast.success("Added as a task for today!");
                  } else {
                    setPlannerData([...plannerData, { 
                      date: dateString, 
                      items: [newItem],
                      tasks: tasks,
                      greatDay: greatDay,
                      grateful: grateful
                    }]);
                    toast.success("Added as a task for today!");
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium">To Do Today</h3>
          </div>
        </div>

        <CardHeader className="px-0 pt-0 pb-2">
          <div className="flex flex-col space-y-4">            
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePreviousDay} className="mr-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-medium"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              
              <Button variant="outline" size="icon" onClick={handleNextDay} className="ml-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <TooltipProvider delayDuration={0}>
                <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!hasItems}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p>Copy Template</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Copy template to another day</DialogTitle>
                      <DialogDescription>
                        Select the date you want to copy this day's template to.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Calendar
                        mode="single"
                        selected={copyToDate}
                        onSelect={setCopyToDate}
                        initialFocus
                      />
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <Checkbox 
                        id="delete-after-copy" 
                        checked={deleteAfterCopy}
                        onCheckedChange={(checked) => setDeleteAfterCopy(checked === true)}
                      />
                      <label
                        htmlFor="delete-after-copy"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Delete template from current day after copying
                      </label>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCopyDialogOpen(false);
                          setDeleteAfterCopy(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={copyTemplate}
                        disabled={!copyToDate}
                      >
                        Copy template
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={0}>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!hasItems}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p>Delete All</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all items for this day?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all planner items 
                        for {format(selectedDate, "MMMM do, yyyy")}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllItems}>
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 pt-0">
          <div className="mb-2">
            <CardDescription>
              Schedule your tasks:
            </CardDescription>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PlannerSection
              title="Morning Routine"
              items={getSectionItems("morning")}
              section="morning"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Morning"
              items={getSectionItems("midday")}
              section="midday"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Afternoon"
              items={getSectionItems("afternoon")}
              section="afternoon"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
            
            <PlannerSection
              title="Evening"
              items={getSectionItems("evening")}
              section="evening"
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onAddItem={handleAddItem}
            />
          </div>
          
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-medium">What would make today great?</h3>
            </div>
            <div className="border rounded-lg p-1">
              <Textarea
                value={greatDay}
                onChange={handleGreatDayChange}
                placeholder="List 1-3 things that would make today wonderful..."
                className="min-h-[120px] resize-none"
                onTextSelect={(selectedText) => {
                  if (selectedText) {
                    const newItem: PlannerItem = {
                      id: Date.now().toString(),
                      text: selectedText,
                      section: "morning",
                      isCompleted: false,
                      date: dateString
                    };
                    
                    const dayIndex = plannerData.findIndex(day => day.date === dateString);
                    
                    if (dayIndex >= 0) {
                      const updatedPlannerData = [...plannerData];
                      updatedPlannerData[dayIndex] = {
                        ...updatedPlannerData[dayIndex],
                        items: [...updatedPlannerData[dayIndex].items, newItem]
                      };
                      setPlannerData(updatedPlannerData);
                      toast.success("Added as a task for today!");
                    } else {
                      setPlannerData([...plannerData, { 
                        date: dateString, 
                        items: [newItem],
                        tasks: tasks,
                        greatDay: greatDay,
                        grateful: grateful
                      }]);
                      toast.success("Added as a task for today!");
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-rose-500" />
              <h3 className="text-lg font-medium">Things I'm grateful for today</h3>
            </div>
            <div className="border rounded-lg p-1">
              <Textarea
                value={grateful}
                onChange={handleGratefulChange}
                placeholder="List 1-3 things you're grateful for today..."
                className="min-h-[120px] resize-none"
                onTextSelect={(selectedText) => {
                  if (selectedText) {
                    const newItem: PlannerItem = {
                      id: Date.now().toString(),
                      text: selectedText,
                      section: "morning",
                      isCompleted: false,
                      date: dateString
                    };
                    
                    const dayIndex = plannerData.findIndex(day => day.date === dateString);
                    
                    if (dayIndex >= 0) {
                      const updatedPlannerData = [...plannerData];
                      updatedPlannerData[dayIndex] = {
                        ...updatedPlannerData[dayIndex],
                        items: [...updatedPlannerData[dayIndex].items, newItem]
                      };
                      setPlannerData(updatedPlannerData);
                      toast.success("Added as a task for today!");
                    } else {
                      setPlannerData([...plannerData, { 
                        date: dateString, 
                        items: [newItem],
                        tasks: tasks,
                        greatDay: greatDay,
                        grateful: grateful
                      }]);
                      toast.success("Added as a task for today!");
                    }
                  }
                }}
              />
            </div>
          </div>
          
        </CardContent>
      </Card>
    </DragDropContext>
  );
};
