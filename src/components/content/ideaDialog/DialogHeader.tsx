
import { Button } from "@/components/ui/button";
import { DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DialogHeaderProps {
  title: string;
  isMeganOpen: boolean;
  toggleMegan: () => void;
}

const DialogHeader = ({ title, isMeganOpen, toggleMegan }: DialogHeaderProps) => {
  return (
    <UIDialogHeader className="relative">
      <DialogTitle>{title}</DialogTitle>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 cursor-pointer transition-all duration-150 hover:bg-accent/80 active:bg-accent active:scale-95 rounded-md"
        onClick={toggleMegan}
        aria-label={isMeganOpen ? "Hide Megan" : "Ask Megan"}
      >
        {isMeganOpen ? (
          <span className="px-3 py-1.5 text-primary hover:text-primary/90 font-medium">Hide Megan</span>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 w-full">
            <span className="text-primary hover:text-primary/90 font-medium">Ask Megan</span>
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
              M
            </div>
          </div>
        )}
      </Button>
    </UIDialogHeader>
  );
};

export default DialogHeader;
