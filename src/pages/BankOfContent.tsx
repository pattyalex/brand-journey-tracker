import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentPillar from "@/components/content/ContentPillar";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Plus, 
  Search, 
  Lightbulb, 
  FileText, 
  Save, 
  ClipboardCopy, 
  Tag, 
  X, 
  Sparkles, 
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  SquareCode,
  Quote,
  Strikethrough
} from "lucide-react";
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
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
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

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let newText;
      let newCursorPos;
      
      if (format === 'bold') {
        newText = value.substring(0, selectionStart) + "**" + selectedText + "**" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4; // 4 for the two asterisks at start and end
      } else if (format === 'italic') {
        newText = value.substring(0, selectionStart) + "_" + selectedText + "_" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2; // 2 for the underscores at start and end
      } else if (format === 'underline') {
        newText = value.substring(0, selectionStart) + "<u>" + selectedText + "</u>" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 7; // 7 for the <u> and </u> tags
      } else if (format === 'strikethrough') {
        newText = value.substring(0, selectionStart) + "~~" + selectedText + "~~" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 4; // 4 for the ~~ at start and end
      } else { // code
        newText = value.substring(0, selectionStart) + "`" + selectedText + "`" + value.substring(selectionEnd);
        newCursorPos = selectionEnd + 2; // 2 for the backticks at start and end
      }
      
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } else {
      let beforeText, afterText;
      
      if (format === 'bold') {
        beforeText = "**";
        afterText = "**";
      } else if (format === 'italic') {
        beforeText = "_";
        afterText = "_";
      } else if (format === 'underline') {
        beforeText = "<u>";
        afterText = "</u>";
      } else if (format === 'strikethrough') {
        beforeText = "~~";
        afterText = "~~";
      } else { // code
        beforeText = "`";
        afterText = "`";
      }
      
      const newText = value.substring(0, selectionStart) + beforeText + afterText + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(selectionStart + beforeText.length, selectionStart + beforeText.length);
        }
      }, 0);
    }
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "• " + after;
    setWritingText(newText);
    updateWritingSpace(activeTab, newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "1. " + after;
    setWritingText(newText);
    updateWritingSpace(activeTab, newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 3, selectionStart + 3);
      }
    }, 0);
  };

  const insertHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    
    const newText = before + "## " + after;
    setWritingText(newText);
    updateWritingSpace(activeTab, newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 3, selectionStart + 3);
      }
    }, 0);
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    const codeBlockStart = "\n```\n";
    const codeBlockEnd = "\n```\n";
    
    const newText = value.substring(0, selectionStart) + 
                    codeBlockStart + 
                    selectedText + 
                    codeBlockEnd + 
                    value.substring(selectionEnd);
    
    setWritingText(newText);
    updateWritingSpace(activeTab, newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = selectionStart + codeBlockStart.length;
        textarea.setSelectionRange(newPosition, newPosition + selectedText.length);
      }
    }, 0);
  };

  const insertQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    const newText = value.substring(0, selectionStart) + 
                    "> " + selectedText + 
                    value.substring(selectionEnd);
    
    setWritingText(newText);
    updateWritingSpace(activeTab, newText);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = selectionEnd + 2; // Adding 2 for "> "
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleAlignText = (alignment: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let alignedText;
      
      if (alignment === 'center') {
        alignedText = `<div style="text-align: center;">${selectedText}</div>`;
      } else if (alignment === 'right') {
        alignedText = `<div style="text-align: right;">${selectedText}</div>`;
      } else {
        alignedText = `<div style="text-align: left;">${selectedText}</div>`;
      }
      
      const newText = value.substring(0, selectionStart) + alignedText + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
    } else {
      let tag;
      
      if (alignment === 'center') {
        tag = `<div style="text-align: center;"></div>`;
      } else if (alignment === 'right') {
        tag = `<div style="text-align: right;"></div>`;
      } else {
        tag = `<div style="text-align: left;"></div>`;
      }
      
      const newText = value.substring(0, selectionStart) + tag + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
      
      // Place cursor between the opening and closing tags
      const cursorPosition = selectionStart + tag.indexOf('</div>');
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
    
    toast({
      title: `Align ${alignment}`,
      description: "Text alignment applied",
    });
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

  const saveForLater = () => {
    if (!writingText.trim()) {
      toast.error("There's nothing to save");
      return;
    }
    
    localStorage.setItem(`writing-${activeTab}`, writingText);
    toast.success("Your writing has been saved for later");
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
                      Brain Dump Of Ideas
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={saveForLater}
                        className="text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={saveWritingAsIdea}
                        className="text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <ClipboardCopy className="h-4 w-4 mr-1" /> Save as Idea
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-t-md shadow-sm flex flex-wrap items-center gap-1 p-3">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-medium text-purple-800">Format Text</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 w-full">
                      <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'bold' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            applyFormatting('bold');
                            setSelectedFormat('bold');
                          }}
                          title="Bold"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'italic' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            applyFormatting('italic');
                            setSelectedFormat('italic');
                          }}
                          title="Italic"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'underline' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            applyFormatting('underline');
                            setSelectedFormat('underline');
                          }}
                          title="Underline"
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'strikethrough' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            applyFormatting('strikethrough');
                            setSelectedFormat('strikethrough');
                          }}
                          title="Strikethrough"
                        >
                          <Strikethrough className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'heading' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            insertHeading();
                            setSelectedFormat('heading');
                          }}
                          title="Heading"
                        >
                          <Heading className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'quote' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            insertQuote();
                            setSelectedFormat('quote');
                          }}
                          title="Quote"
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'bullet-list' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            insertBulletPoint();
                            setSelectedFormat('bullet-list');
                          }}
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'numbered-list' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            insertNumberedList();
                            setSelectedFormat('numbered-list');
                          }}
                          title="Numbered List"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 mr-2 bg-purple-50 px-2 py-0.5 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'code' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            applyFormatting('code');
                            setSelectedFormat('code');
                          }}
                          title="Inline Code"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'code-block' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            insertCodeBlock();
                            setSelectedFormat('code-block');
                          }}
                          title="Code Block"
                        >
                          <SquareCode className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-left' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            handleAlignText('left');
                            setSelectedFormat('align-left');
                          }}
                          title="Align Left"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-center' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            handleAlignText('center');
                            setSelectedFormat('align-center');
                          }}
                          title="Align Center"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 text-slate-700 hover:text-purple-700 hover:bg-purple-100 ${selectedFormat === 'align-right' ? 'bg-purple-200 text-purple-700' : ''}`}
                          onClick={() => {
                            handleAlignText('right');
                            setSelectedFormat('align-right');
                          }}
                          title="Align Right"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[calc(100vh-320px)]">
                    <div className="rounded-b-lg border border-gray-200 border-t-0 shadow-sm overflow-hidden h-full relative bg-[#F6F6F7] flex">
                      <ScrollArea className="h-full w-full">
                        <div 
                          className="h-full w-full cursor-text px-4 py-4" 
                          onClick={() => textareaRef.current?.focus()}
                        >
                          <Textarea
                            ref={textareaRef}
                            value={writingText}
                            onChange={(e) => {
                              setWritingText(e.target.value);
                              updateWritingSpace(activeTab, e.target.value);
                            }}
                            onTextSelect={handleTextSelection}
                            placeholder="Start writing your ideas, thoughts, or notes here..."
                            className="min-h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-600 text-base absolute inset-0 px-4 py-4"
                          />
                        </div>
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
                    onRename={(newName) => renamePillar(pillar.id, newName)}
                    onDelete={() => deletePillar(pillar.id)}
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
