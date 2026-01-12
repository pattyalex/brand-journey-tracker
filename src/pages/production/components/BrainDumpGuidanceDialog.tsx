import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BrainDumpGuidanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  title: string;
  setTitle: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const BrainDumpGuidanceDialog: React.FC<BrainDumpGuidanceDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  title,
  setTitle,
  notes,
  setNotes,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      {/* Title Input */}
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title..."
          tabIndex={-1}
          autoComplete="off"
          className="w-full px-0 py-3 text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300"
        />
      </div>

      {/* Notes/Brain Dump Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span className="text-lg">📝</span> Notes &amp; Brain Dump
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write freely here... no need to organize, just capture your thoughts..."
          className="flex-1 min-h-[400px] resize-none border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all text-sm leading-relaxed bg-gray-50 p-4"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Save Changes
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default BrainDumpGuidanceDialog;
