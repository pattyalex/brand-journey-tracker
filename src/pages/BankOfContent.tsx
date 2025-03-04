import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Search, Lightbulb, LayoutList, FileText, Save, ClipboardCopy, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentUploader from "@/components/content/ContentUploader";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
  writingSpace?: string;
  onUpdateWritingSpace?: (pillarId: string, text: string) => void;
};

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Education", content: [], writingSpace: "" },
    { id: "2", name: "Inspiration", content: [], writingSpace: "" },
    { id: "3", name: "Entertainment", content: [], writingSpace: "" },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [writingText, setWritingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedText, setSelectedText] = useState("");
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    if (activeTab && writingText) {
      const saveTimer = setTimeout(() => {
        localStorage.setItem(`writing-${activeTab}`, writingText);
      }, 1000);
      
      return () => clearTimeout(saveTimer);
    }
  }, [writingText, activeTab]);

  useEffect(() => {
    const savedWriting = localStorage.getItem(`writing-${activeTab}`);
    if (savedWriting) {
      setWritingText(savedWriting);
    } else {
      setWritingText("");
    }
  }, [activeTab]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedContent = selection.toString().trim();
      if (selectedContent) {
        setSelectedText(selectedContent);
      }
    }
  };

  const createNewIdeaFromSelection = () => {
    if (!selectedText.trim() || !newIdeaTitle.trim()) {
      toast.error("Title and content are required");
      return;
    }
    
    const newIdea: ContentItem = {
      id: `${Date.now()}`,
      title: newIdeaTitle,
      description: selectedText.slice(0, 100) + (selectedText.length > 100 ? "..." : ""),
      url: selectedText,
      format: "text",
      dateCreated: new Date(),
      tags: newIdeaTags,
    };
    
    addContentToPillar(activeTab, newIdea);
    setShowNewIdeaDialog(false);
    setSelectedText("");
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    toast.success("Selected text saved as a new idea");
  };

  const saveSelectedTextAsIdea = () => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }
    
    setNewIdeaTitle(`Idea - ${new Date().toLocaleDateString()}`);
    setNewIdeaTags(["selection"]);
    setShowNewIdeaDialog(true);
  };

  const addPillar = () => {
    const newId = `${Date.now()}`;
    setPillars([...pillars, { id: newId, name: "New Pillar", content: [], writingSpace: "" }]);
    setActiveTab(newId);
    toast.success("New pillar added");
  };

  const renamePillar = (id: string, newName: string) => {
    setPillars(pillars.map(p => p.id === id ? {...p, name: newName} : p));
  };

  const deletePillar = (id: string) => {
    const newPillars = pillars.filter(p => p.id !== id);
    
    if (newPillars.length === 0) {
      toast.error("Cannot delete the last pillar");
      return;
    }
    
    setPillars(newPillars);
    
    if (activeTab === id) {
      setActiveTab(newPillars[0].id);
    }
    
    toast.success("Pillar deleted");
  };

  const updateWritingSpace = (pillarId: string, text: string) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, writingSpace: text} 
        : p
    ));
    setWritingText(text);
  };

  const addContentToPillar = (pillarId: string, content: ContentItem) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: [...p.content, content]} 
        : p
    ));
    toast.success(`Content added to ${pillars.find(p => p.id === pillarId)?.name}`);
  };

  const deleteContent = (pillarId: string, contentId: string) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: p.content.filter(c => c.id !== contentId)} 
        : p
    ));
    toast.success("Content deleted");
  };

  const moveContent = (fromPillarId: string, toPillarId: string, contentId: string) => {
    const sourcePillar = pillars.find(p => p.id === fromPillarId);
    const contentToMove = sourcePillar?.content.find(c => c.id === contentId);
    
    if (!contentToMove) return;
    
    setPillars(pillars.map(p => {
      if (p.id === fromPillarId) {
        return {...p, content: p.content.filter(c => c.id !== contentId)};
      }
      if (p.id === toPillarId) {
        return {...p, content: [...p.content, contentToMove]};
      }
      return p;
    }));
    
    const targetPillar = pillars.find(p => p.id === toPillarId);
    toast.success(`Content moved to ${targetPillar?.name}`);
  };

  const saveForLater = () => {
    if (!writingText.trim()) {
      toast.error("There's nothing to save");
      return;
    }
    
    localStorage.setItem(`writing-${activeTab}`, writingText);
    toast.success("Your writing has been saved for later");
  };

  const filteredContent = pillars.map(pillar => ({
    ...pillar,
    content: pillar.content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }));

  const allContent = pillars.flatMap(pillar => pillar.content);
  const activePillar = pillars.find(p => p.id === activeTab);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bank of Ideas</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchModalOpen(true)}
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-background border">
              {pillars.map((pillar) => (
                <TabsTrigger 
                  key={pillar.id} 
                  value={pillar.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {pillar.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="sm" onClick={addPillar}>
              <Plus className="h-4 w-4 mr-2" /> Add Pillar
            </Button>
          </div>

          {pillars.map((pillar) => (
            <TabsContent key={pillar.id} value={pillar.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Pencil className="h-5 w-5 mr-2" />
                      Writing Space
                    </h2>
                  </div>
                  <div className="h-[calc(100vh-240px)]">
                    <Sheet>
                      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] flex">
                        <ScrollArea className="h-full w-full">
                          <div 
                            className="h-full w-full cursor-text px-4 py-4" 
                            onClick={() => textareaRef.current?.focus()}
                            onMouseUp={handleTextSelection}
                          >
                            <Textarea
                              ref={textareaRef}
                              value={writingText}
                              onChange={(e) => setWritingText(e.target.value)}
                              placeholder="Start writing your ideas, thoughts, or notes here..."
                              className="min-h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-base absolute inset-0 px-4 py-4"
                            />
                          </div>
                        </ScrollArea>
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gray-200 opacity-60"></div>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute bottom-4 right-4 bg-white/80"
                          >
                            <LayoutList className="h-4 w-4 mr-2" /> Options
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-auto">
                          <div className="py-4 space-y-4">
                            <h3 className="text-lg font-medium">Writing Options</h3>
                            
                            {selectedText ? (
                              <div className="p-4 bg-gray-100/80 rounded-md">
                                <h4 className="font-medium mb-2">Selected Text:</h4>
                                <p className="text-sm text-gray-700 line-clamp-3">{selectedText}</p>
                                <Button 
                                  onClick={saveSelectedTextAsIdea}
                                  className="w-full mt-3"
                                  variant="secondary"
                                >
                                  <ClipboardCopy className="h-4 w-4 mr-2" />
                                  Save Selection as Idea
                                </Button>
                              </div>
                            ) : null}
                            
                            <div className="grid gap-4">
                              <Button 
                                onClick={saveWritingAsIdea}
                                className="w-full"
                              >
                                Save Entire Text as Idea
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={saveForLater}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save for Later
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setWritingText("")}
                              >
                                Clear Text
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </div>
                    </Sheet>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" /> 
                      Develop Your Ideas
                    </h2>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-[#8B6B4E] hover:bg-[#7A5C3F]"
                      onClick={() => {
                        setNewIdeaTitle(`Idea - ${new Date().toLocaleDateString()}`);
                        setNewIdeaTags(["idea"]);
                        setSelectedText("");
                        setShowNewIdeaDialog(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Add New Idea
                    </Button>
                  </div>
                  <ContentPillar
                    pillar={{...pillar}}
                    pillars={pillars}
                    onRename={(newName) => renamePillar(pillar.id, newName)}
                    onDelete={() => deletePillar(pillar.id)}
                    onDeleteContent={(contentId) => deleteContent(pillar.id, contentId)}
                    onMoveContent={(toPillarId, contentId) => moveContent(pillar.id, toPillarId, contentId)}
                    searchQuery={searchQuery}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <ContentSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          content={allContent}
          pillars={pillars}
        />
        
        <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Idea</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idea-title">Title</Label>
                <Input
                  id="idea-title"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  placeholder="Enter a title for your idea"
                />
              </div>
              
              {selectedText && (
                <div className="grid gap-2">
                  <Label>Selected Content</Label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-[150px] overflow-y-auto">
                    {selectedText}
                  </div>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="secondary">
                    <Tag className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {newIdeaTags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-secondary/20 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewIdeaDialog(false)}>
                Cancel
              </Button>
              <Button onClick={selectedText ? createNewIdeaFromSelection : saveWritingAsIdea}>
                <Plus className="mr-2 h-4 w-4" /> Create Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BankOfContent;
