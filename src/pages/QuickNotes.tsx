
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReminderItem from "@/components/reminders/ReminderItem";
import ReminderSidebar from "@/components/reminders/ReminderSidebar";

type Note = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
};

const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [activeList, setActiveList] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("quickNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quickNotes", JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newNoteTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setNotes([newNote, ...notes]);
      setNewNoteTitle("");
      toast.success("Reminder added successfully");
    }
  };

  const handleToggleComplete = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast.success("Reminder deleted successfully");
  };

  const getCounts = () => ({
    all: notes.length,
    today: notes.filter(note => !note.completed).length,
    scheduled: notes.filter(note => note.dueDate).length,
    completed: notes.filter(note => note.completed).length,
  });

  const getFilteredNotes = () => {
    let filtered = [...notes];
    
    if (activeList === 'completed') {
      filtered = filtered.filter(note => note.completed);
    } else if (activeList === 'today') {
      filtered = filtered.filter(note => !note.completed);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] bg-white">
        <ReminderSidebar
          activeList={activeList}
          counts={getCounts()}
          onListSelect={setActiveList}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search reminders..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-1">
              <div className="px-3">
                <Input
                  placeholder="Add new reminder..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  onKeyPress={handleAddNote}
                  className="border-0 px-0 h-9 focus-visible:ring-0 text-sm"
                />
              </div>
              {getFilteredNotes().map((note) => (
                <ReminderItem
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  completed={note.completed}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuickNotes;
