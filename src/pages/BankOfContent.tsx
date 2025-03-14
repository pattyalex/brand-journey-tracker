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
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";

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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [newBucketType, setNewBucketType] = useState("");

  const allContent = pillars.flatMap(pillar => pillar.content);

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
    setSelectedFormat("text");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setNewIdeaTags([]);
    setScheduledDate(undefined);
    setNewBucketType("");
  };

  const handleAddToBucket = (bucketType: string) => {
    setNewBucketType(bucketType);
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
        shootDetails: shootDetails,
        caption: captionText,
        platforms: selectedPlatforms
      }),
      dateCreated: new Date(),
      tags: newIdeaTags,
      platforms: selectedPlatforms,
      scheduledDate: scheduledDate,
      status: newBucketType || "draft",
    };

    addContentToPillar(activeTab, newContent);

    setNewIdeaTitle("");
    setDevelopScriptText("");
    setSelectedText("");
    setSelectedFormat("text");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setCurrentPlatform("");
    setNewIdeaTags([]);
    setCurrentTag("");
    setScheduledDate(undefined);
    setShowNewIdeaDialog(false);
    setDevelopIdeaMode(false);
    setNewBucketType("");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Idea Development</h1>
          
          <Button 
            variant="default" 
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            onClick={openNewIdeaDialog}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add New Idea</span>
          </Button>
        </div>

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
            <TabsContent key={pillar.id} value={pillar.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WritingSpace 
                  writingText={writingText}
                  onTextChange={updateWritingSpace}
                  onTextSelection={handleTextSelection}
                  onFormatText={handleFormatText}
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
          scriptText={developScriptText || selectedText}
          onScriptTextChange={setDevelopScriptText}
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
          scheduledDate={scheduledDate}
          onScheduledDateChange={setScheduledDate}
          onSave={createNewIdeaFromSelection}
          onCancel={() => {
            setShowNewIdeaDialog(false);
            setDevelopIdeaMode(false);
            setScheduledDate(undefined);
            setNewBucketType("");
          }}
          isEditMode={developIdeaMode}
          dialogTitle={developIdeaMode ? "Develop Selected Idea" : (newBucketType ? 
            `Add to ${newBucketType.charAt(0).toUpperCase() + newBucketType.slice(1)} Bucket` : 
            "Create New Idea")}
        />
      </div>
    </Layout>
  );
};

export default BankOfContent;
