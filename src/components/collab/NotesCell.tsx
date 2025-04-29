
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface NotesCellProps {
  value: string;
  onChange: (value: string) => void;
}

const NotesCell = ({ value, onChange }: NotesCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState(value || "");
  
  const handleSave = () => {
    onChange(noteText);
    setIsOpen(false);
  };
  
  // Truncate the notes for display in the table cell
  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text || text === "None") return "None";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-full justify-center text-center font-normal"
        >
          <span className="truncate text-center w-full">
            {truncateText(value || "None")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Notes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your notes here..."
            className="min-h-[200px] border rounded-md"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesCell;
