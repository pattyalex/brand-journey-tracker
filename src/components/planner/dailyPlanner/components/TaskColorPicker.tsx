import { useState, useEffect } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { taskColorPalettes, getTaskColorByHex } from "../utils/colorConstants";
import { cn } from "@/lib/utils";
import { StorageKeys, getString, setString, getJSON, setJSON } from "@/lib/storage";

interface TaskColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const DEFAULT_PALETTE = 'mauve';
const CUSTOM_COLORS_KEY = 'taskPaletteCustomColors';
const HIDDEN_COLORS_KEY = 'taskPaletteHiddenColors';

// Type for custom color storage
interface CustomColor {
  id: string;
  name: string;
  fill: string;
  border: string;
  text: string;
  fromPalette: string;
}

export const TaskColorPicker = ({ selectedColor, onColorSelect }: TaskColorPickerProps) => {
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(DEFAULT_PALETTE);
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);
  const [hiddenColors, setHiddenColors] = useState<string[]>([]); // Array of color fill values to hide
  const [showAddColors, setShowAddColors] = useState(false);

  // Load saved palette preference and custom colors on mount
  useEffect(() => {
    const savedPalette = getString(StorageKeys.selectedTaskPalette);
    if (savedPalette && taskColorPalettes[savedPalette as keyof typeof taskColorPalettes]) {
      setSelectedPaletteId(savedPalette);
    }

    // Load custom colors
    const savedCustomColors = getJSON<CustomColor[]>(CUSTOM_COLORS_KEY, []);
    setCustomColors(savedCustomColors);

    // Load hidden colors
    const savedHiddenColors = getJSON<string[]>(HIDDEN_COLORS_KEY, []);
    setHiddenColors(savedHiddenColors);
  }, []);

  // Get the current palette
  const currentPalette = taskColorPalettes[selectedPaletteId as keyof typeof taskColorPalettes] || taskColorPalettes[DEFAULT_PALETTE];

  // Handle palette selection
  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPaletteId(paletteId);
    setString(StorageKeys.selectedTaskPalette, paletteId);
    setShowAddColors(false);

    // Auto-select the first color from the new palette
    const palette = taskColorPalettes[paletteId as keyof typeof taskColorPalettes];
    if (palette) {
      onColorSelect(palette.colors[0].fill);
    }
  };

  // Handle color selection from current palette
  const handleColorClick = (colorFill: string) => {
    onColorSelect(colorFill);
  };

  // Add a color from another palette
  const handleAddCustomColor = (color: typeof currentPalette.colors[0], fromPaletteId: string) => {
    // Check if already added or is from current palette
    if (fromPaletteId === selectedPaletteId) return;
    if (customColors.some(c => c.fill === color.fill)) return;

    const newCustomColor: CustomColor = {
      ...color,
      fromPalette: fromPaletteId
    };

    const updatedColors = [...customColors, newCustomColor];
    setCustomColors(updatedColors);
    setJSON(CUSTOM_COLORS_KEY, updatedColors);
  };

  // Remove a custom color
  const handleRemoveCustomColor = (colorFill: string) => {
    const updatedColors = customColors.filter(c => c.fill !== colorFill);
    setCustomColors(updatedColors);
    setJSON(CUSTOM_COLORS_KEY, updatedColors);
  };

  // Hide a palette color
  const handleHidePaletteColor = (colorFill: string) => {
    const updatedHidden = [...hiddenColors, colorFill];
    setHiddenColors(updatedHidden);
    setJSON(HIDDEN_COLORS_KEY, updatedHidden);
  };

  // Restore a hidden palette color
  const handleRestorePaletteColor = (colorFill: string) => {
    const updatedHidden = hiddenColors.filter(c => c !== colorFill);
    setHiddenColors(updatedHidden);
    setJSON(HIDDEN_COLORS_KEY, updatedHidden);
  };

  // Check if a color is already added
  const isColorAdded = (colorFill: string) => {
    return customColors.some(c => c.fill === colorFill) ||
           (currentPalette.colors.some(c => c.fill === colorFill) && !hiddenColors.includes(colorFill));
  };

  // Get visible palette colors (excluding hidden ones)
  const visiblePaletteColors = currentPalette.colors.filter(c => !hiddenColors.includes(c.fill));

  // Get hidden colors from current palette
  const hiddenPaletteColors = currentPalette.colors.filter(c => hiddenColors.includes(c.fill));

  // Get selected color info
  const selectedColorInfo = getTaskColorByHex(selectedColor);

  return (
    <div className="flex items-center gap-2">
      {/* Color swatches from current palette */}
      <div className="flex items-center gap-1.5">
        {visiblePaletteColors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => handleColorClick(color.fill)}
            className={cn(
              "w-8 h-8 rounded-lg border-l-[3px] transition-all hover:scale-110 relative group",
              selectedColor === color.fill && "ring-2 ring-offset-1 ring-gray-400"
            )}
            style={{
              backgroundColor: color.fill,
              borderLeftColor: color.border
            }}
            title={color.name}
          >
            {selectedColor === color.fill && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" style={{ color: color.border }} />
              </div>
            )}
            {/* Hide button on hover - only show if more than 1 color visible */}
            {visiblePaletteColors.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleHidePaletteColor(color.fill);
                }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-500 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                title="Hide color"
              >
                <X className="w-2 h-2" />
              </span>
            )}
          </button>
        ))}

        {/* Custom colors from other palettes */}
        {customColors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => handleColorClick(color.fill)}
            className={cn(
              "w-8 h-8 rounded-lg border-l-[3px] transition-all hover:scale-110 relative group",
              selectedColor === color.fill && "ring-2 ring-offset-1 ring-gray-400"
            )}
            style={{
              backgroundColor: color.fill,
              borderLeftColor: color.border
            }}
            title={`${color.name} (from ${taskColorPalettes[color.fromPalette as keyof typeof taskColorPalettes]?.name || color.fromPalette})`}
          >
            {selectedColor === color.fill && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" style={{ color: color.border }} />
              </div>
            )}
            {/* Remove button on hover */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCustomColor(color.fill);
              }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-500 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              title="Remove color"
            >
              <X className="w-2 h-2" />
            </span>
          </button>
        ))}
      </div>

      {/* Palette picker button */}
      <Popover open={isPalettePickerOpen} onOpenChange={(open) => {
        setIsPalettePickerOpen(open);
        if (!open) setShowAddColors(false);
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Change palette"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-2 bg-white shadow-xl border rounded-xl overflow-hidden z-[300]"
          align="end"
          side="top"
          sideOffset={8}
        >
          {!showAddColors ? (
            <>
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
                Choose Palette
              </div>
              <div className="space-y-1">
                {Object.entries(taskColorPalettes).map(([key, palette]) => {
                  const isSelected = selectedPaletteId === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePaletteSelect(key)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 transition-all rounded-lg",
                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                      )}
                    >
                      {/* Color preview strip */}
                      <div className="flex rounded-md overflow-hidden shrink-0">
                        {palette.colors.map((color) => (
                          <div
                            key={color.id}
                            className="w-5 h-5"
                            style={{ backgroundColor: color.fill }}
                          />
                        ))}
                      </div>

                      {/* Palette name */}
                      <div className="flex-1 text-left">
                        <span className="text-xs font-medium text-gray-700">{palette.name}</span>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hidden colors restore section */}
              {hiddenPaletteColors.length > 0 && (
                <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                  <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                    Hidden Colors
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {hiddenPaletteColors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleRestorePaletteColor(color.fill)}
                        className="w-6 h-6 rounded border-l-2 opacity-50 hover:opacity-100 transition-all hover:scale-110"
                        style={{
                          backgroundColor: color.fill,
                          borderLeftColor: color.border
                        }}
                        title={`Restore ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add colors from other palettes button */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddColors(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-[#612A4F] hover:bg-[#F5F0F4] rounded-lg transition-all font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Customize your palette
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Add colors view */}
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Add Colors
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddColors(false)}
                  className="text-[10px] text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </div>

              <div className="max-h-[280px] overflow-y-auto space-y-3">
                {Object.entries(taskColorPalettes).map(([key, palette]) => {
                  // Skip current palette
                  if (key === selectedPaletteId) return null;

                  return (
                    <div key={key} className="px-2">
                      <div className="text-[10px] font-medium text-gray-500 mb-1.5">{palette.name}</div>
                      <div className="flex gap-1.5">
                        {palette.colors.map((color) => {
                          const alreadyAdded = isColorAdded(color.fill);
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => !alreadyAdded && handleAddCustomColor(color, key)}
                              disabled={alreadyAdded}
                              className={cn(
                                "w-8 h-8 rounded-lg border-l-[3px] transition-all relative",
                                alreadyAdded
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:scale-110 cursor-pointer"
                              )}
                              style={{
                                backgroundColor: color.fill,
                                borderLeftColor: color.border
                              }}
                              title={alreadyAdded ? `${color.name} (already added)` : `Add ${color.name}`}
                            >
                              {alreadyAdded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check className="w-3 h-3" style={{ color: color.border }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {customColors.length > 0 && (
                <div className="border-t border-gray-100 mt-3 pt-2 px-2">
                  <div className="text-[10px] text-gray-400 mb-1">
                    {customColors.length} custom color{customColors.length !== 1 ? 's' : ''} added
                  </div>
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
