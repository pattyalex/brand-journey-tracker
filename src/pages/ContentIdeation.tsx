
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, Plus, X, Check, GripVertical, Trash2 } from "lucide-react";
import BrainDump from "@/components/BrainDump";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

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
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([
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
  ]);

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
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="brain-dump" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Brain Dump</span>
            </TabsTrigger>
            <TabsTrigger value="content-ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="inspiration" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Inspiration</span>
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
                    {/* Trash icons positioned outside the table */}
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
                    
                    <table className="w-full border-collapse ml-10 mr-10">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" />
                              <span>Idea</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Pillar</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Format</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Goal</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Hook</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Script</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <span>Caption</span>
                            </div>
                          </th>
                          
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
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.idea} 
                                onChange={(e) => handleCellChange(idea.id, 'idea', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add idea..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.pillar} 
                                onChange={(e) => handleCellChange(idea.id, 'pillar', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add pillar..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.format} 
                                onChange={(e) => handleCellChange(idea.id, 'format', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add format..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.goal} 
                                onChange={(e) => handleCellChange(idea.id, 'goal', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add goal..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.hook} 
                                onChange={(e) => handleCellChange(idea.id, 'hook', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add hook..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.script} 
                                onChange={(e) => handleCellChange(idea.id, 'script', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add script..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.caption} 
                                onChange={(e) => handleCellChange(idea.id, 'caption', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add caption..."
                              />
                            </td>
                            
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
                          <td colSpan={8 + customColumns.length + 1} className="px-4 py-3 text-center">
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

export default ContentIdeation;
