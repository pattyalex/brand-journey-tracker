import { useCallback } from 'react';
import { formatTimeInput } from '../utils/timeUtils';

interface UseTaskDialogInputsArgs {
  dialogStartTime: string;
  dialogEndTime: string;
  setDialogTaskColor: React.Dispatch<React.SetStateAction<string>>;
  setDialogStartTime: React.Dispatch<React.SetStateAction<string>>;
  setDialogEndTime: React.Dispatch<React.SetStateAction<string>>;
  startTimeInputRef: React.RefObject<HTMLInputElement>;
  endTimeInputRef: React.RefObject<HTMLInputElement>;
  descriptionInputRef: React.RefObject<HTMLTextAreaElement>;
}

export interface UseTaskDialogInputsReturn {
  handleDialogTaskColorSelect: (color: string) => void;
  handleDialogTaskClearColor: () => void;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartTimeFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleEndTimeFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleStartTimeBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleEndTimeBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleTitleFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleStartTimeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEndTimeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Hook for handling task dialog input interactions
 * Manages color selection, time input formatting, and keyboard navigation
 */
export const useTaskDialogInputs = ({
  dialogStartTime,
  dialogEndTime,
  setDialogTaskColor,
  setDialogStartTime,
  setDialogEndTime,
  startTimeInputRef,
  endTimeInputRef,
  descriptionInputRef,
}: UseTaskDialogInputsArgs): UseTaskDialogInputsReturn => {

  // Color handlers
  const handleDialogTaskColorSelect = useCallback((color: string) => {
    setDialogTaskColor(color);
  }, [setDialogTaskColor]);

  const handleDialogTaskClearColor = useCallback(() => {
    setDialogTaskColor('');
  }, [setDialogTaskColor]);

  // Time change handlers with formatting
  const handleStartTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setDialogStartTime('');
      return;
    }
    const formatted = formatTimeInput(value);
    setDialogStartTime(formatted);
  }, [setDialogStartTime]);

  const handleEndTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setDialogEndTime('');
      return;
    }
    const formatted = formatTimeInput(value);
    setDialogEndTime(formatted);
  }, [setDialogEndTime]);

  // Focus handlers
  const handleStartTimeFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!dialogStartTime) {
      e.target.placeholder = '__:__ am/pm';
    }
  }, [dialogStartTime]);

  const handleEndTimeFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!dialogEndTime) {
      e.target.placeholder = '__:__ am/pm';
    }
  }, [dialogEndTime]);

  // Blur handlers - auto-add AM/PM
  const handleStartTimeBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = '9:00 am';

    if (dialogStartTime && !dialogStartTime.includes('am') && !dialogStartTime.includes('pm')) {
      const match = dialogStartTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1], 10);
        const period = hour === 12 ? 'pm' : hour >= 1 && hour <= 11 ? 'pm' : 'am';
        setDialogStartTime(dialogStartTime + ' ' + period);
      }
    }
  }, [dialogStartTime, setDialogStartTime]);

  const handleEndTimeBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = '10:00 pm';

    if (dialogEndTime && !dialogEndTime.includes('am') && !dialogEndTime.includes('pm')) {
      const match = dialogEndTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[1], 10);
        const period = hour === 12 ? 'pm' : hour >= 1 && hour <= 11 ? 'pm' : 'am';
        setDialogEndTime(dialogEndTime + ' ' + period);
      }
    }
  }, [dialogEndTime, setDialogEndTime]);

  // Title focus handler
  const handleTitleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent text selection on focus - move cursor to end
    setTimeout(() => {
      const length = e.target.value.length;
      e.target.setSelectionRange(length, length);
    }, 0);
  }, []);

  // Keyboard navigation handlers
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startTimeInputRef.current?.focus();
    }
  }, [startTimeInputRef]);

  const handleStartTimeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      endTimeInputRef.current?.focus();
    }
  }, [endTimeInputRef]);

  const handleEndTimeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      descriptionInputRef.current?.focus();
    }
  }, [descriptionInputRef]);

  return {
    handleDialogTaskColorSelect,
    handleDialogTaskClearColor,
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
  };
};
