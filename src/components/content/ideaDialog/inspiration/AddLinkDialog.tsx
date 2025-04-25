
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLink: string;
  onCurrentLinkChange: (value: string) => void;
  onAddLink: () => void;
}

const AddLinkDialog = ({
  open,
  onOpenChange,
  currentLink,
  onCurrentLinkChange,
  onAddLink,
}: AddLinkDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-700">Add Inspiration Link</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Enter link URL..."
            value={currentLink}
            onChange={(e) => onCurrentLinkChange(e.target.value)}
            className="text-sm border-purple-200 focus-visible:ring-purple-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddLink();
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter className="sm:justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            size="sm"
            onClick={onAddLink}
            variant="vision"
            disabled={!currentLink.trim()}
          >
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkDialog;
