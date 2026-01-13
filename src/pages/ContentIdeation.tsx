import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, Plus, X, Check, GripVertical, Trash2, FileEdit, Globe, ImageIcon, Upload, Link, Pin } from "lucide-react";
import BrainDump from "@/components/BrainDump";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StorageKeys, getJSON, setJSON } from "@/lib/storage";

type TabType = "brain-dump" | "content-ideas" | "vision-board";

interface CustomColumn {
  id: string;
  name: string;
}

interface ContentIdea {
  id: string;
  idea: string;
  pillar: string;
  format: string;
  goal: string;
  hook: string;
  script: string;
  caption: string;
  customValues: Record<string, string>;
}

const ContentIdeation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("brain-dump");
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Load content ideas from localStorage or use default examples
  const defaultContentIdeas: ContentIdea[] = [
    {
      id: "1",
      idea: "Spring outfits",
      pillar: "Fashion",
      format: "Video",
      goal: "Engagement",
      hook: "3 outfit formulas for spring",
      script: "Formula 1: Pastel blouse + wide leg jeans. Formula 2: Floral dress + denim jacket. Formula 3: Linen shirt + cropped pants.",
      caption: "If you don't know what to wear this spring, here are some outfit ideas ✨",
      customValues: {}
    },
    {
      id: "2",
      idea: "Morning routine",
      pillar: "Lifestyle",
      format: "Carousel",
      goal: "Growth",
      hook: "5 habits for a productive morning",
      script: "1. Wake up early, 2. Hydrate, 3. Move your body, 4. Journal, 5. Plan your day",
      caption: "Small habits, big results. Which one are you trying tomorrow?",
      customValues: {}
    }
  ];

  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>(() => {
    return getJSON<ContentIdea[]>(StorageKeys.contentIdeas, defaultContentIdeas);
  });

  // Define standard columns to be able to delete them
  const [standardColumns] = useState([
    { id: "idea", name: "Idea", field: "idea" },
    { id: "pillar", name: "Pillar", field: "pillar" },
    { id: "format", name: "Format", field: "format" },
    { id: "goal", name: "Goal", field: "goal" },
    { id: "hook", name: "Hook", field: "hook" },
    { id: "script", name: "Script", field: "script" },
    { id: "caption", name: "Caption", field: "caption" },
  ]);

  // Track visible/hidden columns
  const [hiddenStandardColumns, setHiddenStandardColumns] = useState<string[]>([]);

  // Track pinned content ideas (max 5)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Load pinned items from localStorage on mount
  useEffect(() => {
    const saved = getJSON<string[]>(StorageKeys.pinnedContentIdeas, []);
    setPinnedIds(saved);
  }, []);

  // Save content ideas to localStorage whenever they change
  useEffect(() => {
    setJSON(StorageKeys.contentIdeas, contentIdeas);
  }, [contentIdeas]);

  // Handle pin/unpin content idea
  const handleTogglePin = (ideaId: string) => {
    setPinnedIds((prev) => {
      let updated: string[];

      if (prev.includes(ideaId)) {
        // Unpin
        updated = prev.filter(id => id !== ideaId);
        toast({
          title: "Unpinned",
          description: "Content idea removed from dashboard"
        });
      } else {
        // Pin - check limit
        if (prev.length >= 5) {
          toast({
            title: "Maximum reached",
            description: "You can only pin up to 5 content ideas",
            variant: "destructive"
          });
          return prev;
        }
        updated = [...prev, ideaId];
        toast({
          title: "Pinned to dashboard",
          description: "This content idea will appear in 'Next to Work On'"
        });
      }

      // Save to localStorage
      setJSON(StorageKeys.pinnedContentIdeas, updated);
      return updated;
    });
  };

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
    if (customColumns.some(col => col.name.toLowerCase() === newColumnName.toLowerCase())) {
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
    setContentIdeas(contentIdeas.map(idea => {
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

    setContentIdeas([...contentIdeas, newIdea]);

    toast({
      title: "New idea added",
      description: "Start filling in the details"
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

    setContentIdeas(contentIdeas.filter(idea => idea.id !== ideaId));

    toast({
      title: "Idea deleted",
      description: "The content idea has been removed",
    });
  };

  const handleCellChange = (ideaId: string, field: keyof Omit<ContentIdea, 'id' | 'customValues'>, value: string) => {
    setContentIdeas(contentIdeas.map(idea => {
      if (idea.id === ideaId) {
        return { ...idea, [field]: value };
      }
      return idea;
    }));
  };

  // New function to handle deletion of standard columns
  const handleDeleteStandardColumn = (columnId: string) => {
    // Prevent deletion of the last visible column
    const visibleStandardColumns = standardColumns.filter(col => !hiddenStandardColumns.includes(col.id));
    if (visibleStandardColumns.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need to keep at least one column",
        variant: "destructive",
      });
      return;
    }

    // Prevent deletion of the "Idea" column as it's required
    if (columnId === "idea") {
      toast({
        title: "Cannot delete",
        description: "The Idea column is required and cannot be removed",
        variant: "destructive",
      });
      return;
    }

    // Hide the column instead of deleting it
    setHiddenStandardColumns([...hiddenStandardColumns, columnId]);

    toast({
      title: "Column removed",
      description: `The ${standardColumns.find(col => col.id === columnId)?.name} column has been hidden`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">X</h1>
          <p className="text-muted-foreground">
            Develop and organize your content ideas in one place
          </p>
        </div>

        <Tabs defaultValue="brain-dump" className="w-full" onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="brain-dump" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Brain Dump</span>
            </TabsTrigger>
            <TabsTrigger value="content-ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="vision-board" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Vision Board</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brain-dump" className="space-y-4">
            <BrainDump />
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
                    {/* Trash icons positioned outside the table on the left for rows */}
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

                    {/* Column delete buttons positioned above the table header */}
                    <div className="absolute top-0 left-10 right-10 h-8 z-20">
                      {standardColumns.filter(col => !hiddenStandardColumns.includes(col.id)).map((column, index) => {
                        // Calculate position based on a rough estimate of column widths
                        let leftPosition = 0;
                        for (let i = 0; i < index; i++) {
                          const col = standardColumns[i];
                          if (!hiddenStandardColumns.includes(col.id)) {
                            // Approximate width - could be refined based on actual column widths
                            leftPosition += col.id === "hook" || col.id === "script" || col.id === "caption" ? 200 : 120;
                          }
                        }
                        // Center in the column
                        leftPosition += column.id === "hook" || column.id === "script" || col.id === "caption" ? 100 : 60;

                        return (
                          <div
                            key={`col-delete-${column.id}`}
                            className="absolute"
                            style={{ 
                              left: `${leftPosition}px`,
                              top: '4px'
                            }}
                          >
                            {column.id !== "idea" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteStandardColumn(column.id)}
                                title={`Delete ${column.name} column`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
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
                          {/* Only render visible columns */}
                          {standardColumns.filter(col => !hiddenStandardColumns.includes(col.id)).map(column => (
                            <th 
                              key={column.id}
                              className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700 relative group"
                            >
                              <div className="flex items-center gap-1">
                                {column.id === "idea" && <Lightbulb className="h-3 w-3" />}
                                <span>{column.name}</span>
                              </div>

                              {/* Add hover trash icon inside the column header */}
                              {column.id !== "idea" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  className="absolute top-1 right-1 h-5 w-5 p-0 text-gray-300 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteStandardColumn(column.id)}
                                  title={`Delete ${column.name} column`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </th>
                          ))}

                          {/* Custom Columns */}
                          {customColumns.map(column => (
                            <th 
                              key={column.id}
                              className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700 bg-purple-900"
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

                          {/* Pin Column */}
                          <th className="px-4 py-3 text-center font-medium text-xs uppercase tracking-wider w-[80px] bg-gradient-to-br from-amber-700 to-amber-600 border-r border-amber-500">
                            <div className="flex items-center justify-center gap-1">
                              <Pin className="h-3 w-3" />
                              <span>Pin</span>
                            </div>
                          </th>

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
                            className="hover:bg-gray-50 group"
                            data-row-id={idea.id}
                          >
                            {/* Only render cells for visible columns */}
                            {standardColumns.filter(col => !hiddenStandardColumns.includes(col.id)).map(column => (
                              <td key={`${idea.id}-${column.id}`} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                <Input 
                                  value={idea[column.field as keyof typeof idea] as string} 
                                  onChange={(e) => handleCellChange(idea.id, column.field as keyof Omit<ContentIdea, 'id' | 'customValues'>, e.target.value)}
                                  className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                  placeholder={`Add ${column.field}...`}
                                />
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

                            {/* Pin Cell */}
                            <td className="px-4 py-3 text-center border-r border-gray-200 bg-gradient-to-br from-amber-50 to-amber-100">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePin(idea.id)}
                                className={`h-7 w-7 p-0 transition-all ${
                                  pinnedIds.includes(idea.id)
                                    ? 'text-amber-600 hover:text-amber-700 bg-amber-200 hover:bg-amber-300'
                                    : 'text-gray-400 hover:text-amber-600 hover:bg-amber-100'
                                }`}
                                title={pinnedIds.includes(idea.id) ? "Unpin from dashboard" : "Pin to dashboard"}
                              >
                                <Pin className={`h-4 w-4 transition-transform ${pinnedIds.includes(idea.id) ? 'rotate-45' : ''}`} />
                              </Button>
                            </td>

                            {/* Empty cell for the "Add Column" header */}
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 bg-gray-50">
                            </td>
                          </tr>
                        ))}
                        {/* Add New Idea Row */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td
                            colSpan={
                              standardColumns.filter(col => !hiddenStandardColumns.includes(col.id)).length +
                              customColumns.length +
                              2 // +1 for pin column, +1 for add column
                            }
                            className="px-4 py-3 text-center"
                          >
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

          <TabsContent value="vision-board" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Vision Board</h2>
                <p className="text-muted-foreground mb-6">
                  Create visual boards to represent your brand identity, goals, and aesthetics.
                </p>
                <div className="bg-white border border-gray-100 rounded-md p-8 min-h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Add Image Card */}
                    <div className="border border-dashed border-gray-300 rounded-md h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Add images to your vision board</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Image
                      </Button>
                    </div>

                    {/* Example Vision Board Items */}
                    <div className="rounded-md overflow-hidden h-48 relative group">
                      <img 
                        src="public/lovable-uploads/89b44c46-3bcc-4440-a4a6-be3b515f53e0.png" 
                        alt="Vision board example"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button variant="secondary" size="sm" className="mr-2">
                          <FileEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Text Card */}
                    <div className="rounded-md h-48 bg-purple-100 flex flex-col p-4 relative group">
                      <h3 className="text-lg font-medium text-purple-800">Brand Voice</h3>
                      <p className="text-sm text-purple-700 mt-2">
                        Authentic, inspiring, and approachable. Our voice should make people feel motivated and understood.
                      </p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color Palette Card */}
                    <div className="rounded-md h-48 bg-white border border-gray-200 p-4 flex flex-col">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Brand Colors</h3>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-purple-500" title="#8B5CF6"></div>
                        <div className="w-10 h-10 rounded-full bg-blue-400" title="#60A5FA"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-400" title="#34D399"></div>
                        <div className="w-10 h-10 rounded-full bg-amber-300" title="#FCD34D"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-400" title="#FB7185"></div>
                      </div>
                    </div>

                    {/* External Link Card */}
                    <div className="rounded-md h-48 bg-gray-50 border border-gray-200 p-4 flex flex-col">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-800">Inspiration Link</h3>
                      </div>
                      <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2">
                        Visual Mood Board Examples
                      </a>
                      <p className="text-sm text-gray-600 mt-2">
                        Collection of visual styles that align with our brand aesthetic.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vision-board" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Vision Board</h2>
                <p className="text-muted-foreground mb-6">
                  Create visual boards to represent your brand identity, goals, and aesthetics.
                </p>
                <div className="bg-white border border-gray-100 rounded-md p-8 min-h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Add Image Card */}
                    <div className="border border-dashed border-gray-300 rounded-md h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Add images to your vision board</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Image
                      </Button>
                    </div>

                    {/* Example Vision Board Items */}
                    <div className="rounded-md overflow-hidden h-48 relative group">
                      <img 
                        src="public/lovable-uploads/89b44c46-3bcc-4440-a4a6-be3b515f53e0.png" 
                        alt="Vision board example"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button variant="secondary" size="sm" className="mr-2">
                          <FileEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Text Card */}
                    <div className="rounded-md h-48 bg-purple-100 flex flex-col p-4 relative group">
                      <h3 className="text-lg font-medium text-purple-800">Brand Voice</h3>
                      <p className="text-sm text-purple-700 mt-2">
                        Authentic, inspiring, and approachable. Our voice should make people feel motivated and understood.
                      </p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color Palette Card */}
                    <div className="rounded-md h-48 bg-white border border-gray-200 p-4 flex flex-col">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Brand Colors</h3>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-purple-500" title="#8B5CF6"></div>
                        <div className="w-10 h-10 rounded-full bg-blue-400" title="#60A5FA"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-400" title="#34D399"></div>
                        <div className="w-10 h-10 rounded-full bg-amber-300" title="#FCD34D"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-400" title="#FB7185"></div>
                      </div>
                    </div>

                    {/* External Link Card */}
                    <div className="rounded-md h-48 bg-gray-50 border border-gray-200 p-4 flex flex-col">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-800">Inspiration Link</h3>
                      </div>
                      <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2">
                        Visual Mood Board Examples
                      </a>
                      <p className="text-sm text-gray-600 mt-2">
                        Collection of visual styles that align with our brand aesthetic.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ContentIdeation;