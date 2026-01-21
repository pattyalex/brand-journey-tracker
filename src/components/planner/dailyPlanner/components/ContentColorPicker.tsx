import React from 'react';
import { Plus, XIcon, ChevronLeft, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { contentColorGroups, predefinedPalettes } from '../utils/colorConstants';
import type { UseColorPaletteReturn } from '../hooks/useColorPalette';

interface ContentColorPickerProps {
  palette: UseColorPaletteReturn;
}

/**
 * A reusable color picker component for content items
 * Includes:
 * - "My Palette" section with user's custom colors
 * - "Add to palette" popover for adding new colors
 * - "More colors" popover with full color grid and predefined palettes
 */
export const ContentColorPicker: React.FC<ContentColorPickerProps> = ({ palette }) => {
  const {
    userPalette,
    selectedColor,
    setSelectedColor,
    isColorPickerOpen,
    setIsColorPickerOpen,
    isAddingToPalette,
    setIsAddingToPalette,
    isCreatingOwn,
    setIsCreatingOwn,
    selectedColorsForCreation,
    setSelectedColorsForCreation,
    selectedPredefinedPalette,
    setSelectedPredefinedPalette,
    addColorToPalette,
    removeColorFromPalette,
    applySelectedColors,
  } = palette;

  const allColors = Object.values(contentColorGroups).flat();

  return (
    <div className="space-y-3">
      {/* User's Custom Palette */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">My Palette</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {userPalette.map((color, idx) => (
            <button
              key={`palette-${idx}`}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-8 h-8 rounded-lg transition-all hover:scale-110 relative group",
                selectedColor === color && "ring-2 ring-offset-1 ring-gray-400"
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
          <Popover modal={false} open={isAddingToPalette} onOpenChange={setIsAddingToPalette}>
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
                  {allColors.map((colorItem) => (
                    <button
                      key={`add-${colorItem.name}`}
                      type="button"
                      onClick={() => addColorToPalette(colorItem.hex)}
                      disabled={userPalette.includes(colorItem.hex)}
                      className={cn(
                        "w-6 h-6 rounded-md transition-all hover:scale-110",
                        userPalette.includes(colorItem.hex) && "opacity-30 cursor-not-allowed"
                      )}
                      style={{ backgroundColor: colorItem.hex }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* More Colors */}
      <div className="flex items-center gap-3">
        <Popover
          modal={false}
          open={isColorPickerOpen}
          onOpenChange={(open) => {
            setIsColorPickerOpen(open);
            if (!open) {
              setIsCreatingOwn(false);
              setSelectedColorsForCreation([]);
              setSelectedPredefinedPalette(null);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              {selectedColor ? (
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: selectedColor }}
                />
              ) : (
                <div className="w-4 h-4 rounded-full overflow-hidden border border-gray-200" style={{
                  background: 'conic-gradient(from 0deg, #f9a8d4, #d8b4fe, #93c5fd, #86efac, #fde047, #d4a574, #f9a8d4)'
                }} />
              )}
              <span className="text-xs text-gray-600">More colors</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[300] bg-white shadow-lg border" align="start">
            <div className="flex">
              {/* Left column: No color + Color grid */}
              <div className="p-3 space-y-3 border-r border-gray-100">
                {/* No color option */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isCreatingOwn) {
                      setSelectedColor('');
                      setIsColorPickerOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors",
                    !selectedColor && !isCreatingOwn && "bg-gray-100"
                  )}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <XIcon className="w-3 h-3 text-gray-400" />
                  </div>
                  No color
                </button>

                {/* Color grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {allColors.map((colorItem) => (
                    <button
                      key={colorItem.name}
                      type="button"
                      onClick={() => {
                        if (isCreatingOwn || selectedPredefinedPalette) {
                          // Toggle color selection for palette creation/editing
                          if (selectedColorsForCreation.includes(colorItem.hex)) {
                            setSelectedColorsForCreation(selectedColorsForCreation.filter(c => c !== colorItem.hex));
                          } else {
                            setSelectedColorsForCreation([...selectedColorsForCreation, colorItem.hex]);
                          }
                        } else {
                          setSelectedColor(colorItem.hex);
                          setIsColorPickerOpen(false);
                        }
                      }}
                      className={cn(
                        "w-7 h-7 rounded-md transition-all hover:scale-110",
                        (isCreatingOwn || selectedPredefinedPalette)
                          ? selectedColorsForCreation.includes(colorItem.hex) && "ring-2 ring-offset-1 ring-gray-400"
                          : selectedColor === colorItem.hex && "ring-2 ring-offset-1 ring-gray-400"
                      )}
                      style={{ backgroundColor: colorItem.hex }}
                    />
                  ))}
                </div>

                {/* Help text for palette editing mode */}
                {(isCreatingOwn || selectedPredefinedPalette) && (
                  <p className="text-[10px] text-gray-400">Click to select/deselect colors</p>
                )}
              </div>

              {/* Right column: Palettes, Selected Palette, or Create Your Own */}
              <div className="p-3 w-48">
                {isCreatingOwn ? (
                  <div className="space-y-3">
                    {/* Create your own header with back button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingOwn(false);
                          setSelectedColorsForCreation([]);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium text-gray-600">Create your own</span>
                    </div>

                    {/* Your selection */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">Your selection</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedColorsForCreation.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <div className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Apply button */}
                    <button
                      type="button"
                      onClick={applySelectedColors}
                      className="w-full py-2 px-3 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Apply to My Palette
                    </button>
                  </div>
                ) : selectedPredefinedPalette ? (
                  <div className="space-y-3">
                    {/* Selected palette header with back button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPredefinedPalette(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium text-gray-600">{selectedPredefinedPalette.name}</span>
                    </div>

                    {/* Your selection - shows the palette colors */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">Your selection</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedColorsForCreation.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-md relative group cursor-pointer"
                            style={{ backgroundColor: color }}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedColorsForCreation(selectedColorsForCreation.filter(c => c !== color))}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow border border-gray-200 items-center justify-center text-gray-400 hover:text-red-500 hidden group-hover:flex"
                            >
                              <XIcon className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        <div className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Apply button */}
                    <button
                      type="button"
                      onClick={applySelectedColors}
                      className="w-full py-2 px-3 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Apply to My Palette
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Palettes header */}
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Palettes</span>
                    </div>

                    <div className="space-y-2.5">
                      {predefinedPalettes.map((paletteItem) => (
                        <button
                          key={paletteItem.name}
                          type="button"
                          onClick={() => {
                            setSelectedPredefinedPalette(paletteItem);
                            setSelectedColorsForCreation([...paletteItem.colors]);
                          }}
                          className="w-full group"
                        >
                          <span className="text-[10px] text-gray-500 group-hover:text-gray-700 block mb-1">{paletteItem.name}</span>
                          <div className="flex gap-0">
                            {paletteItem.colors.map((color, idx) => (
                              <div
                                key={`${paletteItem.name}-${idx}`}
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
                        onClick={() => {
                          setIsCreatingOwn(true);
                          setSelectedColorsForCreation([]);
                        }}
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
    </div>
  );
};
