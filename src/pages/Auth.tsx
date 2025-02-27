
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, AlignJustify, FileText, Target, MessageSquare, Text, ArrowRightCircle, Link, Upload, Check, ImageIcon, Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

interface InspirationSource {
  type: "link" | "image";
  content: string;
  label?: string;
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
      caption: "If you don't know what to wear this spring, here are some outfit ideas ✨"
    },
    {
      id: "2",
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: ""
    },
    {
      id: "3",
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: ""
    }
  ]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

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

  const handleAddNewIdea = () => {
    const newIdea: ContentIdea = {
      id: Date.now().toString(),
      idea: "",
      pillar: "",
      format: "",
      goal: "",
      hook: "",
      script: "",
      caption: ""
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

  const handleCellChange = (ideaId: string, field: keyof ContentIdea, value: string) => {
    setContentIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return { ...idea, [field]: value };
      }
      return idea;
    }));
  };

  const renderInspirationCell = (idea: ContentIdea) => {
    const source = idea.inspirationSource;
    
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
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingLink(true);
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
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsAddingLink(true);
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

    return (
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-5 w-5 p-0"
          onClick={() => {
            setIsAddingLink(true);
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
                <h2 className="text-2xl font-semibold mb-4">Brain Dump</h2>
                <p className="text-muted-foreground mb-6">
                  Quickly jot down all your thoughts and ideas without worrying about organization yet.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-8 min-h-[300px]">
                  <p className="text-center text-muted-foreground">
                    Brain dump content will go here
                  </p>
                </div>
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
                    {/* Trash icons positioned outside the table */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-[53px] z-10">
                      {contentIdeas.map((idea, index) => (
                        <div 
                          key={`delete-${idea.id}`} 
                          className="h-[53px] flex items-center justify-center opacity-0 group-hover-[data-row-id='${idea.id}']:opacity-100 transition-opacity"
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
                    
                    <table className="w-full border-collapse ml-10">
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
                              <Link className="h-3 w-3" />
                              <span>Inspiration</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <AlignJustify className="h-3 w-3" />
                              <span>Pillar</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>Format</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>Goal</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>Hook</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <ArrowRightCircle className="h-3 w-3" />
                              <span>Script</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider border-r border-gray-700">
                            <div className="flex items-center gap-1">
                              <Text className="h-3 w-3" />
                              <span>Caption</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {contentIdeas.map((idea) => (
                          <tr 
                            key={idea.id} 
                            className="hover:bg-gray-50" 
                            data-row-id={idea.id}
                            onMouseEnter={() => {
                              // This is to handle showing the corresponding delete button
                              const deleteButton = document.querySelector(`[data-delete-for="${idea.id}"]`);
                              if (deleteButton) {
                                deleteButton.classList.add('opacity-100');
                                deleteButton.classList.remove('opacity-0');
                              }
                            }}
                            onMouseLeave={() => {
                              // Hide the delete button when mouse leaves
                              const deleteButton = document.querySelector(`[data-delete-for="${idea.id}"]`);
                              if (deleteButton) {
                                deleteButton.classList.add('opacity-0');
                                deleteButton.classList.remove('opacity-100');
                              }
                            }}
                          >
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Input 
                                value={idea.idea} 
                                onChange={(e) => handleCellChange(idea.id, 'idea', e.target.value)}
                                className="border-0 focus:ring-0 h-6 p-0 text-sm bg-transparent"
                                placeholder="Add idea..."
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px] border-r border-gray-200">
                              {renderInspirationCell(idea)}
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
                          </tr>
                        ))}
                        {/* Add New Idea Row */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td colSpan={8} className="px-4 py-3 text-center">
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
