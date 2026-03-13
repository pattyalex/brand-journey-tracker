
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, FileText, BookOpen } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserResearchItems,
  createResearchItem,
  updateResearchItem,
  deleteResearchItem,
  type ResearchItem as DBResearchItem
} from "@/services/researchService";

interface ResearchItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

const Research = () => {
  const { user } = useAuth();
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemTags, setNewItemTags] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResearchItems();
  }, [user]);

  const loadResearchItems = async () => {
    if (!user?.id) {
      setResearchItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await getUserResearchItems(user.id);
      const formattedItems = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content || "",
        date: item.created_at,
        tags: item.tags || []
      }));
      setResearchItems(formattedItems);
    } catch (error) {
      console.error("Error loading research items:", error);
      toast.error("Failed to load research items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      toast.error("Please enter a title for your research");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to add research");
      return;
    }

    try {
      const newItem = await createResearchItem(user.id, {
        title: newItemTitle,
        content: newItemContent,
        tags: newItemTags.split(",").map(tag => tag.trim()).filter(tag => tag),
      });

      setResearchItems([{
        id: newItem.id,
        title: newItem.title,
        content: newItem.content || "",
        date: newItem.created_at,
        tags: newItem.tags || []
      }, ...researchItems]);

      setNewItemTitle("");
      setNewItemContent("");
      setNewItemTags("");
      setIsCreating(false);
      toast.success("Research note added successfully");
    } catch (error) {
      console.error("Error adding research item:", error);
      toast.error("Failed to add research note");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteResearchItem(id);
      setResearchItems(researchItems.filter(item => item.id !== id));
      toast.success("Research note deleted");
    } catch (error) {
      console.error("Error deleting research item:", error);
      toast.error("Failed to delete research note");
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<ResearchItem>) => {
    try {
      // Optimistically update UI
      setResearchItems(
        researchItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      );

      // Update in database
      await updateResearchItem(id, {
        title: updates.title,
        content: updates.content,
        tags: updates.tags
      });

      toast.success("Research note updated");
    } catch (error) {
      console.error("Error updating research item:", error);
      toast.error("Failed to update research note");
      // Reload to revert optimistic update
      loadResearchItems();
    }
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

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading research...</p>
          </div>
        ) : researchItems.length === 0 && !isCreating ? (
          <EmptyState
            icon={BookOpen}
            title="No research saved yet"
            description="Save articles, insights, and research to stay informed and inspire your content strategy."
            actionLabel="Add Research"
            onAction={() => setIsCreating(true)}
          />
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
