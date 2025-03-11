
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlannerItem } from "@/types/planner";
import { loadGoogleMapsAPI, hasGoogleMapsError } from "@/utils/googleMapsLoader";
import { AlertTriangle } from "lucide-react";

interface PlannerTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<PlannerItem, "id">) => void;
  selectedDate: string;
  selectedTime: string;
}

export const PlannerTaskDialog = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedTime,
}: PlannerTaskDialogProps) => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [section, setSection] = useState<"morning" | "midday" | "afternoon" | "evening">("morning");
  const [startTime, setStartTime] = useState(selectedTime);
  const [endTime, setEndTime] = useState("none");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
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

  const handleSave = () => {
    if (!text.trim()) return;

    onSave({
      text,
      section,
      isCompleted: false,
      date: selectedDate,
      startTime,
      endTime: endTime === "none" ? undefined : endTime,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
    });

    setText("");
    setDescription("");
    setLocation("");
    setSection("morning");
    setEndTime("none");
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Label htmlFor="end-time">End Time (Optional)</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger id="end-time">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {timeOptions.map((time) => (
                  <SelectItem key={`end-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlannerTaskDialog;
