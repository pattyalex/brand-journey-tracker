import { useState, useEffect } from "react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { Copy, Trash2, Sun, Heart, ListTodo, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { PlannerDay, PlannerItem } from "@/types/planner";
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
import { DragDropContext } from "react-beautiful-dnd";

const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const DailyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteAfterCopy, setDeleteAfterCopy] = useState(false);
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
  }, []);

  useEffect(() => {
    localStorage.setItem("plannerData", JSON.stringify(plannerData));
  }, [plannerData]);

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
      if (currentDay.greatDay) {
        updatedPlannerData[targetDayIndex].greatDay = currentDay.greatDay;
      }
      if (currentDay.grateful) {
        updatedPlannerData[targetDayIndex].grateful = currentDay.grateful;
      }
    } else {
      updatedPlannerData = [...updatedPlannerData, {
        date: toDateString,
        items: newItems,
        tasks: currentDay.tasks || "",
        greatDay: currentDay.greatDay || "",
        grateful: currentDay.grateful || ""
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

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const sourceSection = result.source.droppableId;
    const destinationSection = result.destination.droppableId;
    const itemId = result.draggableId;

    const dayIndex = plannerData.findIndex(day => day.date === dateString);
    if (dayIndex < 0) return;

    const updatedPlannerData = [...plannerData];
    const items = [...updatedPlannerData[dayIndex].items];
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      const [movedItem] = items.splice(itemIndex, 1);
      const updatedItem = {
        ...movedItem,
        section: destinationSection as PlannerItem["section"]
      };
      
      const destinationIndex = result.destination.index;
      items.splice(destinationIndex, 0, updatedItem);
      
      updatedPlannerData[dayIndex] = {
        ...updatedPlannerData[dayIndex],
        items
      };
      
      setPlannerData(updatedPlannerData);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <Che

