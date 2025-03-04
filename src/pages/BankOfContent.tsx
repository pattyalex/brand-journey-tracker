import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Search, Lightbulb, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentUploader from "@/components/content/ContentUploader";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  const saveWritingAsIdea = () => {
    const activePillar = pillars.find(p => p.id === activeTab);
    if (!writingText.trim()) {
      toast.error("Please write something first");
      return;
    }
    
    const newIdea: ContentItem = {
      id: `${Date.now()}`,
      title: `Idea - ${new Date().toLocaleDateString()}`,
      description: writingText,
      url: "",
      format: "text",
      dateCreated: new Date(),
      tags: ["idea"]
    };
    
    addContentToPillar(activeTab, newIdea);
    setWritingText("");
    toast.success("Saved as idea");
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
                      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-gray-100">
                        <ScrollArea className="h-full px-4 py-4 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
                          <Textarea
                            ref={textareaRef}
                            value={writingText}
                            onChange={(e) => setWritingText(e.target.value)}
                            placeholder="Start writing your ideas, thoughts, or notes here..."
                            className="min-h-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-base"
                          />
                        </ScrollArea>
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
                            <div className="grid gap-4">
                              <Button 
                                onClick={saveWritingAsIdea}
                                className="w-full"
                              >
                                Save as Idea
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
                    <div className="flex items-center gap-2">
                      <ContentUploader 
                        pillarId={activeTab} 
                        onContentAdded={addContentToPillar} 
                      />
                    </div>
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
      </div>
    </Layout>
  );
};

export default BankOfContent;
