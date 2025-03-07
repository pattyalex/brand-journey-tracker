
import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("quickNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("quickNotes", JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    toast.success("Note created successfully");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast.success("Note deleted successfully");
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quick Notes</h1>
            <p className="text-muted-foreground mt-1">
              Jot down ideas, thoughts, and reminders
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
              <CardDescription>
                Quickly capture your thoughts before they escape
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your note here..."
                  className="min-h-[200px]"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddNote} className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Notes</h2>
              <span className="text-sm text-muted-foreground">
                {notes.length} note{notes.length !== 1 ? "s" : ""}
              </span>
            </div>

            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        No notes yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create your first note
                      </p>
                    </div>
                  </div>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id} className="group">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <CardDescription className="text-xs">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap line-clamp-3">
                          {note.content || <span className="italic text-muted-foreground">No content</span>}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuickNotes;
