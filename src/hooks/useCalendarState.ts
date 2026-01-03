
import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";

export const useCalendarState = () => {
  const getToday = () => new Date();
  
  const [currentMonth, setCurrentMonth] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getToday());
  const [readyToScheduleContent, setReadyToScheduleContent] = useState<ContentItem[]>([]);
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([]);
  const [draggedContent, setDraggedContent] = useState<ContentItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [animatingContent, setAnimatingContent] = useState<string | null>(null);
  const [animationTarget, setAnimationTarget] = useState<{x: number, y: number} | null>(null);

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
    // Dispatch custom event for same-tab updates
    const event = new CustomEvent('scheduledContentUpdated', { detail: scheduledContent });
    window.dispatchEvent(event);
  }, [scheduledContent]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(getToday());

  const handleDateChange = (contentId: string, newDate: Date | undefined) => {
    if (!newDate) return;
    
    const contentItem = readyToScheduleContent.find(item => item.id === contentId);
    if (!contentItem) return;
    
    const scheduledItem = {
      ...contentItem,
      scheduledDate: newDate
    };
    
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
    setScheduledContent(prev => [...prev, scheduledItem]);
    
    toast.success(`"${contentItem.title}" scheduled for ${newDate.toLocaleDateString()}`);
  };

  return {
    currentMonth,
    selectedDate,
    readyToScheduleContent,
    scheduledContent,
    draggedContent,
    dropTarget,
    animatingContent,
    animationTarget,
    setSelectedDate,
    setReadyToScheduleContent,
    setScheduledContent,
    setDraggedContent,
    setDropTarget,
    setAnimatingContent,
    setAnimationTarget,
    nextMonth,
    prevMonth,
    goToToday,
    handleDateChange
  };
};

