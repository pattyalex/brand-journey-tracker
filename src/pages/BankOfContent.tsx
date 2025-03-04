
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { Plus, Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ContentUploader from "@/components/content/ContentUploader";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
  brainDump?: string;
  onUpdateBrainDump?: (pillarId: string, text: string) => void;
};

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Education", content: [], brainDump: "" },
    { id: "2", name: "Inspiration", content: [], brainDump: "" },
    { id: "3", name: "Entertainment", content: [], brainDump: "" },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState("");
  
  const addPillar = () => {
    const newId = `${Date.now()}`;
    setPillars([...pillars, { id: newId, name: "New Pillar", content: [], brainDump: "" }]);
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

  const updateBrainDump = (pillarId: string, text: string) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, brainDump: text} 
        : p
    ));
  };

  const saveBrainDump = () => {
    const activePillar = pillars.find(p => p.id === activeTab);
    if (activePillar) {
      updateBrainDump(activeTab, brainDumpText);
      toast.success("Thoughts saved to current pillar!");
    }
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

  // Find the active pillar to get its brain dump
  const activePillar = pillars.find(p => p.id === activeTab);
  
  // Set brain dump text when changing tabs
  useState(() => {
    if (activePillar) {
      setBrainDumpText(activePillar.brainDump || "");
    }
  });

  return (
    <Layout>
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full h-[calc(100vh-64px)]">
          {/* Writing Space (Left Sidebar) */}
          <Sidebar variant="inset" side="left">
            <SidebarHeader className="p-4 border-b">
              <h2 className="text-lg font-semibold">Writing Space</h2>
              <p className="text-sm text-muted-foreground">
                Capture your thoughts and ideas
              </p>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <div className="flex flex-col h-full">
                <Textarea
                  value={brainDumpText}
                  onChange={(e) => setBrainDumpText(e.target.value)}
                  placeholder="Start writing your ideas here... This is your space to brainstorm freely."
                  className="min-h-[300px] resize-none flex-grow mb-4"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Saving to: {activePillar?.name}
                  </p>
                  <Button onClick={saveBrainDump} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Content Management (Main Area) */}
          <SidebarInset className="fade-in">
            <div className="container mx-auto py-6 space-y-6">
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
                  <ContentUploader 
                    pillarId={activeTab} 
                    onContentAdded={addContentToPillar} 
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                const pillar = pillars.find(p => p.id === value);
                if (pillar) {
                  setBrainDumpText(pillar.brainDump || "");
                }
              }} className="w-full">
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
                    <ContentPillar
                      pillar={{...pillar, onUpdateBrainDump: updateBrainDump}}
                      pillars={pillars}
                      onRename={(newName) => renamePillar(pillar.id, newName)}
                      onDelete={() => deletePillar(pillar.id)}
                      onDeleteContent={(contentId) => deleteContent(pillar.id, contentId)}
                      onMoveContent={(toPillarId, contentId) => moveContent(pillar.id, toPillarId, contentId)}
                      searchQuery={searchQuery}
                    />
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default BankOfContent;
