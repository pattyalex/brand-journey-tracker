
import { format as formatDate, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, getDay } from "date-fns";
import { ContentItem } from "@/types/content";

export const isWeekend = (date: Date) => {
  const day = getDay(date);
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const getCalendarDays = (currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getContentForDate = (scheduledContent: ContentItem[], date: Date) => {
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

export const formatColors: Record<string, string> = {
  "Video": "bg-purple-100 text-purple-800 border-purple-300",
  "Blog Post": "bg-blue-100 text-blue-800 border-blue-300",
  "Reel": "bg-pink-100 text-pink-800 border-pink-300",
  "Story": "bg-amber-100 text-amber-800 border-amber-300",
  "Podcast": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Newsletter": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Post": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Vlog": "bg-purple-100 text-purple-800 border-purple-300"
};

