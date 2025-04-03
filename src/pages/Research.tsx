
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ResearchItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

const Research = () => {
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemTags, setNewItemTags] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Load research items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem("researchItems");
    if (savedItems) {
      try {
        setResearchItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error parsing saved research items:", error);
      }
    }
  }, []);
  
  // Save research items to localStorage when they change
  useEffect(() => {
    localStorage.setItem("researchItems", JSON.stringify(researchItems));
  }, [researchItems]);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      toast.error("Please enter a title for your research");
      return;
    }
    
    const newItem: ResearchItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      content: newItemContent,
      date: new Date().toISOString(),
      tags: newItemTags.split(",").map(tag => tag.trim()).filter(tag => tag),
    };
    
    setResearchItems([...researchItems, newItem]);
    setNewItemTitle("");
    setNewItemContent("");
    setNewItemTags("");
    setIsCreating(false);
    toast.success("Research note added successfully");
  };

  const handleDeleteItem = (id: string) => {
    setResearchItems(researchItems.filter(item => item.id !== id));
    toast.success("Research note deleted");
  };

  const handleUpdateItem = (id: string, updates: Partial<ResearchItem>) => {
    setResearchItems(
      researchItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    setEditingId(null);
    toast.success("Research note updated");
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Research</h1>
            <p className="text-muted-foreground mt-1">
              Organize your research, trends, and information
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-[#8B6B4E] hover:bg-[#6D5540]"
            disabled={isCreating}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Research Note
          </Button>
        </div>

        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>New Research Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <Input
                  id="title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Enter a title for your research"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                <Textarea
                  id="content"
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Enter your research notes, findings, or trends"
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input
                  id="tags"
                  value={newItemTags}
                  onChange={(e) => setNewItemTags(e.target.value)}
                  placeholder="trend, social media, audience research, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} className="bg-[#8B6B4E] hover:bg-[#6D5540]">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {researchItems.length === 0 && !isCreating ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Research Notes Yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add research notes to keep track of trends, audience insights, and ideas for your content.
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-[#8B6B4E] hover:bg-[#6D5540]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Research Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {researchItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  {editingId === item.id ? (
                    <Input
                      value={item.title}
                      onChange={(e) => 
                        handleUpdateItem(item.id, { title: e.target.value })
                      }
                      className="font-bold text-lg"
                    />
                  ) : (
                    <CardTitle className="flex justify-between items-center">
                      <span>{item.title}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingId(item.id)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardTitle>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={item.content}
                        onChange={(e) => 
                          handleUpdateItem(item.id, { content: e.target.value })
                        }
                        className="min-h-[200px]"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <Input 
                          value={item.tags.join(", ")}
                          onChange={(e) => {
                            const newTags = e.target.value
                              .split(",")
                              .map(tag => tag.trim())
                              .filter(tag => tag);
                            handleUpdateItem(item.id, { tags: newTags });
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setEditingId(null)}
                          className="bg-[#8B6B4E] hover:bg-[#6D5540]"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{item.content}</div>
                      {item.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Research;
