import { useState } from "react";
import { Edit, Clock, Palette, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlannerDerived, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";
import { cn } from "@/lib/utils";

// Color palette organized by color groups (5 shades each, light to dark)
const colorGroups = {
  pink: [
    { name: 'pink-1', hex: '#fdf2f8' },
    { name: 'pink-2', hex: '#fce7f3' },
    { name: 'pink-3', hex: '#fbcfe8' },
    { name: 'pink-4', hex: '#f9a8d4' },
    { name: 'pink-5', hex: '#f472b6' },
  ],
  purple: [
    { name: 'purple-1', hex: '#faf5ff' },
    { name: 'purple-2', hex: '#f3e8ff' },
    { name: 'purple-3', hex: '#e9d5ff' },
    { name: 'purple-4', hex: '#d8b4fe' },
    { name: 'purple-5', hex: '#c084fc' },
  ],
  blue: [
    { name: 'blue-1', hex: '#eff6ff' },
    { name: 'blue-2', hex: '#dbeafe' },
    { name: 'blue-3', hex: '#bfdbfe' },
    { name: 'blue-4', hex: '#93c5fd' },
    { name: 'blue-5', hex: '#60a5fa' },
  ],
  green: [
    { name: 'green-1', hex: '#f0fdf4' },
    { name: 'green-2', hex: '#dcfce7' },
    { name: 'green-3', hex: '#bbf7d0' },
    { name: 'green-4', hex: '#86efac' },
    { name: 'green-5', hex: '#4ade80' },
  ],
  sage: [
    { name: 'sage-1', hex: '#f6f7f4' },
    { name: 'sage-2', hex: '#e8ebe4' },
    { name: 'sage-3', hex: '#d4dbc9' },
    { name: 'sage-4', hex: '#b7c4a1' },
    { name: 'sage-5', hex: '#9aab7f' },
  ],
  brown: [
    { name: 'brown-1', hex: '#faf7f5' },
    { name: 'brown-2', hex: '#f5ebe0' },
    { name: 'brown-3', hex: '#e6d5c3' },
    { name: 'brown-4', hex: '#d4a574' },
    { name: 'brown-5', hex: '#b8956c' },
  ],
  yellow: [
    { name: 'yellow-1', hex: '#fefce8' },
    { name: 'yellow-2', hex: '#fef9c3' },
    { name: 'yellow-3', hex: '#fef08a' },
    { name: 'yellow-4', hex: '#fde047' },
    { name: 'yellow-5', hex: '#facc15' },
  ],
  rosewood: [
    { name: 'rosewood-1', hex: '#f5eaea' },
    { name: 'rosewood-2', hex: '#e5d4d4' },
    { name: 'rosewood-3', hex: '#c9aaaa' },
    { name: 'rosewood-4', hex: '#ad8a8a' },
    { name: 'rosewood-5', hex: '#927071' },
  ],
};

interface TaskDialogProps {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
}

export const TaskDialog = ({ state, derived, refs, setters, actions }: TaskDialogProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const {
    isTaskDialogOpen,
    editingTask,
    dialogTaskTitle,
    dialogTaskDescription,
    dialogStartTime,
    dialogEndTime,
    dialogTaskColor,
    dialogAddToContentCalendar,
  } = state;

  const { titleInputRef, startTimeInputRef, endTimeInputRef, descriptionInputRef } = refs;
  const {
    setDialogTaskTitle,
    setDialogTaskDescription,
    setDialogStartTime,
    setDialogEndTime,
    setDialogTaskColor,
    setDialogAddToContentCalendar,
  } = setters;
  const {
    handleCancelTaskDialog,
    handleSaveTaskDialog,
    handleStartTimeChange,
    handleEndTimeChange,
    handleStartTimeFocus,
    handleEndTimeFocus,
    handleStartTimeBlur,
    handleEndTimeBlur,
    handleTitleFocus,
    handleTitleKeyDown,
    handleStartTimeKeyDown,
    handleEndTimeKeyDown,
  } = actions;

  return (
<Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
  if (!open) {
    handleCancelTaskDialog();
  }
}}>
  <DialogContent
    className="sm:max-w-[500px] p-0 gap-0 bg-[#ffffff] z-[200]"
    style={{ backgroundColor: '#ffffff' }}
    onOpenAutoFocus={(e) => e.preventDefault()}
  >
    <DialogHeader className="px-6 pt-6 pb-2">
      <DialogTitle className="flex items-center gap-3">
        <Edit className="w-5 h-5 text-gray-500" />
        <span className="text-base font-medium text-gray-700">{editingTask?.id ? 'Edit Task' : 'Add Task'}</span>
      </DialogTitle>
    </DialogHeader>

    <div className="px-6 pb-6 space-y-5">
      {/* Task Title */}
      <div>
        <Input
          ref={titleInputRef}
          placeholder="Add title"
          value={dialogTaskTitle}
          onChange={(e) => setDialogTaskTitle(e.target.value)}
          onFocus={handleTitleFocus}
          onKeyDown={handleTitleKeyDown}
          autoFocus={false}
          className="text-lg border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-400 placeholder:text-gray-400"
        />
      </div>

      {/* Time inputs */}
      <div className="flex items-center gap-3">
        <Clock size={18} className="text-gray-500 flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1">
          <Input
            ref={startTimeInputRef}
            type="text"
            value={dialogStartTime}
            onChange={handleStartTimeChange}
            onFocus={handleStartTimeFocus}
            onBlur={handleStartTimeBlur}
            onKeyDown={handleStartTimeKeyDown}
            placeholder="9:00 am"
            className="flex-1 h-9 text-sm"
            maxLength={8}
          />
          <span className="text-gray-400">—</span>
          <Input
            ref={endTimeInputRef}
            type="text"
            value={dialogEndTime}
            onChange={handleEndTimeChange}
            onFocus={handleEndTimeFocus}
            onBlur={handleEndTimeBlur}
            onKeyDown={handleEndTimeKeyDown}
            placeholder="10:00 pm"
            className="flex-1 h-9 text-sm"
            maxLength={8}
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex items-start gap-3">
        <Edit size={18} className="text-gray-500 flex-shrink-0 mt-2" />
        <Textarea
          ref={descriptionInputRef}
          placeholder="Add description"
          value={dialogTaskDescription}
          onChange={(e) => setDialogTaskDescription(e.target.value)}
          rows={3}
          className="flex-1 resize-none text-sm"
        />
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-3">
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              {dialogTaskColor ? (
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: dialogTaskColor }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200" style={{
                  background: 'conic-gradient(from 0deg, #f9a8d4, #d8b4fe, #93c5fd, #86efac, #fde047, #d4a574, #f9a8d4)'
                }} />
              )}
              <span className="text-sm text-gray-600">
                {dialogTaskColor ? 'Change color' : 'Add color'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 z-[300] bg-white shadow-lg border" align="start">
            <div className="space-y-3">
              {/* No color option */}
              <button
                type="button"
                onClick={() => {
                  setDialogTaskColor('');
                  setIsColorPickerOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors",
                  !dialogTaskColor && "bg-gray-100"
                )}
              >
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <XIcon className="w-3 h-3 text-gray-400" />
                </div>
                No color
              </button>

              {/* Color grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {Object.values(colorGroups).flat().map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => {
                      setDialogTaskColor(color.hex);
                      setIsColorPickerOpen(false);
                    }}
                    className={cn(
                      "w-7 h-7 rounded-md transition-all hover:scale-110",
                      dialogTaskColor === color.hex && "ring-2 ring-offset-1 ring-gray-400"
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Completed Checkbox */}
      <div className="flex items-center gap-3 pt-2">
        <Checkbox
          id="add-to-content-calendar"
          checked={dialogAddToContentCalendar}
          onCheckedChange={(checked) => setDialogAddToContentCalendar(checked as boolean)}
          className="h-5 w-5"
        />
        <label
          htmlFor="add-to-content-calendar"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Include in content calendar
        </label>
      </div>
    </div>

    <DialogFooter className="px-6 py-4 bg-gray-50 flex-row justify-end gap-2 sm:space-x-0">
      <Button variant="ghost" onClick={handleCancelTaskDialog} className="px-4">
        Cancel
      </Button>
      <Button onClick={handleSaveTaskDialog} className="px-6 bg-blue-600 hover:bg-blue-700">
        {editingTask ? 'Save' : 'Create'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  );
};
