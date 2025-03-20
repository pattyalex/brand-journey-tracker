import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  formatDate, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  getDay,
  setDefaultOptions,
  setYear,
  setMonth,
  setDate,
  startOfWeek,
  endOfWeek
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, FileText, ChevronLeft, ChevronRight, PlusCircle, Trash2, Instagram, Youtube, AtSign, Pencil, CornerUpLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";
import ContentCard from "@/components/content/ContentCard";
import { ContentItem as ContentItemType } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { toast } from "sonner";
import { restoreContentToIdeas } from "@/utils/contentRestoreUtils";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  format?: string;
  tags?: string[];
  buckets?: string[];
  platforms?: string[];
  scheduledDate?: Date | null;
  url?: string;
  pillarId?: string;
  dateCreated?: string;
}

const formatColors: Record<string, string> = {
  "Video": "bg-purple-100 text-purple-800",
  "Blog Post": "bg-blue-100 text-blue-800",
  "Reel": "bg-pink-100 text-pink-800",
  "Story": "bg-amber-100 text-amber-800",
  "Podcast": "bg-emerald-100 text-emerald-800",
  "Newsletter": "bg-indigo-100 text-indigo-800",
  "Post": "bg-cyan-100 text-cyan-800",
  "Vlog": "bg-purple-100 text-purple-800"
};

const getPlatformIcon = (platform: string) => {
  const lowercasePlatform = platform.toLowerCase();
  
  switch (lowercasePlatform) {
    case 'instagram':
      return <Instagram className="h-3 w-3" />;
    case 'youtube':
      return <Youtube className="h-3 w-3" />;
    case 'twitter':
    case 'x':
      return <AtSign className="h-3 w-3" />;
    default:
      return <AtSign className="h-3 w-3" />;
  }
};

