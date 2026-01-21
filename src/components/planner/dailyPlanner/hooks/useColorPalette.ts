import { useState, useEffect, useCallback } from 'react';
import { defaultContentPalette } from '../utils/colorConstants';

const STORAGE_KEY = 'plannerContentColorPalette';

export interface UseColorPaletteReturn {
  // Palette state
  userPalette: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;

  // Popover states
  isColorPickerOpen: boolean;
  setIsColorPickerOpen: (open: boolean) => void;
  isAddingToPalette: boolean;
  setIsAddingToPalette: (adding: boolean) => void;

  // Palette creation states
  isCreatingOwn: boolean;
  setIsCreatingOwn: (creating: boolean) => void;
  selectedColorsForCreation: string[];
  setSelectedColorsForCreation: (colors: string[]) => void;
  selectedPredefinedPalette: { name: string; colors: string[] } | null;
  setSelectedPredefinedPalette: (palette: { name: string; colors: string[] } | null) => void;

  // Actions
  addColorToPalette: (color: string) => void;
  removeColorFromPalette: (color: string) => void;
  applySelectedColors: () => void;
  resetPickerState: () => void;
}

export const useColorPalette = (initialColor: string = ''): UseColorPaletteReturn => {
  // User's custom palette
  const [userPalette, setUserPalette] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultContentPalette;
  });

  // Selected color for content
  const [selectedColor, setSelectedColor] = useState(initialColor);

  // Popover open states
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isAddingToPalette, setIsAddingToPalette] = useState(false);

  // Palette creation states
  const [isCreatingOwn, setIsCreatingOwn] = useState(false);
  const [selectedColorsForCreation, setSelectedColorsForCreation] = useState<string[]>([]);
  const [selectedPredefinedPalette, setSelectedPredefinedPalette] = useState<{ name: string; colors: string[] } | null>(null);

  // Save palette to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPalette));
  }, [userPalette]);

  // Add a color to the user's palette
  const addColorToPalette = useCallback((color: string) => {
    if (!userPalette.includes(color)) {
      setUserPalette(prev => [...prev, color]);
    }
    setIsAddingToPalette(false);
  }, [userPalette]);

  // Remove a color from the user's palette
  const removeColorFromPalette = useCallback((color: string) => {
    setUserPalette(prev => prev.filter(c => c !== color));
  }, []);

  // Apply selected colors (from creation mode or predefined palette)
  const applySelectedColors = useCallback(() => {
    if (selectedColorsForCreation.length > 0) {
      setUserPalette(prev => [...new Set([...prev, ...selectedColorsForCreation])]);
      setSelectedColorsForCreation([]);
      setIsCreatingOwn(false);
      setSelectedPredefinedPalette(null);
      setIsColorPickerOpen(false);
    }
  }, [selectedColorsForCreation]);

  // Reset picker state (useful when closing dialogs)
  const resetPickerState = useCallback(() => {
    setIsColorPickerOpen(false);
    setIsAddingToPalette(false);
    setIsCreatingOwn(false);
    setSelectedColorsForCreation([]);
    setSelectedPredefinedPalette(null);
  }, []);

  return {
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
    resetPickerState,
  };
};
