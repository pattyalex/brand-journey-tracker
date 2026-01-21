import { useState, useEffect } from "react";
import { Clock, X as XIcon, Plus, Palette, ListTodo, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlannerDerived, PlannerRefs, PlannerSetters, PlannerState } from "../hooks/usePlannerState";
import { usePlannerActions } from "../hooks/usePlannerActions";
import { cn } from "@/lib/utils";

// Color palette organized by color groups (4 shades each, light to dark)
const colorGroups = {
  pink: [
    { name: 'pink-1', hex: '#fce7f3' },
    { name: 'pink-2', hex: '#fbcfe8' },
    { name: 'pink-3', hex: '#f8b4d9' },
    { name: 'pink-4', hex: '#f68dc5' },
  ],
  purple: [
    { name: 'purple-1', hex: '#f3e8ff' },
    { name: 'purple-2', hex: '#e9d5ff' },
    { name: 'purple-3', hex: '#dcc4fe' },
    { name: 'purple-4', hex: '#cc9cfd' },
  ],
  blue: [
    { name: 'blue-1', hex: '#dbeafe' },
    { name: 'blue-2', hex: '#bfdbfe' },
    { name: 'blue-3', hex: '#a5cdfc' },
    { name: 'blue-4', hex: '#7ab5fb' },
  ],
  green: [
    { name: 'green-1', hex: '#e6f2eb' },
    { name: 'green-2', hex: '#c8e6d0' },
    { name: 'green-3', hex: '#a5d9b5' },
    { name: 'green-4', hex: '#7ec998' },
  ],
  sage: [
    { name: 'sage-1', hex: '#e8ebe4' },
    { name: 'sage-2', hex: '#d4dbc9' },
    { name: 'sage-3', hex: '#c2ccb0' },
    { name: 'sage-4', hex: '#a8b790' },
  ],
  brown: [
    { name: 'brown-1', hex: '#f5ebe0' },
    { name: 'brown-2', hex: '#e6d5c3' },
    { name: 'brown-3', hex: '#dbc0a0' },
    { name: 'brown-4', hex: '#c69d70' },
  ],
  yellow: [
    { name: 'yellow-1', hex: '#faf6e8' },
    { name: 'yellow-2', hex: '#f5f0d5' },
    { name: 'yellow-3', hex: '#fef3c7' },
    { name: 'yellow-4', hex: '#fde68a' },
  ],
  rosewood: [
    { name: 'rosewood-1', hex: '#f5e8e8' },
    { name: 'rosewood-2', hex: '#e8d4d4' },
    { name: 'rosewood-3', hex: '#d9c0c0' },
    { name: 'rosewood-4', hex: '#c9abab' },
  ],
};

// Inspiration palettes for users (using colors from colorGroups)
const inspirationPalettes = [
  {
    name: 'Soft Neutrals',
    colors: ['#faf6e8', '#f5ebe0', '#e8ebe4', '#c2ccb0'],
  },
  {
    name: 'Warm Sunset',
    colors: ['#fef3c7', '#fde68a', '#f8b4d9', '#f68dc5'],
  },
  {
    name: 'Ocean Breeze',
    colors: ['#dbeafe', '#bfdbfe', '#a5cdfc', '#7ab5fb'],
  },
  {
    name: 'Berry Garden',
    colors: ['#fce7f3', '#fbcfe8', '#e9d5ff', '#cc9cfd'],
  },
  {
    name: 'Earth Tones',
    colors: ['#f5ebe0', '#e6d5c3', '#d4dbc9', '#a8b790'],
  },
];

// Default user palette
const defaultUserPalette = ['#fdf8f0', '#f0e6de', '#e8ebe6', '#c8d4bc'];

interface TaskDialogProps {
  state: PlannerState;
  derived: PlannerDerived;
  refs: PlannerRefs;
  setters: PlannerSetters;
  actions: ReturnType<typeof usePlannerActions>;
}

