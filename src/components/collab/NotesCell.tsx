import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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
    
    // Show a success toast
    toast({
      title: "Notes saved",
      description: "Your notes have been updated successfully",
    });
  };
  
  const handleClear = () => {
    setNoteText("");
  };
  
  // Truncate the notes for display in the table cell
  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text || text === "None") return "None";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Determine if there are actual notes (not empty or "None")
  const hasNotes = value && value !== "None";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={`h-8 w-full justify-start text-left font-normal ${hasNotes ? 'border-l-4 border-l-purple-400 pl-2' : ''}`}
        >
          <span className={`truncate ${hasNotes ? 'text-gray-700' : 'text-gray-400 italic'}`}>
            {truncateText(value || "None")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-purple-500">Notes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your notes here..."
            className="min-h-[200px] border rounded-md focus:border-purple-400 focus:ring focus:ring-purple-100 shadow-sm"
            autoFocus
          />
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Clear
            </Button>
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-purple-500 hover:bg-purple-600 transition-all duration-200"
          >
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesCell;
