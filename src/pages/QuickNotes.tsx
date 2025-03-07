
import { useState } from 'react';
import { Clipboard, Plus, X, Save } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const QuickNotes = () => {
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const note: QuickNote = {
      id: crypto.randomUUID(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date(),
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
    
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreating(false);
    
    toast.success('Note saved successfully');
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
    toast.success('Note deleted');
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Clipboard className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Quick Notes</h1>
        </div>
        
        <p className="text-muted-foreground">
          Capture quick notes and thoughts for your content creation process. Use these for ideas that need more detail than quick ideas.
        </p>
        
        {!isCreating ? (
          <div className="flex justify-start">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        ) : (
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="font-medium"
                />
                <Textarea
                  placeholder="Write your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-4 mt-6">
          {notes.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-muted-foreground">
              No notes yet. Create your first note above!
            </div>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuickNotes;
