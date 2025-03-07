
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Lightbulb, Bell, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type NoteType = "idea" | "reminder" | "other";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: NoteType;
};

const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [activeTab, setActiveTab] = useState<NoteType>("idea");

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
      type: activeTab,
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

  const filteredNotes = notes.filter((note) => note.type === activeTab);

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

        <Tabs defaultValue="idea" onValueChange={(value) => setActiveTab(value as NoteType)}>
          <TabsList className="mb-4">
            <TabsTrigger value="idea" className="flex items-center">
              <Lightbulb className="mr-2 h-4 w-4" />
              Quick Ideas
            </TabsTrigger>
            <TabsTrigger value="reminder" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Quick Reminders
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Other Notes
            </TabsTrigger>
          </TabsList>

          {["idea", "reminder", "other"].map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {type === "idea" && "Create New Idea"}
                      {type === "reminder" && "Create New Reminder"}
                      {type === "other" && "Create New Note"}
                    </CardTitle>
                    <CardDescription>
                      {type === "idea" && "Capture your brilliant ideas before they fade away"}
                      {type === "reminder" && "Add reminders for things you need to remember"}
                      {type === "other" && "Keep track of miscellaneous notes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder={
                          type === "idea" ? "Idea title" : 
                          type === "reminder" ? "Reminder title" : 
                          "Note title"
                        }
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        placeholder={
                          type === "idea" ? "Write your idea here..." :
                          type === "reminder" ? "Write your reminder here..." :
                          "Write your note here..."
                        }
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
                      className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                    >
                      <PlusCircle className="mr-2 h-3.5 w-3.5" />
                      {type === "idea" ? "Add Idea" : 
                       type === "reminder" ? "Add Reminder" : 
                       "Add Note"}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {type === "idea" ? "Your Ideas" :
                       type === "reminder" ? "Your Reminders" :
                       "Your Notes"}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {filteredNotes.length} {type === "idea" ? 
                        (filteredNotes.length !== 1 ? "ideas" : "idea") : 
                        type === "reminder" ? 
                        (filteredNotes.length !== 1 ? "reminders" : "reminder") : 
                        (filteredNotes.length !== 1 ? "notes" : "note")}
                    </span>
                  </div>

                  <ScrollArea className="h-[700px] pr-4">
                    <div className="space-y-4">
                      {filteredNotes.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              {type === "idea" ? "No ideas yet" :
                               type === "reminder" ? "No reminders yet" :
                               "No notes yet"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {type === "idea" ? "Create your first idea" :
                               type === "reminder" ? "Create your first reminder" :
                               "Create your first note"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        filteredNotes.map((note) => (
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default QuickNotes;
