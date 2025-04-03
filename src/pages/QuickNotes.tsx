
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, FileText, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("quickNotes");
    if (savedNotes) {
      try {
        // Convert all existing notes to the new format (without type)
        const parsedNotes = JSON.parse(savedNotes);
        const convertedNotes = parsedNotes.map((note: any) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt
        }));
        setNotes(convertedNotes);
      } catch (error) {
        console.error("Error parsing saved notes:", error);
        setNotes([]);
      }
    }
  }, []);

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

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quick Notes</h1>
            <p className="text-muted-foreground mt-1">
              Write down thoughts and notes
            </p>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
              <CardDescription>
                Keep track of your important notes
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
                  className="min-h-[200px] resize-y"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6 flex justify-end">
              <Button 
                onClick={handleAddNote} 
                size="sm" 
                className="bg-[#8B6B4E] hover:bg-[#6D5540]"
              >
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Add Note
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Your Notes
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredNotes.length} {filteredNotes.length !== 1 ? "notes" : "note"}
              </span>
            </div>

            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-4">
                {filteredNotes.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No matching notes found" : "No notes yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {searchQuery ? "Try a different search term" : "Create your first note"}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <Card key={note.id} className="group relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteNote(note.id)}
                            aria-label="Delete note"
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
