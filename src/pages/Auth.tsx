
import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, AlignJustify, FileText, Target, MessageSquare, Text, ArrowRightCircle, Link, Upload, Check, ImageIcon, Globe, Plus, Trash2, GripVertical, FileEdit, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrainDump from "@/components/BrainDump";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

interface InspirationSource {
  type: "link" | "image" | "text";
  content: string;
  label?: string;
}

interface CustomColumn {
  id: string;
  name: string;
}

interface StandardColumn {
  id: string;
  name: string;
  field: string;
  icon?: React.ReactNode;
  isEditing: boolean;
  width?: string; // Added width property for column sizing
}

interface ContentIdea {
  id: string;
  idea: string;
  inspirationSource?: InspirationSource;
  pillar: string;
  format: string;
  goal: string;
  hook: string;
  script: string;
  caption: string;
  customValues: Record<string, string>;
}

const Auth = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("brain-dump");
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([
    {
      id: "1",
      idea: "Spring outfits",
      inspirationSource: {
        type: "link",
        content: "https://pinterest.com/search/pins/?q=spring%20outfits",
        label: "Pinterest"
      },
      pillar: "Fashion",
      format: "Text On Video",
      goal: "Likes",
      hook: "3 outfit formulas for spring",
      script: "Formula 1: Pastel blouse + wide leg jeans + ballet flats. Formula 2: Floral dress + denim jacket + white sneakers. Formula 3: Linen shirt + cropped pants + espadrilles.",
      caption: "If you don't know what to wear this spring, here are some outfit ideas ✨",
      customValues: {}
    },
    {
      id: "2",
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: "",
      customValues: {}
    },
    {
      id: "3",
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: "",
      customValues: {}
    }
  ]);
  
  // Standard columns that can be reordered and renamed with explicit widths for all columns
  const [standardColumns, setStandardColumns] = useState<StandardColumn[]>([
    { id: "idea", name: "Idea", field: "idea", icon: <Lightbulb className="h-3 w-3" />, isEditing: false, width: "600px" },
    { id: "inspiration", name: "Inspiration", field: "inspiration", icon: <Link className="h-3 w-3" />, isEditing: false, width: "150px" },
    { id: "pillar", name: "Pillar", field: "pillar", icon: <AlignJustify className="h-3 w-3" />, isEditing: false, width: "200px" },
    { id: "format", name: "Format", field: "format", icon: <FileText className="h-3 w-3" />, isEditing: false, width: "200px" },
    { id: "goal", name: "Goal", field: "goal", icon: <Target className="h-3 w-3" />, isEditing: false, width: "200px" },
    { id: "hook", name: "Hook", field: "hook", icon: <MessageSquare className="h-3 w-3" />, isEditing: false, width: "500px" },
    { id: "script", name: "Script", field: "script", icon: <ArrowRightCircle className="h-3 w-3" />, isEditing: false, width: "200px" },
    { id: "caption", name: "Caption", field: "caption", icon: <Text className="h-3 w-3" />, isEditing: false, width: "200px" },
  ]);
  
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [inspirationText, setInspirationText] = useState("");
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  
  // Column drag state
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  
  // Editing column name state
  const [editingColumnName, setEditingColumnName] = useState("");

  // Custom columns state
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, ideaId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setContentIdeas(prev => prev.map(idea => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              inspirationSource: {
                type: "image",
                content: result,
                label: file.name
              }
            };
          }
          return idea;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = (ideaId: string) => {
    if (linkUrl) {
      setContentIdeas(prev => prev.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            inspirationSource: {
              type: "link",
              content: linkUrl,
              label: linkLabel || new URL(linkUrl).hostname
            }
          };
        }
        return idea;
      }));
      setLinkUrl("");
      setLinkLabel("");
      setIsAddingLink(false);
      setActiveCellId(null);
    }
  };

  const handleAddText = (ideaId: string) => {
    if (inspirationText.trim()) {
      setContentIdeas(prev => prev.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            inspirationSource: {
              type: "text",
              content: inspirationText,
              label: "Note"
            }
          };
        }
        return idea;
      }));
      setInspirationText("");
      setIsAddingText(false);
      setActiveCellId(null);
    }
  };

  const handleAddNewIdea = () => {
    const newIdea: ContentIdea = {
      id: Date.now().toString(),
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: "",
      customValues: {}
    };
    setContentIdeas(prev => [...prev, newIdea]);
    toast({
      title: "New idea added",
      description: "Start filling in the details",
    });
  };

  const handleDeleteIdea = (ideaId: string) => {
    // Don't allow deleting all rows
    if (contentIdeas.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need to keep at least one idea row",
        variant: "destructive",
      });
      return;
    }
    
    setContentIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    toast({
      title: "Idea deleted",
      description: "The content idea has been removed",
    });
  };

  // Handle deleting standard column
  const handleDeleteStandardColumn = (columnId: string) => {
    // Don't allow deleting all columns
    if (standardColumns.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need to keep at least one standard column",
        variant: "destructive",
      });
      return;
    }
    
    // Check if it's a required column like "idea"
    if (columnId === "idea") {
      toast({
        title: "Cannot delete",
        description: "The Idea column is required and cannot be deleted",
        variant: "destructive",
      });
      return;
    }
    
    setStandardColumns(prev => prev.filter(col => col.id !== columnId));
    toast({
      title: "Column deleted",
      description: "The column has been removed",
    });
  };

  const handleCellChange = (ideaId: string, field: keyof Omit<ContentIdea, 'id' | 'inspirationSource' | 'customValues'>, value: string) => {
    setContentIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return { ...idea, [field]: value };
      }
      return idea;
    }));
  };

  // Drag and drop functions for rows
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, ideaId: string) => {
    setDraggedRowId(ideaId);
    e.dataTransfer.effectAllowed = 'move';
    // Add some transparency to the dragged element
    if (e.currentTarget) {
      setTimeout(() => {
        e.currentTarget.style.opacity = '0.5';
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    setDraggedRowId(null);
    setDragOverRowId(null);
    // Reset opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, ideaId: string) => {
    e.preventDefault();
    if (draggedRowId === ideaId) return;
    setDragOverRowId(ideaId);
  };

  const handleDragLeave = () => {
    setDragOverRowId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) return;

    const draggedIndex = contentIdeas.findIndex(idea => idea.id === draggedRowId);
    const targetIndex = contentIdeas.findIndex(idea => idea.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Create a new array with the reordered elements
      const newIdeas = [...contentIdeas];
      const draggedItem = newIdeas[draggedIndex];
      newIdeas.splice(draggedIndex, 1);
      newIdeas.splice(targetIndex, 0, draggedItem);
      
      setContentIdeas(newIdeas);
      toast({
        title: "Row reordered",
        description: "The idea has been moved to a new position",
      });
    }
    
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  // Column drag and drop functions
  const handleColumnDragStart = (e: React.DragEvent<HTMLTableCellElement>, columnId: string) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual cue for dragging
    if (e.currentTarget) {
      setTimeout(() => {
        e.currentTarget.style.opacity = '0.7';
        e.currentTarget.style.border = '2px dashed #555';
      }, 0);
    }
  };

  const handleColumnDragEnd = (e: React.DragEvent<HTMLTableCellElement>) => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    // Reset visual styles
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.border = '';
    }

    // Reset all column headers
    const headers = document.querySelectorAll('th');
    headers.forEach(header => {
      header.style.opacity = '1';
      header.style.border = '';
      header.style.borderRight = '1px solid rgb(55, 65, 81)'; // border-r border-gray-700
    });
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLTableCellElement>, columnId: string) => {
    e.preventDefault();
    if (draggedColumnId === columnId) return;
    setDragOverColumnId(columnId);
    
    // Add visual cue for drop target
    if (e.currentTarget) {
      e.currentTarget.style.borderLeft = '3px solid #3b82f6';
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent<HTMLTableCellElement>) => {
    setDragOverColumnId(null);
    // Remove visual cue
    if (e.currentTarget) {
      e.currentTarget.style.borderLeft = '';
    }
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLTableCellElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedColumnId || draggedColumnId === targetId) return;

    // Determine if we're dealing with standard columns or custom columns
    const isStandardDragged = standardColumns.some(col => col.id === draggedColumnId);
    const isStandardTarget = standardColumns.some(col => col.id === targetId);
    const isCustomDragged = customColumns.some(col => col.id === draggedColumnId);
    const isCustomTarget = customColumns.some(col => col.id === targetId);

    // Handle reordering within the same column type (standard or custom)
    if (isStandardDragged && isStandardTarget) {
      const draggedIndex = standardColumns.findIndex(col => col.id === draggedColumnId);
      const targetIndex = standardColumns.findIndex(col => col.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newColumns = [...standardColumns];
        const draggedItem = newColumns[draggedIndex];
        newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedItem);
        
        setStandardColumns(newColumns);
        toast({
          title: "Column reordered",
          description: "The column has been moved to a new position",
        });
      }
    } else if (isCustomDragged && isCustomTarget) {
      const draggedIndex = customColumns.findIndex(col => col.id === draggedColumnId);
      const targetIndex = customColumns.findIndex(col => col.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newColumns = [...customColumns];
        const draggedItem = newColumns[draggedIndex];
        newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedItem);
        
        setCustomColumns(newColumns);
        toast({
          title: "Column reordered",
          description: "The column has been moved to a new position",
        });
      }
    }
    // Reset drag state
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    
    // Reset all column header styles
    const headers = document.querySelectorAll('th');
    headers.forEach(header => {
      header.style.opacity = '1';
      header.style.border = '';
      header.style.borderLeft = '';
      header.style.borderRight = '1px solid rgb(55, 65, 81)'; // border-r border-gray-700
    });
  };

  // Column editing functions
  const startEditingColumn = (columnId: string) => {
    setStandardColumns(prev => 
      prev.map(col => ({
        ...col,
        isEditing: col.id === columnId
      }))
    );
    
    const column = standardColumns.find(col => col.id === columnId);
    if (column) {
      setEditingColumnName(column.name);
    }
  };

  const saveColumnName = (columnId: string) => {
    if (editingColumnName.trim() === '') {
      toast({
        title: "Column name required",
        description: "Column name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setStandardColumns(prev => 
      prev.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            name: editingColumnName,
            isEditing: false
          };
        }
        return { ...col, isEditing: false };
      })
    );
    
    setEditingColumnName("");
    
    toast({
      title: "Column renamed",
      description: "The column name has been updated",
    });
  };

  const cancelEditingColumn = () => {
    setStandardColumns(prev => 
      prev.map(col => ({
        ...col,
        isEditing: false
      }))
    );
    setEditingColumnName("");
  };

  // Custom column functions
  const handleAddCustomColumn = () => {
    if (newColumnName.trim() === "") {
      toast({
        title: "Column name required",
        description: "Please enter a name for your new column",
        variant: "destructive"
      });
      return;
    }

    // Check if column name already exists
    if (customColumns.some(col => col.name.toLowerCase() === newColumnName.toLowerCase()) ||
        standardColumns.some(col => col.name.toLowerCase() === newColumnName.toLowerCase())) {
      toast({
        title: "Column already exists",
        description: "Please use a different name",
        variant: "destructive"
      });
      return;
    }

    const newColumn: CustomColumn = {
      id: Date.now().toString(),
      name: newColumnName
    };

    setCustomColumns([...customColumns, newColumn]);
    setNewColumnName("");
    setIsAddingColumn(false);
    
    toast({
      title: "Column added",
      description: `"${newColumnName}" column has been added to your table`
    });
  };

  const handleRemoveCustomColumn = (columnId: string) => {
    setCustomColumns(customColumns.filter(col => col.id !== columnId));
    
    // Remove the column data from all content ideas
    setContentIdeas(contentIdeas.map(idea => {
      const updatedCustomValues = { ...idea.customValues };
      delete updatedCustomValues[columnId];
      return {
        ...idea,
        customValues: updatedCustomValues
      };
    }));
    
    toast({
      title: "Column removed",
      description: "The custom column has been removed"
    });
  };

  const handleUpdateCustomValue = (ideaId: string, columnId: string, value: string) => {
    setContentIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          customValues: {
            ...idea.customValues,
            [columnId]: value
          }
        };
      }
      return idea;
    }));
  };

  const renderInspirationCell = (idea: ContentIdea) => {
    const source = idea.inspirationSource;
    
    // Adding Link UI
    if (isAddingLink && activeCellId === idea.id) {
      return (
        <div className="flex flex-col space-y-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="text-xs h-6 px-2"
          />
          <Input
            type="text"
            placeholder="Label (optional)"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className="text-xs h-6 px-2"
          />
          <div className="flex gap-1">
            <Button
              type="button"
              size="xs"
              onClick={() => handleAddLink(idea.id)}
              className="text-xs h-5"
            >
              <Check className="h-2.5 w-2.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                setIsAddingLink(false);
                setActiveCellId(null);
              }}
              className="text-xs h-5"
            >
              <span className="text-[10px]">Cancel</span>
            </Button>
          </div>
        </div>
      );
    }

    // Adding Text UI
    if (isAddingText && activeCellId === idea.id) {
      return (
        <div className="flex flex-col space-y-2">
          <Input
            type="text"
            placeholder="Enter inspiration text..."
            value={inspirationText}
            onChange={(e) => setInspirationText(e.target.value)}
            className="text-xs h-6 px-2"
          />
          <div className="flex gap-1">
            <Button
              type="button"
              size="xs"
              onClick={() => handleAddText(idea.id)}
              className="text-xs h-5"
            >
              <Check className="h-2.5 w-2.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                setIsAddingText(false);
                setActiveCellId(null);
              }}
              className="text-xs h-5"
            >
              <span className="text-[10px]">Cancel</span>
            </Button>
          </div>
        </div>
      );
    }

    // Display Image
    if (source?.type === "image" && source.content) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-2 w-2 text-blue-600" />
            <span className="text-blue-600 text-xs truncate max-w-[120px]">{source.label}</span>
          </div>
          <div className="w-16 h-16 relative">
            <img 
              src={source.content} 
              alt="Inspiration" 
              className="w-full h-full object-cover rounded-md border border-gray-200" 
            />
          </div>
          <div className="flex gap-1 mt-1">
            {/* Reordered icons: Write, Link, Upload */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingText(true);
                setIsAddingLink(false);
                setActiveCellId(idea.id);
              }}
              title="Add Text"
            >
              <FileEdit className="h-2.5 w-2.5" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingLink(true);
                setIsAddingText(false);
                setActiveCellId(idea.id);
              }}
              title="Add Link"
            >
              <Globe className="h-2.5 w-2.5" />
            </Button>
            
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, idea.id)}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-5 w-5 p-0"
                title="Upload Image"
              >
                <Upload className="h-2.5 w-2.5" />
              </Button>
            </label>
          </div>
        </div>
      );
    }

    // Display Link
    if (source?.type === "link" && source.content) {
      return (
        <div className="flex flex-col space-y-2">
          <a href={source.content} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
            <Link className="h-2 w-2" />
            <span className="text-xs">{source.label || "Link"}</span>
          </a>
          <div className="flex gap-1 mt-1">
            {/* Reordered icons: Write, Link, Upload */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingText(true);
                setIsAddingLink(false);
                setActiveCellId(idea.id);
              }}
              title="Add Text"
            >
              <FileEdit className="h-2.5 w-2.5" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingLink(true);
                setIsAddingText(false);
                setActiveCellId(idea.id);
              }}
              title="Add Link"
            >
              <Globe className="h-2.5 w-2.5" />
            </Button>
            
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, idea.id)}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-5 w-5 p-0"
                title="Upload Image"
              >
                <Upload className="h-2.5 w-2.5" />
              </Button>
            </label>
          </div>
        </div>
      );
    }

    // Display Text
    if (source?.type === "text" && source.content) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <FileEdit className="h-2 w-2 text-gray-600" />
            <span className="text-gray-600 text-xs">{source.label || "Note"}</span>
          </div>
          <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 max-h-16 overflow-y-auto">
            {source.content}
          </div>
          <div className="flex gap-1 mt-1">
            {/* Reordered icons: Write, Link, Upload */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingText(true);
                setIsAddingLink(false);
                setInspirationText(source.content);
                setActiveCellId(idea.id);
              }}
              title="Edit Text"
            >
              <FileEdit className="h-2.5 w-2.5" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingLink(true);
                setIsAddingText(false);
                setActiveCellId(idea.id);
              }}
              title="Add Link"
            >
              <Globe className="h-2.5 w-2.5" />
            </Button>
            
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, idea.id)}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-5 w-5 p-0"
                title="Upload Image"
              >
                <Upload className="h-2.5 w-2.5" />
              </Button>
            </label>
          </div>
        </div>
      );
    }

    // No source yet - show options
    return (
      <div className="flex gap-1">
        {/* Reordered icons: Write, Link, Upload */}
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-5 w-5 p-0"
          onClick={() => {
            setIsAddingText(true);
            setIsAddingLink(false);
            setActiveCellId(idea.id);
          }}
          title="Add Text"
        >
          <FileEdit className="h-2.5 w-2.5" />
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-5 w-5 p-0"
          onClick={() => {
            setIsAddingLink(true);
            setIsAddingText(false);
            setActiveCellId(idea.id);
          }}
          title="Add Link"
        >
          <Globe className="h-2.5 w-2.5" />
        </Button>
        
        <label className="cursor-pointer">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, idea.id)}
          />
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="h-5 w-5 p-0"
            title="Upload Image"
          >
            <Upload className="h-2.5 w-2.5" />
          </Button>
        </label>
      </div>
    );
  };

  // Render cell for a specific standard column
  const renderStandardCell = (idea: ContentIdea, columnField: string) => {
    if (columnField === "inspiration") {
      return renderInspirationCell(idea);
    }
    
    // For all other standard fields
    return (
      <Input 
        value={idea[columnField as keyof typeof idea] as string} 
        onChange={(e) => handleCellChange(idea.id, columnField as keyof Omit<ContentIdea, 'id' | 'inspirationSource' | 'customValues'>, e.target.value)}
        className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
        placeholder={`Add ${columnField}...`}
      />
    );
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Content Ideation & Planning</h1>
          <p className="text-muted-foreground">
            Develop and organize your content ideas in one place
          </p>
        </div>

        <Tabs defaultValue="brain-dump" className="w-full" onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="brain-dump" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Brain Dump</span>
            </TabsTrigger>
            <TabsTrigger value="content-ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="inspiration" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Inspiration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brain-dump" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <BrainDump />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content-ideas" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Content Ideas</h2>
                <p className="text-muted-foreground mb-6">
                  Organize your content ideas into categories and refine them for future content creation.
                </p>
                <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
                  <div className="overflow-x-auto relative">
                    {/* Row Delete icons positioned outside the table */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-[53px] z-10">
                      {contentIdeas.map((idea) => (
                        <div 
                          key={`delete-${idea.id}`} 
                          className="h-[53px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-delete-for={idea.id}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteIdea(idea.id)}
                            title="Delete idea"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Column Delete icons positioned at the top of the table */}
                    <div className="absolute left-10 top-0 h-[53px] z-10 flex items-center">
                      {standardColumns.map((column) => (
                        <div 
                          key={`col-delete-${column.id}`} 
                          className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ 
                            position: 'absolute', 
                            left: `${Array.from(standardColumns).findIndex(c => c.id === column.id) * 10}px`,
                            width: column.width ? 'calc(' + column.width + ' - 10px)' : '190px'
                          }}
                          data-delete-col-for={column.id}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteStandardColumn(column.id)}
                            title={`Delete ${column.name} column`}
                            disabled={column.id === "idea"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Drag handles positioned outside the table on the right */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex flex-col pt-[53px] z-10">
                      {contentIdeas.map((idea) => (
                        <div 
                          key={`drag-${idea.id}`} 
                          className="h-[53px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-drag-for={idea.id}
                        >
                          <div
                            className="h-6 w-6 flex items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <table className="w-full border-collapse ml-10 mr-10 group">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {/* Standard Columns - can be reordered and renamed */}
                          {standardColumns.map((column, index) => (
                            <th 
                              key={column.id}
                              className={`px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700 cursor-move ${dragOverColumnId === column.id ? 'bg-blue-800' : ''}`}
                              style={{ width: column.width }} /* Apply column width here */
                              draggable
                              onDragStart={(e) => handleColumnDragStart(e, column.id)}
                              onDragEnd={handleColumnDragEnd}
                              onDragOver={(e) => handleColumnDragOver(e, column.id)}
                              onDragLeave={(e) => handleColumnDragLeave(e)}
                              onDrop={(e) => handleColumnDrop(e, column.id)}
                              title="Drag to reorder column"
                              onMouseEnter={() => {
                                // Show the delete button for this column
                                const deleteButton = document.querySelector(`[data-delete-col-for="${column.id}"]`);
                                if (deleteButton) {
                                  deleteButton.classList.add('opacity-100');
                                  deleteButton.classList.remove('opacity-0');
                                }
                              }}
                              onMouseLeave={() => {
                                // Hide the delete button
                                const deleteButton = document.querySelector(`[data-delete-col-for="${column.id}"]`);
                                if (deleteButton) {
                                  deleteButton.classList.add('opacity-0');
                                  deleteButton.classList.remove('opacity-100');
                                }
                              }}
                            >
                              {column.isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingColumnName}
                                    onChange={(e) => setEditingColumnName(e.target.value)}
                                    className="h-6 text-xs px-2 py-1 bg-gray-600 border-gray-500 text-white"
                                    autoFocus
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="h-5 w-5 p-0 text-green-300 hover:text-green-100"
                                    onClick={() => saveColumnName(column.id)}
                                    title="Save column name"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="h-5 w-5 p-0 text-red-300 hover:text-red-100"
                                    onClick={cancelEditingColumn}
                                    title="Cancel"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {column.icon}
                                    <span>{column.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="h-5 w-5 p-0 text-gray-300 hover:text-white -mr-1 opacity-0 group-hover:opacity-100"
                                    onClick={() => startEditingColumn(column.id)}
                                    title="Edit column name"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </th>
                          ))}
                          
                          {/* Custom Columns */}
                          {customColumns.map(column => (
                            <th 
                              key={column.id}
                              className={`px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700 bg-purple-900 cursor-move ${dragOverColumnId === column.id ? 'bg-purple-800' : ''}`}
                              draggable
                              onDragStart={(e) => handleColumnDragStart(e, column.id)}
                              onDragEnd={handleColumnDragEnd}
                              onDragOver={(e) => handleColumnDragOver(e, column.id)}
                              onDragLeave={(e) => handleColumnDragLeave(e)}
                              onDrop={(e) => handleColumnDrop(e, column.id)}
                              title="Drag to reorder column"
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate max-w-[100px]">{column.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="h-5 w-5 p-0 text-gray-300 hover:text-red-300 -mr-1"
                                  onClick={() => handleRemoveCustomColumn(column.id)}
                                  title={`Remove ${column.name} column`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </th>
                          ))}
                          
                          {/* Add Custom Column */}
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider min-w-[140px] bg-gray-700">
                            {isAddingColumn ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={newColumnName}
                                  onChange={(e) => setNewColumnName(e.target.value)}
                                  placeholder="Column name"
                                  className="h-6 text-xs px-2 py-1 bg-gray-600 border-gray-500 text-white"
                                  autoFocus
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="h-5 w-5 p-0 text-green-300 hover:text-green-100"
                                  onClick={handleAddCustomColumn}
                                  title="Add column"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="h-5 w-5 p-0 text-red-300 hover:text-red-100"
                                  onClick={() => {
                                    setIsAddingColumn(false);
                                    setNewColumnName("");
                                  }}
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="text-gray-300 hover:text-white h-6"
                                onClick={() => setIsAddingColumn(true)}
                                title="Add custom column"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span>Add Column</span>
                              </Button>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {contentIdeas.map((idea) => (
                          <tr 
                            key={idea.id} 
                            className={`hover:bg-gray-50 group ${dragOverRowId === idea.id ? 'bg-blue-50' : ''}`}
                            data-row-id={idea.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idea.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, idea.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idea.id)}
                            onMouseEnter={() => {
                              // Show the corresponding delete and drag buttons
                              const deleteButton = document.querySelector(`[data-delete-for="${idea.id}"]`);
                              const dragHandle = document.querySelector(`[data-drag-for="${idea.id}"]`);
                              if (deleteButton) {
                                deleteButton.classList.add('opacity-100');
                                deleteButton.classList.remove('opacity-0');
                              }
                              if (dragHandle) {
                                dragHandle.classList.add('opacity-100');
                                dragHandle.classList.remove('opacity-0');
                              }
                            }}
                            onMouseLeave={() => {
                              // Hide the delete and drag buttons
                              const deleteButton = document.querySelector(`[data-delete-for="${idea.id}"]`);
                              const dragHandle = document.querySelector(`[data-drag-for="${idea.id}"]`);
                              if (deleteButton) {
                                deleteButton.classList.add('opacity-0');
                                deleteButton.classList.remove('opacity-100');
                              }
                              if (dragHandle) {
                                dragHandle.classList.add('opacity-0');
                                dragHandle.classList.remove('opacity-100');
                              }
                            }}
                          >
                            {/* Render cells based on the order of standardColumns */}
                            {standardColumns.map(column => (
                              <td 
                                key={`${idea.id}-${column.id}`}
                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200"
                                style={{ width: column.width }} /* Apply column width to cells too */
                              >
                                {renderStandardCell(idea, column.field)}
                              </td>
                            ))}
                            
                            {/* Custom Column Values */}
                            {customColumns.map(column => (
                              <td 
                                key={`${idea.id}-${column.id}`} 
                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 bg-purple-50"
                              >
                                <Input 
                                  value={idea.customValues[column.id] || ""}
                                  onChange={(e) => handleUpdateCustomValue(idea.id, column.id, e.target.value)}
                                  className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                  placeholder={`Add ${column.name.toLowerCase()}...`}
                                />
                              </td>
                            ))}
                            
                            {/* Empty cell for the "Add Column" header */}
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 bg-gray-50">
                            </td>
                          </tr>
                        ))}
                        {/* Add New Idea Row */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td colSpan={standardColumns.length + customColumns.length + 1} className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              className="text-gray-400 hover:text-primary"
                              title="Add New Idea"
                              onClick={handleAddNewIdea}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              <span className="text-sm">Add New Idea</span>
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Inspiration</h2>
                <p className="text-muted-foreground mb-6">
                  Save inspiration from around the web and organize visual references for your content.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-8 min-h-[300px]">
                  <p className="text-center text-muted-foreground">
                    Inspiration board will go here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auth;