export const TaskDialog = ({ state, derived, refs, setters, actions }: TaskDialogProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [userPalette, setUserPalette] = useState<string[]>(() => {
    const saved = localStorage.getItem('plannerUserColorPalette');
    return saved ? JSON.parse(saved) : defaultUserPalette;
  });
  const [isAddingToPalette, setIsAddingToPalette] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<{name: string, colors: string[]} | null>(null);
  const [editingInspiration, setEditingInspiration] = useState<string[]>([]);

  // Save user palette to localStorage
  useEffect(() => {
    localStorage.setItem('plannerUserColorPalette', JSON.stringify(userPalette));
  }, [userPalette]);

  // Reset inspiration selection when popover closes
  useEffect(() => {
    if (!isColorPickerOpen) {
      setSelectedInspiration(null);
      setEditingInspiration([]);
    }
  }, [isColorPickerOpen]);

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

  const addColorToPalette = (color: string) => {
    if (!userPalette.includes(color)) {
      setUserPalette([...userPalette, color]);
    }
    setIsAddingToPalette(false);
  };

  const removeColorFromPalette = (color: string) => {
    setUserPalette(userPalette.filter(c => c !== color));
  };

  const selectInspirationPalette = (palette: {name: string, colors: string[]}) => {
    setSelectedInspiration(palette);
    setEditingInspiration([...palette.colors]);
  };

  const applyEditedPalette = () => {
    setUserPalette(editingInspiration);
    setSelectedInspiration(null);
    setEditingInspiration([]);
    setIsColorPickerOpen(false);
  };

  const addColorToEditingPalette = (color: string) => {
    if (!editingInspiration.includes(color)) {
      setEditingInspiration([...editingInspiration, color]);
    }
  };

  const removeColorFromEditingPalette = (color: string) => {
    setEditingInspiration(editingInspiration.filter(c => c !== color));
  };

  const backToInspirations = () => {
    setSelectedInspiration(null);
    setEditingInspiration([]);
  };

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
      {/* Semi-transparent backdrop for click outside to close */}
      <div
        className="absolute inset-0 bg-black/[0.07]"
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
            <Input
              ref={startTimeInputRef}
              type="text"
              value={dialogStartTime}
              onChange={handleStartTimeChange}
              onFocus={handleStartTimeFocus}
              onBlur={handleStartTimeBlur}
              onKeyDown={handleStartTimeKeyDown}
              placeholder="Start time"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              placeholder="End time"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              maxLength={8}
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

          {/* User's Custom Palette - Always Visible */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">My Palette</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {userPalette.map((color, idx) => (
                <button
                  key={`palette-${idx}`}
                  type="button"
                  onClick={() => {
                    setDialogTaskColor(color);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all hover:scale-110 relative group",
                    dialogTaskColor === color && "ring-2 ring-offset-1 ring-gray-400"
                  )}
                  style={{ backgroundColor: color }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColorFromPalette(color);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow border border-gray-200 items-center justify-center text-gray-400 hover:text-red-500 hidden group-hover:flex"
                  >
                    <XIcon className="w-2.5 h-2.5" />
                  </button>
                </button>
              ))}
              {/* Add color to palette button */}
              <Popover open={isAddingToPalette} onOpenChange={setIsAddingToPalette}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 z-[300] bg-white shadow-lg border" align="start">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500">Add to my palette</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.values(colorGroups).flat().map((color) => (
                        <button
                          key={`add-${color.name}`}
                          type="button"
                          onClick={() => addColorToPalette(color.hex)}
                          disabled={userPalette.includes(color.hex)}
                          className={cn(
                            "w-6 h-6 rounded-md transition-all hover:scale-110",
                            userPalette.includes(color.hex) && "opacity-30 cursor-not-allowed"
                          )}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-3">
            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  {dialogTaskColor ? (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: dialogTaskColor }}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-gray-200" style={{
                      background: 'conic-gradient(from 0deg, #f9a8d4, #d8b4fe, #93c5fd, #86efac, #fde047, #d4a574, #f9a8d4)'
                    }} />
                  )}
                  <span className="text-xs text-gray-600">
                    {dialogTaskColor ? 'Change color' : 'More colors'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[300] bg-white shadow-lg border" align="start">
                <div className="flex">
                  {/* Left side - Color grid */}
                  <div className="p-3 space-y-3 border-r border-gray-100">
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
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.values(colorGroups).flat().map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            if (selectedInspiration) {
                              // In edit mode, toggle color in editing palette
                              if (editingInspiration.includes(color.hex)) {
                                removeColorFromEditingPalette(color.hex);
                              } else {
                                addColorToEditingPalette(color.hex);
                              }
                            } else {
                              // Normal mode, select color for task
                              setDialogTaskColor(color.hex);
                              setIsColorPickerOpen(false);
                            }
                          }}
                          className={cn(
                            "w-7 h-7 rounded-md transition-all hover:scale-110",
                            selectedInspiration
                              ? editingInspiration.includes(color.hex) && "ring-2 ring-offset-1 ring-gray-400"
                              : dialogTaskColor === color.hex && "ring-2 ring-offset-1 ring-gray-400"
                          )}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                    {selectedInspiration && (
                      <p className="text-[10px] text-gray-400 mt-2">Click to select/deselect colors</p>
                    )}
                  </div>

                  {/* Right side - Inspiration palettes or Edit panel */}
                  <div className="p-3 w-48">
                    {selectedInspiration ? (
                      // Edit palette panel
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={backToInspirations}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-xs font-medium text-gray-600">{selectedInspiration.name}</span>
                        </div>

                        {/* Current palette being edited */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Your selection</span>
                          <div className="flex flex-wrap gap-1.5">
                            {editingInspiration.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-md relative group cursor-pointer"
                                style={{ backgroundColor: color }}
                              >
                                <button
                                  type="button"
                                  onClick={() => removeColorFromEditingPalette(color)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow border border-gray-200 items-center justify-center text-gray-400 hover:text-red-500 hidden group-hover:flex"
                                >
                                  <XIcon className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                            {/* Add hint */}
                            <div className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Apply button */}
                        <button
                          type="button"
                          onClick={applyEditedPalette}
                          className="w-full py-2 px-3 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Apply to My Palette
                        </button>
                      </div>
                    ) : (
                      // Inspiration list
                      <>
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                          <Palette className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Palettes</span>
                        </div>
                        <div className="space-y-2.5">
                          {inspirationPalettes.map((palette, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectInspirationPalette(palette)}
                              className="w-full group"
                            >
                              <span className="text-[10px] text-gray-500 group-hover:text-gray-700 block mb-1">{palette.name}</span>
                              <div className="flex gap-1">
                                {palette.colors.map((color, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="flex-1 h-5 first:rounded-l-md last:rounded-r-md transition-all group-hover:scale-y-110"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </button>
                          ))}

                          {/* Create your own */}
                          <button
                            type="button"
                            onClick={() => selectInspirationPalette({ name: 'Create your own', colors: [] })}
                            className="w-full group pt-2 border-t border-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-gray-400">
                                <Plus className="w-3 h-3 text-gray-400 group-hover:text-gray-500" />
                              </div>
                              <span className="text-[11px] text-gray-500 group-hover:text-gray-700">Create your own</span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
