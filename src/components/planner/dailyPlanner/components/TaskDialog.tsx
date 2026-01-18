import { Edit, Clock, Palette, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlannerDerived, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";

interface TaskDialogProps {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
}

export const TaskDialog = ({ state, derived, refs, setters, actions }: TaskDialogProps) => {
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
  const { colorOptions } = derived;
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
    <DialogHeader className="px-6 pt-6 pb-4">
      <DialogTitle className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
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
          className="text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-400"
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
        <Palette size={18} className="text-gray-500 flex-shrink-0" />
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => setDialogTaskColor(color.value)}
              className={`w-8 h-8 rounded-full border transition-all ${
                dialogTaskColor === color.value
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 border-gray-300'
                  : 'hover:scale-105 border-gray-200'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <button
            onClick={() => setDialogTaskColor('')}
            className={`w-8 h-8 rounded-full border-2 border-gray-300 transition-all flex items-center justify-center bg-white ${
              dialogTaskColor === ''
                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                : 'hover:scale-105'
            }`}
            title="No color"
          >
            <XIcon size={14} className="text-gray-400" />
          </button>
        </div>
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
