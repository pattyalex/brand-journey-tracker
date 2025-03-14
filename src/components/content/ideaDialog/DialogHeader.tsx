
import { DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DialogHeaderProps {
  title: string;
  isMeganOpen?: boolean;
  toggleMegan?: () => void;
}

const DialogHeader = ({ title }: DialogHeaderProps) => {
  return (
    <UIDialogHeader className="relative">
      <DialogTitle>{title}</DialogTitle>
    </UIDialogHeader>
  );
};

export default DialogHeader;
