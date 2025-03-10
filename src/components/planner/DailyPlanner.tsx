import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Copy, Trash2, StickyNote, Sun, Heart, ListTodo, BookmarkCheck, Plus, Edit, X } from "lucide-react";
import { PlannerDay, PlannerItem, GeneralTasks } from "@/types/planner";
import { PlannerSection } from "./PlannerSection";
import { VisionBoardButton } from "./VisionBoardButton";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

export const DailyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [generalTasks, setGeneralTasks] = useState<GeneralTasks[]>([]);
  const [newGeneralTask, setNewGeneralTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState<string>("");
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [tasks, setTasks] = useState<string>("");
  const [greatDay, setGreatDay] = useState<string>("");
  const [grateful, setGrateful] = useState<string>("");

  const dateString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const savedData = localStorage.getItem("plannerData");
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
    
    const savedGeneralTasks = localStorage.getItem("generalTasks");
    if (savedGeneralTasks) {
      setGeneralTasks(JSON.parse(savedGeneralTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);
  
  useEffect(() => {
    localStorage.setItem("generalTasks", JSON.stringify(generalTasks));
  }, [generalTasks]);

  useEffect(() => {
    const currentDay = plannerData.find(day => day.date === dateString);
    if (currentDay) {
      if (currentDay.notes) {
        setNotes(currentDay.notes);
      } else {
        setNotes("");
      }
      
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
      setNotes("");
      setTasks("");
      setGreatDay("");
      setGrateful("");
    }
  }, [dateString, plannerData]);

  const currentDay = plannerData.find(day => day.date === dateString) || {
    date: dateString,
    items: [],
    notes: "",
    tasks: "",
    greatDay: "",
    grateful: ""
  };

  const getSectionItems = (section: PlannerItem["section"]) => {
    return currentDay.items.filter(item => item.section === section);
  };

  const handleAddGeneralTask = () => {
    if (newGeneralTask.trim() === "") return;
    
    const newTask: GeneralTasks = {
      id: Date.now().toString(),
      text: newGeneralTask,
      isCompleted: false
    };
    
    setGeneralTasks([...generalTasks, newTask]);
    setNewGeneralTask("");
    toast.success("Task added to general tasks");
  };

  const handleToggleGeneralTask = (id: string) => {
    const updatedTasks = generalTasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setGeneralTasks(updatedTasks);
  };

  const handleDeleteGeneralTask = (id: string) => {
    setGeneralTasks(generalTasks.filter(task => task.id !== id));
    toast.success("Task removed from general tasks");
  };

  const handleEditGeneralTask = (id: string) => {
    const task = generalTasks.find(task => task.id === id);
    if (task) {
      setEditingTaskId(id);
      setEditingTaskText(task.text);
    }
  };

  const saveEditedGeneralTask = () => {
    if (!editingTaskId) return;
    
    const updatedTasks = generalTasks.map(task => 
      task.id === editingTaskId ? { ...task, text: editingTaskText } : task
    );
    
    setGeneralTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingTaskText("");
    toast.success("Task updated");
  };

  const moveTaskToDay = (taskId: string) => {
    const task = generalTasks.find(task => task.id === taskId);
    if (!task) return;
    
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text: task.text,
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
    } else {
      setPlannerData([...plannerData, { 
        date: dateString, 
        items: [newItem],
        notes: notes,
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      }]);
    }
    
    handleDeleteGeneralTask(taskId);
    toast.success("Task moved to today's planner");
  };

  const handleAddItem = (text: string, section: PlannerItem["section"]) => {
    const newItem: PlannerItem = {
      id: Date.now().toString(),
      text,
      section,
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
    } else {
      setPlannerData([...plannerData, { 
        date: dateString, 
        items: [newItem],
        notes: "",
        greatDay: "",
        grateful: ""
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

  const handleEditItem = (id: string, newText: string) => {
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const itemIndex = updatedPlannerData[dayIndex].items.findIndex(item => item.id === id);
    
    if (itemIndex >= 0) {
      updatedPlannerData[dayIndex].items[itemIndex] = {
        ...updatedPlannerData[dayIndex].items[itemIndex],
        text: newText
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
    }
  };

  const copyTemplate = () => {
    if (!copyToDate) return;
    
    const targetDateString = copyToDate.toISOString().split('T')[0];
    
    if (targetDateString === dateString) {
      toast.error("Cannot copy to the same day");
      return;
    }
    
    const newItems = currentDay.items.map(item => ({
      ...item,
      id: Date.now() + Math.random().toString(),
      date: targetDateString,
      isCompleted: false
    }));
    
    const targetDayIndex = plannerData.findIndex(day => day.date === targetDateString);
    let updatedPlannerData = [...plannerData];
    
    if (targetDayIndex >= 0) {
      updatedPlannerData[targetDayIndex] = {
        ...updatedPlannerData[targetDayIndex],
        items: [...updatedPlannerData[targetDayIndex].items, ...newItems]
      };
    } else {
      updatedPlannerData = [...updatedPlannerData, {
        date: targetDateString,
        items: newItems
      }];
    }
    
    if (deleteAfterCopy) {
      const currentDayIndex = updatedPlannerData.findIndex(day => day.date === dateString);
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    const updatedPlannerData = [...plannerData];
    
    if (dayIndex >= 0) {
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        notes: newNotes
      };
    } else {
      updatedPlannerData.push({
        date: dateString,
        items: [],
        notes: newNotes,
        tasks: tasks,
        greatDay: greatDay,
        grateful: grateful
      });
    }
    
    setPlannerData(updatedPlannerData);
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
        notes: notes,
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
        notes: notes,
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
        notes: notes,
        greatDay: greatDay,
        grateful: newGrateful
      });
    }
    
    setPlannerData(updatedPlannerData);
  };

  const hasItems = currentDay.items.length > 0;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Daily Planner</CardTitle>
            <CardDescription>
              Plan your day and organize your schedule
            </CardDescription>
          </div>
          <VisionBoardButton />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Tasks</h3>
            </div>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="task" 
                    size="sm" 
                    className="ml-2"
                    onClick={handleAddGeneralTask}
                    disabled={!newGeneralTask.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Add a new task to your list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Input 
                placeholder="Add a new task or reminder..."
                value={newGeneralTask}
                onChange={(e) => setNewGeneralTask(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGeneralTask.trim() !== '') {
                    handleAddGeneralTask();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              {generalTasks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tasks yet. Add a task to get started!</p>
              ) : (
                generalTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group">
                    {editingTaskId === task.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input 
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedGeneralTask();
                            } else if (e.key === 'Escape') {
                              setEditingTaskId(null);
                            }
                          }}
                        />
                        <Button size="sm" variant="default" onClick={saveEditedGeneralTask}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTaskId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Checkbox 
                          checked={task.isCompleted}
                          onCheckedChange={() => handleToggleGeneralTask(task.id)}
                          id={`general-task-${task.id}`}
                        />
                        <label 
                          htmlFor={`general-task-${task.id}`}
                          className={cn(
                            "flex-1 text-sm cursor-pointer",
                            task.isCompleted && "line-through text-gray-500"
                          )}
                          onClick={() => handleToggleGeneralTask(task.id)}
                        >
                          {task.text}
                        </label>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            onClick={() => moveTaskToDay(task.id)}
                            title="Move to today"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            onClick={() => handleEditGeneralTask(task.id)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            onClick={() => handleDeleteGeneralTask(task.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePreviousDay}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{format(selectedDate, "EEEE, MMMM do, yyyy")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextDay}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <TooltipProvider delayDuration={0}>
              <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="ml-2 h-8 w-8"
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
                        className="ml-2 h-8 w-8"
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
        
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Today's Tasks</h3>
          </div>
          <div className="border rounded-lg p-1">
            <Textarea
              value={tasks}
              onChange={handleTasksChange}
              placeholder="Write down your tasks for the day..."
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
                      notes: notes,
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
            title="Evening Routine"
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
            <StickyNote className="h-5 w-5" />
            <h3 className="text-lg font-medium">Notes</h3>
          </div>
          <div className="border rounded-lg p-1">
            <Textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Write your notes, reminders or thoughts for the day..."
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-5 w-5 text-amber-500" />
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
                      notes: notes,
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
                      notes: notes,
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
  );
};
