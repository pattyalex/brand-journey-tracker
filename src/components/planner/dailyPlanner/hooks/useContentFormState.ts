import { useState, useCallback, useEffect } from 'react';
import { useColorPalette, UseColorPaletteReturn } from './useColorPalette';

export interface ContentFormState {
  contentHook: string;
  contentNotes: string;
  contentColor: string;
  contentStartTime: string;
  contentEndTime: string;
}

export interface UseContentFormStateReturn extends ContentFormState {
  // Setters
  setContentHook: (hook: string) => void;
  setContentNotes: (notes: string) => void;
  setContentColor: (color: string) => void;
  setContentStartTime: (time: string) => void;
  setContentEndTime: (time: string) => void;

  // Color palette
  colorPalette: UseColorPaletteReturn;

  // Actions
  resetForm: () => void;
  setFormValues: (values: Partial<ContentFormState>) => void;
}

interface UseContentFormStateOptions {
  initialStartTime?: string;
  initialEndTime?: string;
}

/**
 * Custom hook for managing content form state
 * Includes all form fields and integrates with color palette management
 */
export const useContentFormState = (
  options: UseContentFormStateOptions = {}
): UseContentFormStateReturn => {
  const { initialStartTime = '', initialEndTime = '' } = options;

  // Form fields
  const [contentHook, setContentHook] = useState('');
  const [contentNotes, setContentNotes] = useState('');
  const [contentStartTime, setContentStartTime] = useState(initialStartTime);
  const [contentEndTime, setContentEndTime] = useState(initialEndTime);

  // Color palette hook (manages both selected color and palette state)
  const colorPalette = useColorPalette('');

  // Sync color from palette hook
  const contentColor = colorPalette.selectedColor;
  const setContentColor = colorPalette.setSelectedColor;

  // Update times when initial values change (e.g., from drag-to-create)
  useEffect(() => {
    setContentStartTime(initialStartTime);
  }, [initialStartTime]);

  useEffect(() => {
    setContentEndTime(initialEndTime);
  }, [initialEndTime]);

  // Reset all form fields
  const resetForm = useCallback(() => {
    setContentHook('');
    setContentNotes('');
    setContentStartTime('');
    setContentEndTime('');
    colorPalette.setSelectedColor('');
    colorPalette.resetPickerState();
  }, [colorPalette]);

  // Set multiple form values at once
  const setFormValues = useCallback((values: Partial<ContentFormState>) => {
    if (values.contentHook !== undefined) setContentHook(values.contentHook);
    if (values.contentNotes !== undefined) setContentNotes(values.contentNotes);
    if (values.contentColor !== undefined) colorPalette.setSelectedColor(values.contentColor);
    if (values.contentStartTime !== undefined) setContentStartTime(values.contentStartTime);
    if (values.contentEndTime !== undefined) setContentEndTime(values.contentEndTime);
  }, [colorPalette]);

  return {
    // Form state
    contentHook,
    contentNotes,
    contentColor,
    contentStartTime,
    contentEndTime,

    // Setters
    setContentHook,
    setContentNotes,
    setContentColor,
    setContentStartTime,
    setContentEndTime,

    // Color palette
    colorPalette,

    // Actions
    resetForm,
    setFormValues,
  };
};
