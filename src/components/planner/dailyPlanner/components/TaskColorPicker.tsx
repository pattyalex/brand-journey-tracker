import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { taskColorPalettes, getTaskColorByHex } from "../utils/colorConstants";
import { cn } from "@/lib/utils";
import { StorageKeys, getString, setString } from "@/lib/storage";

interface TaskColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const DEFAULT_PALETTE = 'mauve';

export const TaskColorPicker = ({ selectedColor, onColorSelect }: TaskColorPickerProps) => {
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(DEFAULT_PALETTE);

  // Load saved palette preference on mount
  useEffect(() => {
    const savedPalette = getString(StorageKeys.selectedTaskPalette);
    if (savedPalette && taskColorPalettes[savedPalette as keyof typeof taskColorPalettes]) {
      setSelectedPaletteId(savedPalette);
    }
  }, []);

  // Get the current palette
  const currentPalette = taskColorPalettes[selectedPaletteId as keyof typeof taskColorPalettes] || taskColorPalettes[DEFAULT_PALETTE];

  // Handle palette selection
  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPaletteId(paletteId);
    setString(StorageKeys.selectedTaskPalette, paletteId);
    setIsPalettePickerOpen(false);

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

  // Get selected color info
  const selectedColorInfo = getTaskColorByHex(selectedColor);

  return (
    <div className="flex items-center gap-2">
      {/* Color swatches from current palette */}
      <div className="flex items-center gap-1.5">
        {currentPalette.colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => handleColorClick(color.fill)}
            className={cn(
              "w-8 h-8 rounded-lg border-l-[3px] transition-all hover:scale-110 relative",
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
          </button>
        ))}
      </div>

      {/* Palette picker button */}
      <Popover open={isPalettePickerOpen} onOpenChange={setIsPalettePickerOpen}>
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
          className="w-[260px] p-2 bg-white shadow-xl border rounded-xl overflow-hidden z-[300]"
          align="end"
          side="top"
          sideOffset={8}
        >
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
        </PopoverContent>
      </Popover>
    </div>
  );
};
