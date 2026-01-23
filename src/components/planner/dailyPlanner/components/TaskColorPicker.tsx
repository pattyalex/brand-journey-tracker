import { useState, useEffect } from "react";
import { Palette, Plus, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { taskColorCategories, allTaskColors, getTaskColorByHex } from "../utils/colorConstants";
import { cn } from "@/lib/utils";
import { StorageKeys, getString, setString } from "@/lib/storage";

interface TaskColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

interface SavedPaletteColor {
  fill: string;
  border: string;
  text: string;
  name: string;
}

const SAVED_PALETTE_KEY = 'task-color-palette';

export const TaskColorPicker = ({ selectedColor, onColorSelect }: TaskColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedPalette, setSavedPalette] = useState<SavedPaletteColor[]>([]);
  const [showAddToPalette, setShowAddToPalette] = useState<string | null>(null);

  // Load saved palette from storage
  useEffect(() => {
    const saved = getString(SAVED_PALETTE_KEY as any);
    if (saved) {
      try {
        setSavedPalette(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved palette:', e);
      }
    }
  }, []);

  // Save palette to storage
  const savePaletteToStorage = (palette: SavedPaletteColor[]) => {
    setString(SAVED_PALETTE_KEY as any, JSON.stringify(palette));
    setSavedPalette(palette);
  };

  // Add color to saved palette
  const addToPalette = (color: SavedPaletteColor) => {
    if (savedPalette.length >= 7) {
      // Replace oldest color if palette is full
      const newPalette = [...savedPalette.slice(1), color];
      savePaletteToStorage(newPalette);
    } else if (!savedPalette.find(c => c.fill === color.fill)) {
      savePaletteToStorage([...savedPalette, color]);
    }
    setShowAddToPalette(null);
  };

  // Remove color from saved palette
  const removeFromPalette = (fill: string) => {
    savePaletteToStorage(savedPalette.filter(c => c.fill !== fill));
  };

  // Handle color selection (keep popover open to preview)
  const handleColorClick = (color: typeof allTaskColors[0]) => {
    onColorSelect(color.fill);
    // Don't close popover - let user see the preview
  };

  // Get selected color info
  const selectedColorInfo = getTaskColorByHex(selectedColor);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          {selectedColor ? (
            <div
              className="w-6 h-6 rounded-md border-l-[3px]"
              style={{
                backgroundColor: selectedColorInfo.fill,
                borderLeftColor: selectedColorInfo.border
              }}
            />
          ) : (
            <Palette className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-sm" style={{ color: selectedColor ? selectedColorInfo.text : '#6b7280' }}>
            {selectedColor ? selectedColorInfo.name : 'Add color'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white shadow-xl border rounded-2xl overflow-visible z-[300]"
        align="start"
        side="top"
        sideOffset={8}
        avoidCollisions={false}
      >
        <div className="p-3">
          {/* Saved Palette Section */}
          {savedPalette.length > 0 && (
            <div className="mb-3">
              <div className="text-[9px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Your Palette
              </div>
              <div className="flex gap-1">
                {savedPalette.map((color) => (
                  <div key={color.fill} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleColorClick(color as any)}
                      className={cn(
                        "w-8 h-8 rounded-md border-l-[3px] transition-all hover:scale-105",
                        selectedColor === color.fill && "ring-2 ring-offset-1 ring-gray-400"
                      )}
                      style={{
                        backgroundColor: color.fill,
                        borderLeftColor: color.border
                      }}
                      title={color.name}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPalette(color.fill);
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All colors in one horizontal row */}
          <div className="flex flex-col">
            {/* Color strips row */}
            <div className="flex rounded-xl overflow-hidden">
              {Object.values(taskColorCategories).flatMap((category, catIdx) =>
                category.colors.map((color, idx) => {
                  const totalCategories = Object.keys(taskColorCategories).length;
                  const isFirstColor = catIdx === 0 && idx === 0;
                  const isLastColor = catIdx === totalCategories - 1 && idx === category.colors.length - 1;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        handleColorClick(color);
                        setShowAddToPalette(color.fill);
                      }}
                      className={cn(
                        "w-[18px] h-16 transition-all hover:brightness-90 relative",
                        isFirstColor && "rounded-l-xl",
                        isLastColor && "rounded-r-xl",
                      )}
                      style={{ backgroundColor: color.fill }}
                      title={color.name}
                    >
                      {selectedColor === color.fill && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3 h-3" style={{ color: color.border }} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Category names row */}
            <div className="flex mt-2">
              {Object.values(taskColorCategories).map((category) => (
                <div
                  key={category.name}
                  className="text-[9px] text-gray-400 text-center font-medium"
                  style={{ width: `${18 * 3}px` }}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>

          {/* Add to palette button */}
          {showAddToPalette && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  const color = allTaskColors.find(c => c.fill === showAddToPalette);
                  if (color) addToPalette(color);
                }}
                className="w-full px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-gray-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to palette
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
