import { useCallback } from 'react';

interface UseCopyDialogActionsArgs {
  setIsCopyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCopyToDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setDeleteAfterCopy: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UseCopyDialogActionsReturn {
  handleCopyDialogOpen: () => void;
  handleCopyDialogClose: () => void;
  handleCopyToDateChange: (date: Date | undefined) => void;
  handleDeleteAfterCopyChange: (checked: boolean) => void;
  handleCloseCopyDialog: () => void;
}

/**
 * Hook for handling copy dialog actions
 * Manages the copy tasks dialog state
 */
export const useCopyDialogActions = ({
  setIsCopyDialogOpen,
  setCopyToDate,
  setDeleteAfterCopy,
}: UseCopyDialogActionsArgs): UseCopyDialogActionsReturn => {

  const handleCopyDialogOpen = useCallback(() => {
    setIsCopyDialogOpen(true);
  }, [setIsCopyDialogOpen]);

  const handleCopyDialogClose = useCallback(() => {
    setIsCopyDialogOpen(false);
    setCopyToDate(undefined);
    setDeleteAfterCopy(false);
  }, [setIsCopyDialogOpen, setCopyToDate, setDeleteAfterCopy]);

  const handleCopyToDateChange = useCallback((date: Date | undefined) => {
    if (!date) return;
    setCopyToDate(date);
  }, [setCopyToDate]);

  const handleDeleteAfterCopyChange = useCallback((checked: boolean) => {
    setDeleteAfterCopy(checked);
  }, [setDeleteAfterCopy]);

  // Alias for handleCopyDialogClose (for backwards compatibility)
  const handleCloseCopyDialog = handleCopyDialogClose;

  return {
    handleCopyDialogOpen,
    handleCopyDialogClose,
    handleCopyToDateChange,
    handleDeleteAfterCopyChange,
    handleCloseCopyDialog,
  };
};
