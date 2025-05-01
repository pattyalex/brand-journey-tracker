import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import PillarTabs from "@/components/content/PillarTabs";
import WritingSpace from "@/components/content/WritingSpace";
import IdeaSection from "@/components/content/IdeaSection";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";
import ContentTypeBuckets from "@/components/content/ContentTypeBuckets";
import { getRestoredIdeas } from "@/utils/contentRestoreUtils";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
  writingSpace?: string;
  onUpdateWritingSpace?: (pillarId: string, text: string) => void;
};

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [], writingSpace: "" },
    { id: "2", name: "Pillar 2", content: [], writingSpace: "" },
    { id: "3", name: "Pillar 3", content: [], writingSpace: "" },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [writingText, setWritingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedText, setSelectedText] = useState("");
  const [developScriptText, setDevelopScriptText] = useState("");
  const [visualNotes, setVisualNotes] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("text");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [developIdeaMode, setDevelopIdeaMode] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newBucketType, setNewBucketType] = useState("");
  const [selectedBucketId, setSelectedBucketId] = useState("");

  const allContent = pillars.flatMap(pillar => pillar.content);

  useEffect(() => {
    const restoredIdeas = getRestoredIdeas();
    
    if (restoredIdeas.length > 0) {
      const updatedPillars = [...pillars];
      
      const itemsByPillar: Record<string, ContentItem[]> = {};
      let totalRestored = 0;
      let lastRestoredItem: ContentItem | null = null;
      
      restoredIdeas.forEach(item => {
        const pillarId = item.originalPillarId || "1";
        if (!itemsByPillar[pillarId]) {
          itemsByPillar[pillarId] = [];
        }
        itemsByPillar[pillarId].push(item);
        totalRestored++;
        lastRestoredItem = item;
      });
      
      Object.entries(itemsByPillar).forEach(([pillarId, items]) => {
        const pillarIndex = updatedPillars.findIndex(p => p.id === pillarId);
        if (pillarIndex >= 0) {
          updatedPillars[pillarIndex] = {
            ...updatedPillars[pillarIndex],
            content: [...updatedPillars[pillarIndex].content, ...items]
          };
          console.log(`Restored ${items.length} items to Pillar ${pillarId}`);
        } else {
          updatedPillars[0] = {
            ...updatedPillars[0],
            content: [...updatedPillars[0].content, ...items]
          };
          console.log(`Pillar ${pillarId} not found, restored ${items.length} items to Pillar 1 instead`);
        }
      });
      
      setPillars(updatedPillars);
      
      if (totalRestored === 1 && lastRestoredItem) {
        const targetPillar = lastRestoredItem.originalPillarId ? 
          pillars.find(p => p.id === lastRestoredItem!.originalPillarId)?.name || "Pillar 1" : 
          "Pillar 1";
          
        toast.success(
          `"${lastRestoredItem.title}" has been restored to ${targetPillar}`,
          {
            duration: 5000,
            description: "This item was moved from Content Calendar"
          }
        );
      } else if (totalRestored > 1) {
        toast.success(
          `${totalRestored} items restored to their original pillars`,
          {
            duration: 5000,
            description: "These items were moved from Content Calendar"
          }
        );
      }
      
      console.log("Content items restored to Idea Development:", restoredIdeas);
    }
  }, []);

  const addPillar = () => {
    const newPillarId = String(pillars.length + 1);
    const newPillar: Pillar = {
      id: newPillarId,
      name: `Pillar ${newPillarId}`,
      content: [],
      writingSpace: "",
    };
    setPillars([...pillars, newPillar]);
    setActiveTab(newPillarId);
  };

  const renamePillar = (pillarId: string, newName: string) => {
    setPillars(pillars.map(pillar => 
      pillar.id === pillarId ? { ...pillar, name: newName } : pillar
    ));
  };

  const deletePillar = (pillarId: string) => {
    if (pillars.length <= 1) {
      toast.error("Cannot delete the last pillar");
      return;
    }
    
    setPillars(pillars.filter(pillar => pillar.id !== pillarId));
    
    if (activeTab === pillarId) {
      setActiveTab(pillars[0].id === pillarId ? pillars[1].id : pillars[0].id);
    }
  };

  const updateWritingSpace = (text: string) => {
    setWritingText(text);
    setPillars(pillars.map(pillar => 
      pillar.id === activeTab ? { ...pillar, writingSpace: text } : pillar
    ));
  };

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
  };

  const handleFormatText = (formatType: string, formatValue?: string) => {
    console.log(`Format text: ${formatType}, value: ${formatValue}`);
  };

  const openNewIdeaDialog = () => {
    setShowNewIdeaDialog(true);
    setDevelopIdeaMode(false);
    setNewIdeaTitle("");
    setDevelopScriptText("");
    setVisualNotes("");
    setSelectedFormat("text");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setNewIdeaTags([]);
    setNewBucketType("");
  };

  const handleAddToBucket = (formatType: string) => {
    setNewBucketType(formatType);
    setSelectedBucketId(formatType);
    openNewIdeaDialog();
  };

  const deleteContent = (pillarId: string, contentId: string) => {
    setPillars(pillars.map(pillar => 
      pillar.id === pillarId 
        ? { ...pillar, content: pillar.content.filter(item => item.id !== contentId) } 
        : pillar
    ));
    toast.success("Content deleted successfully");
  };

  const moveContent = (fromPillarId: string, toPillarId: string, contentId: string) => {
    const sourcePillar = pillars.find(p => p.id === fromPillarId);
    if (!sourcePillar) return;
    
    const contentItem = sourcePillar.content.find(item => item.id === contentId);
    if (!contentItem) return;
    
    setPillars(pillars.map(pillar => {
      if (pillar.id === fromPillarId) {
        return {
          ...pillar,
          content: pillar.content.filter(item => item.id !== contentId)
        };
      } else if (pillar.id === toPillarId) {
        return {
          ...pillar,
          content: [...pillar.content, contentItem]
        };
      }
      return pillar;
    }));
    
    toast.success(`Moved to ${pillars.find(p => p.id === toPillarId)?.name}`);
  };

  const editContent = (pillarId: string, contentId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return;
    
    const content = pillar.content.find(item => item.id === contentId);
    if (!content) return;
    
    setEditingContent(content);
    setIsEditing(true);
  };

  const updateContent = (pillarId: string, updatedContent: ContentItem) => {
    setPillars(pillars.map(pillar => 
      pillar.id === pillarId 
        ? { 
            ...pillar, 
            content: pillar.content.map(item => 
              item.id === updatedContent.id ? updatedContent : item
            ) 
          } 
        : pillar
    ));
    setIsEditing(false);
    setEditingContent(null);
    toast.success("Content updated successfully");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingContent(null);
  };

  const handleReorderContent = (pillarId: string, reorderedItems: ContentItem[]) => {
    setPillars(pillars.map(pillar => 
      pillar.id === pillarId 
        ? { ...pillar, content: reorderedItems } 
        : pillar
    ));
  };

  const addContentToPillar = (pillarId: string, content: ContentItem) => {
    setPillars(pillars.map(pillar => 
      pillar.id === pillarId 
        ? { ...pillar, content: [...pillar.content, content] } 
        : pillar
    ));
    toast.success("New idea added successfully");
  };

  const addPlatform = () => {
    if (currentPlatform && !selectedPlatforms.includes(currentPlatform)) {
      setSelectedPlatforms([...selectedPlatforms, currentPlatform]);
      setCurrentPlatform("");
    }
  };

  const removePlatform = (platform: string) => {
    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
  };

  const addTag = () => {
    if (currentTag && !newIdeaTags.includes(currentTag)) {
      setNewIdeaTags([...newIdeaTags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setNewIdeaTags(newIdeaTags.filter(t => t !== tag));
  };

  const createNewIdeaFromSelection = () => {
    if (!newIdeaTitle.trim()) {
      toast.error("Please enter a title for your idea");
      return;
    }

    const newContent: ContentItem = {
      id: `content-${Date.now()}`,
      title: newIdeaTitle,
      description: developScriptText || selectedText,
      format: selectedFormat,
      url: JSON.stringify({
        script: developScriptText || selectedText,
        visualNotes: visualNotes,
        shootDetails: shootDetails,
        caption: captionText,
        platforms: selectedPlatforms,
        bucketId: selectedBucketId
      }),
      dateCreated: new Date(),
      tags: newIdeaTags,
      platforms: selectedPlatforms,
      status: newBucketType || "draft",
      bucketId: selectedBucketId,
    };

    addContentToPillar(activeTab, newContent);

    setNewIdeaTitle("");
    setDevelopScriptText("");
    setSelectedText("");
    setVisualNotes("");
    setSelectedFormat("text");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setCurrentPlatform("");
    setNewIdeaTags([]);
    setCurrentTag("");
    setShowNewIdeaDialog(false);
    setDevelopIdeaMode(false);
    setNewBucketType("");
    setSelectedBucketId("");
  };

  const handleBucketChange = (bucketId: string) => {
    setSelectedBucketId(bucketId);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <h1 className="text-3xl font-bold">Idea Development</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <PillarTabs 
              pillars={pillars}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAddPillar={addPillar}
              onRenamePillar={renamePillar}
              onDeletePillar={deletePillar}
            />
          </div>
          <ContentTypeBuckets 
            onAddIdea={handleAddToBucket} 
            pillarId={activeTab}
          />
          {pillars.map((pillar) => (
            <TabsContent key={pillar.id} value={pillar.id} className={`space-y-4 pillar-theme pillar-${pillar.id}-theme`}>
              <div className="relative pb-1 mb-3">
                <h2 className="text-2xl font-bold pillar-header">{pillar.name}</h2>
                <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'var(--pillar-gradient)' }}></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-b from-[var(--pillar-light)] to-white p-4 rounded-lg border border-1 shadow-sm" style={{ borderColor: 'var(--pillar-color)', borderOpacity: 0.2 }}>
                <WritingSpace 
                  value={writingText}
                  onChange={updateWritingSpace}
                />
                <IdeaSection 
                  pillar={pillar}
                  pillars={pillars}
                  searchQuery={searchQuery}
                  onNewIdeaClick={openNewIdeaDialog}
                  onDeleteContent={(contentId) => deleteContent(pillar.id, contentId)}
                  onMoveContent={(toPillarId, contentId) => moveContent(pillar.id, toPillarId, contentId)}
                  onEditContent={(contentId) => editContent(pillar.id, contentId)}
                  onReorderContent={(newItems) => handleReorderContent(pillar.id, newItems)}
                  editingContent={editingContent}
                  isEditing={isEditing}
                  onContentUpdated={updateContent}
                  onCancelEdit={cancelEditing}
                  onContentAdded={addContentToPillar}
                  onAddToBucket={handleAddToBucket}
                />
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
        <IdeaCreationDialog
          open={showNewIdeaDialog}
          onOpenChange={setShowNewIdeaDialog}
          title={newIdeaTitle}
          onTitleChange={setNewIdeaTitle}
          bucketId={selectedBucketId}
          onBucketChange={handleBucketChange}
          pillarId={activeTab}
          scriptText={developScriptText || selectedText}
          onScriptTextChange={setDevelopScriptText}
          visualNotes={visualNotes}
          onVisualNotesChange={setVisualNotes}
          format={selectedFormat}
          onFormatChange={setSelectedFormat}
          shootDetails={shootDetails}
          onShootDetailsChange={setShootDetails}
          captionText={captionText}
          onCaptionTextChange={setCaptionText}
          platforms={selectedPlatforms}
          currentPlatform={currentPlatform}
          onCurrentPlatformChange={setCurrentPlatform}
          onAddPlatform={addPlatform}
          onRemovePlatform={removePlatform}
          tags={newIdeaTags}
          currentTag={currentTag}
          onCurrentTagChange={setCurrentTag}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onSave={createNewIdeaFromSelection}
          onCancel={() => {
            setShowNewIdeaDialog(false);
            setDevelopIdeaMode(false);
            setNewBucketType("");
            setSelectedBucketId("");
          }}
          isEditMode={developIdeaMode}
          dialogTitle={developIdeaMode ? "Develop Selected Idea" : (newBucketType ? 
            `Add to ${newBucketType.charAt(0).toUpperCase() + newBucketType.slice(1)} Format` : 
            "Create New Idea")}
          inspirationText=""
          onInspirationTextChange={() => {}}
          inspirationLinks={[]}
          onAddInspirationLink={() => {}}
          onRemoveInspirationLink={() => {}}
          inspirationImages={[]}
          onAddInspirationImage={() => {}}
          onRemoveInspirationImage={() => {}}
        />
      </div>
    </Layout>
  );
};

export default BankOfContent;
