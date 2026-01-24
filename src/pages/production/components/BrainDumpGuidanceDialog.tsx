import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface BrainDumpGuidanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  onMoveToScript?: () => void;
  title: string;
  setTitle: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  onNavigateToStep?: (step: number) => void;
}

const BrainDumpGuidanceDialog: React.FC<BrainDumpGuidanceDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  onMoveToScript,
  title,
  setTitle,
  notes,
  setNotes,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xl p-0 overflow-hidden flex flex-col bg-gradient-to-b from-[#8B7082]/10 via-white to-white">
      {/* Content Area */}
      <div className="px-6 pt-8 pb-4">
        {/* Title Input */}
        <div className="border-b border-gray-200 pb-2 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title..."
            tabIndex={-1}
            autoComplete="off"
            className="w-full px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0]"
          />
        </div>

        {/* Notes/Brain Dump Area */}
        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-[#8B7082] uppercase tracking-wider mb-2">
            Notes & Brainstorming
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write freely here... no need to organize, just capture your thoughts..."
            className="min-h-[200px] resize-none border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8B7082]/20 focus:border-[#8B7082]/30 transition-all text-sm leading-relaxed bg-white p-4"
          />
        </div>

        {/* Move to Script Button */}
        <div className="flex justify-center mt-6">
          <Button
            variant="ghost"
            onClick={onMoveToScript}
            className="text-[#8B7082] hover:text-[#7A6073] hover:bg-[#8B7082]/10"
          >
            Move to Script <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex justify-end gap-3 px-6 pt-2 pb-4 bg-white flex-shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-[#8B7082] hover:bg-[#7A6073] text-white"
        >
          Save Changes
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default BrainDumpGuidanceDialog;