const isWeekend = (date: Date) => {
  const day = getDay(date);
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

const ContentCalendar = () => {
  const getToday = () => {
    const today = new Date(2025, 2, 14); // Note: months are 0-indexed, so 2 = March
    return today;
  };

  const [currentMonth, setCurrentMonth] = useState(getToday());
  const [readyToScheduleContent, setReadyToScheduleContent] = useState<ContentItem[]>([]);
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getToday());
  const [showReadyContent, setShowReadyContent] = useState(true);
  const [newContentDialogOpen, setNewContentDialogOpen] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentDescription, setNewContentDescription] = useState("");
  const [newContentFormat, setNewContentFormat] = useState("Post");
  
  const [editContentDialogOpen, setEditContentDialogOpen] = useState(false);
  const [currentEditingContent, setCurrentEditingContent] = useState<ContentItem | null>(null);

  const [title, setTitle] = useState("");
  const [bucketId, setBucketId] = useState("");
  const [textContent, setTextContent] = useState("");
  const [visualNotes, setVisualNotes] = useState("");
  const [format, setFormat] = useState("Post");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [platformsList, setPlatformsList] = useState<string[]>([]);
  const [inspirationText, setInspirationText] = useState("");
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);

  useEffect(() => {
    try {
      const readyToScheduleData = localStorage.getItem('readyToScheduleContent');
      if (readyToScheduleData) {
        const parsedData = JSON.parse(readyToScheduleData);
        const contentWithDates = parsedData.map((item: any) => ({
          ...item,
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null,
          dateCreated: item.dateCreated || new Date().toISOString()
        }));
        setReadyToScheduleContent(contentWithDates);
      }

      const scheduledData = localStorage.getItem('scheduledContent');
      if (scheduledData) {
        const parsedData = JSON.parse(scheduledData);
        const contentWithDates = parsedData.map((item: any) => ({
          ...item,
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null,
          dateCreated: item.dateCreated || new Date().toISOString()
        }));
        setScheduledContent(contentWithDates);
      }
    } catch (error) {
      console.error("Error loading content from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readyToScheduleContent', JSON.stringify(readyToScheduleContent));
  }, [readyToScheduleContent]);

  useEffect(() => {
    localStorage.setItem('scheduledContent', JSON.stringify(scheduledContent));
  }, [scheduledContent]);

  const handleEditContent = (content: ContentItem) => {
    setCurrentEditingContent(content);
    
    setTitle(content.title || "");
    setTagsList(content.tags || []);
    setPlatformsList(content.platforms || []);
    
    if (content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        setTextContent(parsedContent.script || "");
        setVisualNotes(parsedContent.visualNotes || "");
        setShootDetails(parsedContent.shootDetails || "");
        setCaptionText(parsedContent.caption || "");
        setBucketId(parsedContent.bucketId || "");
        setFormat(parsedContent.format || "Post");
        setInspirationText(parsedContent.inspirationText || "");
        setInspirationLinks(parsedContent.inspirationLinks || []);
        setInspirationImages(parsedContent.inspirationImages || []);
      } catch (error) {
        console.error("Error parsing content URL:", error);
      }
    }
    
    setEditContentDialogOpen(true);
  };

  const handleUpdateContent = () => {
    if (!currentEditingContent) return;
    
    const updatedContent: ContentItem = {
      ...currentEditingContent,
      title,
      tags: tagsList,
      platforms: platformsList,
      format,
      url: JSON.stringify({
        script: textContent,
        visualNotes,
        shootDetails,
        caption: captionText,
        platforms: platformsList,
        bucketId,
        format,
        inspirationText,
        inspirationLinks,
        inspirationImages
      })
    };
    
    if (currentEditingContent.scheduledDate === null) {
      setReadyToScheduleContent(prev => 
        prev.map(item => item.id === currentEditingContent.id ? updatedContent : item)
      );
    } 
    else {
      setScheduledContent(prev => 
        prev.map(item => item.id === currentEditingContent.id ? updatedContent : item)
      );
    }
    
    setEditContentDialogOpen(false);
    resetEditForm();
  };

  const resetEditForm = () => {
    setCurrentEditingContent(null);
    setTitle("");
    setBucketId("");
    setTextContent("");
    setVisualNotes("");
    setFormat("Post");
    setShootDetails("");
    setCaptionText("");
    setCurrentTag("");
    setTagsList([]);
    setCurrentPlatform("");
    setPlatformsList([]);
    setInspirationText("");
    setInspirationLinks([]);
    setInspirationImages([]);
  };

  const handleCancelEdit = () => {
    setEditContentDialogOpen(false);
    resetEditForm();
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tagsList.includes(currentTag.trim())) {
      setTagsList([...tagsList, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  const handleAddPlatform = () => {
    if (currentPlatform.trim() && !platformsList.includes(currentPlatform.trim())) {
      setPlatformsList([...platformsList, currentPlatform.trim()]);
      setCurrentPlatform("");
    }
  };

  const handleRemovePlatform = (platformToRemove: string) => {
    setPlatformsList(platformsList.filter(platform => platform !== platformToRemove));
  };

  const handleAddInspirationLink = (link: string) => {
    if (link.trim()) {
      setInspirationLinks([...inspirationLinks, link.trim()]);
    }
  };

  const handleRemoveInspirationLink = (index: number) => {
    setInspirationLinks(inspirationLinks.filter((_, i) => i !== index));
  };

  const handleAddInspirationImage = (image: string) => {
    if (image.trim()) {
      setInspirationImages([...inspirationImages, image.trim()]);
    }
  };

  const handleRemoveInspirationImage = (index: number) => {
    setInspirationImages(inspirationImages.filter((_, i) => i !== index));
  };

  const scheduleContent = (contentId: string, date: Date) => {
    const contentItem = readyToScheduleContent.find(item => item.id === contentId);
    
    if (!contentItem) return;
    
    const scheduledItem = {
      ...contentItem,
      scheduledDate: date
    };
    
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
    
    setScheduledContent(prev => [...prev, scheduledItem]);
  };

  const createNewContent = () => {
    if (!newContentTitle.trim()) return;
    
    const newItem: ContentItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newContentTitle,
      description: newContentDescription,
      format: newContentFormat,
      tags: [],
      platforms: [],
      scheduledDate: selectedDate
    };
    
    setScheduledContent(prev => [...prev, newItem]);
    setNewContentDialogOpen(false);
    setNewContentTitle("");
    setNewContentDescription("");
    setNewContentFormat("Post");
  };

  const deleteContent = (contentId: string) => {
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
  };

  const deleteScheduledContent = (contentId: string) => {
    setScheduledContent(prev => prev.filter(item => item.id !== contentId));
  };

  const getContentFormat = (content: ContentItem) => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    
    return "Post";
  };

  const getContentForDate = (date: Date) => {
    return scheduledContent.filter(content => {
      if (!content.scheduledDate) return false;
      
      const contentDate = new Date(content.scheduledDate);
      return (
        contentDate.getDate() === date.getDate() &&
        contentDate.getMonth() === date.getMonth() &&
        contentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(getToday());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ 
    start: calendarStart, 
    end: calendarEnd 
  });

  const handleRestoreToIdeas = (content: ContentItemType, originalPillarId?: string) => {
    try {
      // Remove from current lists
      if (content.scheduledDate) {
        setScheduledContent(prev => prev.filter(item => item.id !== content.id));
      } else {
        setReadyToScheduleContent(prev => prev.filter(item => item.id !== content.id));
      }

      // Determine which pillar to restore to
      // First check passed originalPillarId, then content.originalPillarId, then default to "1"
      const pillarToRestoreTo = originalPillarId || content.originalPillarId || 
                               (content.bucketId ? content.bucketId : "1");
      
      console.log(`Restoring content to pillar: ${pillarToRestoreTo}`, content);

      // Use the utility function to store the content for restoration
      restoreContentToIdeas(content, pillarToRestoreTo);
      
      const targetPillar = pillarToRestoreTo === "1" ? "Pillar 1" : 
                           pillarToRestoreTo === "2" ? "Pillar 2" : 
                           pillarToRestoreTo === "3" ? "Pillar 3" : "Pillar 1";
      
      toast.success(`"${content.title}" will be restored to Idea Development`, {
        description: `Navigate to Idea Development to see this content in ${targetPillar}`,
        duration: 5000
      });
      
      setTimeout(() => {
        toast.info("To see your restored content, go to Idea Development page", {
          duration: 8000,
          action: {
            label: "Got it",
            onClick: () => {}
          }
        });
      }, 500);
    } catch (error) {
      console.error("Error restoring content to ideas:", error);
      toast.error("Failed to restore to Idea Development");
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and organize your content publishing plan.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={prevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={goToToday}
              className="h-8"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setShowReadyContent(!showReadyContent)}
                    variant={showReadyContent ? "default" : "outline"}
                    className="h-8"
                  >
                    Ready Content
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View content ready to be scheduled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Content Ready to be Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {readyToScheduleContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {readyToScheduleContent.map((content, index) => {
                  const contentItem: ContentItemType = {
                    ...content as unknown as ContentItemType,
                    url: content.url || "",
                    format: content.format || "text",
                    dateCreated: content.dateCreated ? new Date(content.dateCreated) : new Date(),
                    description: content.description || "",
                  };
                  
                  return (
                    <ContentCard
                      key={content.id}
                      content={contentItem}
                      index={index}
                      pillar={{ id: content.pillarId || "default", name: "Default Pillar", content: [] }}
                      pillars={[
                        { id: "1", name: "Pillar 1", content: [] },
                        { id: "2", name: "Pillar 2", content: [] },
                        { id: "3", name: "Pillar 3", content: [] }
                      ]}
                      onDeleteContent={deleteContent}
                      onEditContent={() => handleEditContent(content)}
                      onRestoreToIdeas={handleRestoreToIdeas}
                      originalPillarId={content.pillarId}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No content ready to be scheduled.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create content ideas in the Content Ideation section and mark them as ready for scheduling.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center text-2xl font-semibold mb-4">
          {formatDate(currentMonth, 'MMMM yyyy')}
        </div>
        
        <div className="border rounded-md bg-white overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 min-h-[70vh]">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const dayContent = getContentForDate(day);
              const isWeekendDay = isWeekend(day);
              
              return (
                <div 
                  key={i} 
                  className={`border-t border-l min-h-[120px] p-1 ${
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isCurrentDay ? "bg-blue-50" : ""} ${
                    isWeekendDay && isCurrentMonth ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedDate(day);
                    if (isCurrentMonth && dayContent.length === 0) {
                      setNewContentDialogOpen(true);
                    }
                  }}
                >
                  <div className="flex justify-between items-start p-1">
                    <div className={`text-sm font-medium ${
                      isCurrentDay ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
                    }`}>
                      {formatDate(day, 'd')}
                    </div>
                    {isCurrentMonth && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day);
                          setNewContentDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1 mt-1 max-h-[90px] overflow-y-auto">
                    {dayContent.map((content) => (
                      <div 
                        key={content.id} 
                        className="group"
                      >
                        <div 
                          className={`text-xs p-1 rounded cursor-pointer ${
                            content.format && formatColors[getContentFormat(content)] 
                              ? formatColors[getContentFormat(content)] 
                              : "bg-gray-100 text-gray-800"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{content.title}</span>
                            <div className="flex">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditContent(content);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduledContent(content.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {content.platforms && content.platforms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 ml-1">
                            {content.platforms.slice(0, 2).map((platform, idx) => (
                              <Badge
                                key={`cal-platform-${content.id}-${idx}`}
                                className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0 rounded-full flex items-center gap-0.5"
                              >
                                {getPlatformIcon(platform)}
                                <span className="text-[9px]">{platform}</span>
                              </Badge>
                            ))}
                            {content.platforms.length > 2 && (
                              <Badge className="bg-purple-100 text-purple-800 text-[9px]">
                                +{content.platforms.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <Dialog open={newContentDialogOpen} onOpenChange={setNewContentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
              <DialogDescription>
                Create a new content item for {selectedDate ? formatDate(selectedDate, 'MMMM d, yyyy') : 'selected date'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <input
                  id="title"
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Content title"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  value={newContentDescription}
                  onChange={(e) => setNewContentDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Content description"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="format" className="text-sm font-medium">Format</label>
                <select
                  id="format"
                  value={newContentFormat}
                  onChange={(e) => setNewContentFormat(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Post">Post</option>
                  <option value="Video">Video</option>
                  <option value="Blog Post">Blog Post</option>
                  <option value="Reel">Reel</option>
                  <option value="Story">Story</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Vlog">Vlog</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createNewContent}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <IdeaCreationDialog
          open={editContentDialogOpen}
          onOpenChange={setEditContentDialogOpen}
          title={title}
          onTitleChange={setTitle}
          bucketId={bucketId}
          onBucketChange={setBucketId}
          pillarId=""
          scriptText={textContent}
          onScriptTextChange={setTextContent}
          visualNotes={visualNotes}
          onVisualNotesChange={setVisualNotes}
          format={format}
          onFormatChange={setFormat}
          shootDetails={shootDetails}
          onShootDetailsChange={setShootDetails}
          captionText={captionText}
          onCaptionTextChange={setCaptionText}
          platforms={platformsList}
          currentPlatform={currentPlatform}
          onCurrentPlatformChange={setCurrentPlatform}
          onAddPlatform={handleAddPlatform}
          onRemovePlatform={handleRemovePlatform}
          tags={tagsList}
          currentTag={currentTag}
          onCurrentTagChange={setCurrentTag}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSave={handleUpdateContent}
          onCancel={handleCancelEdit}
          isEditMode={true}
          dialogTitle="Edit Content"
          inspirationText={inspirationText}
          onInspirationTextChange={setInspirationText}
          inspirationLinks={inspirationLinks}
          onAddInspirationLink={handleAddInspirationLink}
          onRemoveInspirationLink={handleRemoveInspirationLink}
          inspirationImages={inspirationImages}
          onAddInspirationImage={handleAddInspirationImage}
          onRemoveInspirationImage={handleRemoveInspirationImage}
        />
      </div>
    </Layout>
  );
};

export default ContentCalendar;
