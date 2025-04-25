import React, { useState, useEffect, useRef, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  format as formatDate, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  getDay,
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
import { cn } from "@/lib/utils";
import ContentFilters from "@/components/content/calendar/ContentFilters";

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
  status?: string;
}

const formatColors: Record<string, string> = {
  "Video": "bg-purple-100 text-purple-800 border-purple-300",
  "Blog Post": "bg-blue-100 text-blue-800 border-blue-300",
  "Reel": "bg-pink-100 text-pink-800 border-pink-300",
  "Story": "bg-amber-100 text-amber-800 border-amber-300",
  "Podcast": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Newsletter": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Post": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Vlog": "bg-purple-100 text-purple-800 border-purple-300"
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
    return new Date();
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

  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [] },
    { id: "2", name: "Pillar 2", content: [] },
    { id: "3", name: "Pillar 3", content: [] }
  ]);

  const [animatingContent, setAnimatingContent] = useState<string | null>(null);
  const [animationTarget, setAnimationTarget] = useState<{x: number, y: number} | null>(null);
  const [draggedContent, setDraggedContent] = useState<ContentItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const readyContentRef = useRef<HTMLDivElement>(null);

  // Add new state for filters
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

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

  const handleDateChange = (contentId: string, newDate: Date | undefined) => {
    if (!newDate) return;
    
    const contentItem = readyToScheduleContent.find(item => item.id === contentId);
    if (!contentItem) return;
    
    const targetDay = document.querySelector(`[data-date="${formatDate(newDate, 'yyyy-MM-dd')}"]`);
    
    if (targetDay) {
      const contentRect = document.getElementById(`content-card-${contentId}`)?.getBoundingClientRect();
      const targetRect = targetDay.getBoundingClientRect();
      
      if (contentRect) {
        setAnimatingContent(contentId);
        setAnimationTarget({
          x: targetRect.left - contentRect.left,
          y: targetRect.top - contentRect.top
        });
        
        setTimeout(() => {
          const scheduledItem = {
            ...contentItem,
            scheduledDate: newDate
          };
          
          setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
          setScheduledContent(prev => [...prev, scheduledItem]);
          setAnimatingContent(null);
          setAnimationTarget(null);
          
          toast.success(`"${contentItem.title}" scheduled for ${formatDate(newDate, "PPP")}`);
        }, 500);
      } else {
        scheduleContent(contentId, newDate);
      }
    } else {
      scheduleContent(contentId, newDate);
    }
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
    
    toast.success(`"${contentItem.title}" scheduled for ${formatDate(date, "PPP")}`);
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

  // Add filter handlers
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePillarChange = (pillarId: string) => {
    setSelectedPillars(prev => 
      prev.includes(pillarId)
        ? prev.filter(p => p !== pillarId)
        : [...prev, pillarId]
    );
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Modify getContentForDate to apply filters
  const getContentForDate = (date: Date) => {
    return scheduledContent.filter(content => {
      // First check if the content is scheduled for this date
      if (!content.scheduledDate) return false;
      
      const contentDate = new Date(content.scheduledDate);
      const isSameDate = 
        contentDate.getDate() === date.getDate() &&
        contentDate.getMonth() === date.getMonth() &&
        contentDate.getFullYear() === date.getFullYear();
      
      if (!isSameDate) return false;

      // Apply platform filter
      if (selectedPlatforms.length > 0) {
        const contentPlatforms = content.platforms || [];
        if (!selectedPlatforms.some(p => contentPlatforms.includes(p))) {
          return false;
        }
      }

      // Apply pillar filter
      if (selectedPillars.length > 0) {
        if (!content.pillarId || !selectedPillars.includes(content.pillarId)) {
          return false;
        }
      }

      // Apply status filter
      if (selectedStatuses.length > 0) {
        const contentStatus = content.status || 'Draft';
        if (!selectedStatuses.includes(contentStatus)) {
          return false;
        }
      }

      return true;
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

  // Get unique platforms from scheduled content
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    scheduledContent.forEach(content => {
      if (content.platforms) {
        content.platforms.forEach(platform => platforms.add(platform));
      }
    });
    return Array.from(platforms);
  }, [scheduledContent]);

  // Get unique statuses from scheduled content
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    scheduledContent.forEach(content => {
      if (content.status) {
        statuses.add(content.status);
      } else {
        statuses.add('Draft');
      }
    });
    return Array.from(statuses);
  }, [scheduledContent]);

  const handleRestoreToIdeas = (content: ContentItemType, originalPillarId?: string) => {
    try {
      if (content.scheduledDate) {
        setScheduledContent(prev => prev.filter(item => item.id !== content.id));
      } else {
        setReadyToScheduleContent(prev => prev.filter(item => item.id !== content.id));
      }

      const pillarToRestoreTo = originalPillarId || 
                               content.originalPillarId || 
                               content.bucketId || 
                               "1";
      
      console.log(`ContentCalendar: Restoring content "${content.title}" to pillar: ${pillarToRestoreTo}`, content);

      restoreContentToIdeas(content, pillarToRestoreTo);
      
      const targetPillar = pillars.find(p => p.id === pillarToRestoreTo)?.name || 
                          (pillarToRestoreTo === "1" ? "Pillar 1" : 
                           pillarToRestoreTo === "2" ? "Pillar 2" : 
                           pillarToRestoreTo === "3" ? "Pillar 3" : "Pillar 1");
      
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, content: ContentItem) => {
    e.dataTransfer.setData("contentId", content.id);
    e.dataTransfer.setData("source", content.scheduledDate ? "calendar" : "ready");
    setDraggedContent(content);
    
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `<div class="bg-white p-2 rounded shadow-md opacity-70 border-2 border-blue-400 flex gap-2 items-center">
      <span class="text-blue-600"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M5 9l4 4 10-10"></path>
      </svg></span>
      <span>${content.title}</span>
    </div>`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    setDropTarget(targetId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDate?: Date) => {
    e.preventDefault();
    setDropTarget(null);
    
    const contentId = e.dataTransfer.getData("contentId");
    const source = e.dataTransfer.getData("source");
    
    if (!contentId) return;
    
    if (source === "calendar") {
      const content = scheduledContent.find(item => item.id === contentId);
      if (!content) return;
      
      if (targetDate) {
        const updatedContent = {
          ...content,
          scheduledDate: targetDate
        };
        
        setScheduledContent(prev => [
          ...prev.filter(item => item.id !== contentId),
          updatedContent
        ]);
        
        toast.success(`"${content.title}" moved to ${formatDate(targetDate, "PPP")}`);
      } else {
        const contentForReadySection = {
          ...content,
          scheduledDate: null
        };
        
        setScheduledContent(prev => prev.filter(item => item.id !== contentId));
        setReadyToScheduleContent(prev => [...prev, contentForReadySection]);
        
        toast.success(`"${content.title}" moved back to ready content`);
      }
    } else {
      const content = readyToScheduleContent.find(item => item.id === contentId);
      if (!content || !targetDate) return;
      
      const updatedContent = {
        ...content,
        scheduledDate: targetDate
      };
      
      setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
      setScheduledContent(prev => [...prev, updatedContent]);
      
      toast.success(`"${content.title}" scheduled for ${formatDate(targetDate, "PPP")}`);
    }
    
    setDraggedContent(null);
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
            <ContentFilters
              platforms={availablePlatforms}
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={handlePlatformChange}
              pillars={pillars}
              selectedPillars={selectedPillars}
              onPillarChange={handlePillarChange}
              statuses={availableStatuses}
              selectedStatuses={selectedStatuses}
              onStatusChange={handleStatusChange}
            />
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
          </div>
        </div>
        
        <Card 
          className={cn(
            "overflow-hidden",
            dropTarget === "ready-content" ? "ring-2 ring-blue-400 bg-blue-50" : ""
          )}
          ref={readyContentRef}
          onDragOver={(e) => handleDragOver(e, "ready-content")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Content Ready to be Scheduled
              {draggedContent && draggedContent.scheduledDate && (
                <span className="text-sm font-normal text-blue-600">
                  Drop here to move content back to ready section
                </span>
              )}
            </CardTitle>
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
                  
                  const isAnimating = animatingContent === content.id;
                  const isDragging = draggedContent?.id === content.id;
                  
                  return (
                    <div 
                      id={`content-card-${content.id}`}
                      key={content.id}
                      className={cn(
                        "transition-all duration-500",
                        isAnimating && "fixed z-50",
                        isDragging && "opacity-50"
                      )}
                      style={
                        isAnimating && animationTarget
                          ? { 
                              transform: `translate(${animationTarget.x}px, ${animationTarget.y}px) scale(0.5)`,
                              opacity: 0.8
                            }
                          : {}
                      }
                      draggable
                      onDragStart={(e) => handleDragStart(e, content)}
                    >
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
                        isInCalendarView={true}
                        onScheduleContent={(contentId, date) => handleDateChange(contentId, date)}
                        isDraggable={true}
                      />
                    </div>
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
              const dateStr = formatDate(day, 'yyyy-MM-dd');
              const isDropTarget = dropTarget === dateStr;
              
              return (
                <div 
                  key={i} 
                  data-date={dateStr}
                  className={cn(
                    "border-t border-l min-h-[120px] p-1",
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : "",
                    isCurrentDay ? "bg-blue-50" : "",
                    isWeekendDay && isCurrentMonth ? "bg-gray-100" : "",
                    isDropTarget ? "ring-2 ring-inset ring-blue-400 bg-blue-50" : ""
                  )}
                  onClick={() => {
                    setSelectedDate(day);
                    if (isCurrentMonth && dayContent.length === 0) {
                      setNewContentDialogOpen(true);
                    }
                  }}
                  onDragOver={(e) => isCurrentMonth && handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => isCurrentMonth && handleDrop(e, day)}
                >
                  <div className="flex justify-between items-start p-1">
                    <div className={cn(
                      "text-sm font-medium",
                      isCurrentDay ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
                    )}>
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
                        className={cn(
                          "group cursor-grab border rounded",
                          draggedContent?.id === content.id ? "opacity-50" : "",
                          content.format && formatColors[getContentFormat(content)] 
                            ? formatColors[getContentFormat(content)] 
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, content)}
                      >
                        <div 
                          className="text-xs p-1 cursor-pointer flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContent(content);
                          }}
                        >
                          <div className="flex-1 flex items-center justify-between">
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
                          <div className="flex flex-wrap gap-1 mt-1 ml-1 pb-1">
                            {content.platforms.slice(0, 2).map((platform, idx) => (
                              <Badge
                                key={`cal-platform-${content.id}-${idx}`}
