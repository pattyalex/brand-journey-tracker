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

  useEffect(() => {
    try {
      const savedPillarsData = localStorage.getItem('pillars');
      
      if (savedPillarsData) {
        const savedPillars = JSON.parse(savedPillarsData);
        setPillars(current => 
          current.map(pillar => {
            const savedPillar = savedPillars.find((p: {id: string}) => p.id === pillar.id);
            return savedPillar ? {...pillar, name: savedPillar.name} : pillar;
          })
        );
      }
    } catch (error) {
      console.error("Failed to load pillar names:", error);
    }
    
    const loadedPillars = pillars.map(pillar => {
      try {
        const savedContent = localStorage.getItem(`pillar-content-${pillar.id}`);
        if (savedContent) {
          console.log(`Loading content for pillar ${pillar.id} (${pillar.name}):`, savedContent);
          const parsedContent = JSON.parse(savedContent);
          
          const contentWithDates = parsedContent.map((item: any) => ({
            ...item,
            dateCreated: item.dateCreated ? new Date(item.dateCreated) : new Date(),
            tags: Array.isArray(item.tags) ? item.tags : [],
            platforms: item.platforms ? 
              (Array.isArray(item.platforms) ? item.platforms : []) : 
              []
          }));
          
          return {
            ...pillar,
            content: contentWithDates
          };
        }
        return pillar;
      } catch (error) {
        console.error(`Failed to load content for pillar ${pillar.id}:`, error);
        return pillar;
      }
    });
    
    console.log("Loaded pillars with content:", loadedPillars);
    setPillars(loadedPillars);
  }, []);

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

  const addPillar = () => {
    const newId = `${Date.now()}`;
    const newPillars = [...pillars, { id: newId, name: "New Pillar", content: [], writingSpace: "" }];
    setPillars(newPillars);
    setActiveTab(newId);
    
    try {
      localStorage.setItem('pillars', JSON.stringify(newPillars.map(p => ({
        id: p.id,
        name: p.name
      }))));
    } catch (error) {
      console.error("Failed to save pillars to localStorage:", error);
    }
    
    toast.success("New pillar added");
  };

  const renamePillar = (id: string, newName: string) => {
    const updatedPillars = pillars.map(p => p.id === id ? {...p, name: newName} : p);
    setPillars(updatedPillars);
    
    try {
      localStorage.setItem('pillars', JSON.stringify(updatedPillars.map(p => ({
        id: p.id,
        name: p.name
      }))));
    } catch (error) {
      console.error("Failed to save renamed pillar to localStorage:", error);
    }
    
    toast.success(`Pillar renamed to "${newName}"`);
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
    
    try {
      localStorage.setItem('pillars', JSON.stringify(newPillars.map(p => ({
        id: p.id,
        name: p.name
      }))));
      
      localStorage.removeItem(`pillar-content-${id}`);
      localStorage.removeItem(`writing-${id}`);
    } catch (error) {
      console.error("Failed to update localStorage after pillar deletion:", error);
    }
    
    toast.success("Pillar deleted");
  };

  const updateWritingSpace = (text: string) => {
    setWritingText(text);
  };

  const addPlatform = () => {
    if (currentPlatform.trim() && !selectedPlatforms.includes(currentPlatform.trim())) {
      setSelectedPlatforms([...selectedPlatforms, currentPlatform.trim()]);
      setCurrentPlatform("");
    }
  };

  const removePlatform = (platformToRemove: string) => {
    setSelectedPlatforms(selectedPlatforms.filter(platform => platform !== platformToRemove));
  };

  const addTag = () => {
    if (currentTag.trim() && !newIdeaTags.includes(currentTag.trim())) {
      setNewIdeaTags([...newIdeaTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewIdeaTags(newIdeaTags.filter(tag => tag !== tagToRemove));
  };

  const handleTextSelection = (selectedContent: string) => {
    setSelectedText(selectedContent);
  };

  const saveWritingAsIdea = () => {
    if (!writingText.trim()) {
      toast.error("Please write something first");
      return;
    }
    
    setSelectedText(writingText);
    setDevelopScriptText(writingText);
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    setDevelopIdeaMode(true);
    setShowNewIdeaDialog(true);
  };

  const saveSelectedTextAsIdea = () => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }
    
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    setShowNewIdeaDialog(true);
  };

  const developSelectedIdea = () => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }
    
    setNewIdeaTitle("");
    setDevelopScriptText(selectedText);
    setNewIdeaTags([]);
    setDevelopIdeaMode(true);
    setShowNewIdeaDialog(true);
  };

  const handleFormatText = (formatType: string, formatValue?: string) => {
    if (!textareaRef.current) {
      let newText = writingText;
      const selectionStart = 0;
      const selectionEnd = writingText.length;
      const selectedText = writingText;
      
      switch (formatType) {
        case 'bold':
          newText = `**${selectedText}**`;
          break;
        case 'italic':
          newText = `_${selectedText}_`;
          break;
        case 'underline':
          newText = `<u>${selectedText}</u>`;
          break;
        case 'bullet':
          newText = `• ${selectedText}`;
          break;
        case 'numbered':
          newText = `1. ${selectedText}`;
          break;
        case 'align':
          if (formatValue) {
            newText = `<div style="text-align: ${formatValue};">${selectedText}</div>`;
          }
          break;
        case 'size':
          if (formatValue) {
            newText = `<span style="font-size: ${formatValue};">${selectedText}</span>`;
          }
          break;
        default:
          return;
      }
      
      setWritingText(newText);
      return;
    }

    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectionStart === selectionEnd && formatType !== 'bullet' && formatType !== 'numbered') {
      toast.info("Select some text first to apply formatting");
      return;
    }
    
    let newText;
    let newCursorPos;
    
    switch (formatType) {
      case 'bold':
        newText = value.substring(0, selectionStart) + "**" + selectedText + "**" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4;
        break;
      case 'italic':
        newText = value.substring(0, selectionStart) + "_" + selectedText + "_" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2;
        break;
      case 'underline':
        newText = value.substring(0, selectionStart) + "<u>" + selectedText + "</u>" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 7;
        break;
      case 'bullet':
        if (selectionStart === selectionEnd) {
          newText = value.substring(0, selectionStart) + "• " + value.substring(selectionEnd);
          newCursorPos = selectionStart + 2;
        } else {
          newText = value.substring(0, selectionStart) + "• " + selectedText + value.substring(selectionEnd);
          newCursorPos = selectionEnd + 2;
        }
        break;
      case 'numbered':
        if (selectionStart === selectionEnd) {
          newText = value.substring(0, selectionStart) + "1. " + value.substring(selectionEnd);
          newCursorPos = selectionStart + 3;
        } else {
          newText = value.substring(0, selectionStart) + "1. " + selectedText + value.substring(selectionEnd);
          newCursorPos = selectionEnd + 3;
        }
        break;
      case 'align':
        if (formatValue) {
          newText = value.substring(0, selectionStart) + 
                    `<div style="text-align: ${formatValue};">${selectedText}</div>` + 
                    value.substring(selectionEnd);
          newCursorPos = selectionEnd + 30 + formatValue.length;
        } else {
          return;
        }
        break;
      case 'size':
        if (formatValue) {
          newText = value.substring(0, selectionStart) + 
                    `<span style="font-size: ${formatValue};">${selectedText}</span>` + 
                    value.substring(selectionEnd);
          newCursorPos = selectionEnd + 30 + formatValue.length;
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    setWritingText(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const createNewIdeaFromSelection = () => {
    if (!newIdeaTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    
    const scriptContent = developScriptText.trim() || selectedText;
    
    if (!scriptContent) {
      toast.error("Script content is required");
      return;
    }
    
    const newIdea: ContentItem = {
      id: `${Date.now()}`,
      title: newIdeaTitle,
      description: scriptContent.slice(0, 100) + (scriptContent.length > 100 ? "..." : ""),
      url: JSON.stringify({
        script: scriptContent,
        shootDetails: shootDetails,
        caption: captionText,
        platforms: selectedPlatforms
      }),
      format: selectedFormat,
      dateCreated: new Date(),
      tags: newIdeaTags,
      platforms: selectedPlatforms,
      scheduledDate: scheduledDate,
    };
    
    addContentToPillar(activeTab, newIdea);
    
    if (scheduledDate) {
      try {
        const existingScheduledContents = localStorage.getItem('scheduledContents');
        let scheduledContents: any[] = [];
        
        if (existingScheduledContents) {
          scheduledContents = JSON.parse(existingScheduledContents);
        }
        
        scheduledContents.push({
          ...newIdea,
          dateCreated: newIdea.dateCreated.toISOString(),
          scheduledDate: scheduledDate.toISOString(),
          pillarId: activeTab,
          pillarName: pillars.find(p => p.id === activeTab)?.name || "Unknown"
        });
        
        localStorage.setItem('scheduledContents', JSON.stringify(scheduledContents));
        toast.success(`Scheduled for ${scheduledDate.toLocaleDateString()}`);
      } catch (error) {
        console.error("Error saving scheduled content:", error);
      }
    }
    
    setShowNewIdeaDialog(false);
    setSelectedText("");
    setDevelopScriptText("");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setCurrentPlatform("");
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    setScheduledDate(undefined);
    toast.success("Idea saved successfully");
  };

  const addContentToPillar = (pillarId: string, content: ContentItem) => {
    console.log(`Adding content to pillar ${pillarId}:`, content);
    
    const updatedPillars = pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: [...p.content, content]} 
        : p
    );
    
    setPillars(updatedPillars);
    
    try {
      const pillarContent = updatedPillars.find(p => p.id === pillarId)?.content || [];
      const serializableContent = pillarContent.map(item => ({
        ...item,
        dateCreated: item.dateCreated.toISOString()
      }));
      localStorage.setItem(`pillar-content-${pillarId}`, JSON.stringify(serializableContent));
      console.log(`Saved content for pillar ${pillarId}:`, serializableContent);
    } catch (error) {
      console.error("Failed to save content to localStorage:", error);
    }
    
    toast.success(`Content added to ${pillars.find(p => p.id === pillarId)?.name}`);
  };

  const deleteContent = (pillarId: string, contentId: string) => {
    console.log(`Deleting content ${contentId} from pillar ${pillarId}`);
    
    const updatedPillars = pillars.map(p => 
      p.id === pillarId 
        ? {...p, content: p.content.filter(c => c.id !== contentId)} 
        : p
    );
    
    setPillars(updatedPillars);
    
    try {
      const updatedPillar = updatedPillars.find(p => p.id === pillarId);
      if (updatedPillar) {
        const serializableContent = updatedPillar.content.map(item => ({
          ...item,
          dateCreated: item.dateCreated.toISOString()
        }));
        localStorage.setItem(`pillar-content-${pillarId}`, JSON.stringify(serializableContent));
        console.log(`Updated localStorage after deletion for pillar ${pillarId}:`, serializableContent);
      }
    } catch (error) {
      console.error("Failed to update localStorage after deletion:", error);
    }
    
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

  const editContent = (pillarId: string, contentId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return;
    
    const content = pillar.content.find(c => c.id === contentId);
    if (!content) return;
    
    setEditingContent(content);
    setIsEditing(true);
  };
  
  const updateContent = (pillarId: string, updatedContent: ContentItem) => {
    const updatedPillars = pillars.map(p => 
      p.id === pillarId 
        ? {
            ...p, 
            content: p.content.map(c => 
              c.id === updatedContent.id ? updatedContent : c
            )
          } 
        : p
    );
    
    setPillars(updatedPillars);
    
    try {
      const pillarContent = updatedPillars.find(p => p.id === pillarId)?.content || [];
      const serializableContent = pillarContent.map(item => ({
        ...item,
        dateCreated: item.dateCreated.toISOString()
      }));
      localStorage.setItem(`pillar-content-${pillarId}`, JSON.stringify(serializableContent));
    } catch (error) {
      console.error("Failed to save updated content to localStorage:", error);
    }
    
    setEditingContent(null);
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  const cancelEditing = () => {
    setEditingContent(null);
    setIsEditing(false);
  };

  const handleReorderContent = (pillarId: string, newItems: ContentItem[]) => {
    console.log(`Reordering content for pillar ${pillarId}:`, newItems);
    
    setPillars(prev => 
      prev.map(p => 
        p.id === pillarId 
          ? {...p, content: newItems} 
          : p
      )
    );
    
    try {
      const serializableContent = newItems.map(item => ({
        ...item,
        dateCreated: item.dateCreated instanceof Date 
          ? item.dateCreated.toISOString() 
          : item.dateCreated
      }));
      localStorage.setItem(`pillar-content-${pillarId}`, JSON.stringify(serializableContent));
      console.log(`Saved reordered content for pillar ${pillarId}:`, serializableContent);
    } catch (error) {
      console.error("Failed to save reordered content to localStorage:", error);
    }
  };

  const openNewIdeaDialog = () => {
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    setSelectedText("");
    setDevelopScriptText("");
    setShootDetails("");
    setSelectedFormat("text");
    setShowNewIdeaDialog(true);
    setScheduledDate(undefined);
  };

  const activePillar = pillars.find(p => p.id === activeTab);
  const allContent = pillars.flatMap(pillar => pillar.content);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Idea Development</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <PillarTabs 
            pillars={pillars}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddPillar={addPillar}
            onRenamePillar={renamePillar}
            onDeletePillar={deletePillar}
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
          }}
          isEditMode={developIdeaMode}
          dialogTitle={developIdeaMode ? "Develop Selected Idea" : "Create New Idea"}
        />
      </div>
    </Layout>
  );
};

export default BankOfContent;
