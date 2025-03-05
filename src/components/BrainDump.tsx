import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit3, 
  Trash2,
  Check,
  X,
  List,
  Bold,
  Italic,
  Heading,
  ListOrdered,
  AlignLeft,
  Underline,
  Link,
  Image,
  AlignCenter,
  AlignRight,
  Type,
  Pilcrow,
  Quote,
  Code,
  SquareCode,
  Strikethrough
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
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

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

    const updatedPages = pages.map(page => 
      page.id === id ? { ...page, title: editingTitle } : page
    );
    
    setPages(updatedPages);
    
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
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "• " + after;
    handleContentChange(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "1. " + after;
    handleContentChange(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 3, selectionStart + 3);
      }
    }, 0);
  };

  const insertHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "## " + after;
    handleContentChange(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 3, selectionStart + 3);
      }
    }, 0);
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let newText;
      let newCursorPos;
      
      if (format === 'bold') {
        newText = value.substring(0, selectionStart) + "**" + selectedText + "**" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4; // 4 for the two asterisks at start and end
      } else if (format === 'italic') { // italic
        newText = value.substring(0, selectionStart) + "_" + selectedText + "_" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2; // 2 for the underscores at start and end
      } else if (format === 'underline') { // underline
        newText = value.substring(0, selectionStart) + "<u>" + selectedText + "</u>" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 7; // 7 for the <u> and </u> tags
      } else if (format === 'strikethrough') { // strikethrough
        newText = value.substring(0, selectionStart) + "~~" + selectedText + "~~" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4; // 4 for the ~~ at start and end
      } else { // code - change this to ensure it works in plain text
        // Use a special format that will be visually distinct but won't render as code
        newText = value.substring(0, selectionStart) + "[code]" + selectedText + "[/code]" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 13; // 13 for the [code] and [/code] tags
      }
      
      handleContentChange(newText);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } else {
      let beforeText, afterText;
      
      if (format === 'bold') {
        beforeText = "**";
        afterText = "**";
      } else if (format === 'italic') { // italic
        beforeText = "_";
        afterText = "_";
      } else if (format === 'underline') { // underline
        beforeText = "<u>";
        afterText = "</u>";
      } else if (format === 'strikethrough') { // strikethrough
        beforeText = "~~";
        afterText = "~~";
      } else { // code - change this to ensure it works in plain text
        beforeText = "[code]";
        afterText = "[/code]";
      }
      
      const newText = value.substring(0, selectionStart) + beforeText + afterText + value.substring(selectionEnd);
      handleContentChange(newText);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(selectionStart + beforeText.length, selectionStart + beforeText.length);
        }
      }, 0);
    }
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    // Use custom format that won't render as actual code
    const codeBlockStart = "\n[codeblock]\n";
    const codeBlockEnd = "\n[/codeblock]\n";
    
    const newText = value.substring(0, selectionStart) + 
                    codeBlockStart + 
                    selectedText + 
                    codeBlockEnd + 
                    value.substring(selectionEnd);
    
    handleContentChange(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = selectionStart + codeBlockStart.length;
        textarea.setSelectionRange(newPosition, newPosition + selectedText.length);
      }
    }, 0);
  };

  const insertQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    const newText = value.substring(0, selectionStart) + 
                    "> " + selectedText + 
                    value.substring(selectionEnd);
    
    handleContentChange(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = selectionEnd + 2; // Adding 2 for "> "
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleAlignText = (alignment: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let alignedText;
      
      if (alignment === 'center') {
        alignedText = `<div style="text-align: center;">${selectedText}</div>`;
      } else if (alignment === 'right') {
        alignedText = `<div style="text-align: right;">${selectedText}</div>`;
      } else {
        alignedText = `<div style="text-align: left;">${selectedText}</div>`;
      }
      
      const newText = value.substring(0, selectionStart) + alignedText + value.substring(selectionEnd);
      handleContentChange(newText);
    } else {
      let tag;
      
      if (alignment === 'center') {
        tag = `<div style="text-align: center;"></div>`;
      } else if (alignment === 'right') {
        tag = `<div style="text-align: right;"></div>`;
      } else {
        tag = `<div style="text-align: left;"></div>`;
      }
      
      const newText = value.substring(0, selectionStart) + tag + value.substring(selectionEnd);
      handleContentChange(newText);
      
      // Place cursor between the opening and closing tags
      const cursorPosition = selectionStart + tag.indexOf('</div>');
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
    
    toast({
      title: `Align ${alignment}`,
      description: "Text alignment applied",
    });
  };

  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = textarea.value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      setSelectedFormat('paragraph');
    } else {
      setSelectedFormat(null);
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
      
      <div className="flex flex-wrap gap-2 mb-4">
        {pages.map(page => (
          <div 
            key={page.id}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer 
              ${activePage.id === page.id ? 'bg-gray-100 border-l-4 border-primary' : 'bg-gray-50'}`}
            onClick={() => {
              if (editingPageId !== page.id) {
                setActivePage(page);
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
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Brain Dump Of Ideas</h2>
        </div>
        
        <div className="flex flex-col">
          <div className="bg-white border border-slate-200 rounded-t-md shadow-sm flex flex-wrap items-center gap-1 p-3">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2 text-purple-800" />
                <span className="text-sm font-medium text-purple-800">Text Formatting</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 w-full">
              <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'bold' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    applyFormatting('bold');
                    setSelectedFormat('bold');
                  }}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'italic' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    applyFormatting('italic');
                    setSelectedFormat('italic');
                  }}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'underline' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    applyFormatting('underline');
                    setSelectedFormat('underline');
                  }}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'strikethrough' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    applyFormatting('strikethrough');
                    setSelectedFormat('strikethrough');
                  }}
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'heading' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    insertHeading();
                    setSelectedFormat('heading');
                  }}
                  title="Heading"
                >
                  <Heading className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'paragraph' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    setSelectedFormat('paragraph');
                  }}
                  title="Paragraph"
                >
                  <Pilcrow className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'quote' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    insertQuote();
                    setSelectedFormat('quote');
                  }}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'bullet-list' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    insertBulletPoint();
                    setSelectedFormat('bullet-list');
                  }}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'numbered-list' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    insertNumberedList();
                    setSelectedFormat('numbered-list');
                  }}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'code' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    applyFormatting('code');
                    setSelectedFormat('code');
                  }}
                  title="Inline Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'code-block' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    insertCodeBlock();
                    setSelectedFormat('code-block');
                  }}
                  title="Code Block"
                >
                  <SquareCode className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-left' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    handleAlignText('left');
                    setSelectedFormat('align-left');
                  }}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-center' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    handleAlignText('center');
                    setSelectedFormat('align-center');
                  }}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-right' ? 'bg-purple-200 text-purple-700' : ''}`}
                  onClick={() => {
                    handleAlignText('right');
                    setSelectedFormat('align-right');
                  }}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Card className="mt-0 rounded-t-none">
            <CardContent className="p-6">
              <Textarea
                ref={textareaRef}
                placeholder="Start writing your ideas here... This is a space for you to freely brainstorm, jot down random thoughts, or draft content ideas without any structure. Just let your creativity flow!"
                className="min-h-[400px] resize-none border-0 focus-visible:ring-0"
                value={activePage.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onTextSelect={handleTextSelection}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrainDump;
