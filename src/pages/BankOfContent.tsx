
import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentItem } from "@/types/content";
import ContentPillar from "@/components/content/ContentPillar";
import ContentUploader from "@/components/content/ContentUploader";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Code, 
  FileCode, 
  AlignLeft, 
  AlignCenter, 
  AlignRight
} from "lucide-react";

export interface Pillar {
  id: string;
  name: string;
  content: ContentItem[];
}

// Default pillars for demonstration
const defaultPillars: Pillar[] = [
  {
    id: "1",
    name: "Education",
    content: []
  },
  {
    id: "2",
    name: "Entertainment",
    content: []
  },
  {
    id: "3",
    name: "Lifestyle",
    content: []
  },
  {
    id: "4",
    name: "Reviews",
    content: []
  }
];

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>(() => {
    const storedPillars = localStorage.getItem("contentPillars");
    return storedPillars ? JSON.parse(storedPillars) : defaultPillars;
  });
  
  const [activeTab, setActiveTab] = useState("pillars");
  const [newPillarName, setNewPillarName] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  
  // Brain Dump of Ideas section
  const [writingSpaces, setWritingSpaces] = useState<{ [key: string]: string }>(() => {
    const storedSpaces = localStorage.getItem("writingSpaces");
    return storedSpaces ? JSON.parse(storedSpaces) : {
      "daily": "",
      "weekly": "",
      "monthly": "",
      "yearly": ""
    };
  });
  
  const [writingTab, setWritingTab] = useState("daily");
  const [writingText, setWritingText] = useState(writingSpaces[writingTab] || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setWritingText(writingSpaces[writingTab] || "");
  }, [writingTab, writingSpaces]);
  
  useEffect(() => {
    localStorage.setItem("contentPillars", JSON.stringify(pillars));
  }, [pillars]);
  
  useEffect(() => {
    localStorage.setItem("writingSpaces", JSON.stringify(writingSpaces));
  }, [writingSpaces]);
  
  const handlePillarCreate = () => {
    if (!newPillarName.trim()) return;
    
    const newPillar: Pillar = {
      id: Date.now().toString(),
      name: newPillarName,
      content: []
    };
    
    setPillars([...pillars, newPillar]);
    setNewPillarName("");
  };

  const handlePillarSelect = (pillar: Pillar) => {
    setSelectedPillar(pillar);
  };
  
  const handleContentUpdate = (pillarId: string, updatedContent: ContentItem[]) => {
    setPillars(pillars.map(p => p.id === pillarId ? { ...p, content: updatedContent } : p));
  };
  
  const updateWritingSpace = (tab: string, text: string) => {
    setWritingSpaces({ ...writingSpaces, [tab]: text });
  };

  // Text formatting functions
  const handleBoldClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      const newText = value.substring(0, selectionStart) + `**${selectedText}**` + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const newText = value.substring(0, selectionStart) + "**Bold Text**" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor between the asterisks
      const cursorPosition = selectionStart + 2;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 9);
        }
      }, 0);
    }
    
    toast({
      description: "Text formatted: Bold",
    });
  };

  const handleItalicClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      const newText = value.substring(0, selectionStart) + `*${selectedText}*` + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const newText = value.substring(0, selectionStart) + "*Italic Text*" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor between the asterisks
      const cursorPosition = selectionStart + 1;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 11);
        }
      }, 0);
    }
    
    toast({
      description: "Text formatted: Italic",
    });
  };
  
  const handleUnderlineClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      const newText = value.substring(0, selectionStart) + `<u>${selectedText}</u>` + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const newText = value.substring(0, selectionStart) + "<u>Underlined Text</u>" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor between the tags
      const cursorPosition = selectionStart + 3;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 15);
        }
      }, 0);
    }
    
    toast({
      description: "Text formatted: Underline",
    });
  };
  
  const handleStrikethroughClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      const newText = value.substring(0, selectionStart) + `~~${selectedText}~~` + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const newText = value.substring(0, selectionStart) + "~~Strikethrough Text~~" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor between the tags
      const cursorPosition = selectionStart + 2;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 18);
        }
      }, 0);
    }
    
    toast({
      description: "Text formatted: Strikethrough",
    });
  };
  
  const handleHeadingClick = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const hashes = "#".repeat(level);
    
    if (selectedText) {
      // Check if we're at the start of a line
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const prefix = value.substring(lineStart, selectionStart);
      
      if (prefix.trim() === '') {
        const newText = value.substring(0, lineStart) + 
                       `${hashes} ${selectedText}` + 
                       value.substring(selectionEnd);
        setWritingText(newText);
        updateWritingSpace(writingTab, newText);
      } else {
        const newText = value.substring(0, selectionStart) + 
                       `\n${hashes} ${selectedText}` + 
                       value.substring(selectionEnd);
        setWritingText(newText);
        updateWritingSpace(writingTab, newText);
      }
    } else {
      const newText = value.substring(0, selectionStart) + 
                     `${hashes} Heading ${level}` + 
                     value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor after the heading prefix
      const cursorPosition = selectionStart + hashes.length + 1;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 8 + level.toString().length);
        }
      }, 0);
    }
    
    toast({
      description: `Text formatted: Heading ${level}`,
    });
  };

  const handleQuoteClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      // Split the selected text into lines and add > to each
      const quotedText = selectedText
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');
      
      const newText = value.substring(0, selectionStart) + quotedText + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const newText = value.substring(0, selectionStart) + "> Quoted text" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor after the > prefix
      const cursorPosition = selectionStart + 2;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 11);
        }
      }, 0);
    }
    
    toast({
      description: "Text formatted: Quote",
    });
  };
  
  const handleListClick = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      // Split the selected text into lines and add list markers to each
      const listText = selectedText
        .split('\n')
        .map((line, index) => ordered ? `${index + 1}. ${line}` : `- ${line}`)
        .join('\n');
      
      const newText = value.substring(0, selectionStart) + listText + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      const prefix = ordered ? "1. " : "- ";
      const newText = value.substring(0, selectionStart) + prefix + "List item" + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor after the list marker
      const cursorPosition = selectionStart + prefix.length;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + 9);
        }
      }, 0);
    }
    
    toast({
      description: `Text formatted: ${ordered ? 'Ordered' : 'Bulleted'} List`,
    });
  };
  
  const handleCodeClick = (block: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let newText;
      if (block) {
        newText = value.substring(0, selectionStart) + 
                 "```\n" + selectedText + "\n```" + 
                 value.substring(selectionEnd);
      } else {
        newText = value.substring(0, selectionStart) + 
                 "`" + selectedText + "`" + 
                 value.substring(selectionEnd);
      }
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
    } else {
      let newText;
      if (block) {
        newText = value.substring(0, selectionStart) + 
                 "```\ncode block\n```" + 
                 value.substring(selectionEnd);
      } else {
        newText = value.substring(0, selectionStart) + 
                 "`inline code`" + 
                 value.substring(selectionEnd);
      }
      setWritingText(newText);
      updateWritingSpace(writingTab, newText);
      
      // Place cursor appropriately
      const cursorPosition = block ? selectionStart + 4 : selectionStart + 1;
      const selectionLength = block ? 10 : 11;
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition + selectionLength);
        }
      }, 0);
    }
    
    toast({
      description: `Text formatted: ${block ? 'Code Block' : 'Inline Code'}`,
    });
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
      updateWritingSpace(writingTab, newText);
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
      updateWritingSpace(writingTab, newText);
      
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
      description: `Text alignment: ${alignment}`,
    });
  };
  
  return (
    <Layout>
      <div className="container py-8 max-w-screen-2xl">
        <h1 className="text-3xl font-bold mb-8">Bank of Content</h1>
        
        <Tabs defaultValue="pillars" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="pillars">Content Pillars</TabsTrigger>
            <TabsTrigger value="braindump">Brain Dump of Ideas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pillars" className="space-y-8">
            {selectedPillar ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPillar(null)}
                    className="mr-2"
                  >
                    Back to Pillars
                  </Button>
                  <h2 className="text-xl font-semibold">{selectedPillar.name}</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <ContentUploader 
                    pillar={selectedPillar} 
                    onContentUpdate={(updatedContent) => handleContentUpdate(selectedPillar.id, updatedContent)} 
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Create a New Content Pillar</label>
                    <Input 
                      placeholder="Enter pillar name" 
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePillarCreate()}
                    />
                  </div>
                  <Button onClick={handlePillarCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pillar
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pillars.map((pillar) => (
                    <Card key={pillar.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle>{pillar.name}</CardTitle>
                        <CardDescription>
                          {pillar.content.length} {pillar.content.length === 1 ? 'item' : 'items'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-0 h-48 overflow-hidden">
                        <ContentPillar 
                          pillar={pillar} 
                          onContentUpdate={(updatedContent) => handleContentUpdate(pillar.id, updatedContent)}
                          preview
                        />
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handlePillarSelect(pillar)}
                        >
                          View All Content
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="braindump">
            <Card>
              <CardHeader>
                <CardTitle>Brain Dump of Ideas</CardTitle>
                <CardDescription>
                  Use this space to jot down content ideas, draft scripts, or save inspiration
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="daily" value={writingTab} onValueChange={setWritingTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                  
                  {/* Text formatting toolbar */}
                  <div className="flex flex-wrap gap-1 mb-3 p-1 border rounded-md bg-muted/30">
                    <div className="flex gap-1 mr-2">
                      <Button variant="ghost" size="xs" onClick={handleBoldClick} title="Bold">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={handleItalicClick} title="Italic">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={handleUnderlineClick} title="Underline">
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={handleStrikethroughClick} title="Strikethrough">
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1 mr-2">
                      <Button variant="ghost" size="xs" onClick={() => handleHeadingClick(1)} title="Heading 1">
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleHeadingClick(2)} title="Heading 2">
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={handleQuoteClick} title="Quote">
                        <Quote className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1 mr-2">
                      <Button variant="ghost" size="xs" onClick={() => handleListClick(false)} title="Bullet List">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleListClick(true)} title="Numbered List">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1 mr-2">
                      <Button variant="ghost" size="xs" onClick={() => handleCodeClick(false)} title="Inline Code">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleCodeClick(true)} title="Code Block">
                        <FileCode className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleAlignText('left')} title="Align Left">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleAlignText('center')} title="Align Center">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleAlignText('right')} title="Align Right">
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[60vh]">
                    <Textarea
                      ref={textareaRef}
                      value={writingText}
                      onChange={(e) => {
                        setWritingText(e.target.value);
                        updateWritingSpace(writingTab, e.target.value);
                      }}
                      placeholder="Start typing your ideas..."
                      className="min-h-[60vh] border-none"
                    />
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BankOfContent;
