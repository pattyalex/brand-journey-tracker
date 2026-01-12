import React, { useState, useRef, useEffect } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Move } from "lucide-react";
import { ContentCardProps } from "./types/ContentCardTypes";
import { ContentCardHeader } from "./card/ContentCardHeader";
import { ContentCardContent } from "./card/ContentCardContent";
import { ContentCardActions } from "./card/ContentCardActions";
import { RestoreToIdeasButton } from "./card/RestoreToIdeasButton";
import { Pillar } from "@/pages/BankOfContent";
import { format } from "date-fns";
import { StorageKeys, contentFormatsByPillar, getString, setString } from "@/lib/storage";

const ContentCard = ({
  content,
  pillar,
  pillars,
  onDeleteContent,
  onEditContent,
  onScheduleContent,
  onRestoreToIdeas,
  originalPillarId,
  isInCalendarView = false,
  isDraggable = false
}: ContentCardProps) => {
  const [date, setDate] = useState<Date | undefined>(content.scheduledDate);
  const [formatName, setFormatName] = useState<string>("Post");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteractingWithButton, setIsInteractingWithButton] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  
  const determinePillarToRestoreTo = () => {
    console.log(`[ContentCard] Determining pillar to restore to for "${content.title}" (ID: ${content.id}):`);
    console.log(`- originalPillarId prop: ${originalPillarId || "undefined"}`);
    console.log(`- content.originalPillarId: ${content.originalPillarId || "undefined"}`);
    console.log(`- content.bucketId: ${content.bucketId || "undefined"}`);
    console.log(`- current pillar: ${pillar.id || "undefined"}`);
    
    if (originalPillarId) {
      console.log(`[ContentCard] Using provided originalPillarId: ${originalPillarId}`);
      return originalPillarId;
    } 
    
    if (content.originalPillarId) {
      console.log(`[ContentCard] Using content's originalPillarId: ${content.originalPillarId}`);
      return content.originalPillarId;
    }
    
    if (content.bucketId) {
      console.log(`[ContentCard] Using content's bucketId: ${content.bucketId}`);
      return content.bucketId;
    }
    
    console.log(`[ContentCard] No pillar ID found, card won't be properly restored`);
    return undefined;
  };
  
  const pillarToRestoreTo = determinePillarToRestoreTo();
  
  const getTargetPillarName = () => {
    if (!pillarToRestoreTo) {
      return "Unknown Pillar";
    }
    
    const targetPillar = pillars.find(p => p.id === pillarToRestoreTo);
    
    if (targetPillar) {
      return targetPillar.name;
    }
    
    return `Pillar ${pillarToRestoreTo}`;
  };
  
  const targetPillarName = getTargetPillarName();
  
  useEffect(() => {
    if (content.bucketId) {
      try {
        const savedFormats = getString(contentFormatsByPillar(pillar.id));
        if (savedFormats) {
          const parsedFormats = JSON.parse(savedFormats);
          const format = parsedFormats.find((f: any) => f.id === content.bucketId);
          if (format) {
            setFormatName(format.name);
          }
        }
      } catch (error) {
        console.error("Failed to load content format name:", error);
      }
    }
  }, [content.bucketId, pillar.id]);
  
  const getContentFormat = () => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    
    if (content.format === 'text' && content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        return parsedContent.format || formatName;
      } catch {
        return formatName;
      }
    }
    
    return formatName;
  };

  const getPlatforms = () => {
    if (content.platforms && content.platforms.length > 0) {
      return content.platforms;
    }
    
    if (content.format === 'text' && content.url) {
      try {
        const parsedContent = JSON.parse(content.url);
        if (parsedContent.platforms && Array.isArray(parsedContent.platforms)) {
          return parsedContent.platforms;
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  const getUniqueTags = () => {
    if (!content.tags || !Array.isArray(content.tags)) return [];
    return [...new Set(content.tags)];
  };

  const platforms = getPlatforms();
  const uniqueTags = getUniqueTags();
  const contentFormat = getContentFormat();

  const handleSendToCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsInteractingWithButton(false);
    
    try {
      let readyToScheduleContent = [];
      const storedContent = getString(StorageKeys.readyToScheduleContent);
      
      if (storedContent) {
        readyToScheduleContent = JSON.parse(storedContent);
      }
      
      const existingIndex = readyToScheduleContent.findIndex(
        (item: ContentItem) => item.id === content.id
      );
      
      if (existingIndex >= 0) {
        toast.info(`"${content.title}" is already in your calendar`);
        return;
      }
      
      const contentToSchedule = {
        ...content,
        format: contentFormat,
        platforms: platforms,
        tags: uniqueTags,
        originalPillarId: content.originalPillarId || pillar.id
      };
      
      readyToScheduleContent.push(contentToSchedule);
      setString(StorageKeys.readyToScheduleContent, JSON.stringify(readyToScheduleContent));
      
      onDeleteContent(content.id);
      
      toast.success(`"${content.title}" sent to Content Calendar`);
    } catch (error) {
      console.error("Error sending to calendar:", error);
      toast.error("Failed to send to Content Calendar");
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    
    if (newDate && onScheduleContent) {
      onScheduleContent(content.id, newDate);
      setIsDatePickerOpen(false);
    } else if (newDate) {
      try {
        const updatedContent = {
          ...content,
          scheduledDate: newDate
        };
        
        if (isInCalendarView) {
          let contents = [];
          const storedContent = getString(StorageKeys.readyToScheduleContent);
          
          if (storedContent) {
            contents = JSON.parse(storedContent);
            const index = contents.findIndex((item: any) => item.id === content.id);
            if (index >= 0) {
              contents[index] = updatedContent;
              setString(StorageKeys.readyToScheduleContent, JSON.stringify(contents));
            }
          }
        }
        
        toast.success(`"${content.title}" scheduled for ${format(newDate, "PPP")}`);
        setIsDatePickerOpen(false);
      } catch (error) {
        console.error("Error scheduling content:", error);
        toast.error("Failed to schedule content");
      }
    }
  };

  const handleButtonMouseEnter = () => {
    setIsInteractingWithButton(true);
  };
  
  const handleButtonMouseLeave = () => {
    setTimeout(() => {
      setIsInteractingWithButton(false);
    }, 200);
  };

  const handleScheduleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsInteractingWithButton(false);
    onDeleteContent(content.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsInteractingWithButton(false);
    onEditContent(content.id);
  };

  const handleRestoreToIdeas = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    setIsInteractingWithButton(false);
    
    if (onRestoreToIdeas) {
      const pillarToRestoreTo = determinePillarToRestoreTo();
      onRestoreToIdeas(content, pillarToRestoreTo);
    }
  };

  const preventDragOnButtons = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.tagName === 'BUTTON' || 
                     target.closest('button') ||
                     target.tagName === 'svg' ||
                     target.tagName === 'path' ||
                     target.closest('svg');
                     
    if (isButton || isInteractingWithButton) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.tagName === 'BUTTON' || 
                     target.closest('button') ||
                     target.tagName === 'svg' ||
                     target.tagName === 'path' ||
                     target.closest('svg');
                     
    if (isButton || isInteractingWithButton) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "overflow-hidden relative h-full border-2 w-full",
        isDraggable && !isDragging && !isInteractingWithButton && "cursor-grab hover:shadow-md transition-shadow",
        isDraggable && isDragging && "cursor-grabbing"
      )}
      draggable={isDraggable && !isInteractingWithButton}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={preventDragOnButtons}
    >
      {isDraggable && !isInteractingWithButton && (
        <div className="absolute top-0 left-0 w-full h-full opacity-0 z-10 group-hover:opacity-100 transition-opacity">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">
            <Move size={24} className="h-8 w-8 text-blue-400 opacity-0 group-hover:opacity-25" />
          </div>
        </div>
      )}
      
      {onRestoreToIdeas && (
        <RestoreToIdeasButton
          targetPillarName={getTargetPillarName()}
          onRestore={handleRestoreToIdeas}
          onButtonMouseEnter={handleButtonMouseEnter}
          onButtonMouseLeave={handleButtonMouseLeave}
        />
      )}
      
      <ContentCardHeader content={content} date={date} />
      
      <ContentCardContent
        content={content}
        contentFormat={contentFormat}
        platforms={platforms}
        uniqueTags={uniqueTags}
      />
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <ContentCardActions
          content={content}
          isInCalendarView={isInCalendarView}
          isDatePickerOpen={isDatePickerOpen}
          date={date}
          calendarButtonRef={calendarButtonRef}
          onSendToCalendar={handleSendToCalendar}
          onScheduleButtonClick={handleScheduleButtonClick}
          onDelete={handleDeleteClick}
          onEdit={handleEditClick}
          onDateChange={handleDateChange}
          onDatePickerClose={() => setIsDatePickerOpen(false)}
          onButtonMouseEnter={handleButtonMouseEnter}
          onButtonMouseLeave={handleButtonMouseLeave}
        />
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
