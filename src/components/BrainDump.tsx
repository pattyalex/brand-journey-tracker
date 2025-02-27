
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit3, 
  Trash2,
  Check,
  X,
  List
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

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

  const startEditingTitle = (page: BrainDumpPage) => {
    setEditingPageId(page.id);
    setEditingTitle(page.title);
  };

  const cancelEditingTitle = () => {
    setEditingPageId(null);
    setEditingTitle('');
  };

  const saveNewTitle = (id: string) => {
    if (editingTitle.trim() === '') {
      toast({
        title: "Title required",
        description: "Page title cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Update the page title in the pages array
    const updatedPages = pages.map(page => 
      page.id === id ? { ...page, title: editingTitle } : page
    );
    
    setPages(updatedPages);
    
    // If the active page was renamed, update it too
    if (activePage.id === id) {
      setActivePage({ ...activePage, title: editingTitle });
    }
    
    setEditingPageId(null);
    setEditingTitle('');
    
    toast({
      title: "Page renamed",
      description: "The page title has been updated",
    });
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    
    // Find the start of the current line
    let startOfLine = selectionStart;
    while (startOfLine > 0 && value[startOfLine - 1] !== '\n') {
      startOfLine--;
    }
    
    // Check if we're already in a bullet point
    const currentLineText = value.substring(startOfLine, selectionStart);
    const isAlreadyBullet = /^\s*•\s/.test(currentLineText);
    
    // Get text before and after cursor
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    let newText;
    let newCursorPosition;
    
    if (isAlreadyBullet) {
      // If we're pressing Enter on a bullet line, we want to add a new bullet
      if (selectionStart === selectionEnd && before.endsWith("\n")) {
        newText = before + "• " + after;
        newCursorPosition = selectionStart + 2;
      } else {
        // Just maintain the current bullet
        newText = value;
        newCursorPosition = selectionEnd;
      }
    } else {
      // Insert a bullet point at the cursor position
      newText = before + "• " + after;
      newCursorPosition = selectionStart + 2;
    }
    
    // Update content 
    handleContentChange(newText);
    
    // Set cursor position after the operation is complete
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Enter key on a line that starts with a bullet point
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const { selectionStart, value } = textarea;
      
      // Find the start of the current line
      let startOfLine = selectionStart;
      while (startOfLine > 0 && value[startOfLine - 1] !== '\n') {
        startOfLine--;
      }
      
      // Check if the current line starts with a bullet point
      const currentLine = value.substring(startOfLine, selectionStart);
      const bulletPattern = /^\s*•\s/;
      
      if (bulletPattern.test(currentLine)) {
        // If the line only contains a bullet point and nothing else, remove the bullet
        if (currentLine.trim() === "• ") {
          e.preventDefault();
          
          // Remove the bullet point
          const before = value.substring(0, startOfLine);
          const after = value.substring(selectionStart);
          const newText = before + after;
          
          handleContentChange(newText);
          
          // Position cursor at the beginning of the next line
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(startOfLine, startOfLine);
            }
          }, 0);
        } else {
          // Add a new bullet point on the next line
          e.preventDefault();
          
          const before = value.substring(0, selectionStart);
          const after = value.substring(selectionStart);
          const newText = before + "\n• " + after;
          
          handleContentChange(newText);
          
          // Position cursor after the new bullet
          const newPosition = selectionStart + 3;
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(newPosition, newPosition);
            }
          }, 0);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {editingPageId === activePage.id ? (
            <div className="flex items-center gap-2">
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="text-xl font-semibold h-9"
                autoFocus
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={() => saveNewTitle(activePage.id)}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={cancelEditingTitle}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{activePage.title}</h2>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={() => startEditingTitle(activePage)}
                title="Rename page"
              >
                <Edit3 className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground text-sm">
            Created on {formatDate(activePage.createdAt)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreatingPage(true)}>
            <Plus className="h-4 w-4 mr-1" />
            <span>New Page</span>
          </Button>
        </div>
      </div>
      
      {isCreatingPage && (
        <div className="bg-white rounded-md shadow-lg p-4 z-10 border">
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
      
      {/* Page list */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pages.map(page => (
          <div 
            key={page.id}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer 
              ${activePage.id === page.id ? 'bg-gray-100 border-l-4 border-primary' : 'bg-gray-50'}`}
            onClick={() => {
              if (editingPageId !== page.id) {
                setActivePage(page);
                // Cancel any ongoing edit when switching pages
                setEditingPageId(null);
              }
            }}
          >
            {editingPageId === page.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="text-sm h-6 px-2 py-1 w-[120px]"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveNewTitle(page.id);
                  }}
                >
                  <Check className="h-3 w-3 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEditingTitle();
                  }}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-sm font-medium truncate max-w-[120px]">{page.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingTitle(page);
                  }}
                  title="Rename page"
                >
                  <Edit3 className="h-2.5 w-2.5 text-gray-400" />
                </Button>
              </div>
            )}
            
            {pages.length > 1 && !editingPageId && (
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
      
      <div className="flex gap-2 mb-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:text-gray-900"
          onClick={insertBulletPoint}
          title="Add bullet point"
        >
          <List className="h-4 w-4 mr-1" />
          <span>Bullet Point</span>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Textarea
            ref={textareaRef}
            placeholder="Write your thoughts here..."
            className="min-h-[400px] resize-none border-0 focus-visible:ring-0"
            value={activePage.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BrainDump;
