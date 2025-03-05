import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Search, Lightbulb, FileText, X, Tag, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentUploader from "@/components/content/ContentUploader";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getTagColorClasses } from "@/utils/tagColors";
import SimpleTextFormattingToolbar from "@/components/SimpleTextFormattingToolbar";
import { Edit, Trash2 } from "lucide-react";
import AlertDialog from "@/components/ui/alert-dialog";

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
  const [developScriptText, setDevelopScriptText] = useState("");
  const [formatText, setFormatText] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [developIdeaMode, setDevelopIdeaMode] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    pillars.forEach(pillar => {
      try {
        const savedContent = localStorage.getItem(`pillar-content-${pillar.id}`);
        if (savedContent) {
          const parsedContent = JSON.parse(savedContent);
          
          const contentWithDates = parsedContent.map((item: any) => ({
            ...item,
            dateCreated: new Date(item.dateCreated)
          }));
          
          setPillars(prev => 
            prev.map(p => 
              p.id === pillar.id 
                ? {...p, content: contentWithDates} 
                : p
            )
          );
        }
      } catch (error) {
        console.error(`Failed to load content for pillar ${pillar.id}:`, error);
      }
    });
  }, []);

  const handleTextSelection = (selectedContent: string) => {
    setSelectedText(selectedContent);
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
        format: formatText,
        shootDetails: shootDetails,
        caption: captionText,
        platforms: selectedPlatforms
      }),
      format: "text",
      dateCreated: new Date(),
      tags: newIdeaTags,
      platforms: selectedPlatforms,
    };
    
    addContentToPillar(activeTab, newIdea);
    setShowNewIdeaDialog(false);
    setSelectedText("");
    setDevelopScriptText("");
    setFormatText("");
    setShootDetails("");
    setCaptionText("");
    setSelectedPlatforms([]);
    setCurrentPlatform("");
    setNewIdeaTitle("");
    setNewIdeaTags([]);
    toast.success("Idea saved successfully");
  };

  const saveSelectedTextAsIdea = () => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }
    
    setNewIdeaTitle(`Idea - ${new Date().toLocaleDateString()}`);
    setNewIdeaTags([]);
    setShowNewIdeaDialog(true);
  };

  const developSelectedIdea = () => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }
    
    setNewIdeaTitle(`Development - ${new Date().toLocaleDateString()}`);
    setDevelopScriptText(selectedText);
    setNewIdeaTags([]);
    setDevelopIdeaMode(true);
    setShowNewIdeaDialog(true);
  };

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

  const updateWritingSpace = (pillarId: string, text: string) => {
    setPillars(pillars.map(p => 
      p.id === pillarId 
        ? {...p, writingSpace: text} 
        : p
    ));
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

  const handleAddTag = () => {
    if (currentTag.trim() && !newIdeaTags.includes(currentTag.trim())) {
      setNewIdeaTags([...newIdeaTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewIdeaTags(newIdeaTags.filter(tag => tag !== tagToRemove));
  };

  const saveWritingAsIdea = () => {
    if (!writingText.trim()) {
      toast.error("Please write something first");
      return;
    }
    
    setSelectedText(writingText);
    setDevelopScriptText(writingText);
    setNewIdeaTitle(`Idea - ${new Date().toLocaleDateString()}`);
    setNewIdeaTags([]);
    setDevelopIdeaMode(true);
    setShowNewIdeaDialog(true);
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

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(current => 
      current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
    );
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

  const handleFormatText = (formatType: string, formatValue?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
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
        newText = value.substring(0, selectionStart) + "• " + selectedText + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2;
        break;
      case 'numbered':
        newText = value.substring(0, selectionStart) + "1. " + selectedText + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 3;
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
      default:
        return;
    }
    
    setWritingText(newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

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
            <TabsList className="bg-background border flex-1 overflow-x-auto">
              {pillars.map((pillar) => (
                <div key={pillar.id} className="relative group flex items-center">
                  <TabsTrigger 
                    value={pillar.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {pillar.name}
                  </TabsTrigger>
                  <div className="hidden group-hover:flex absolute top-full left-0 z-50 bg-background border shadow-md rounded-md p-1 mt-1">
                    <Button variant="ghost" size="sm" onClick={() => {
                      const newName = window.prompt("Rename pillar", pillar.name);
                      if (newName && newName.trim()) {
                        renamePillar(pillar.id, newName.trim());
                      }
                    }}>
                      <Edit className="h-4 w-4 mr-1" />
                      Rename
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {pillar.name} Pillar</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{pillar.name}" pillar and all its content. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deletePillar(pillar.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </TabsList>
            <Button variant="outline" size="sm" onClick={addPillar} className="ml-2">
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
                      Brain Dump Of Ideas
                    </h2>
                  </div>
                  <div className="h-[calc(100vh-240px)]">
                    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] flex flex-col">
                      <SimpleTextFormattingToolbar onFormat={handleFormatText} />
                      
                      <ScrollArea className="h-full w-full flex-1">
                        <Textarea
                          ref={textareaRef}
                          value={writingText}
                          onChange={(e) => setWritingText(e.target.value)}
                          onTextSelect={handleTextSelection}
                          placeholder="Write your ideas here..."
                          className="min-h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-sm absolute inset-0 px-4 py-4"
                        />
                      </ScrollArea>
                      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gray-200 opacity-60"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" /> 
                      Develop Your Ideas
                    </h2>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <ContentUploader
                          pillarId={pillar.id}
                          onContentAdded={addContentToPillar}
                          onContentUpdated={updateContent}
                          contentToEdit={editingContent}
                          isEditMode={true}
                          onCancelEdit={cancelEditing}
                        />
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-[#8B6B4E] hover:bg-[#7A5C3F]"
                          onClick={() => {
                            setNewIdeaTitle(`Idea - ${new Date().toLocaleDateString()}`);
                            setNewIdeaTags([]);
                            setSelectedText("");
                            setDevelopScriptText("");
                            setShootDetails("");
                            setShowNewIdeaDialog(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Add New Idea
                        </Button>
                      )}
                    </div>
                  </div>
                  <ContentPillar
                    pillar={{...pillar}}
                    pillars={pillars}
                    onDeleteContent={(contentId) => deleteContent(pillar.id, contentId)}
                    onMoveContent={(toPillarId, contentId) => moveContent(pillar.id, toPillarId, contentId)}
                    onEditContent={(contentId) => editContent(pillar.id, contentId)}
                    searchQuery={searchQuery}
                    onReorderContent={(newItems) => handleReorderContent(pillar.id, newItems)}
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
          <DialogContent className="sm:max-w-[525px] max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>
                {developIdeaMode ? "Develop Selected Idea" : "Create New Idea"}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(85vh-140px)] pr-6">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="idea-title">Title</Label>
                  <Input
                    id="idea-title"
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    placeholder="Enter a catchy hook for your idea..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="develop-script">Script</Label>
                  <Textarea
                    id="develop-script"
                    value={developScriptText || selectedText}
                    onChange={(e) => setDevelopScriptText(e.target.value)}
                    placeholder="Write your script here..."
                    className="min-h-[100px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="format-text">Format</Label>
                  <Textarea
                    id="format-text"
                    value={formatText}
                    onChange={(e) => setFormatText(e.target.value)}
                    placeholder="Describe how you want to present your script (e.g., POV skit, educational, storytelling, aesthetic montage)..."
                    className="min-h-[80px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="shoot-details">Shoot Details</Label>
                  <Textarea
                    id="shoot-details"
                    value={shootDetails}
                    onChange={(e) => setShootDetails(e.target.value)}
                    placeholder="Enter details about the shoot, such as location, outfits, props needed..."
                    className="min-h-[80px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="caption-text">Caption</Label>
                  <Textarea
                    id="caption-text"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Draft a caption for your content when posting to social media platforms..."
                    className="min-h-[80px] resize-y"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="platforms">Platforms</Label>
                  <div className="flex gap-2">
                    <Input
                      id="platforms"
                      value={currentPlatform}
                      onChange={(e) => setCurrentPlatform(e.target.value)}
                      placeholder="Where do you want to post this content?"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPlatform())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addPlatform} variant="outline" size="icon" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedPlatforms.map((platform, index) => (
                      <span 
                        key={index} 
                        className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5"
                      >
                        {platform}
                        <button 
                          type="button" 
                          onClick={() => removePlatform(platform)}
                          className="text-primary hover:text-primary/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add tags (e.g., To Film, To Edit, To Post)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="icon" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newIdeaTags.map((tag, index) => (
                      <span 
                        key={index} 
                        className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 ${getTagColorClasses(tag)}`}
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => {
                setShowNewIdeaDialog(false);
                setDevelopIdeaMode(false);
              }}>
                Cancel
              </Button>
              <Button onClick={developIdeaMode ? createNewIdeaFromSelection : createNewIdeaFromSelection}
                className={developIdeaMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                Save Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BankOfContent;
