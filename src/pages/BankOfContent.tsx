"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { ContentItem } from "@/types/content";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";

interface BankOfContentProps {
  initialContent?: ContentItem[];
}

const BankOfContent: React.FC<BankOfContentProps> = ({ initialContent = [] }) => {
  const [contentList, setContentList] = useState<ContentItem[]>(initialContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentText, setNewContentText] = useState("");

  useEffect(() => {
    const storedContent = localStorage.getItem("contentList");
    if (storedContent) {
      setContentList(JSON.parse(storedContent));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contentList", JSON.stringify(contentList));
  }, [contentList]);

  const handleAddContent = useCallback(() => {
    if (!newContentTitle || !newContentText) {
      toast({
        title: "Error",
        description: "Title and text cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const newContentItem: ContentItem = {
      id: uuidv4(),
      title: newContentTitle,
      description: newContentText.slice(0, 100) + (newContentText.length > 100 ? "..." : ""),
      format: "text",
      url: newContentText,
      dateCreated: new Date(),
      tags: searchTags,
    };

    setContentList((prevContentList) => [...prevContentList, newContentItem]);
    setNewContentTitle("");
    setNewContentText("");
    setSearchTags([]);
    setIsModalOpen(false);

    toast({
      title: "Success",
      description: "Content added successfully.",
    });
  }, [newContentTitle, newContentText, searchTags]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddTag = () => {
    if (newTag && !searchTags.includes(newTag)) {
      setSearchTags([...searchTags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToRemove));
  };

  const filteredContent = contentList.filter((content) => {
    const searchText = searchQuery.toLowerCase();
    const titleMatch = content.title.toLowerCase().includes(searchText);
    const descriptionMatch = content.description?.toLowerCase().includes(searchText);
    const tagMatch = searchTags.every((tag) => content.tags?.includes(tag));

    return titleMatch || descriptionMatch && tagMatch;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bank of Content</h1>

      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-grow"
        />

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Add tags..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-32"
          />
          <Button onClick={handleAddTag} variant="outline" size="sm">
            Add Tag
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Content Title"
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Your content here"
                  className="min-h-[100px]"
                  value={newContentText}
                  onChange={(e) => setNewContentText(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex items-center space-x-2">
                  {searchTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddContent}>
                Add Content
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        {filteredContent.map((content) => (
          <div key={content.id} className="border rounded-md p-4 w-64">
            <h2 className="text-lg font-semibold">{content.title}</h2>
            <p className="text-sm text-gray-500">{content.description}</p>
            <div className="mt-2">
              {content.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="mr-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <IdeaCreationDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={newContentTitle}
        onTitleChange={setNewContentTitle}
        contentType="video" // Add this line
        onContentTypeChange={() => {}} // Add this line
        scriptText={newContentText}
        onScriptTextChange={setNewContentText}
        shootDetails=""
        onShootDetailsChange={() => {}}
        captionText=""
        onCaptionTextChange={() => {}}
        platforms={[]}
        currentPlatform=""
        onCurrentPlatformChange={() => {}}
        onAddPlatform={() => {}}
        onRemovePlatform={() => {}}
        tags={searchTags}
        currentTag={newTag}
        onCurrentTagChange={setNewTag}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onSave={handleAddContent}
        onCancel={() => setIsModalOpen(false)}
        isEditMode={false}
        dialogTitle="Add New Content"
      />
    </div>
  );
};

export default BankOfContent;
