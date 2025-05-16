import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

const BrainDump = () => {
  // Load saved notes from localStorage or use default empty array
  const [notes, setNotes] = useState<string[]>(() => {
    const savedNotes = localStorage.getItem('brainDumpNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [currentNote, setCurrentNote] = useState('');

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('brainDumpNotes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = () => {
    if (!currentNote.trim()) {
      toast.error("Cannot save an empty note");
      return;
    }

    setNotes([...notes, currentNote]);
    setCurrentNote('');
    toast.success("Note saved successfully");
  };

  const handleRemoveNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
    toast.success("Note removed");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Write your thoughts here..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <Button onClick={handleSaveNote} className="w-full">
          Save Note
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Saved Notes</h3>

        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet. Add some thoughts above!</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{note}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveNote(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainDump;