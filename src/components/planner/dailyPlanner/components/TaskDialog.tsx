import { useEffect } from "react";
import { Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlannerDerived, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";
import { defaultTaskColor } from "../utils/colorConstants";
import { TaskColorPicker } from "./TaskColorPicker";
import { TimePicker } from "./TimePicker";

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
    taskDialogPosition,
    editingTask,
    dialogTaskTitle,
    dialogTaskDescription,
    dialogStartTime,
    dialogEndTime,
    dialogTaskColor,
  } = state;

  const { titleInputRef, startTimeInputRef, endTimeInputRef, descriptionInputRef } = refs;
  const {
    setDialogTaskTitle,
    setDialogTaskDescription,
    setDialogStartTime,
    setDialogEndTime,
    setDialogTaskColor,
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

  // Set default color to Blush Mauve if no color selected
  useEffect(() => {
    if (!dialogTaskColor) {
      setDialogTaskColor(defaultTaskColor.fill);
    }
  }, [dialogTaskColor, setDialogTaskColor]);

  if (!isTaskDialogOpen) return null;

  // Calculate popover position based on click coordinates (Google Calendar style)
  const getPopoverStyle = (): React.CSSProperties => {
    if (!taskDialogPosition) {
      // Fallback to center if no position
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const popoverWidth = 400;
    const popoverHeight = 480; // Approximate height
    const gap = 12; // Gap between click point and popover
    const padding = 16;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const clickX = taskDialogPosition.x;
    const clickY = taskDialogPosition.y;

    let x: number;
    let y: number;

    // Horizontal positioning: appear to the right or left of click
    const spaceOnRight = viewportWidth - clickX;
    const spaceOnLeft = clickX;

    if (spaceOnRight >= popoverWidth + gap + padding) {
      // Position to the right of click
      x = clickX + gap;
    } else if (spaceOnLeft >= popoverWidth + gap + padding) {
      // Position to the left of click
      x = clickX - popoverWidth - gap;
    } else {
      // Not enough space on either side, center horizontally
      x = Math.max(padding, (viewportWidth - popoverWidth) / 2);
    }

    // Vertical positioning: try to align top with click, but adjust if needed
    y = clickY - 60; // Offset slightly above the click point

    // Adjust Y to keep popover on screen
    if (y + popoverHeight + padding > viewportHeight) {
      y = viewportHeight - popoverHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    return {
      top: y,
      left: x,
      transform: 'none',
    };
  };

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Invisible backdrop for click outside to close */}
      <div
        className="absolute inset-0"
        onClick={handleCancelTaskDialog}
      />

      {/* Popover-style container */}
      <div
        className="absolute w-full max-w-md px-4"
        style={getPopoverStyle()}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden pt-6 animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Content */}
          <div className="px-5 pb-5 space-y-4">
          {/* Task Title */}
          <div>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Add task"
              value={dialogTaskTitle}
              onChange={(e) => setDialogTaskTitle(e.target.value)}
              onFocus={handleTitleFocus}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Time inputs */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <TimePicker
              value={dialogStartTime}
              onChange={(value) => setDialogStartTime(value)}
              placeholder="Start time"
              className="flex-1"
            />
            <span className="text-gray-400">—</span>
            <TimePicker
              value={dialogEndTime}
              onChange={(value) => setDialogEndTime(value)}
              placeholder="End time"
              className="flex-1"
            />
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-2" />
            <textarea
              ref={descriptionInputRef}
              placeholder="Add description"
              value={dialogTaskDescription}
              onChange={(e) => setDialogTaskDescription(e.target.value)}
              rows={3}
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Color Picker */}
          <TaskColorPicker
            selectedColor={dialogTaskColor}
            onColorSelect={setDialogTaskColor}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancelTaskDialog}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTaskDialog}
              className="px-6 py-2 text-sm font-medium text-white bg-[#1E4256] rounded-lg hover:bg-[#163544] transition-colors"
            >
              {editingTask?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
