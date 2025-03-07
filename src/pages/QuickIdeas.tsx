
import { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface QuickIdea {
  id: string;
  text: string;
  createdAt: Date;
}

const QuickIdeas = () => {
  const [ideas, setIdeas] = useState<QuickIdea[]>(() => {
    const savedIdeas = localStorage.getItem('quickIdeas');
    return savedIdeas ? JSON.parse(savedIdeas) : [];
  });
  
  const [newIdea, setNewIdea] = useState('');

  const handleAddIdea = () => {
    if (!newIdea.trim()) {
      toast.error('Please enter an idea');
      return;
    }

    const idea: QuickIdea = {
      id: crypto.randomUUID(),
      text: newIdea.trim(),
      createdAt: new Date(),
    };

    const updatedIdeas = [idea, ...ideas];
    setIdeas(updatedIdeas);
    localStorage.setItem('quickIdeas', JSON.stringify(updatedIdeas));
    setNewIdea('');
    toast.success('Idea added successfully');
  };

  const handleDeleteIdea = (id: string) => {
    const updatedIdeas = ideas.filter(idea => idea.id !== id);
    setIdeas(updatedIdeas);
    localStorage.setItem('quickIdeas', JSON.stringify(updatedIdeas));
    toast.success('Idea deleted');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddIdea();
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Quick Ideas</h1>
        </div>
        
        <p className="text-muted-foreground">
          Capture your content ideas quickly before they slip away. These are meant to be brief sparks that you can develop later.
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type your quick idea here..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleAddIdea}>
            <Plus className="h-4 w-4 mr-2" />
            Add Idea
          </Button>
        </div>
        
        <div className="grid gap-4 mt-6">
          {ideas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quick ideas yet. Add your first idea above!
            </div>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id} className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteIdea(idea.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{idea.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(idea.createdAt).toLocaleDateString()} {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default QuickIdeas;
