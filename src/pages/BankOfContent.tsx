
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentUploader from "@/components/content/ContentUploader";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
};

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Education", content: [] },
    { id: "2", name: "Inspiration", content: [] },
    { id: "3", name: "Entertainment", content: [] },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Function to add a new content pillar
  const addPillar = () => {
    const newId = `${Date.now()}`;
    setPillars([...pillars, { id: newId, name: "New Pillar", content: [] }]);
    setActiveTab(newId);
    toast.success("New pillar added");
  };

  // Function to rename a pillar
  const renamePillar = (id: string, newName: string) => {
    setPillars(pillars.map(p => p.id === id ? {...p, name: newName} : p));
  };

  // Function to delete a pillar
  const deletePillar = (id: string) => {
    const newPillars = pillars.filter(p => p.id !== id);
    
    if (newPillars.length === 0) {
      toast.error("Cannot delete the last pillar");
      return;
    }
    
    setPillars(newPillars);
    
    // If the active tab is the one being deleted, switch to another tab
    if (activeTab === id) {
      setActiveTab(newPillars[0].id);
    }
    
    toast.success("Pillar deleted");
  };

  // Function to add content to a pillar
  const addContentToPillar = (pillarId: string, content: ContentItem) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: [...p.content, content]} 
        : p
    ));
    toast.success(`Content added to ${pillars.find(p => p.id === pillarId)?.name}`);
  };

  // Function to delete content from a pillar
  const deleteContent = (pillarId: string, contentId: string) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: p.content.filter(c => c.id !== contentId)} 
        : p
    ));
    toast.success("Content deleted");
  };

  // Function to move content to another pillar
  const moveContent = (fromPillarId: string, toPillarId: string, contentId: string) => {
    // Find the content item to move
    const sourcePillar = pillars.find(p => p.id === fromPillarId);
    const contentToMove = sourcePillar?.content.find(c => c.id === contentId);
    
    if (!contentToMove) return;
    
    // Remove from source pillar and add to target pillar
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

  // Filter content based on search query
  const filteredContent = pillars.map(pillar => ({
    ...pillar,
    content: pillar.content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }));

  // Find all content across all pillars
  const allContent = pillars.flatMap(pillar => pillar.content);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bank of Content</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
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
              <ContentPillar
                pillar={pillar}
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

        {/* Search modal */}
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
