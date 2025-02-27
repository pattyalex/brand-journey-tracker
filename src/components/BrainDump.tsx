
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface BrainDumpPage {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const BrainDump = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<BrainDumpPage[]>([
    {
      id: "1",
      title: "My First Brain Dump",
      content: "Start writing your ideas here...",
      createdAt: new Date(),
    }
  ]);
  const [activePage, setActivePage] = useState<BrainDumpPage>(pages[0]);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreatePage = () => {
    if (newPageTitle.trim() === '') {
      toast({
        title: "Title required",
        description: "Please enter a title for your new page",
        variant: "destructive"
      });
      return;
    }

    const newPage: BrainDumpPage = {
      id: Date.now().toString(),
      title: newPageTitle,
      content: "",
      createdAt: new Date()
    };

    setPages([...pages, newPage]);
    setActivePage(newPage);
    setNewPageTitle('');
    setIsCreatingPage(false);
    toast({
      title: "Page created",
      description: `"${newPageTitle}" has been created`
    });
  };

  const handleDeletePage = (id: string) => {
    if (pages.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one brain dump page",
        variant: "destructive"
      });
      return;
    }

    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    
    // If active page is deleted, set the first page as active
    if (activePage.id === id) {
      setActivePage(updatedPages[0]);
    }
    
    toast({
      title: "Page deleted",
      description: "The page has been deleted",
    });
  };

  const handleContentChange = (content: string) => {
    const updatedPage = { ...activePage, content };
    setActivePage(updatedPage);
    
    // Update the page in the pages array
    setPages(pages.map(page => 
      page.id === activePage.id ? updatedPage : page
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{activePage.title}</h2>
          <p className="text-muted-foreground text-sm">
            Created on {formatDate(activePage.createdAt)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsCreatingPage(!isCreatingPage)}>
              <Calendar className="h-4 w-4" />
              <span>Pages</span>
              <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                {pages.length}
              </span>
            </Button>
            
            {isCreatingPage && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-4 z-10 border">
                <h3 className="font-medium mb-2">Create New Page</h3>
                <Input
                  placeholder="Page Title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreatePage}>Create</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsCreatingPage(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="outline" onClick={() => setIsCreatingPage(true)}>
            <Plus className="h-4 w-4 mr-1" />
            <span>New Page</span>
          </Button>
        </div>
      </div>
      
      {/* Page list */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pages.map(page => (
          <div 
            key={page.id}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer 
              ${activePage.id === page.id ? 'bg-gray-100 border-l-4 border-primary' : 'bg-gray-50'}`}
            onClick={() => setActivePage(page)}
          >
            <span className="text-sm font-medium truncate max-w-[150px]">{page.title}</span>
            {pages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePage(page.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Textarea
            placeholder="Write your thoughts here..."
            className="min-h-[400px] resize-none border-0 focus-visible:ring-0"
            value={activePage.content}
            onChange={(e) => handleContentChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BrainDump;
