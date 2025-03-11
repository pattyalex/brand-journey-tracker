
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryDefinition, PlannerItem } from "@/types/planner";
import { loadGoogleMapsAPI, hasGoogleMapsError } from "@/utils/googleMapsLoader";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { RecurrenceRule } from "@/utils/recurringEvents";
import { format, addDays, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CategorySelector from "./CategorySelector";
import RecurringEventOptions from "./RecurringEventOptions";

interface PlannerTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<PlannerItem, "id">) => void;
  selectedDate: string;
  selectedTime: string;
  categories: CategoryDefinition[];
  onAddCategory?: (category: Omit<CategoryDefinition, "id">) => void;
}

export const PlannerTaskDialog = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedTime,
  categories = [],
  onAddCategory,
}: PlannerTaskDialogProps) => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState<"morning" | "midday" | "afternoon" | "evening">("morning");
  const [startTime, setStartTime] = useState(selectedTime);
  const [endTime, setEndTime] = useState("");
  const [isTimeBlock, setIsTimeBlock] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("basic");
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadGoogleMapsAPI(
        () => {
          setGoogleMapsLoaded(true);
          setGoogleMapsError(false);
        },
        () => {
          setGoogleMapsError(true);
          setGoogleMapsLoaded(false);
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (googleMapsLoaded && locationInputRef.current) {
      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(locationInputRef.current, {
          fields: ["name", "formatted_address"],
          types: ["establishment", "geocode"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            setLocation(place.formatted_address);
          } else if (place && place.name) {
            setLocation(place.name);
          }
        });

        return () => {
          if (locationInputRef.current) {
            const parent = locationInputRef.current.parentNode;
            if (parent) {
              const newInput = locationInputRef.current.cloneNode(true) as HTMLInputElement;
              parent.replaceChild(newInput, locationInputRef.current);
              locationInputRef.current = newInput;
            }
          }
        };
      } catch (error) {
        console.error("Error initializing Google Maps Autocomplete:", error);
        setGoogleMapsError(true);
      }
    }
  }, [googleMapsLoaded]);
  
  useEffect(() => {
    if (selectedDate && isMultiDay && !endDate) {
      setEndDate(format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd"));
    }
  }, [isMultiDay, selectedDate, endDate]);

  const handleSave = () => {
    if (!text.trim()) return;

    const taskData: Omit<PlannerItem, "id"> = {
      text,
      section,
      isCompleted: false,
      date: selectedDate,
      startTime: !isTimeBlock || startTime ? startTime : undefined,
      endTime: endTime === "" ? undefined : endTime,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      isTimeBlock,
      category: selectedCategory,
      categoryColor: selectedCategory 
        ? categories.find(c => c.id === selectedCategory)?.color 
        : undefined,
      recurrenceRule,
    };
    
    if (isMultiDay && endDate) {
      taskData.isMultiDay = true;
      taskData.endDate = endDate;
    }

    onSave(taskData);

    // Reset form
    setText("");
    setDescription("");
    setLocation("");
    setSection("morning");
    setEndTime("");
    setIsTimeBlock(false);
    setIsMultiDay(false);
    setEndDate("");
    setSelectedCategory(undefined);
    setRecurrenceRule(undefined);
    setActiveTab("basic");
    onClose();
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        times.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  
  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (date < parseISO(selectedDate)) {
      setEndDate(selectedDate);
    } else {
      setEndDate(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="time">Time & Date</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task">Task</Label>
              <Input
                id="task"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="grid gap-2 relative">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                ref={locationInputRef}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search for a location"
                className="pr-10"
              />
              {googleMapsError && (
                <div className="text-destructive flex items-center gap-1.5 text-xs mt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    Google Maps API not available. Please check your API key.
                  </span>
                </div>
              )}
              {!googleMapsLoaded && !googleMapsError && (
                <div className="text-xs text-gray-500 mt-1">
                  Loading Google Maps...
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Select value={section} onValueChange={(value: "morning" | "midday" | "afternoon" | "evening") => setSection(value)}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="midday">Midday</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Category</Label>
              <CategorySelector 
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                categories={categories}
                onAddCategory={onAddCategory}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4 py-4">
            <div className="flex items-center space-x-2 mb-2">
              <Switch 
                id="time-block" 
                checked={isTimeBlock}
                onCheckedChange={setIsTimeBlock}
              />
              <Label htmlFor="time-block">This is a time block (not a task)</Label>
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time {!isTimeBlock && "(Optional)"}</Label>
                <Select 
                  value={endTime} 
                  onValueChange={setEndTime}
                  disabled={isTimeBlock && !startTime}
                >
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder={isTimeBlock ? "Select end time" : "None"} />
                  </SelectTrigger>
                  <SelectContent>
                    {!isTimeBlock && <SelectItem value="">None</SelectItem>}
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time} disabled={startTime && time <= startTime}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center space-x-2 mb-2">
              <Switch 
                id="multi-day" 
                checked={isMultiDay}
                onCheckedChange={setIsMultiDay}
              />
              <Label htmlFor="multi-day">This is a multi-day event</Label>
            </div>
            
            {isMultiDay && (
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(parseISO(endDate), "PPP")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate ? parseISO(endDate) : undefined}
                      onSelect={handleEndDateSelect}
                      disabled={(date) => date < parseISO(selectedDate)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="py-4">
            <RecurringEventOptions
              recurrenceRule={recurrenceRule}
              onChange={setRecurrenceRule}
              startDate={selectedDate}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!text.trim() || (isTimeBlock && !startTime)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlannerTaskDialog;
