
import React, { useRef, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle, Trash2, Instagram, Youtube, AtSign, Pencil, CornerUpLeft } from "lucide-react";
import { format as formatDate, isSameMonth } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";
import ContentCard from "@/components/content/ContentCard";
import { cn } from "@/lib/utils";
import { ContentItem as ContentItemType } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import { toast } from "sonner";
import { restoreContentToIdeas } from "@/utils/contentRestoreUtils";
import CalendarDayCell from "@/components/content/calendar/CalendarDayCell";
import { useCalendarState } from "@/hooks/useCalendarState";
import { getCalendarDays, getContentForDate } from "@/utils/calendarUtils";

const ContentCalendar = () => {
  const {
    currentMonth,
    selectedDate,
    readyToScheduleContent,
    scheduledContent,
    draggedContent,
    dropTarget,
    setSelectedDate,
    setReadyToScheduleContent,
    setScheduledContent,
    setDraggedContent,
    setDropTarget,
    nextMonth,
    prevMonth,
    goToToday,
    handleDateChange
  } = useCalendarState();

  const readyContentRef = useRef<HTMLDivElement>(null);
  const [newContentDialogOpen, setNewContentDialogOpen] = React.useState(false);
  const [editContentDialogOpen, setEditContentDialogOpen] = React.useState(false);
  const [currentEditingContent, setCurrentEditingContent] = React.useState<ContentItemType | null>(null);
  
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentDescription, setNewContentDescription] = useState("");
  const [newContentFormat, setNewContentFormat] = useState("Post");

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

  const handleEditContent = (content: ContentItemType) => {
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
    
    const updatedContent: ContentItemType = {
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
      }),
      dateCreated: currentEditingContent.dateCreated || new Date()
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

  const createNewContent = () => {
    if (!newContentTitle.trim()) return;
    
    const newItem: ContentItemType = {
      id: Math.random().toString(36).substring(2, 9),
      title: newContentTitle,
      description: newContentDescription,
      format: newContentFormat,
      tags: [],
      platforms: [],
      scheduledDate: selectedDate,
      url: "",
      dateCreated: new Date()
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, content: ContentItemType) => {
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

  const calendarDays = getCalendarDays(currentMonth);

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
            <Button variant="outline" onClick={prevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="h-8">Today</Button>
            <Button variant="outline" onClick={nextMonth} className="h-8 w-8 p-0">
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
                  
                  return (
                    <ContentCard
                      key={content.id}
                      content={contentItem}
                      index={index}
                      pillar={{ id: content.bucketId || "default", name: "Default Pillar", content: [] }}
                      pillars={[
                        { id: "1", name: "Pillar 1", content: [] },
                        { id: "2", name: "Pillar 2", content: [] },
                        { id: "3", name: "Pillar 3", content: [] }
                      ]}
                      onDeleteContent={deleteContent}
                      onEditContent={() => handleEditContent(content)}
                      onRestoreToIdeas={(content) => handleRestoreToIdeas(content, content.originalPillarId)}
                      originalPillarId={content.originalPillarId}
                      isInCalendarView={true}
                      onScheduleContent={(contentId, date) => handleDateChange(contentId, date)}
                      isDraggable={true}
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
            {calendarDays.map((day, i) => (
              <CalendarDayCell
                key={i}
                day={day}
                currentMonth={currentMonth}
                dayContent={getContentForDate(scheduledContent, day)}
                onDayClick={(day) => {
                  setSelectedDate(day);
                  setNewContentDialogOpen(true);
                }}
                onEditContent={handleEditContent}
                onDeleteContent={deleteScheduledContent}
                draggedContent={draggedContent}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dropTarget={dropTarget}
              />
            ))}
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
