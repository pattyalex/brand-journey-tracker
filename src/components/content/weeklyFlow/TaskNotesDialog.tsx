
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContentItem, Platform } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";

interface TaskNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ContentItem | null;
  platform: Platform | null;
  onSave: (taskId: string, notes: string) => void;
}

const TaskNotesDialog = ({
  open,
  onOpenChange,
  task,
  platform,
  onSave
}: TaskNotesDialogProps) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task && open) {
      setNotes(task.notes || "");
    }
  }, [task, open]);

  const handleSave = () => {
    if (task) {
      onSave(task.id, notes);
      onOpenChange(false);
    }
  };

  if (!task || !platform) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <PlatformIcon platform={platform} size={18} />
            </div>
            {platform.name} - {task.day}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-1">Task</h3>
            <p>{task.title}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add your notes about this task..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskNotesDialog;
