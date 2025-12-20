import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import PillarTabs, { getPillarColor } from "@/components/content/PillarTabs";
import WritingSpace from "@/components/content/WritingSpace";
import IdeaSection from "@/components/content/IdeaSection";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";
import ContentTypeBuckets from "@/components/content/ContentTypeBuckets";
import { getRestoredIdeas } from "@/utils/contentRestoreUtils";
import { useUser } from "@clerk/clerk-react";
import {
  getUserContentPillars,
  getPillarContentItems,
  createContentPillar,
  updateContentPillar,
  deleteContentPillar as deleteContentPillarDb,
  createContentItem,
  updateContentItem,
  deleteContentItem as deleteContentItemDb,
  moveContentItem,
} from "@/services/contentService";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
  writingSpace?: string;
  onUpdateWritingSpace?: (pillarId: string, text: string) => void;
};

const BankOfContent = () => {
  const { user } = useUser();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
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

  // Load pillars and content from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('📥 Loading pillars and content from Supabase for user:', user.id);

        // Load pillars
        const dbPillars = await getUserContentPillars(user.id);

        // If no pillars exist, create default ones
        if (dbPillars.length === 0) {
          console.log('No pillars found, creating defaults...');
          const pillar1 = await createContentPillar(user.id, { name: 'Pillar 1', position: 0 });
          const pillar2 = await createContentPillar(user.id, { name: 'Pillar 2', position: 1 });
          const pillar3 = await createContentPillar(user.id, { name: 'Pillar 3', position: 2 });
          dbPillars.push(pillar1, pillar2, pillar3);
        }

        // Load content for each pillar
        const pillarsWithContent = await Promise.all(
          dbPillars.map(async (dbPillar) => {
            const content = await getPillarContentItems(user.id, dbPillar.id);
            return {
              id: dbPillar.id,
              name: dbPillar.name,
              content: content,
              writingSpace: dbPillar.writing_space || "",
            };
          })
        );

        setPillars(pillarsWithContent);
        if (pillarsWithContent.length > 0 && !activeTab) {
          setActiveTab(pillarsWithContent[0].id);
        }

        console.log('✅ Loaded', pillarsWithContent.length, 'pillars from database');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        toast.error('Failed to load your content');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

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
      
      console.log("Content items restored to Pillars:", restoredIdeas);
    }
  }, []);

  const addPillar = async () => {
    if (!user?.id) return;

    try {
      const newPillar = await createContentPillar(user.id, {
        name: `Pillar ${pillars.length + 1}`,
        position: pillars.length,
      });

      const pillarWithContent: Pillar = {
        id: newPillar.id,
        name: newPillar.name,
        content: [],
        writingSpace: "",
      };

      setPillars([...pillars, pillarWithContent]);
      setActiveTab(newPillar.id);
      toast.success('New pillar created');
    } catch (error) {
      console.error('Error creating pillar:', error);
      toast.error('Failed to create pillar');
    }
  };

  const renamePillar = async (pillarId: string, newName: string) => {
    try {
      await updateContentPillar(pillarId, { name: newName });
      setPillars(pillars.map(pillar =>
        pillar.id === pillarId ? { ...pillar, name: newName } : pillar
      ));
      toast.success('Pillar renamed');
    } catch (error) {
      console.error('Error renaming pillar:', error);
      toast.error('Failed to rename pillar');
    }
  };

  const deletePillar = async (pillarId: string) => {
    if (pillars.length <= 1) {
      toast.error("Cannot delete the last pillar");
      return;
    }

    try {
      await deleteContentPillarDb(pillarId);
      setPillars(pillars.filter(pillar => pillar.id !== pillarId));

      if (activeTab === pillarId) {
        setActiveTab(pillars[0].id === pillarId ? pillars[1].id : pillars[0].id);
      }
      toast.success('Pillar deleted');
    } catch (error) {
      console.error('Error deleting pillar:', error);
      toast.error('Failed to delete pillar');
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

  const deleteContent = async (pillarId: string, contentId: string) => {
    try {
      await deleteContentItemDb(contentId);
      setPillars(pillars.map(pillar =>
        pillar.id === pillarId
          ? { ...pillar, content: pillar.content.filter(item => item.id !== contentId) }
          : pillar
      ));
      toast.success("Content deleted successfully");
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const moveContent = async (fromPillarId: string, toPillarId: string, contentId: string) => {
    const sourcePillar = pillars.find(p => p.id === fromPillarId);
    if (!sourcePillar) return;

    const contentItem = sourcePillar.content.find(item => item.id === contentId);
    if (!contentItem) return;

    try {
      await moveContentItem(contentId, toPillarId);

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
    } catch (error) {
      console.error('Error moving content:', error);
      toast.error('Failed to move content');
    }
  };

  const editContent = (pillarId: string, contentId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return;
    
    const content = pillar.content.find(item => item.id === contentId);
    if (!content) return;
    
    setEditingContent(content);
    setIsEditing(true);
  };

  const updateContent = async (pillarId: string, updatedContent: ContentItem) => {
    try {
      await updateContentItem(updatedContent.id, updatedContent);

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
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
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

  const addContentToPillar = async (pillarId: string, content: ContentItem) => {
    if (!user?.id) return;

    try {
      // Save to database (remove id since it will be generated by database)
      const { id, ...contentWithoutId } = content;
      const savedContent = await createContentItem(user.id, pillarId, contentWithoutId);

      // Update local state with database-generated content
      setPillars(pillars.map(pillar =>
        pillar.id === pillarId
          ? { ...pillar, content: [...pillar.content, savedContent] }
          : pillar
      ));
      toast.success("New idea added successfully");
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to save content');
    }
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

  // Show loading state while fetching data
  if (loading) {
    return (
      <Layout>
        <div className="w-full max-w-[1600px] mx-auto px-8 py-6 space-y-6 fade-in">
          <h1 className="text-2xl font-bold">Pillars</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your content...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1800px] h-[calc(100vh-4rem)] mx-auto px-8 pt-2 pb-6 fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          {pillars.map((pillar, index) => {
            const color = getPillarColor(index);

            return (
              <TabsContent
                key={pillar.id}
                value={pillar.id}
                className="h-full"
              >
                {/* 2 COLUMNS - Left: Brain Dump card, Right: Pillars + Formats + Content Bank */}
                <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-8 h-full">

                  {/* LEFT COLUMN: Brain Dump CARD - beige */}
                  <div
                    className="rounded-xl p-4 overflow-y-auto shadow-sm flex flex-col"
                    style={{
                      backgroundColor: color.veryLight,
                      border: `1px solid ${color.light}`,
                    }}
                  >
                    <h2 className="text-lg font-bold mb-3" style={{ color: '#8B6B4E' }}>
                      Brain Dump
                    </h2>
                    <div className="flex-1">
                      <WritingSpace
                        value={writingText}
                        onChange={updateWritingSpace}
                      />
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Pillars + Formats + Content Bank stacked vertically */}
                  <div className="space-y-6 overflow-y-auto">
                    {/* Pillars */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: '#8B6B4E' }}>
                        Pillars
                      </h3>
                      <PillarTabs
                        pillars={pillars}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onAddPillar={addPillar}
                        onRenamePillar={renamePillar}
                        onDeletePillar={deletePillar}
                      />
                    </div>

                    {/* Formats */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: '#8B6B4E' }}>
                        Formats for {pillar.name}
                      </h3>
                      <ContentTypeBuckets
                        onAddIdea={handleAddToBucket}
                        pillarId={activeTab}
                        pillarName={pillars.find(p => p.id === activeTab)?.name || ''}
                        pillarIndex={pillars.findIndex(p => p.id === activeTab)}
                      />
                    </div>

                    {/* Content Bank CARD - white */}
                    <div className="rounded-xl p-6 bg-white border border-gray-300 shadow-sm">
                      <h2 className="text-lg font-semibold mb-5" style={{ color: '#8B6B4E' }}>
                        Content Bank
                      </h2>
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
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Modals */}
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
