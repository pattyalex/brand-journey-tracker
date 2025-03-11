
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlannerItem } from "@/types/planner";

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
  const [endTime, setEndTime] = useState("none"); // Changed from empty string to "none"

  const handleSave = () => {
    if (!text.trim()) return;

    onSave({
      text,
      section,
      isCompleted: false,
      date: selectedDate,
      startTime,
      endTime: endTime === "none" ? undefined : endTime, // Convert "none" back to undefined
      description: description.trim() || undefined,
      location: location.trim() || undefined,
    });

    // Reset form
    setText("");
    setDescription("");
    setLocation("");
    setSection("morning");
    setEndTime("none");
    onClose();
  };

  // Helper to format times for the select dropdowns
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

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where will this task take place?"
            />
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
