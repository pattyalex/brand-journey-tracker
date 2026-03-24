import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { COLUMN_TO_STAGE, STAGE_LABELS } from "../utils/productionConstants";

interface SkipColumnDialogProps {
  open: boolean;
  cardTitle: string;
  skippedColumnIds: string[];
  targetColumnTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const SkipColumnDialog: React.FC<SkipColumnDialogProps> = ({
  open,
  cardTitle,
  skippedColumnIds,
  targetColumnTitle,
  onConfirm,
  onCancel,
}) => {
  const skippedNames = skippedColumnIds
    .map(id => STAGE_LABELS[COLUMN_TO_STAGE[id]])
    .filter(Boolean);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px] font-semibold text-[#3D2E36]">
            Skipping stages
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-[#6B5A63] leading-relaxed">
            <strong className="text-[#3D2E36]">{cardTitle}</strong> is moving to{' '}
            <strong className="text-[#3D2E36]">{targetColumnTitle}</strong>.{' '}
            {skippedNames.length === 1
              ? `${skippedNames[0]} hasn't been started yet.`
              : `${skippedNames.join(' and ')} haven't been started yet.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="text-[13px]"
          >
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#612A4F] hover:bg-[#4A1F3B] text-white text-[13px]"
          >
            Move Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SkipColumnDialog;
